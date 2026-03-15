import type { ArchiveEntry } from './archive';

export type MediaKind = 'image' | 'video' | 'audio';

export interface CodexMediaItem {
  kind: MediaKind;
  src: string;
  role: string;
  alt?: string;
  caption?: string;
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

function cleanPreviewTarget(value: string): string {
  return value
    .trim()
    .replace(/^<|>$/g, '')
    .replace(/\s+["'][^"']*["']\s*$/, '')
    .split(/[?#]/, 1)[0]
    .replace(/\\/g, '/');
}

function isPublishablePreviewTarget(value: string): boolean {
  return value.startsWith('/') || /^(https?:)?\/\//i.test(value);
}

function fallbackAltFromTarget(value: string): string {
  const cleanTarget = cleanPreviewTarget(value);
  const filename = cleanTarget.split('/').filter(Boolean).pop() || cleanTarget;
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
}

export function withMediaVersion(src: string, version?: string): string {
  if (!version) {
    return src;
  }

  const isAbsolute = /^https?:\/\//i.test(src);
  const url = new URL(src, isAbsolute ? undefined : 'https://ndcodex.com');
  url.searchParams.set('v', version);

  if (isAbsolute) {
    return url.toString();
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

const PRIMARY_ROLE_ORDER = [
  'hero',
  'scan',
  'detail',
  'process',
  'gallery',
  'reference',
  'audio',
];

function isMediaKind(value: unknown): value is MediaKind {
  return value === 'image' || value === 'video' || value === 'audio';
}

function mediaRoleWeight(role: string): number {
  const index = PRIMARY_ROLE_ORDER.indexOf(role);
  return index === -1 ? PRIMARY_ROLE_ORDER.length : index;
}

export function getMediaItems(entry: ArchiveEntry): CodexMediaItem[] {
  const maybeMedia = (entry.data as Record<string, unknown>).media;
  if (!Array.isArray(maybeMedia)) {
    return [];
  }

  return maybeMedia
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const candidate = item as Record<string, unknown>;
      const kind = candidate.kind;
      const src = candidate.src;
      const role = candidate.role;
      const alt = candidate.alt;
      const caption = candidate.caption;
      const normalizedSrc = typeof src === 'string' ? src.trim() : '';
      const normalizedRole = typeof role === 'string' ? role.trim() : '';

      if (!isMediaKind(kind) || !normalizedSrc || !normalizedRole) {
        return null;
      }

      return {
        kind,
        src: normalizedSrc,
        role: normalizedRole,
        alt: typeof alt === 'string' && alt.trim() ? alt.trim() : undefined,
        caption: typeof caption === 'string' && caption.trim() ? caption.trim() : undefined,
      };
    })
    .filter((item): item is CodexMediaItem => Boolean(item));
}

export function getBodyImagePreviewItems(body: string): CodexMediaItem[] {
  const items: CodexMediaItem[] = [];
  const seen = new Set<string>();
  const source = stripFencedCodeBlocks(body);

  const pushItem = (rawTarget: string, rawAlt = '') => {
    const src = cleanPreviewTarget(rawTarget);
    if (!src || !isPublishablePreviewTarget(src) || seen.has(src)) {
      return;
    }

    seen.add(src);
    items.push({
      kind: 'image',
      src,
      role: items.length === 0 ? 'hero' : 'gallery',
      alt: rawAlt.trim() || fallbackAltFromTarget(src),
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

export function getPreviewMediaItems(entry: ArchiveEntry): CodexMediaItem[] {
  const explicitMediaItems = getMediaItems(entry);
  return explicitMediaItems.length > 0 ? explicitMediaItems : getBodyImagePreviewItems(entry.body);
}

export function pickPrimaryMedia(items: CodexMediaItem[]): CodexMediaItem | null {
  if (items.length === 0) {
    return null;
  }
  return [...items].sort((a, b) => mediaRoleWeight(a.role) - mediaRoleWeight(b.role))[0];
}

export function formatMediaLabel(item: CodexMediaItem): string {
  return `${item.kind} - ${item.role}`;
}
