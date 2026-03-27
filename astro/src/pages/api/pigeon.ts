import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  inferAxes,
  normalizeAxisDepth,
  normalizeAxisFocus,
  normalizeAxisFunction,
  normalizeAxisScale,
  type ArchiveAxes,
} from '../../lib/axes.ts';
import { resolveExcerpt } from '../../lib/excerpt.ts';
import {
  normalizeMythmechSidecar,
  normalizePlatePrompt,
  stringifyMythmechSidecar,
} from '../../lib/mythmech.ts';

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

const STATUS_VALUES = ['draft', 'review', 'published', 'archived'] as const;
const VISIBILITY_VALUES = ['public', 'private', 'internal', 'unlisted'] as const;
const SIGNAL_LOCK_VALUES = ['OBSERVED', 'INFERRED', 'PENDING'] as const;

const UNIVERSAL_PASSTHROUGH_KEYS = new Set([
  'constellations',
  'related',
  'connections',
  'source',
  'location',
  'geo',
  'terrain',
  'author',
  'contributors',
]);

const OBJECT_TYPE_PASSTHROUGH_KEYS: Record<PigeonObjectType, Set<string>> = {
  scroll: new Set(['series', 'cadence', 'tone', 'dedication', 'bodyclass']),
  loremap: new Set(['classification', 'atlas', 'bodyclass']),
  artifact: new Set(['artifacttype', 'materials', 'year', 'dimensions', 'condition']),
  fieldlog: new Set(['project', 'phase', 'context', 'specs', 'signals', 'actions']),
  codex: new Set(['version', 'scope', 'systemarea', 'changetype']),
  fragment: new Set(['lengthclass', 'origin', 'voice']),
  nexus: new Set(['lead', 'featured', 'includedobjects', 'themestatement', 'releasetype']),
  signal: new Set(['origin', 'markers']),
};

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
  axes: Required<ArchiveAxes>;
  tags: string[];
  themes: string[];
  body: string;
  images: string[];
  media: PigeonMediaItem[];
  status: PigeonStatus;
  visibility: PigeonVisibility;
  excerpt?: string;
  codexState?: PigeonStatus;
  codexDependencies: string[];
  passthroughFrontmatter: string[];
};

type PigeonStatus = 'draft' | 'review' | 'published' | 'archived';
type PigeonVisibility = 'public' | 'private' | 'internal' | 'unlisted';

type FrontmatterEntry = {
  key: string;
  rawLines: string[];
  values: string[];
};

type ParsedFrontmatter = {
  fields: Map<string, string[]>;
  entries: FrontmatterEntry[];
  body: string;
};

type StandardParsedPigeonRequest = {
  kind: 'standard';
  payload: PigeonPayload;
  uploadedImages: File[];
};

type FieldHudParsedPigeonRequest = {
  kind: 'field-hud';
  payload: PigeonPayload;
  requestedSlug?: string;
  frontmatter: Record<string, unknown>;
  packet: unknown | null;
  respawnSummary: string | null;
  mythmech: Record<string, unknown> | null;
  platePrompt: string | null;
};

type ParsedPigeonRequest = StandardParsedPigeonRequest | FieldHudParsedPigeonRequest;

type PreparedImageAsset = {
  originalName: string;
  publicSrc: string;
  repoPath: string;
  buffer: Buffer;
  contentType: string;
};

type SidecarFile = {
  suffix: '.packet.json' | '.respawn.txt' | '.mythmech.sidecar' | '.plate-prompt.txt';
  content: Buffer;
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

function normalizeIncomingTitle(value: unknown): string {
  let normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) {
    return '';
  }

  const quotePairs: Array<[string, string]> = [
    ['"', '"'],
    ["'", "'"],
    ['“', '”'],
    ['‘', '’'],
  ];

  for (let depth = 0; depth < 2; depth += 1) {
    const matchingPair = quotePairs.find(
      ([open, close]) => normalized.startsWith(open) && normalized.endsWith(close)
    );
    if (!matchingPair) {
      break;
    }

    const unwrapped = normalized
      .slice(matchingPair[0].length, normalized.length - matchingPair[1].length)
      .trim();
    if (!unwrapped) {
      break;
    }

    normalized = unwrapped;
  }

  normalized = normalized
    .replace(/^\s{0,3}#{1,6}\s+/u, '')
    .replace(/^\s*>+\s*/u, '')
    .replace(/^\s*[-*+]\s+/u, '')
    .trim();

  return normalized;
}

function normalizeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    return null;
  }

  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeFlexibleStringArray(value: unknown): string[] {
  if (typeof value === 'string') {
    return normalizeNonEmptyStrings(value.split(','));
  }

  return normalizeStringArray(value) ?? [];
}

function normalizeNonEmptyStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalizeDateString(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Date.parse(value))) {
    return value.trim();
  }

  return fallback;
}

function getFirstMeaningfulLine(value: string): string {
  return value
    .split('\n')
    .map((line) => normalizeIncomingTitle(line))
    .find(Boolean) || '';
}

function omitUndefinedFields(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
}

function readAxisField(
  key: keyof ArchiveAxes,
  value: unknown,
  sourceLabel: string
): ArchiveAxes[keyof ArchiveAxes] | Response | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = parseFrontmatterScalar(value)?.trim();
  if (!trimmed) {
    return undefined;
  }

  switch (key) {
    case 'scale': {
      const normalized = normalizeAxisScale(trimmed);
      if (!normalized) {
        return Response.json(
          { error: `Invalid scale axis value "${trimmed}" in ${sourceLabel}.` },
          { status: 400 }
        );
      }
      return normalized;
    }
    case 'depth': {
      const normalized = normalizeAxisDepth(trimmed);
      if (!normalized) {
        return Response.json(
          { error: `Invalid depth axis value "${trimmed}" in ${sourceLabel}.` },
          { status: 400 }
        );
      }
      return normalized;
    }
    case 'focus': {
      const normalized = normalizeAxisFocus(trimmed);
      if (!normalized) {
        return Response.json(
          { error: `Invalid focus axis value "${trimmed}" in ${sourceLabel}.` },
          { status: 400 }
        );
      }
      return normalized;
    }
    case 'function': {
      const normalized = normalizeAxisFunction(trimmed);
      if (!normalized) {
        return Response.json(
          { error: `Invalid function axis value "${trimmed}" in ${sourceLabel}.` },
          { status: 400 }
        );
      }
      return normalized;
    }
    default:
      return undefined;
  }
}

function resolveAxisOverridesFromMap(
  fields: Map<string, string[]>,
  sourceLabel: string
): ArchiveAxes | Response {
  const axes: ArchiveAxes = {};

  for (const key of ['scale', 'depth', 'focus', 'function'] as const) {
    const result = readAxisField(key, fields.get(key)?.[0], sourceLabel);
    if (result instanceof Response) {
      return result;
    }
    if (result) {
      axes[key] = result;
    }
  }

  return axes;
}

function resolveAxisOverridesFromRecord(
  candidate: Record<string, unknown>,
  sourceLabel: string
): ArchiveAxes | Response {
  const axes: ArchiveAxes = {};
  const nestedAxes =
    candidate.axes && typeof candidate.axes === 'object'
      ? (candidate.axes as Record<string, unknown>)
      : null;

  for (const key of ['scale', 'depth', 'focus', 'function'] as const) {
    const value =
      typeof candidate[key] === 'string'
        ? candidate[key]
        : nestedAxes && typeof nestedAxes[key] === 'string'
          ? nestedAxes[key]
          : undefined;
    const result = readAxisField(key, value, sourceLabel);
    if (result instanceof Response) {
      return result;
    }
    if (result) {
      axes[key] = result;
    }
  }

  return axes;
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

function parseFrontmatterScalar(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'string') {
        return parsed;
      }
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }

  return trimmed;
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalized = parseFrontmatterScalar(value)?.trim();
  return normalized ? normalized : undefined;
}

function normalizeSignalTrackValue(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized || normalized.toUpperCase() === 'UNLOCKED SIGNAL') {
    return undefined;
  }

  return normalized;
}

function normalizeSignalLockValue(value: unknown): (typeof SIGNAL_LOCK_VALUES)[number] | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  return SIGNAL_LOCK_VALUES.find((candidate) => candidate === normalized);
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

function normalizeStatus(value: unknown): PigeonStatus | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = parseFrontmatterScalar(value)?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return STATUS_VALUES.includes(normalized as PigeonStatus) ? (normalized as PigeonStatus) : null;
}

function normalizeVisibility(value: unknown): PigeonVisibility | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = parseFrontmatterScalar(value)?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return VISIBILITY_VALUES.includes(normalized as PigeonVisibility)
    ? (normalized as PigeonVisibility)
    : null;
}

function normalizeObjectType(value: unknown): PigeonObjectType | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = parseFrontmatterScalar(value)?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
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
      `[Carrier Pigeon] Invalid object_type "${candidate.trim()}" from ${source}; defaulting to codex.`
    );
    return;
  }

  console.warn(`[Carrier Pigeon] Missing object_type in ${source}; defaulting to codex.`);
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

function shouldPassThroughFrontmatterKey(objectType: PigeonObjectType, key: string): boolean {
  if (UNIVERSAL_PASSTHROUGH_KEYS.has(key)) {
    return true;
  }

  return OBJECT_TYPE_PASSTHROUGH_KEYS[objectType]?.has(key) ?? false;
}

function buildPassthroughFrontmatter(entries: FrontmatterEntry[], objectType: PigeonObjectType): string[] {
  return entries
    .filter((entry) => shouldPassThroughFrontmatterKey(objectType, entry.key))
    .flatMap((entry) => entry.rawLines);
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
  const title = normalizeIncomingTitle(normalizeOptionalString(fields.get('title')?.[0])) || '';
  const date = normalizeOptionalString(fields.get('date')?.[0]) || '';
  const tags = (fields.get('tags') || []).flatMap(parseFrontmatterValue);
  const themes = (fields.get('themes') || []).flatMap(parseFrontmatterValue);
  const images = (fields.get('images') || []).flatMap(parseFrontmatterValue);
  const body = parsedFrontmatter.body.trim();
  const status =
    normalizeStatus(fields.get('status')?.[0]) ||
    normalizeStatus(fields.get('state')?.[0]) ||
    'published';
  const visibility = normalizeVisibility(fields.get('visibility')?.[0]) || 'public';
  const requestedExcerpt =
    normalizeOptionalString(fields.get('excerpt')?.[0]) ||
    normalizeOptionalString(fields.get('summary')?.[0]);
  const axisOverrides = resolveAxisOverridesFromMap(fields, 'markdown note frontmatter');
  const excerpt = resolveExcerpt({
    title,
    excerpt: requestedExcerpt,
    body,
    max: 220,
  }) || undefined;

  if (axisOverrides instanceof Response) {
    return axisOverrides;
  }

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
    axes: inferAxes({
      objectType,
      title,
      body,
      existing: axisOverrides,
    }),
    tags: normalizeNonEmptyStrings(tags),
    themes: normalizeNonEmptyStrings(themes),
    body,
    images: normalizeNonEmptyStrings(images),
    media: [],
    status,
    visibility,
    excerpt,
    codexState: normalizeStatus(fields.get('state')?.[0]) || undefined,
    codexDependencies: normalizeNonEmptyStrings(
      (fields.get('dependencies') || []).flatMap(parseFrontmatterValue)
    ),
    passthroughFrontmatter: buildPassthroughFrontmatter(parsedFrontmatter.entries, objectType),
  };
}

function extractMarkdownFrontmatter(source: string): ParsedFrontmatter | null {
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
    if (!/^(title|date|object_type|objecttype|type|state|tags|images|summary|id|status|visibility|themes|media|scale|depth|focus|function)$/.test(firstKey)) {
      return null;
    }
  }

  const fields = new Map<string, string[]>();
  const entries: FrontmatterEntry[] = [];
  let currentKey = '';
  let bodyStartIndex = -1;
  let currentEntry: FrontmatterEntry | null = null;

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
      currentEntry?.rawLines.push(line);
      currentEntry && (currentEntry.values = existing);
      continue;
    }

    const fieldMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (fieldMatch) {
      const [, key, rawValue] = fieldMatch;
      currentKey = key.toLowerCase();
      const value = rawValue.trim();
      const values = value ? [value] : [];
      fields.set(currentKey, values);
      currentEntry = {
        key: currentKey,
        rawLines: [line],
        values,
      };
      entries.push(currentEntry);
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
      currentEntry?.rawLines.push(rawLine);
      currentEntry && (currentEntry.values = existing);
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
    entries,
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
  const canonicalUrl = `https://ndcodex.com${getPublishedUrl(payload.objectType, slug)}`;
  const lines: Array<string | null> = [
    '---',
    `id: ${slug}`,
    `slug: ${yamlString(slug)}`,
    `url: ${yamlString(canonicalUrl)}`,
    `type: ${payload.objectType}`,
    `title: ${yamlString(payload.title)}`,
    `date: ${yamlString(payload.date)}`,
    `postedAt: ${yamlString(new Date().toISOString())}`,
    `status: ${payload.status}`,
    `visibility: ${payload.visibility}`,
    payload.excerpt ? `summary: ${yamlString(payload.excerpt)}` : null,
    payload.excerpt ? `excerpt: ${yamlString(payload.excerpt)}` : null,
    `scale: ${payload.axes.scale}`,
    `depth: ${payload.axes.depth}`,
    `focus: ${payload.axes.focus}`,
    `function: ${payload.axes.function}`,
    yamlStringArrayField('themes', payload.themes),
    yamlImageMediaField(payload.media),
    payload.passthroughFrontmatter.join('\n'),
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
      `state: ${payload.codexState || payload.status}`,
      yamlStringArrayField('dependencies', payload.codexDependencies)
    );
  }

  return lines.filter((line): line is string => Boolean(line)).join('\n');
}

function yamlScalar(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value) || isRecord(value)) {
    return JSON.stringify(value);
  }

  return yamlString(String(value));
}

function omitOperationalFieldHudFrontmatter(frontmatter: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...frontmatter };

  delete sanitized.body;
  delete sanitized.fragment;
  delete sanitized.collection;
  delete sanitized.object_type;
  delete sanitized.objectType;
  delete sanitized.packet;
  delete sanitized.respawn_summary;
  delete sanitized.respawnSummary;
  delete sanitized.mythmech;
  delete sanitized.plate_prompt;
  delete sanitized.platePrompt;

  return sanitized;
}

function buildFrontmatterMarkdown(frontmatter: Record<string, unknown>, body: string): string {
  const lines = ['---'];

  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === undefined) {
      continue;
    }

    lines.push(`${key}: ${yamlScalar(value)}`);
  }

  lines.push('---', '', body.trim(), '');
  return lines.join('\n');
}

function sanitizePacketSidecar(packet: unknown): unknown | null {
  if (!packet) {
    return null;
  }

  if (!isRecord(packet)) {
    return packet;
  }

  const sanitized = { ...packet };
  delete sanitized._source;
  return sanitized;
}

function buildRespawnSummary(packet: unknown): string | null {
  if (!isRecord(packet)) {
    return null;
  }

  const signal = isRecord(packet.signal) ? packet.signal : {};
  const atmosphere = isRecord(packet.atmosphere) ? packet.atmosphere : {};
  const traumaWeather = isRecord(packet.trauma_weather) ? packet.trauma_weather : {};
  const shadow = isRecord(packet.shadow) ? packet.shadow : {};
  const notes = Array.isArray(packet.notes)
    ? packet.notes
        .filter((item): item is Record<string, unknown> => isRecord(item))
        .map((item) => {
          const label = typeof item.label === 'string' ? item.label : 'note';
          const value = typeof item.value === 'string' ? item.value : '';
          return value ? `${label}=${value}` : '';
        })
        .filter(Boolean)
        .join(' | ')
    : '';

  const summary = [
    `MODE: ${typeof packet.mode === 'string' ? packet.mode : '—'}`,
    normalizeSignalTrackValue(signal.track) || normalizeFlexibleStringArray(signal.artists).length > 0
      ? `SIGNAL: ${normalizeSignalTrackValue(signal.track) ?? '—'} / ${typeof signal.mode === 'string' ? signal.mode : '—'} / coherence ${signal.coherence ?? '—'}`
      : '',
    `ATMOS: pollen ${typeof atmosphere.pollen === 'string' ? atmosphere.pollen : '—'} / intake risk ${typeof atmosphere.intake_risk === 'string' ? atmosphere.intake_risk : '—'}`,
    `WATCH: ${typeof traumaWeather.alert === 'string' ? traumaWeather.alert : 'NONE'}`,
    `SHADOW: ${typeof shadow.offset === 'string' ? shadow.offset : 'NONE'} / ${typeof shadow.desynchronization === 'string' ? shadow.desynchronization : 'CLEAR'}`,
    notes ? `NOTES: ${notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return summary.trim() ? summary : null;
}

function buildFieldHudMarkdown(
  objectType: PigeonObjectType,
  slug: string,
  frontmatter: Record<string, unknown>,
  body: string
): string {
  const sanitizedFrontmatter = omitOperationalFieldHudFrontmatter(frontmatter);
  const persistedFrontmatter = {
    ...sanitizedFrontmatter,
    id:
      typeof sanitizedFrontmatter.id === 'string' && sanitizedFrontmatter.id.trim()
        ? sanitizedFrontmatter.id.trim()
        : slug,
    slug,
    url: `https://ndcodex.com${getPublishedUrl(objectType, slug)}`,
    type: objectType,
  };

  return buildFrontmatterMarkdown(omitUndefinedFields(persistedFrontmatter), body);
}

function parseFieldHudRequest(
  candidate: Record<string, unknown>
): FieldHudParsedPigeonRequest | Response | null {
  const looksLikeFieldHudPayload =
    'frontmatter' in candidate ||
    'collection' in candidate ||
    'packet' in candidate ||
    'respawn_summary' in candidate ||
    'mythmech' in candidate ||
    'plate_prompt' in candidate ||
    'platePrompt' in candidate;

  if (!looksLikeFieldHudPayload) {
    return null;
  }

  const requestedFrontmatter = isRecord(candidate.frontmatter) ? { ...candidate.frontmatter } : {};
  const packet = sanitizePacketSidecar(candidate.packet);
  const mythmech = normalizeMythmechSidecar(
    candidate.mythmech ?? requestedFrontmatter.mythmech
  );
  const platePrompt = normalizePlatePrompt(
    candidate.plate_prompt ??
      candidate.platePrompt ??
      requestedFrontmatter.plate_prompt ??
      requestedFrontmatter.platePrompt
  );
  const rawBody =
    (typeof candidate.body === 'string' && candidate.body) ||
    (typeof candidate.fragment === 'string' && candidate.fragment) ||
    (typeof requestedFrontmatter.body === 'string' && requestedFrontmatter.body) ||
    (isRecord(candidate.packet) && typeof candidate.packet._source === 'string' ? candidate.packet._source : '') ||
    '';
  const body = normalizeNewlines(rawBody).trim();

  if (!body) {
    return Response.json({ error: 'body is required for Field HUD publish requests.' }, { status: 400 });
  }

  const requestedCollection =
    candidate.collection ??
    requestedFrontmatter.collection ??
    requestedFrontmatter.object_type ??
    requestedFrontmatter.objectType ??
    requestedFrontmatter.type;
  const objectType = normalizeObjectType(requestedCollection) || 'codex';
  const titleCandidate =
    normalizeIncomingTitle(candidate.title) ||
    normalizeIncomingTitle(requestedFrontmatter.title) ||
    getFirstMeaningfulLine(body).slice(0, 120);

  if (!titleCandidate) {
    return Response.json({ error: 'title is required for Field HUD publish requests.' }, { status: 400 });
  }

  const date = normalizeDateString(
    candidate.date ?? requestedFrontmatter.date,
    new Date().toISOString()
  );
  const axisOverrides = resolveAxisOverridesFromRecord(
    { ...requestedFrontmatter, ...candidate },
    'field hud payload'
  );

  if (axisOverrides instanceof Response) {
    return axisOverrides;
  }

  const tags = normalizeFlexibleStringArray(candidate.tags ?? requestedFrontmatter.tags);
  const themes = normalizeFlexibleStringArray(candidate.themes ?? requestedFrontmatter.themes);
  const images = normalizeFlexibleStringArray(candidate.images ?? requestedFrontmatter.images);
  const dependencies = normalizeFlexibleStringArray(
    candidate.dependencies ?? requestedFrontmatter.dependencies
  );
  const requestedExcerpt =
    (typeof requestedFrontmatter.summary === 'string' && requestedFrontmatter.summary.trim()) ||
    (typeof requestedFrontmatter.excerpt === 'string' && requestedFrontmatter.excerpt.trim()) ||
    (typeof candidate.summary === 'string' && candidate.summary.trim()) ||
    (typeof candidate.excerpt === 'string' && candidate.excerpt.trim()) ||
    undefined;
  const packetSignal = isRecord(packet) && isRecord(packet.signal) ? packet.signal : null;
  const signalTrack = normalizeSignalTrackValue(
    candidate.signal_track ?? requestedFrontmatter.signal_track ?? packetSignal?.track
  );
  const signalArtists = normalizeFlexibleStringArray(
    candidate.signal_artists ?? requestedFrontmatter.signal_artists ?? packetSignal?.artists
  );
  const signalMode = normalizeOptionalString(
    typeof candidate.signal_mode === 'string'
      ? candidate.signal_mode
      : typeof requestedFrontmatter.signal_mode === 'string'
        ? requestedFrontmatter.signal_mode
        : typeof packetSignal?.mode === 'string'
          ? packetSignal.mode
          : undefined
  );
  const signalLock = normalizeSignalLockValue(
    candidate.signal_lock ?? requestedFrontmatter.signal_lock ?? packetSignal?.signal_lock
  );
  const excerpt =
    resolveExcerpt({
      title: titleCandidate,
      excerpt: requestedExcerpt,
      body,
      max: 220,
    }) || undefined;
  const status =
    normalizeStatus(candidate.status) ||
    normalizeStatus(requestedFrontmatter.status) ||
    normalizeStatus(candidate.state) ||
    normalizeStatus(requestedFrontmatter.state) ||
    'published';
  const visibility =
    normalizeVisibility(candidate.visibility) ||
    normalizeVisibility(requestedFrontmatter.visibility) ||
    'public';
  const axes = inferAxes({
    objectType,
    title: titleCandidate,
    body,
    existing: axisOverrides,
  });
  const frontmatter = omitUndefinedFields({
    ...requestedFrontmatter,
    collection: undefined,
    object_type: undefined,
    objectType: undefined,
    body: undefined,
    id:
      typeof requestedFrontmatter.id === 'string' && requestedFrontmatter.id.trim()
        ? requestedFrontmatter.id.trim()
        : undefined,
    title: titleCandidate,
    date,
    postedAt:
      typeof requestedFrontmatter.postedAt === 'string' && requestedFrontmatter.postedAt.trim()
        ? requestedFrontmatter.postedAt.trim()
        : new Date().toISOString(),
    status,
    visibility,
    summary: requestedExcerpt || excerpt,
    excerpt: requestedExcerpt || excerpt,
    scale: axes.scale,
    depth: axes.depth,
    focus: axes.focus,
    function: axes.function,
    themes,
    media: Array.isArray(requestedFrontmatter.media) ? requestedFrontmatter.media : [],
    signal_track: signalTrack,
    signal_artists: signalArtists.length > 0 ? signalArtists : undefined,
    signal_mode: signalMode,
    signal_lock: signalLock,
    ...(objectType === 'codex'
      ? {
          tags,
          images,
          state:
            normalizeStatus(requestedFrontmatter.state) ||
            normalizeStatus(candidate.state) ||
            status,
          dependencies,
        }
      : {}),
  });

  if (objectType !== 'codex') {
    delete frontmatter.tags;
    delete frontmatter.images;
    delete frontmatter.state;
    delete frontmatter.dependencies;
  }

  return {
    kind: 'field-hud',
    payload: {
      objectType,
      title: titleCandidate,
      date,
      axes,
      tags,
      themes,
      body,
      images,
      media: [],
      status,
      visibility,
      excerpt,
      codexState:
        objectType === 'codex'
          ? normalizeStatus(frontmatter.state) || status
          : undefined,
      codexDependencies: dependencies,
      passthroughFrontmatter: [],
    },
    requestedSlug:
      (typeof candidate.slug === 'string' && candidate.slug.trim()) ||
      (typeof requestedFrontmatter.slug === 'string' && requestedFrontmatter.slug.trim()) ||
      undefined,
    frontmatter,
    packet,
    mythmech,
    platePrompt,
    respawnSummary:
      (typeof candidate.respawn_summary === 'string' && candidate.respawn_summary.trim()) ||
      buildRespawnSummary(packet),
  };
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

      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeSubtype = file.type.split('/')[1] || '';
      const normalizedSubtype = mimeSubtype.toLowerCase();
      const extensionFromName = path.extname(file.name).replace(/^\./, '').toLowerCase();
      const extension =
        extensionFromName ||
        (normalizedSubtype === 'jpeg' ? 'jpg' : normalizedSubtype === 'svg+xml' ? 'svg' : normalizedSubtype) ||
        'jpg';
      const publicSrc = getRelativePublicImagePath(objectType, slug, index, extension);

      return {
        originalName: file.name,
        publicSrc,
        repoPath: `astro/public${publicSrc}`,
        buffer,
        contentType: file.type || `image/${extension === 'jpg' ? 'jpeg' : extension}`,
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
  uploadedAssets: PreparedImageAsset[],
  sidecars: SidecarFile[] = []
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

  await mkdir(contentDir, { recursive: true });

  const basePath = path.join(contentDir, slug);
  await Promise.all(
    [
      ...uploadedAssets.map(async (asset) => {
        const assetPath = path.join(publicDir, asset.publicSrc.replace(/^\/+/, ''));
        await mkdir(path.dirname(assetPath), { recursive: true });
        await writeFile(assetPath, asset.buffer);
      }),
      writeFile(filePath, markdown, 'utf8'),
      ...sidecars.map((sidecar) => writeFile(`${basePath}${sidecar.suffix}`, sidecar.content)),
    ]
  );

  return Response.json(
    {
      ok: true,
      mode: 'local',
      slug,
      objectType: payload.objectType,
      path: filePath,
      paths: {
        markdown: filePath,
        packet: sidecars.some((sidecar) => sidecar.suffix === '.packet.json')
          ? `${basePath}.packet.json`
          : null,
        respawn: sidecars.some((sidecar) => sidecar.suffix === '.respawn.txt')
          ? `${basePath}.respawn.txt`
          : null,
        mythmech: sidecars.some((sidecar) => sidecar.suffix === '.mythmech.sidecar')
          ? `${basePath}.mythmech.sidecar`
          : null,
        plate_prompt: sidecars.some((sidecar) => sidecar.suffix === '.plate-prompt.txt')
          ? `${basePath}.plate-prompt.txt`
          : null,
      },
      images: payload.images,
      axes: payload.axes,
      url: getPublishedUrl(payload.objectType, slug),
      object_url: getPublishedUrl(payload.objectType, slug),
      hud_url:
        payload.objectType === 'scroll' && payload.status === 'published'
          ? `/objects/${slug}/hud`
          : null,
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
  uploadedAssets: PreparedImageAsset[],
  sidecars: SidecarFile[] = []
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
      ...sidecars.map((sidecar) => ({
        path: relativePath.replace(/\.md$/i, sidecar.suffix),
        content: sidecar.content,
      })),
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
      paths: {
        markdown: relativePath,
        packet: sidecars.some((sidecar) => sidecar.suffix === '.packet.json')
          ? relativePath.replace(/\.md$/i, '.packet.json')
          : null,
        respawn: sidecars.some((sidecar) => sidecar.suffix === '.respawn.txt')
          ? relativePath.replace(/\.md$/i, '.respawn.txt')
          : null,
        mythmech: sidecars.some((sidecar) => sidecar.suffix === '.mythmech.sidecar')
          ? relativePath.replace(/\.md$/i, '.mythmech.sidecar')
          : null,
        plate_prompt: sidecars.some((sidecar) => sidecar.suffix === '.plate-prompt.txt')
          ? relativePath.replace(/\.md$/i, '.plate-prompt.txt')
          : null,
      },
      images: payload.images,
      axes: payload.axes,
      url: getPublishedUrl(payload.objectType, slug),
      object_url: getPublishedUrl(payload.objectType, slug),
      hud_url:
        payload.objectType === 'scroll' && payload.status === 'published'
          ? `/objects/${slug}/hud`
          : null,
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
    kind: 'standard',
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
      kind: 'standard',
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
  const fieldHudRequest = parseFieldHudRequest(candidate);
  if (fieldHudRequest instanceof Response) {
    return fieldHudRequest;
  }
  if (fieldHudRequest) {
    return fieldHudRequest;
  }

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
      kind: 'standard',
      payload: parsed,
      uploadedImages: [],
    };
  }

  const title = normalizeIncomingTitle(candidate.title);
  const date = typeof candidate.date === 'string' ? candidate.date.trim() : '';
  const body = typeof candidate.body === 'string' ? candidate.body.trim() : '';
  const tags = normalizeStringArray(candidate.tags);
  const themes = candidate.themes === undefined ? [] : normalizeStringArray(candidate.themes);
  const images = candidate.images === undefined ? [] : normalizeStringArray(candidate.images);
  const dependencies =
    candidate.dependencies === undefined ? [] : normalizeStringArray(candidate.dependencies);
  const axisOverrides = resolveAxisOverridesFromRecord(candidate, 'json payload');
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

  if (!themes) {
    return Response.json({ error: 'themes must be an array of strings.' }, { status: 400 });
  }

  if (!images) {
    return Response.json({ error: 'images must be an array of strings.' }, { status: 400 });
  }

  if (!dependencies) {
    return Response.json({ error: 'dependencies must be an array of strings.' }, { status: 400 });
  }

  if (axisOverrides instanceof Response) {
    return axisOverrides;
  }

  return {
    kind: 'standard',
    payload: {
      objectType,
      title,
      date,
      axes: inferAxes({
        objectType,
        title,
        body,
        existing: axisOverrides,
      }),
      tags,
      themes: normalizeNonEmptyStrings(themes),
      body,
      images: normalizeNonEmptyStrings(images),
      media: [],
      status: normalizeStatus(candidate.status) || 'published',
      visibility: normalizeVisibility(candidate.visibility) || 'public',
      excerpt: resolveExcerpt({
        title,
        excerpt:
          (typeof candidate.summary === 'string' ? candidate.summary : undefined) ||
          (typeof candidate.excerpt === 'string' ? candidate.excerpt : undefined),
        body,
        max: 220,
      }) || undefined,
      codexState: normalizeStatus(candidate.state) || undefined,
      codexDependencies: normalizeNonEmptyStrings(dependencies),
      passthroughFrontmatter: [],
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

  const baseSlug = slugify(
    parsed.kind === 'field-hud' && parsed.requestedSlug ? parsed.requestedSlug : parsed.payload.title
  );
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
    if (parsed.kind === 'field-hud') {
      const markdown = buildFieldHudMarkdown(
        parsed.payload.objectType,
        slug,
        parsed.frontmatter,
        parsed.payload.body
      );
      const sidecars: SidecarFile[] = [
        ...(parsed.packet !== null
          ? [
              {
                suffix: '.packet.json' as const,
                content: Buffer.from(JSON.stringify(parsed.packet, null, 2), 'utf8'),
              },
            ]
          : []),
        ...(parsed.respawnSummary
          ? [
              {
                suffix: '.respawn.txt' as const,
                content: Buffer.from(parsed.respawnSummary, 'utf8'),
              },
            ]
          : []),
        ...(parsed.mythmech
          ? (() => {
              const content = stringifyMythmechSidecar(parsed.mythmech);
              return content
                ? [
                    {
                      suffix: '.mythmech.sidecar' as const,
                      content: Buffer.from(content, 'utf8'),
                    },
                  ]
                : [];
            })()
          : []),
        ...(parsed.platePrompt
          ? [
              {
                suffix: '.plate-prompt.txt' as const,
                content: Buffer.from(parsed.platePrompt, 'utf8'),
              },
            ]
          : []),
      ];

      if (githubConfig) {
        return await writeGitHubEntry(githubConfig, parsed.payload, slug, markdown, [], sidecars);
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

      return await writeLocalEntry(parsed.payload, slug, markdown, [], sidecars);
    }

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
