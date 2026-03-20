import { getAllEntries, type ArchiveEntry } from './archive';
import { formatDisplayTitle } from './headline';
import { isPrimarySurfaceEntry } from './marginalia';
import { getObjectExport, getObjectSummary } from './objectInterop';
import { SITE_DESCRIPTION, SITE_ORIGIN, SITE_TITLE, toSiteUrl, withTrailingSlash } from './site';

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

export function getFeedItem(entry: ArchiveEntry) {
  const exported = getObjectExport(entry);

  return {
    id: exported.id,
    title: formatDisplayTitle(entry.data.title),
    url: exported.url,
    summary: exported.summary || getFeedSummary(entry),
    contentText: exported.content_text,
    datePublished: getPublishedAt(entry),
    authorName: exported.author.name,
    tags: exported.tags,
    type: exported.type,
  };
}
