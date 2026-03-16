import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

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

type PigeonMediaItem = {
  kind: 'image';
  src: string;
  role: 'hero' | 'gallery';
  alt?: string;
  caption?: string;
};

type PigeonPayload = {
  objectType: PigeonObjectType;
  title: string;
  date: string;
  tags: string[];
  body: string;
  images: string[];
  media: PigeonMediaItem[];
};

type ParsedPigeonRequest = {
  payload: PigeonPayload;
  uploadedImages: File[];
};

type PreparedImageAsset = {
  originalName: string;
  publicSrc: string;
  repoPath: string;
  buffer: Buffer;
  contentType: string;
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

function normalizeNonEmptyStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function stripMarkdown(value: string): string {
  const source = stripFencedCodeBlocks(value);

  return source
    .replace(/!\[\[[^\]]+\]\]/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function trimExcerpt(value: string, max = 180): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) {
    return normalized;
  }

  const clipped = normalized
    .slice(0, max)
    .replace(/\s+\S*$/, '')
    .replace(/[.?!,:;]+$/, '')
    .trim();

  return `${clipped}…`;
}

function excerptFromBody(value: string): string | null {
  const stripped = stripMarkdown(value);
  if (!stripped) {
    return null;
  }

  return trimExcerpt(stripped, 180);
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n?/g, '\n');
}

function normalizeFilename(value: string): string {
  return value.trim().toLowerCase();
}

function basenameFromReference(value: string): string {
  const cleanValue = value
    .trim()
    .replace(/^<|>$/g, '')
    .split(/[?#]/, 1)[0]
    .replace(/\\/g, '/');

  if (!cleanValue) {
    return '';
  }

  const segments = cleanValue.split('/').filter(Boolean);
  return normalizeFilename(segments[segments.length - 1] || '');
}

function stripFencedCodeBlocks(value: string): string {
  const lines = value.split('\n');
  const kept: string[] = [];
  let activeFence: '```' | '~~~' | null = null;

  for (const line of lines) {
    const trimmed = line.trimStart();

    if (!activeFence) {
      if (trimmed.startsWith('```')) {
        activeFence = '```';
        continue;
      }

      if (trimmed.startsWith('~~~')) {
        activeFence = '~~~';
        continue;
      }

      kept.push(line);
      continue;
    }

    if (trimmed.startsWith(activeFence)) {
      activeFence = null;
    }
  }

  return kept.join('\n');
}

function cleanImageReferenceTarget(value: string): string {
  return value
    .trim()
    .replace(/^<|>$/g, '')
    .replace(/\s+["'][^"']*["']\s*$/, '')
    .split(/[?#]/, 1)[0]
    .replace(/\\/g, '/');
}

function isPublishableImageTarget(value: string): boolean {
  return value.startsWith('/') || /^(https?:)?\/\//i.test(value);
}

function fallbackAltFromImageTarget(value: string): string {
  const cleanTarget = cleanImageReferenceTarget(value);
  const filename = cleanTarget.split('/').filter(Boolean).pop() || cleanTarget;
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizeImageReference(
  value: string,
  uploadedImagesByName: Map<string, PreparedImageAsset>
): string | null {
  const cleanTarget = cleanImageReferenceTarget(value);
  if (!cleanTarget) {
    return null;
  }

  const uploadedAsset = uploadedImagesByName.get(basenameFromReference(cleanTarget));
  if (uploadedAsset) {
    return uploadedAsset.publicSrc;
  }

  if (isPublishableImageTarget(cleanTarget)) {
    return cleanTarget;
  }

  return null;
}

function parseFrontmatterValue(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) {
      return [];
    }

    return inner
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  return trimmed
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function normalizeObjectType(value: unknown): PigeonObjectType | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  const aliased =
    normalized === 'field-log' || normalized === 'field_log' || normalized === 'field log'
      ? 'fieldlog'
      : normalized;

  return OBJECT_TYPES.includes(aliased as PigeonObjectType)
    ? (aliased as PigeonObjectType)
    : null;
}

function logObjectTypeFallback(candidate: unknown, source: string): void {
  if (typeof candidate === 'string' && candidate.trim()) {
    console.warn(
      `[Carrier Pigeon] Invalid object_type "${candidate.trim()}" from ${source}; defaulting to fragment.`
    );
    return;
  }

  console.warn(`[Carrier Pigeon] Missing object_type in ${source}; defaulting to fragment.`);
}

function resolveObjectType(fields: Map<string, string[]>, source: string, fallback?: unknown): PigeonObjectType {
  const candidates = [
    fields.get('object_type')?.[0],
    fields.get('objecttype')?.[0],
    fields.get('type')?.[0],
    fallback,
  ];
  let invalidCandidate: unknown;

  for (const candidate of candidates) {
    const objectType = normalizeObjectType(candidate);
    if (objectType) {
      return objectType;
    }

    if (typeof candidate === 'string' && candidate.trim() && invalidCandidate === undefined) {
      invalidCandidate = candidate;
    }
  }

  logObjectTypeFallback(invalidCandidate, source);
  return 'fragment';
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

function parseMarkdownNote(note: string, fallbackObjectType?: unknown): PigeonPayload | Response {
  const normalized = normalizeNewlines(note).replace(/^\uFEFF/, '').trimStart();
  const parsedFrontmatter = extractMarkdownFrontmatter(normalized);

  if (!parsedFrontmatter) {
    return Response.json(
      {
        error: 'Markdown note must start with frontmatter fields like title: and date:.',
      },
      { status: 400 }
    );
  }

  const fields = parsedFrontmatter.fields;
  const objectType = resolveObjectType(fields, 'markdown note frontmatter', fallbackObjectType);
  const title = (fields.get('title')?.[0] || '').trim();
  const date = (fields.get('date')?.[0] || '').trim();
  const tags = (fields.get('tags') || []).flatMap(parseFrontmatterValue);
  const images = (fields.get('images') || []).flatMap(parseFrontmatterValue);
  const body = parsedFrontmatter.body.trim();

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
    tags: normalizeNonEmptyStrings(tags),
    body,
    images: normalizeNonEmptyStrings(images),
    media: [],
  };
}

function extractMarkdownFrontmatter(source: string): { fields: Map<string, string[]>; body: string } | null {
  const lines = source.split('\n');
  if (!lines.length) {
    return null;
  }

  let startIndex = 0;
  while (startIndex < lines.length && !lines[startIndex]?.trim()) {
    startIndex += 1;
  }

  if (startIndex >= lines.length) {
    return null;
  }

  const hasFence = lines[startIndex].trim() === '---';
  if (!hasFence) {
    const firstFieldMatch = lines[startIndex].trimEnd().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!firstFieldMatch) {
      return null;
    }

    const firstKey = firstFieldMatch[1].toLowerCase();
    if (!/^(title|date|object_type|objecttype|type|state|tags|images|summary|id|status|visibility|themes|media)$/.test(firstKey)) {
      return null;
    }
  }

  const fields = new Map<string, string[]>();
  let currentKey = '';
  let bodyStartIndex = -1;

  for (let index = hasFence ? startIndex + 1 : startIndex; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (hasFence && trimmed === '---') {
      bodyStartIndex = index + 1;
      break;
    }

    if (!trimmed) {
      if (!hasFence && fields.size > 0) {
        bodyStartIndex = index + 1;
        break;
      }
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
    if (fieldMatch) {
      const [, key, rawValue] = fieldMatch;
      currentKey = key.toLowerCase();
      const value = rawValue.trim();
      fields.set(currentKey, value ? [value] : []);
      continue;
    }

    if (/^\s+/.test(rawLine) && currentKey) {
      const existing = fields.get(currentKey) ?? [];
      if (existing.length === 0) {
        existing.push(line.trim());
      } else {
        existing[existing.length - 1] = `${existing[existing.length - 1]} ${line.trim()}`.trim();
      }
      fields.set(currentKey, existing);
      continue;
    }

    if (fields.size > 0) {
      bodyStartIndex = index;
      break;
    }
  }

  if (fields.size === 0) {
    return null;
  }

  return {
    fields,
    body: bodyStartIndex >= 0 ? lines.slice(bodyStartIndex).join('\n') : '',
  };
}

function rewriteBodyImageReferences(
  body: string,
  uploadedImagesByName: Map<string, PreparedImageAsset>
): { body: string; consumedPublicSrcs: Set<string> } {
  const consumedPublicSrcs = new Set<string>();
  let rewritten = body;

  rewritten = rewritten.replace(/!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, (fullMatch, rawTarget: string) => {
    const asset = uploadedImagesByName.get(basenameFromReference(rawTarget));
    if (!asset) {
      return fullMatch;
    }

    consumedPublicSrcs.add(asset.publicSrc);
    const alt = path.basename(asset.originalName, path.extname(asset.originalName)).replace(/[-_]+/g, ' ');
    return `![${alt}](${asset.publicSrc})`;
  });

  rewritten = rewritten.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (fullMatch, altText: string, rawTarget: string) => {
    const target = rawTarget.trim();
    if (/^(https?:)?\/\//i.test(target) || target.startsWith('/')) {
      return fullMatch;
    }

    const asset = uploadedImagesByName.get(basenameFromReference(target));
    if (!asset) {
      return fullMatch;
    }

    consumedPublicSrcs.add(asset.publicSrc);
    return `![${altText}](${asset.publicSrc})`;
  });

  return {
    body: rewritten,
    consumedPublicSrcs,
  };
}

function collectBodyImageMediaItems(
  body: string,
  uploadedImagesByName: Map<string, PreparedImageAsset>
): PigeonMediaItem[] {
  const items: PigeonMediaItem[] = [];
  const seen = new Set<string>();
  const source = stripFencedCodeBlocks(body);

  const pushItem = (rawTarget: string, rawAlt = '') => {
    const src = normalizeImageReference(rawTarget, uploadedImagesByName);
    if (!src || seen.has(src)) {
      return;
    }

    seen.add(src);
    items.push({
      kind: 'image',
      src,
      role: items.length === 0 ? 'hero' : 'gallery',
      alt: normalizeOptionalString(rawAlt) || fallbackAltFromImageTarget(src),
    });
  };

  for (const match of source.matchAll(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) {
    pushItem(match[1], match[2] || '');
  }

  for (const match of source.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    pushItem(match[2], match[1]);
  }

  return items;
}

function buildNormalizedImageFields(
  declaredImages: string[],
  body: string,
  uploadedImagesByName: Map<string, PreparedImageAsset>,
  uploadedAssets: PreparedImageAsset[]
): { images: string[]; media: PigeonMediaItem[] } {
  const ordered: Array<{ src: string; alt?: string; caption?: string }> = [];
  const bySrc = new Map<string, { src: string; alt?: string; caption?: string }>();

  const upsert = (src: string, alt?: string, caption?: string) => {
    const normalizedSrc = src.trim();
    if (!normalizedSrc) {
      return;
    }

    const normalizedAlt = normalizeOptionalString(alt);
    const normalizedCaption = normalizeOptionalString(caption);
    const existing = bySrc.get(normalizedSrc);
    if (existing) {
      if (!existing.alt && normalizedAlt) {
        existing.alt = normalizedAlt;
      }
      if (!existing.caption && normalizedCaption) {
        existing.caption = normalizedCaption;
      }
      return;
    }

    const item = {
      src: normalizedSrc,
      alt: normalizedAlt,
      caption: normalizedCaption,
    };
    bySrc.set(normalizedSrc, item);
    ordered.push(item);
  };

  for (const image of declaredImages) {
    const normalizedSrc = normalizeImageReference(image, uploadedImagesByName);
    if (!normalizedSrc) {
      continue;
    }

    upsert(normalizedSrc);
  }

  for (const item of collectBodyImageMediaItems(body, uploadedImagesByName)) {
    upsert(item.src, item.alt, item.caption);
  }

  for (const asset of uploadedAssets) {
    upsert(asset.publicSrc, fallbackAltFromImageTarget(asset.originalName));
  }

  const media = ordered.map((item, index) => ({
    kind: 'image' as const,
    src: item.src,
    role: index === 0 ? ('hero' as const) : ('gallery' as const),
    alt: item.alt,
    caption: item.caption,
  }));

  return {
    images: media.map((item) => item.src),
    media,
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

function yamlImageMediaField(media: PigeonMediaItem[]): string {
  if (media.length === 0) {
    return 'media: []';
  }

  return `media:\n${media
    .map((item) => {
      const lines = [
        '  - kind: image',
        `    src: ${yamlString(item.src)}`,
        `    role: ${item.role}`,
      ];

      if (item.alt) {
        lines.push(`    alt: ${yamlString(item.alt)}`);
      }

      if (item.caption) {
        lines.push(`    caption: ${yamlString(item.caption)}`);
      }

      return lines.join('\n');
    })
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
    yamlImageMediaField(payload.media),
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
      payload.images.length > 0 ? yamlStringArrayField('images', payload.images) : null,
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

function getRelativePublicImagePath(objectType: PigeonObjectType, slug: string, index: number, extension: string): string {
  const safeExtension = extension.replace(/^\.+/, '') || 'jpg';
  return `/media/pigeon/${objectType}/${slug}-${String(index + 1).padStart(2, '0')}.${safeExtension}`;
}

function getContentFileCandidates(objectType: PigeonObjectType, slug: string): string[] {
  return getContentDirCandidates(objectType).map((candidate) => path.join(candidate, `${slug}.md`));
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

function getPublicDirCandidates(): string[] {
  return [
    path.resolve(process.cwd(), 'public'),
    path.resolve(process.cwd(), 'astro/public'),
  ];
}

async function resolvePublicDir(): Promise<string> {
  for (const candidate of getPublicDirCandidates()) {
    try {
      const info = await stat(candidate);
      if (info.isDirectory()) {
        return candidate;
      }
    } catch {
      // Keep trying candidates.
    }
  }

  throw new Error('Unable to locate astro/public for Carrier Pigeon image ingest.');
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

async function localSlugExists(slug: string): Promise<boolean> {
  for (const objectType of OBJECT_TYPES) {
    for (const candidate of getContentFileCandidates(objectType, slug)) {
      try {
        const info = await stat(candidate);
        if (info.isFile()) {
          return true;
        }
      } catch {
        // Keep checking candidate content paths.
      }
    }
  }

  return false;
}

async function prepareUploadedImages(
  files: File[],
  objectType: PigeonObjectType,
  slug: string
): Promise<PreparedImageAsset[]> {
  return Promise.all(
    files.map(async (file, index) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(`Unsupported uploaded file type for ${file.name}. Only image files are allowed.`);
      }

      const inputBuffer = Buffer.from(await file.arrayBuffer());
      const pipeline = sharp(inputBuffer, { failOn: 'none' }).rotate();
      const metadata = await pipeline.metadata();

      const resized = pipeline.resize({
        width: 2400,
        height: 2400,
        fit: 'inside',
        withoutEnlargement: true,
      });

      const keepPng = file.type === 'image/png' || metadata.hasAlpha === true;
      const outputFormat = keepPng ? 'png' : 'jpeg';
      const buffer =
        outputFormat === 'png'
          ? await resized.png({ compressionLevel: 9 }).toBuffer()
          : await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      const extension = outputFormat === 'png' ? 'png' : 'jpg';
      const publicSrc = getRelativePublicImagePath(objectType, slug, index, extension);

      return {
        originalName: file.name,
        publicSrc,
        repoPath: `astro/public${publicSrc}`,
        buffer,
        contentType: outputFormat === 'png' ? 'image/png' : 'image/jpeg',
      };
    })
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

async function writeLocalEntry(
  payload: PigeonPayload,
  slug: string,
  markdown: string,
  uploadedAssets: PreparedImageAsset[]
): Promise<Response> {
  const contentDir = await resolveContentDir(payload.objectType);
  const publicDir = await resolvePublicDir();
  const filePath = path.join(contentDir, `${slug}.md`);

  try {
    await stat(filePath);
    return buildConflictResponse(payload.objectType, slug, filePath);
  } catch {
    // File does not exist yet.
  }

  await Promise.all(
    uploadedAssets.map(async (asset) => {
      const assetPath = path.join(publicDir, asset.publicSrc.replace(/^\/+/, ''));
      await mkdir(path.dirname(assetPath), { recursive: true });
      await writeFile(assetPath, asset.buffer);
    })
  );

  await mkdir(contentDir, { recursive: true });
  await writeFile(filePath, markdown, 'utf8');

  return Response.json(
    {
      ok: true,
      mode: 'local',
      slug,
      objectType: payload.objectType,
      path: filePath,
      images: payload.images,
      url: getPublishedUrl(payload.objectType, slug),
      note: 'Entry written to source content. Rebuild or redeploy to publish outside local dev.',
    },
    { status: 201 }
  );
}

async function gitHubSlugExists(config: GitHubConfig, slug: string): Promise<boolean | Response> {
  for (const objectType of OBJECT_TYPES) {
    const relativePath = getRelativeContentPath(objectType, slug, config.contentRoot);
    const lookupResponse = await fetch(getGitHubApiUrl(config, relativePath, config.branch), {
      headers: getGitHubHeaders(config.token),
    });

    if (lookupResponse.status === 200) {
      return true;
    }

    if (lookupResponse.status !== 404) {
      return Response.json(
        {
          error: 'GitHub could not check whether this Carrier Pigeon slug already exists.',
          detail: await describeGitHubFailure(lookupResponse),
          slug,
          path: relativePath,
        },
        { status: 502 }
      );
    }
  }

  return false;
}

async function resolveAvailableSlug(baseSlug: string, config: GitHubConfig | null): Promise<string | Response> {
  for (let suffix = 1; suffix < 10_000; suffix += 1) {
    const candidate = suffix === 1 ? baseSlug : `${baseSlug}-${suffix}`;
    const exists = config ? await gitHubSlugExists(config, candidate) : await localSlugExists(candidate);

    if (exists instanceof Response) {
      return exists;
    }

    if (!exists) {
      return candidate;
    }
  }

  return Response.json(
    {
      error: 'Unable to derive a unique slug for this Carrier Pigeon entry.',
      slug: baseSlug,
    },
    { status: 409 }
  );
}

function getGitHubRepoApiUrl(config: GitHubConfig, relativePath: string): URL {
  const encodedPath = relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return new URL(`https://api.github.com/repos/${config.owner}/${config.repo}/${encodedPath}`);
}

async function getGitHubBranchState(
  config: GitHubConfig
): Promise<{ headSha: string; treeSha: string } | Response> {
  const encodedBranch = config.branch.split('/').map((segment) => encodeURIComponent(segment)).join('/');
  const refResponse = await fetch(getGitHubRepoApiUrl(config, `git/ref/heads/${encodedBranch}`), {
    headers: getGitHubHeaders(config.token),
  });

  if (!refResponse.ok) {
    return Response.json(
      {
        error: 'GitHub could not resolve the Carrier Pigeon branch reference.',
        detail: await describeGitHubFailure(refResponse),
      },
      { status: 502 }
    );
  }

  const refData = (await refResponse.json()) as { object?: { sha?: string } };
  const headSha = refData.object?.sha || '';
  if (!headSha) {
    return Response.json(
      {
        error: 'GitHub did not return a commit SHA for the Carrier Pigeon branch reference.',
      },
      { status: 502 }
    );
  }

  const commitResponse = await fetch(getGitHubRepoApiUrl(config, `git/commits/${headSha}`), {
    headers: getGitHubHeaders(config.token),
  });

  if (!commitResponse.ok) {
    return Response.json(
      {
        error: 'GitHub could not read the base commit for Carrier Pigeon.',
        detail: await describeGitHubFailure(commitResponse),
      },
      { status: 502 }
    );
  }

  const commitData = (await commitResponse.json()) as { tree?: { sha?: string } };
  const treeSha = commitData.tree?.sha || '';
  if (!treeSha) {
    return Response.json(
      {
        error: 'GitHub did not return a tree SHA for the Carrier Pigeon base commit.',
      },
      { status: 502 }
    );
  }

  return {
    headSha,
    treeSha,
  };
}

async function createGitHubBlob(config: GitHubConfig, content: Buffer): Promise<string | Response> {
  const blobResponse = await fetch(getGitHubRepoApiUrl(config, 'git/blobs'), {
    method: 'POST',
    headers: {
      ...getGitHubHeaders(config.token),
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      content: content.toString('base64'),
      encoding: 'base64',
    }),
  });

  if (!blobResponse.ok) {
    return Response.json(
      {
        error: 'GitHub could not create a Carrier Pigeon blob.',
        detail: await describeGitHubFailure(blobResponse),
      },
      { status: 502 }
    );
  }

  const blobData = (await blobResponse.json()) as { sha?: string };
  if (!blobData.sha) {
    return Response.json(
      {
        error: 'GitHub did not return a blob SHA for Carrier Pigeon.',
      },
      { status: 502 }
    );
  }

  return blobData.sha;
}

async function commitGitHubFiles(
  config: GitHubConfig,
  message: string,
  files: Array<{ path: string; content: Buffer }>
): Promise<{ commitSha: string; commitUrl: string } | Response> {
  const branchState = await getGitHubBranchState(config);
  if (branchState instanceof Response) {
    return branchState;
  }

  const treeEntries = [];
  for (const file of files) {
    const blobSha = await createGitHubBlob(config, file.content);
    if (blobSha instanceof Response) {
      return blobSha;
    }

    treeEntries.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blobSha,
    });
  }

  const treeResponse = await fetch(getGitHubRepoApiUrl(config, 'git/trees'), {
    method: 'POST',
    headers: {
      ...getGitHubHeaders(config.token),
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      base_tree: branchState.treeSha,
      tree: treeEntries,
    }),
  });

  if (!treeResponse.ok) {
    return Response.json(
      {
        error: 'GitHub could not create the Carrier Pigeon tree.',
        detail: await describeGitHubFailure(treeResponse),
      },
      { status: 502 }
    );
  }

  const treeData = (await treeResponse.json()) as { sha?: string };
  if (!treeData.sha) {
    return Response.json(
      {
        error: 'GitHub did not return a tree SHA for Carrier Pigeon.',
      },
      { status: 502 }
    );
  }

  const commitResponse = await fetch(getGitHubRepoApiUrl(config, 'git/commits'), {
    method: 'POST',
    headers: {
      ...getGitHubHeaders(config.token),
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      message,
      tree: treeData.sha,
      parents: [branchState.headSha],
    }),
  });

  if (!commitResponse.ok) {
    return Response.json(
      {
        error: 'GitHub could not create the Carrier Pigeon commit.',
        detail: await describeGitHubFailure(commitResponse),
      },
      { status: 502 }
    );
  }

  const commitData = (await commitResponse.json()) as { sha?: string };
  if (!commitData.sha) {
    return Response.json(
      {
        error: 'GitHub did not return a commit SHA for Carrier Pigeon.',
      },
      { status: 502 }
    );
  }

  const encodedBranch = config.branch.split('/').map((segment) => encodeURIComponent(segment)).join('/');
  const refUpdateResponse = await fetch(getGitHubRepoApiUrl(config, `git/refs/heads/${encodedBranch}`), {
    method: 'PATCH',
    headers: {
      ...getGitHubHeaders(config.token),
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      sha: commitData.sha,
      force: false,
    }),
  });

  if (!refUpdateResponse.ok) {
    return Response.json(
      {
        error: 'GitHub could not advance the Carrier Pigeon branch reference.',
        detail: await describeGitHubFailure(refUpdateResponse),
      },
      { status: 502 }
    );
  }

  return {
    commitSha: commitData.sha,
    commitUrl: `https://github.com/${config.owner}/${config.repo}/commit/${commitData.sha}`,
  };
}

async function writeGitHubEntry(
  config: GitHubConfig,
  payload: PigeonPayload,
  slug: string,
  markdown: string,
  uploadedAssets: PreparedImageAsset[]
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

  const commitResult = await commitGitHubFiles(
    config,
    `Carrier Pigeon publish ${payload.objectType}: ${slug}`,
    [
      ...uploadedAssets.map((asset) => ({
        path: asset.repoPath,
        content: asset.buffer,
      })),
      {
        path: relativePath,
        content: Buffer.from(markdown, 'utf8'),
      },
    ]
  );

  if (commitResult instanceof Response) {
    return commitResult;
  }

  return Response.json(
    {
      ok: true,
      mode: 'github',
      slug,
      objectType: payload.objectType,
      path: relativePath,
      images: payload.images,
      url: getPublishedUrl(payload.objectType, slug),
      commitSha: commitResult.commitSha,
      commitUrl: commitResult.commitUrl,
      note: 'Entry committed to GitHub. Netlify will publish it after the next deploy completes.',
    },
    { status: 201 }
  );
}

function getPublishedUrl(objectType: PigeonObjectType, slug: string): string {
  return objectType === 'codex' ? `/codex/${slug}` : `/objects/${slug}`;
}

function getFormObjectTypeCandidate(formData: FormData): string | undefined {
  const candidate =
    formData.get('object_type') ||
    formData.get('objectType') ||
    formData.get('type');

  if (typeof candidate !== 'string') {
    return undefined;
  }

  return candidate;
}

async function parseMultipartPayload(request: Request): Promise<ParsedPigeonRequest | Response> {
  const formData = await request.formData();
  const noteValue = formData.get('note');
  const note = typeof noteValue === 'string' ? noteValue.trim() : '';

  if (!note) {
    return Response.json({ error: 'Multipart Carrier Pigeon requests must include a note field.' }, { status: 400 });
  }

  const parsed = parseMarkdownNote(note, getFormObjectTypeCandidate(formData));
  if (parsed instanceof Response) {
    return parsed;
  }

  const imageEntries = formData.getAll('images');
  const uploadedImages = imageEntries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const invalidEntry = imageEntries.find((entry) => !(entry instanceof File));
  if (invalidEntry) {
    return Response.json({ error: 'Image uploads must be sent as file fields named images.' }, { status: 400 });
  }

  return {
    payload: parsed,
    uploadedImages,
  };
}

async function parsePayload(request: Request): Promise<ParsedPigeonRequest | Response> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    return parseMultipartPayload(request);
  }

  if (!contentType.includes('application/json')) {
    const note = (await request.text()).trim();
    if (!note) {
      return Response.json({ error: 'Request body is empty.' }, { status: 400 });
    }
    const parsed = parseMarkdownNote(note);
    if (parsed instanceof Response) {
      return parsed;
    }

    return {
      payload: parsed,
      uploadedImages: [],
    };
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

  if (typeof candidate.note === 'string') {
    const fallbackObjectType =
      (typeof candidate.object_type === 'string' && candidate.object_type) ||
      (typeof candidate.objectType === 'string' && candidate.objectType) ||
      (typeof candidate.type === 'string' && candidate.type) ||
      undefined;
    const parsed = parseMarkdownNote(candidate.note, fallbackObjectType);
    if (parsed instanceof Response) {
      return parsed;
    }

    return {
      payload: parsed,
      uploadedImages: [],
    };
  }

  const title = typeof candidate.title === 'string' ? candidate.title.trim() : '';
  const date = typeof candidate.date === 'string' ? candidate.date.trim() : '';
  const body = typeof candidate.body === 'string' ? candidate.body.trim() : '';
  const tags = normalizeStringArray(candidate.tags);
  const images = candidate.images === undefined ? [] : normalizeStringArray(candidate.images);
  const objectType = resolveObjectType(
    new Map([
      ['object_type', [typeof candidate.object_type === 'string' ? candidate.object_type : '']],
      ['objecttype', [typeof candidate.objectType === 'string' ? candidate.objectType : '']],
      ['type', [typeof candidate.type === 'string' ? candidate.type : '']],
    ]),
    'json payload'
  );

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
    payload: {
      objectType,
      title,
      date,
      tags,
      body,
      images: normalizeNonEmptyStrings(images),
      media: [],
    },
    uploadedImages: [],
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

  const baseSlug = slugify(parsed.payload.title);
  if (!baseSlug) {
    return Response.json({ error: 'Unable to derive a slug from title.' }, { status: 400 });
  }

  try {
    const githubConfig = getGitHubConfig();
    const resolvedSlug = await resolveAvailableSlug(baseSlug, githubConfig);
    if (resolvedSlug instanceof Response) {
      return resolvedSlug;
    }

    const slug = resolvedSlug;
    const preparedImages = await prepareUploadedImages(parsed.uploadedImages, parsed.payload.objectType, slug);
    const uploadedImagesByName = new Map(
      preparedImages.map((asset) => [normalizeFilename(asset.originalName), asset] as const)
    );
    const rewrittenBody = rewriteBodyImageReferences(parsed.payload.body, uploadedImagesByName);
    const normalizedImageFields = buildNormalizedImageFields(
      parsed.payload.images,
      rewrittenBody.body,
      uploadedImagesByName,
      preparedImages
    );
    const finalPayload: PigeonPayload = {
      ...parsed.payload,
      body: rewrittenBody.body,
      images: normalizedImageFields.images,
      media: normalizedImageFields.media,
    };
    const markdown = buildMarkdownEntry(finalPayload, slug);

    if (githubConfig) {
      return await writeGitHubEntry(githubConfig, finalPayload, slug, markdown, preparedImages);
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

    return await writeLocalEntry(finalPayload, slug, markdown, preparedImages);
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
