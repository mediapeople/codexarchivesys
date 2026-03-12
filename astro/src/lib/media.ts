import type { ArchiveEntry } from './archive';

export type MediaKind = 'image' | 'video' | 'audio';

export interface CodexMediaItem {
  kind: MediaKind;
  src: string;
  role: string;
  alt?: string;
  caption?: string;
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

      if (!isMediaKind(kind) || typeof src !== 'string' || typeof role !== 'string') {
        return null;
      }

      return {
        kind,
        src,
        role,
        alt: typeof alt === 'string' ? alt : undefined,
        caption: typeof caption === 'string' ? caption : undefined,
      };
    })
    .filter((item): item is CodexMediaItem => Boolean(item));
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
