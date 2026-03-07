import type { ArchiveEntry } from './archive';
import {
  getDefaultSourceProfile,
  getSourceProfile,
  type SourceProfile,
} from './sourceProfiles';

export type AuthorProfile = {
  id?: string;
  name: string;
  designation?: string;
  role?: string;
  handle?: string;
  avatar?: string;
  bio?: string;
};

function fromSourceProfile(source: SourceProfile): AuthorProfile {
  return {
    id: source.id,
    name: source.name,
    designation: source.designation,
    role: source.designation,
    handle: source.handle,
    avatar: source.avatar,
    bio: source.bio,
  };
}

export const DEFAULT_AUTHOR: AuthorProfile = fromSourceProfile(getDefaultSourceProfile());

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeContributor(input: unknown): AuthorProfile | null {
  if (!input || typeof input !== 'object') {
    return null;
  }
  const record = input as Record<string, unknown>;
  const name = normalizeText(record.name);
  if (!name) {
    return null;
  }
  return {
    id: normalizeText(record.id),
    name,
    designation: normalizeText(record.designation) || normalizeText(record.role),
    role: normalizeText(record.role),
    handle: normalizeText(record.handle),
    avatar: normalizeText(record.avatar),
    bio: normalizeText(record.bio),
  };
}

function withSourceDefaults(author: AuthorProfile, source: AuthorProfile): AuthorProfile {
  return {
    ...source,
    ...author,
    designation: author.designation || source.designation,
    role: author.role || author.designation || source.role || source.designation,
    avatar: author.avatar || source.avatar || DEFAULT_AUTHOR.avatar,
  };
}

function sameIdentity(a: AuthorProfile, b: AuthorProfile): boolean {
  if (a.id && b.id) {
    return a.id === b.id;
  }
  if (a.handle && b.handle) {
    return a.handle.toLowerCase() === b.handle.toLowerCase();
  }
  return a.name.toLowerCase() === b.name.toLowerCase();
}

export function getAuthorProfiles(entry: ArchiveEntry): AuthorProfile[] {
  const data = entry.data as Record<string, unknown>;
  const sourceId = normalizeText(data.source);
  const source = sourceId ? getSourceProfile(sourceId) : null;
  const sourceProfile = source ? fromSourceProfile(source) : DEFAULT_AUTHOR;
  const contributorsRaw = data.contributors;
  const contributors = Array.isArray(contributorsRaw)
    ? contributorsRaw
        .map(normalizeContributor)
        .filter((item): item is AuthorProfile => Boolean(item))
    : [];

  const author = normalizeContributor(data.author);
  const merged = [...contributors];

  if (author && !merged.some((item) => sameIdentity(item, author))) {
    merged.unshift(author);
  }

  if (!author && merged.length === 0 && sourceProfile) {
    merged.push(sourceProfile);
  }

  if (merged.length === 0) {
    return [DEFAULT_AUTHOR];
  }

  return merged.map((item) => {
    if (item.id) {
      const sourceById = getSourceProfile(item.id);
      if (sourceById) {
        return withSourceDefaults(item, fromSourceProfile(sourceById));
      }
    }
    return withSourceDefaults(item, sourceProfile);
  });
}

export function getPrimaryAuthor(entry: ArchiveEntry): AuthorProfile {
  return getAuthorProfiles(entry)[0] || DEFAULT_AUTHOR;
}

export function getAuthorInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return 'AU';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}
