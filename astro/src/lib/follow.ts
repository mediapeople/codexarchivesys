import { getAllEntries, type ArchiveEntry } from './archive';
import { formatDisplayTitle } from './headline';
import { isPrimarySurfaceEntry } from './marginalia';
import { getObjectExport, getObjectSummary } from './objectInterop';
import { SITE_DESCRIPTION, SITE_ORIGIN, SITE_TITLE, toSiteUrl, withTrailingSlash } from './site';

export interface FeedAttachment {
  url: string;
  mimeType: string;
  title?: string;
}

export interface FeedItemRecord {
  id: string;
  title: string;
  url: string;
  summary: string;
  contentText: string;
  contentHtml?: string;
  datePublished: Date;
  authorName: string;
  tags: string[];
  type: string;
  attachments: FeedAttachment[];
}

function getPublishedAt(entry: ArchiveEntry): Date {
  return entry.data.postedAt || entry.data.date;
}

export function isFollowableEntry(entry: ArchiveEntry): boolean {
  return isPrimarySurfaceEntry(entry);
}

export function isPublicObjectEntry(entry: ArchiveEntry): boolean {
  return entry.data.status === 'published' && entry.data.visibility === 'public';
}

function byPublishedAtDesc(a: ArchiveEntry, b: ArchiveEntry): number {
  const timestampDelta = getPublishedAt(b).valueOf() - getPublishedAt(a).valueOf();
  if (timestampDelta !== 0) {
    return timestampDelta;
  }

  return b.data.id.localeCompare(a.data.id);
}

export async function getFollowEntries(): Promise<ArchiveEntry[]> {
  return (await getAllEntries())
    .filter(isFollowableEntry)
    .sort(byPublishedAtDesc);
}

export async function getPublicObjectEntries(): Promise<ArchiveEntry[]> {
  return (await getAllEntries())
    .filter(isPublicObjectEntry)
    .sort(byPublishedAtDesc);
}

export function getFeedSummary(entry: ArchiveEntry): string {
  return getObjectSummary(entry);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getFeedAttachmentMimeType(src: string, kind: string): string {
  const pathname = (() => {
    try {
      return new URL(src, SITE_ORIGIN).pathname.toLowerCase();
    } catch {
      return src.toLowerCase();
    }
  })();

  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (pathname.endsWith('.png')) {
    return 'image/png';
  }
  if (pathname.endsWith('.webp')) {
    return 'image/webp';
  }
  if (pathname.endsWith('.gif')) {
    return 'image/gif';
  }
  if (pathname.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  if (pathname.endsWith('.mp4')) {
    return 'video/mp4';
  }
  if (pathname.endsWith('.webm')) {
    return 'video/webm';
  }
  if (pathname.endsWith('.mp3')) {
    return 'audio/mpeg';
  }
  if (pathname.endsWith('.wav')) {
    return 'audio/wav';
  }
  if (pathname.endsWith('.m4a')) {
    return 'audio/mp4';
  }

  if (kind === 'image') {
    return 'image/*';
  }
  if (kind === 'video') {
    return 'video/*';
  }
  return 'audio/*';
}

function buildFeedAttachments(entry: ReturnType<typeof getObjectExport>): FeedAttachment[] {
  return entry.media.map((item) => ({
    url: toSiteUrl(item.src),
    mimeType: getFeedAttachmentMimeType(item.src, item.kind),
    title: item.caption || item.alt || `${entry.title} ${item.role}`,
  }));
}

function buildImageOnlyFeedHtml(entry: ReturnType<typeof getObjectExport>): string | undefined {
  if (entry.content_text.trim() || entry.media.length === 0) {
    return undefined;
  }

  const imageHtml = entry.media
    .filter((item) => item.kind === 'image')
    .map((item) => {
      const alt = escapeHtml(item.alt || entry.title);
      const src = escapeHtml(toSiteUrl(item.src));
      const caption = item.caption?.trim();

      return [
        '<figure>',
        `<img src="${src}" alt="${alt}">`,
        caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : '',
        '</figure>',
      ]
        .filter(Boolean)
        .join('');
    })
    .join('');

  return imageHtml || undefined;
}

export function getFeedItem(entry: ArchiveEntry): FeedItemRecord {
  const exported = getObjectExport(entry);

  return {
    id: exported.id,
    title: formatDisplayTitle(entry.data.title),
    url: exported.url,
    summary: exported.summary || getFeedSummary(entry),
    contentText: exported.content_text,
    contentHtml: buildImageOnlyFeedHtml(exported),
    datePublished: getPublishedAt(entry),
    authorName: exported.author.name,
    tags: exported.tags,
    type: exported.type,
    attachments: buildFeedAttachments(exported),
  };
}
