import { getAuthorInitials, getPrimaryAuthor, type AuthorProfile } from './author';
import type { ArchiveEntry } from './archive';

export type MarginaliaKind = 'note' | 'quote' | 'link';
export type MythmechMarginaliaEntry = {
  type: string;
  value: string;
  sourceId: string;
};

const MYTHMECH_TAGS = new Set(['seed', 'load', 'fail', 'link', 'evol']);

export type MarginaliaLinkMeta = {
  href?: string;
  label: string;
  suffix?: string;
};

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function extractMythmechTags(value: string): string[] {
  return [...new Set(
    [...value.matchAll(/#([a-z0-9_-]+)/gi)]
      .map((match) => match[1].toLowerCase())
      .filter((tag) => MYTHMECH_TAGS.has(tag))
  )];
}

function getConnections(entry: ArchiveEntry) {
  const rawConnections = (entry.data as Record<string, unknown>).connections;
  if (!Array.isArray(rawConnections)) {
    return [];
  }

  return rawConnections
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const ref = normalizeText(record.ref);
      const role = normalizeText(record.role);
      const display = normalizeText(record.display) || 'inline';

      if (!ref || !role) {
        return null;
      }

      return {
        ref,
        role,
        display,
      };
    })
    .filter(
      (item): item is { ref: string; role: string; display: string } => Boolean(item)
    );
}

function getMarginaliaTimestamp(entry: ArchiveEntry): number {
  return (entry.data.postedAt ?? entry.data.date).valueOf();
}

function isMarginaliaRole(role: string): boolean {
  return role.trim().toLowerCase() === 'note';
}

function isMarginaliaTarget(entry: ArchiveEntry, targetId: string): boolean {
  return getConnections(entry).some(
    (connection) => connection.ref === targetId && isMarginaliaRole(connection.role)
  );
}

function isPublicFacingMarginaliaVisibility(entry: ArchiveEntry): boolean {
  return entry.data.visibility === 'public' || entry.data.visibility === 'unlisted';
}

export function isMarginaliaEntry(entry: ArchiveEntry): boolean {
  return (
    entry.collection === 'fragment' &&
    normalizeText((entry.data as Record<string, unknown>).origin).toLowerCase() === 'marginalia'
  );
}

export function isPrimarySurfaceEntry(entry: ArchiveEntry): boolean {
  return (
    entry.data.status === 'published' &&
    entry.data.visibility === 'public' &&
    !isMarginaliaEntry(entry)
  );
}

export function getMarginaliaEntriesForTarget(
  allEntries: ArchiveEntry[],
  targetId: string
): ArchiveEntry[] {
  return allEntries
    .filter(
      (entry) =>
        isMarginaliaEntry(entry) &&
        entry.data.status === 'published' &&
        isPublicFacingMarginaliaVisibility(entry) &&
        isMarginaliaTarget(entry, targetId)
    )
    .sort((a, b) => {
      const timestampDelta = getMarginaliaTimestamp(a) - getMarginaliaTimestamp(b);
      if (timestampDelta !== 0) {
        return timestampDelta;
      }

      return a.data.id.localeCompare(b.data.id);
    });
}

export function getMarginaliaBody(entry: ArchiveEntry): string {
  return entry.body.trim();
}

export function getMythmechMarginaliaEntries(entries: ArchiveEntry[]): MythmechMarginaliaEntry[] {
  return entries.flatMap((entry) => {
    const body = getMarginaliaBody(entry);
    const tags = extractMythmechTags(body);

    if (tags.length === 0) {
      return [];
    }

    return tags.map((tag) => ({
      type: tag,
      value: body,
      sourceId: entry.data.id,
    }));
  });
}

export function inferMarginaliaKind(body: string): MarginaliaKind {
  const normalized = body.trim();
  if (!normalized) {
    return 'note';
  }

  if (/^(?:→\s*)?(?:\/\S+|https?:\/\/\S+|www\.\S+)/i.test(normalized)) {
    return 'link';
  }

  if (
    /^["'“”‘’]/.test(normalized) ||
    /^—\s*/.test(normalized) ||
    /\s(?:—|--|-)\s*[A-Z][A-Za-z .'-]{1,48}$/.test(normalized)
  ) {
    return 'quote';
  }

  return 'note';
}

export function parseMarginaliaLink(body: string): MarginaliaLinkMeta | null {
  const normalized = body.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return null;
  }

  const withoutArrow = normalized.replace(/^→\s*/, '').trim();
  if (!withoutArrow) {
    return null;
  }

  const separatorMatch = withoutArrow.match(/\s(?:—|--)\s/);
  const separatorIndex = separatorMatch?.index ?? -1;
  const labelPart =
    separatorIndex >= 0 ? withoutArrow.slice(0, separatorIndex).trim() : withoutArrow;
  const suffix =
    separatorIndex >= 0
      ? withoutArrow.slice(separatorIndex + separatorMatch![0].length).trim()
      : '';
  const hrefCandidate = labelPart.match(/^(\/\S+|https?:\/\/\S+|www\.\S+)/i)?.[1] || '';

  return {
    href: hrefCandidate
      ? hrefCandidate.startsWith('www.')
        ? `https://${hrefCandidate}`
        : hrefCandidate
      : undefined,
    label: labelPart,
    suffix: suffix || undefined,
  };
}

export function formatMarginaliaDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function getMarginaliaAuthorTone(author: AuthorProfile): 'nd' | 'rw' | 'km' | 'default' {
  const id = normalizeText(author.id).toLowerCase();
  const handle = normalizeText(author.handle).toLowerCase();
  const name = normalizeText(author.name).toLowerCase();
  const initials = getAuthorInitials(author.name).toLowerCase();

  if (
    id === 'nathan-davis' ||
    handle === '@nathandavis' ||
    handle === 'nathandavis' ||
    initials === 'nd' ||
    name === 'nathan davis'
  ) {
    return 'nd';
  }

  if (initials === 'rw') {
    return 'rw';
  }

  if (initials === 'km') {
    return 'km';
  }

  return 'default';
}

export function getMarginaliaAuthorProfile(entry: ArchiveEntry): AuthorProfile {
  return getPrimaryAuthor(entry);
}
