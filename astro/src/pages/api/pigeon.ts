import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const prerender = false;

const OBJECT_TYPES = [
  'scroll',
  'loremap',
  'artifact',
  'fieldlog',
  'codex',
  'fragment',
  'nexus',
  'signal',
] as const;

type PigeonObjectType = (typeof OBJECT_TYPES)[number];

type PigeonPayload = {
  objectType: PigeonObjectType;
  title: string;
  date: string;
  tags: string[];
  body: string;
  images: string[];
};

type GitHubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  contentRoot: string;
};

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function normalizeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    return null;
  }

  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

function stripMarkdown(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerptFromBody(value: string): string | null {
  const stripped = stripMarkdown(value);
  if (!stripped) {
    return null;
  }

  return stripped.slice(0, 180);
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n?/g, '\n');
}

function parseFrontmatterValue(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeObjectType(value: unknown): PigeonObjectType | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return OBJECT_TYPES.includes(normalized as PigeonObjectType)
    ? (normalized as PigeonObjectType)
    : null;
}

function resolveObjectType(fields: Map<string, string[]>, fallback?: PigeonObjectType): PigeonObjectType {
  const candidates = [
    fields.get('object_type')?.[0],
    fields.get('objecttype')?.[0],
    fields.get('type')?.[0],
    fallback,
  ];

  for (const candidate of candidates) {
    const objectType = normalizeObjectType(candidate);
    if (objectType) {
      return objectType;
    }
  }

  return 'codex';
}

function getEnvValue(name: string): string {
  return (process.env[name] || '').trim();
}

function getSharedSecret(): string {
  return getEnvValue('PIGEON_SHARED_SECRET');
}

function getPresentedSecret(request: Request): string {
  const authorization = request.headers.get('authorization') || '';
  const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch) {
    return bearerMatch[1].trim();
  }

  return (request.headers.get('x-pigeon-key') || '').trim();
}

function secretsMatch(expected: string, presented: string): boolean {
  if (!expected || !presented) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected, 'utf8');
  const presentedBuffer = Buffer.from(presented, 'utf8');
  if (expectedBuffer.length !== presentedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, presentedBuffer);
}

function requireAuthorization(request: Request): Response | null {
  const expectedSecret = getSharedSecret();
  if (!expectedSecret) {
    return null;
  }

  const presentedSecret = getPresentedSecret(request);
  if (secretsMatch(expectedSecret, presentedSecret)) {
    return null;
  }

  return Response.json(
    {
      error: 'Unauthorized. Supply the Carrier Pigeon key in Authorization: Bearer <key> or X-Pigeon-Key.',
    },
    {
      status: 401,
      headers: {
        'cache-control': 'no-store',
      },
    }
  );
}

function parseGitHubRepo(value: string): { owner: string; repo: string } | null {
  const match = value.trim().match(/^([^/\s]+)\/([^/\s]+)$/);
  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

function getGitHubConfig(): GitHubConfig | null {
  const token = getEnvValue('PIGEON_GITHUB_TOKEN');
  const repoSpec = getEnvValue('PIGEON_GITHUB_REPO');

  if (!token && !repoSpec) {
    return null;
  }

  if (!token || !repoSpec) {
    throw new Error('Carrier Pigeon GitHub mode requires both PIGEON_GITHUB_TOKEN and PIGEON_GITHUB_REPO.');
  }

  const parsedRepo = parseGitHubRepo(repoSpec);
  if (!parsedRepo) {
    throw new Error('PIGEON_GITHUB_REPO must use the format owner/repo.');
  }

  return {
    token,
    owner: parsedRepo.owner,
    repo: parsedRepo.repo,
    branch: getEnvValue('PIGEON_GITHUB_BRANCH') || 'main',
    contentRoot: getEnvValue('PIGEON_GITHUB_CONTENT_ROOT') || 'astro/src/content',
  };
}

function isHostedRuntime(): boolean {
  return Boolean(
    process.env.NETLIFY ||
      process.env.AWS_EXECUTION_ENV ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT
  );
}

function parseMarkdownNote(note: string, fallbackObjectType?: PigeonObjectType): PigeonPayload | Response {
  const normalized = normalizeNewlines(note).trim();
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return Response.json(
      {
        error: 'Markdown note must start with frontmatter delimited by --- lines.',
      },
      { status: 400 }
    );
  }

  const [, frontmatterBlock, bodyBlock] = match;
  const lines = frontmatterBlock.split('\n');
  const fields = new Map<string, string[]>();
  let currentKey = '';

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      continue;
    }

    const listMatch = line.match(/^\s*-\s*(.+)$/);
    if (listMatch && currentKey) {
      const existing = fields.get(currentKey) ?? [];
      existing.push(listMatch[1].trim());
      fields.set(currentKey, existing);
      continue;
    }

    const fieldMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!fieldMatch) {
      continue;
    }

    const [, key, rawValue] = fieldMatch;
    currentKey = key.toLowerCase();
    const value = rawValue.trim();

    if (!value) {
      fields.set(currentKey, []);
      continue;
    }

    fields.set(currentKey, [value]);
  }

  const objectType = resolveObjectType(fields, fallbackObjectType);
  const title = (fields.get('title')?.[0] || '').trim();
  const date = (fields.get('date')?.[0] || '').trim();
  const tags = (fields.get('tags') || []).flatMap(parseFrontmatterValue);
  const images = (fields.get('images') || []).flatMap(parseFrontmatterValue);
  const body = bodyBlock.trim();

  if (!title) {
    return Response.json({ error: 'Markdown note is missing title frontmatter.' }, { status: 400 });
  }

  if (!date || Number.isNaN(Date.parse(date))) {
    return Response.json({ error: 'Markdown note is missing a valid date frontmatter value.' }, { status: 400 });
  }

  if (!body) {
    return Response.json({ error: 'Markdown note body is empty.' }, { status: 400 });
  }

  return {
    objectType,
    title,
    date,
    tags: [...new Set(tags)],
    body,
    images: [...new Set(images)],
  };
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function yamlStringArrayField(name: string, values: string[]): string {
  if (values.length === 0) {
    return `${name}: []`;
  }

  return `${name}:\n${values.map((value) => `  - ${yamlString(value)}`).join('\n')}`;
}

function yamlImageMediaField(images: string[]): string {
  if (images.length === 0) {
    return 'media: []';
  }

  return `media:\n${images
    .map((image) => `  - kind: image\n    src: ${yamlString(image)}\n    role: gallery`)
    .join('\n')}`;
}

function buildMarkdownEntry(payload: PigeonPayload, slug: string): string {
  const excerpt = excerptFromBody(payload.body);
  const lines: Array<string | null> = [
    '---',
    `id: ${slug}`,
    `type: ${payload.objectType}`,
    `title: ${yamlString(payload.title)}`,
    `date: ${yamlString(payload.date)}`,
    `postedAt: ${yamlString(new Date().toISOString())}`,
    'status: published',
    'visibility: public',
    excerpt ? `excerpt: ${yamlString(excerpt)}` : null,
    yamlStringArrayField('themes', payload.tags),
    yamlImageMediaField(payload.images),
    '---',
    '',
    payload.body.trim(),
    '',
  ];

  if (payload.objectType === 'codex') {
    lines.splice(
      8,
      0,
      yamlStringArrayField('tags', payload.tags),
      yamlStringArrayField('images', payload.images),
      'state: published',
      'dependencies: []'
    );
  }

  return lines.filter((line): line is string => Boolean(line)).join('\n');
}

function getRelativeContentPath(objectType: PigeonObjectType, slug: string, contentRoot = 'astro/src/content'): string {
  const normalizedRoot = contentRoot.replace(/^\/+|\/+$/g, '');
  return `${normalizedRoot}/${objectType}/${slug}.md`;
}

function getContentDirCandidates(objectType: PigeonObjectType): string[] {
  return [
    path.resolve(process.cwd(), `src/content/${objectType}`),
    path.resolve(process.cwd(), `astro/src/content/${objectType}`),
  ];
}

async function resolveContentDir(objectType: PigeonObjectType): Promise<string> {
  for (const candidate of getContentDirCandidates(objectType)) {
    try {
      const info = await stat(candidate);
      if (info.isDirectory()) {
        return candidate;
      }
    } catch {
      // Keep trying candidates.
    }
  }

  throw new Error(`Unable to locate astro/src/content/${objectType} for Carrier Pigeon ingest.`);
}

function buildConflictResponse(objectType: PigeonObjectType, slug: string, filePath: string): Response {
  return Response.json(
    {
      error: `A ${objectType} entry with this slug already exists.`,
      slug,
      objectType,
      path: filePath,
    },
    { status: 409 }
  );
}

function getGitHubApiUrl(config: GitHubConfig, relativePath: string, ref?: string): URL {
  const encodedPath = relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const url = new URL(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodedPath}`);
  if (ref) {
    url.searchParams.set('ref', ref);
  }
  return url;
}

function getGitHubHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Carrier-Pigeon',
  };
}

async function describeGitHubFailure(response: Response): Promise<string> {
  const raw = await response.text();
  if (!raw.trim()) {
    return `GitHub responded with ${response.status}.`;
  }

  try {
    const parsed = JSON.parse(raw) as { message?: string; errors?: Array<{ message?: string } | string> };
    const errors = Array.isArray(parsed.errors)
      ? parsed.errors
          .map((item) => (typeof item === 'string' ? item : item?.message || ''))
          .filter(Boolean)
      : [];
    if (parsed.message && errors.length > 0) {
      return `${parsed.message} (${errors.join('; ')})`;
    }
    if (parsed.message) {
      return parsed.message;
    }
  } catch {
    // Keep the raw body if it is not JSON.
  }

  return raw.trim();
}

async function writeLocalEntry(payload: PigeonPayload, slug: string, markdown: string): Promise<Response> {
  const contentDir = await resolveContentDir(payload.objectType);
  const filePath = path.join(contentDir, `${slug}.md`);

  try {
    await stat(filePath);
    return buildConflictResponse(payload.objectType, slug, filePath);
  } catch {
    // File does not exist yet.
  }

  await mkdir(contentDir, { recursive: true });
  await writeFile(filePath, markdown, 'utf8');

  return Response.json(
    {
      ok: true,
      mode: 'local',
      slug,
      objectType: payload.objectType,
      path: filePath,
      url: getPublishedUrl(payload.objectType, slug),
      note: 'Entry written to source content. Rebuild or redeploy to publish outside local dev.',
    },
    { status: 201 }
  );
}

async function writeGitHubEntry(
  config: GitHubConfig,
  payload: PigeonPayload,
  slug: string,
  markdown: string
): Promise<Response> {
  const relativePath = getRelativeContentPath(payload.objectType, slug, config.contentRoot);
  const lookupResponse = await fetch(getGitHubApiUrl(config, relativePath, config.branch), {
    headers: getGitHubHeaders(config.token),
  });

  if (lookupResponse.status === 200) {
    return buildConflictResponse(payload.objectType, slug, relativePath);
  }

  if (lookupResponse.status !== 404) {
    return Response.json(
      {
        error: 'GitHub could not check whether this Carrier Pigeon entry already exists.',
        detail: await describeGitHubFailure(lookupResponse),
        slug,
        objectType: payload.objectType,
        path: relativePath,
      },
      { status: 502 }
    );
  }

  const createResponse = await fetch(getGitHubApiUrl(config, relativePath), {
    method: 'PUT',
    headers: {
      ...getGitHubHeaders(config.token),
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      message: `Carrier Pigeon publish ${payload.objectType}: ${slug}`,
      content: Buffer.from(markdown, 'utf8').toString('base64'),
      branch: config.branch,
    }),
  });

  if (!createResponse.ok) {
    return Response.json(
      {
        error: 'GitHub could not create this Carrier Pigeon entry.',
        detail: await describeGitHubFailure(createResponse),
        slug,
        objectType: payload.objectType,
        path: relativePath,
      },
      { status: 502 }
    );
  }

  const created = (await createResponse.json()) as {
    commit?: {
      sha?: string;
      html_url?: string;
    };
  };

  return Response.json(
    {
      ok: true,
      mode: 'github',
      slug,
      objectType: payload.objectType,
      path: relativePath,
      url: getPublishedUrl(payload.objectType, slug),
      commitSha: created.commit?.sha || null,
      commitUrl: created.commit?.html_url || null,
      note: 'Entry committed to GitHub. Netlify will publish it after the next deploy completes.',
    },
    { status: 201 }
  );
}

function getPublishedUrl(objectType: PigeonObjectType, slug: string): string {
  return objectType === 'codex' ? `/codex/${slug}` : `/objects/${slug}`;
}

async function parsePayload(request: Request): Promise<PigeonPayload | Response> {
  const contentType = request.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const note = (await request.text()).trim();
    if (!note) {
      return Response.json({ error: 'Request body is empty.' }, { status: 400 });
    }
    return parseMarkdownNote(note);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object') {
    return Response.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }

  const candidate = payload as Record<string, unknown>;
  const objectType =
    normalizeObjectType(candidate.object_type) ||
    normalizeObjectType(candidate.objectType) ||
    normalizeObjectType(candidate.type) ||
    'codex';

  if (typeof candidate.note === 'string') {
    return parseMarkdownNote(candidate.note, objectType);
  }

  const title = typeof candidate.title === 'string' ? candidate.title.trim() : '';
  const date = typeof candidate.date === 'string' ? candidate.date.trim() : '';
  const body = typeof candidate.body === 'string' ? candidate.body.trim() : '';
  const tags = normalizeStringArray(candidate.tags);
  const images = normalizeStringArray(candidate.images);

  if (!title) {
    return Response.json({ error: 'title is required.' }, { status: 400 });
  }

  if (!date || Number.isNaN(Date.parse(date))) {
    return Response.json({ error: 'date must be a valid ISO-compatible string.' }, { status: 400 });
  }

  if (!body) {
    return Response.json({ error: 'body is required.' }, { status: 400 });
  }

  if (!tags) {
    return Response.json({ error: 'tags must be an array of strings.' }, { status: 400 });
  }

  if (!images) {
    return Response.json({ error: 'images must be an array of strings.' }, { status: 400 });
  }

  return {
    objectType,
    title,
    date,
    tags,
    body,
    images,
  };
}

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireAuthorization(request);
  if (unauthorized) {
    return unauthorized;
  }

  const parsed = await parsePayload(request);
  if (parsed instanceof Response) {
    return parsed;
  }

  const slug = slugify(parsed.title);
  if (!slug) {
    return Response.json({ error: 'Unable to derive a slug from title.' }, { status: 400 });
  }

  try {
    const markdown = buildMarkdownEntry(parsed, slug);
    const githubConfig = getGitHubConfig();

    if (githubConfig) {
      return await writeGitHubEntry(githubConfig, parsed, slug, markdown);
    }

    if (isHostedRuntime()) {
      return Response.json(
        {
          error:
            'Carrier Pigeon is running in hosted mode without GitHub write configuration. Set PIGEON_GITHUB_TOKEN and PIGEON_GITHUB_REPO.',
        },
        { status: 500 }
      );
    }

    return await writeLocalEntry(parsed, slug, markdown);
  } catch (error) {
    return Response.json(
      {
        error: 'Carrier Pigeon failed to persist the entry.',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};
