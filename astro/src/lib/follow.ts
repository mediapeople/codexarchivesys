import { getPrimaryAuthor } from './author';
import { getAllEntries, getTypeLabel, type ArchiveEntry } from './archive';
import { formatDisplayTitle } from './headline';
import { getPresentationLead } from './presentation';

export const SITE_ORIGIN = 'https://ndcodex.com';
export const SITE_TITLE = 'Codex Archive';
export const SITE_DESCRIPTION =
  'An object archive for human creative work.';

function asOptionalText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function withTrailingSlash(path: string): string {
  if (path === '/' || /\.[a-z0-9]+$/i.test(path) || path.endsWith('/')) {
    return path;
  }

  return `${path}/`;
}

export function toSiteUrl(path: string): string {
  return new URL(withTrailingSlash(path), SITE_ORIGIN).toString();
}

function getPublishedAt(entry: ArchiveEntry): Date {
  return entry.data.postedAt || entry.data.date;
}

export function isFollowableEntry(entry: ArchiveEntry): boolean {
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

export function getFeedSummary(entry: ArchiveEntry): string {
  const excerpt = asOptionalText(entry.data.excerpt);
  if (excerpt) {
    return excerpt;
  }

  const presentationLead = getPresentationLead(entry);
  if (presentationLead) {
    return presentationLead;
  }

  return `${getTypeLabel(entry.collection)} in the Codex Archive.`;
}

export function getFeedItem(entry: ArchiveEntry) {
  const author = getPrimaryAuthor(entry);

  return {
    id: entry.data.id,
    title: formatDisplayTitle(entry.data.title),
    url: toSiteUrl(`/objects/${entry.data.id}`),
    summary: getFeedSummary(entry),
    datePublished: getPublishedAt(entry),
    authorName: author.name,
    tags: [getTypeLabel(entry.collection), ...entry.data.themes],
  };
}
