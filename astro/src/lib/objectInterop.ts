import type { CodexMediaItem } from '../content/config';
import { getAuthorProfiles, getPrimaryAuthor, type AuthorProfile } from './author';
import { getTypeLabel, type ArchiveEntry, type CodexCollection } from './archive';
import { sanitizeDiscoveryTerms } from './discoveryTerms';
import { bodyStartsWithDuplicateTitleHeading, resolveExcerpt } from './excerpt';
import { formatDisplayTitle } from './headline';
import { SITE_TITLE, toSiteUrl } from './site';

type ObjectRelationKind = 'related' | 'connection' | 'included' | 'dependency';

interface ObjectRelation {
  kind: ObjectRelationKind;
  target: string;
  slug: string;
  url: string;
  role?: string;
  display?: string;
}

export interface ObjectExportRecord {
  id: string;
  archive_id: string;
  slug: string;
  url: string;
  type: string;
  title: string;
  summary: string;
  content_text: string;
  content_markdown: string;
  author: AuthorProfile;
  contributors: AuthorProfile[];
  date_published: string;
  date_modified: string;
  status: string;
  visibility: string;
  language: string;
  axes: {
    scale: string | null;
    depth: string | null;
    focus: string | null;
    function: string | null;
  };
  themes: string[];
  constellations: string[];
  tags: string[];
  keywords: string[];
  relations: ObjectRelation[];
  media: CodexMediaItem[];
}

const SCHEMA_TYPE_BY_COLLECTION: Record<CodexCollection, string> = {
  scroll: 'Article',
  loremap: 'Map',
  artifact: 'VisualArtwork',
  fieldlog: 'Report',
  codex: 'Article',
  fragment: 'CreativeWork',
  nexus: 'PublicationIssue',
  signal: 'Article',
};

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

export function normalizeObjectReference(value: unknown): string {
  const raw = normalizeText(value);
  if (!raw) {
    return '';
  }

  if (raw.startsWith('codex://object/')) {
    return decodeURIComponent(raw.slice('codex://object/'.length)).trim();
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const match = url.pathname.match(/^\/(?:objects|codex|nexus)\/([^/]+)\/?$/i);
      return match?.[1] ? decodeURIComponent(match[1]).trim() : raw;
    } catch {
      return raw;
    }
  }

  const relativeMatch = raw.match(/^\/(?:objects|codex|nexus)\/([^/]+)\/?$/i);
  if (relativeMatch?.[1]) {
    return decodeURIComponent(relativeMatch[1]).trim();
  }

  return raw;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(normalized);
  }

  return deduped;
}

function getSummaryField(entry: ArchiveEntry): string {
  const data = entry.data as Record<string, unknown>;
  return normalizeText(data.summary) || normalizeText(data.excerpt);
}

function stripLeadingTitleHeading(title: string, body: string): string {
  if (!bodyStartsWithDuplicateTitleHeading(title, body)) {
    return body;
  }

  const lines = body.replace(/\r\n?/g, '\n').split('\n');
  let removedHeading = false;

  return lines
    .filter((line) => {
      if (!removedHeading && /^\s{0,3}#{1,6}\s+/u.test(line)) {
        removedHeading = true;
        return false;
      }

      return true;
    })
    .join('\n')
    .trim();
}

function stripFencedCodeBlocks(value: string): string {
  const lines = value.replace(/\r\n?/g, '\n').split('\n');
  const kept: string[] = [];
  let fence: '```' | '~~~' | null = null;

  for (const line of lines) {
    const trimmed = line.trimStart();

    if (!fence) {
      if (trimmed.startsWith('```')) {
        fence = '```';
        continue;
      }

      if (trimmed.startsWith('~~~')) {
        fence = '~~~';
        continue;
      }

      kept.push(line);
      continue;
    }

    if (trimmed.startsWith(fence)) {
      fence = null;
    }
  }

  return kept.join('\n');
}

function markdownToPlainText(title: string, body: string): string {
  return stripFencedCodeBlocks(stripLeadingTitleHeading(title, body))
    .replace(/!\[\[[^\]]+\]\]/g, ' ')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s{0,3}#{1,6}\s+/u, '')
        .replace(/^\s*>\s?/u, '')
        .replace(/^\s*[-*+]\s+/u, '')
        .replace(/^\s*\d+\.\s+/u, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

function getObjectDataType(entry: ArchiveEntry): string {
  return normalizeText((entry.data as Record<string, unknown>).type) || entry.collection;
}

export function getObjectThemes(entry: ArchiveEntry): string[] {
  return sanitizeDiscoveryTerms(entry.data.themes || []);
}

export function getObjectTags(entry: ArchiveEntry): string[] {
  const data = entry.data as Record<string, unknown>;
  return uniqueStrings(
    sanitizeDiscoveryTerms([
      ...normalizeStringArray(data.tags),
      ...getObjectThemes(entry),
    ])
  );
}

export function getObjectSlug(entry: ArchiveEntry): string {
  const data = entry.data as Record<string, unknown>;
  return normalizeObjectReference(data.slug) || normalizeObjectReference(entry.data.id) || normalizeText(entry.slug);
}

export function getObjectStableId(entryOrSlug: ArchiveEntry | string): string {
  const slug = typeof entryOrSlug === 'string' ? normalizeObjectReference(entryOrSlug) : getObjectSlug(entryOrSlug);

  if (slug.startsWith('codex://')) {
    return slug;
  }

  return `codex://object/${slug}`;
}

export function getObjectPath(entryOrSlug: ArchiveEntry | string): string {
  const slug = typeof entryOrSlug === 'string' ? normalizeObjectReference(entryOrSlug) : getObjectSlug(entryOrSlug);
  return `/objects/${encodeURIComponent(slug)}`;
}

export function getObjectJsonPath(entry: ArchiveEntry): string {
  return `${getObjectPath(entry)}.json`;
}

export function getObjectMarkdownPath(entry: ArchiveEntry): string {
  return `${getObjectPath(entry)}.md`;
}

export function getObjectCanonicalUrl(entry: ArchiveEntry): string {
  const explicitUrl = normalizeText((entry.data as Record<string, unknown>).url);
  if (explicitUrl) {
    return toSiteUrl(explicitUrl);
  }

  return toSiteUrl(getObjectPath(entry));
}

export function matchesObjectParam(entry: ArchiveEntry, value: string | undefined): boolean {
  return matchesObjectReference(entry, value);
}

export function getObjectPublishedAt(entry: ArchiveEntry): Date {
  return entry.data.postedAt || entry.data.date;
}

export function getObjectUpdatedAt(entry: ArchiveEntry): Date {
  return entry.data.postedAt || entry.data.date;
}

export function getObjectSummary(entry: ArchiveEntry, max = 220): string {
  return (
    resolveExcerpt({
      title: entry.data.title,
      excerpt: getSummaryField(entry),
      body: entry.body,
      max,
    }) || `${getTypeLabel(entry.collection)} in the Codex Archive.`
  );
}

export function getObjectContentText(entry: ArchiveEntry): string {
  return markdownToPlainText(entry.data.title, entry.body);
}

function makeRelation(kind: ObjectRelationKind, slug: string, extras?: Partial<ObjectRelation>): ObjectRelation | null {
  const normalizedSlug = normalizeObjectReference(slug);
  if (!normalizedSlug) {
    return null;
  }

  return {
    kind,
    target: getObjectStableId(normalizedSlug),
    slug: normalizedSlug,
    url: toSiteUrl(getObjectPath(normalizedSlug)),
    ...extras,
  };
}

export function getObjectReferenceAliases(entry: ArchiveEntry): string[] {
  return uniqueStrings([
    normalizeObjectReference(entry.data.id),
    getObjectSlug(entry),
    normalizeObjectReference(getObjectPath(entry)),
    normalizeObjectReference(getObjectCanonicalUrl(entry)),
    normalizeObjectReference(getObjectStableId(entry)),
  ]);
}

export function matchesObjectReference(entry: ArchiveEntry, value: unknown): boolean {
  const normalized = normalizeObjectReference(value);
  if (!normalized) {
    return false;
  }

  return getObjectReferenceAliases(entry).includes(normalized);
}

export function buildObjectLookup(entries: ArchiveEntry[]): Map<string, ArchiveEntry> {
  const lookup = new Map<string, ArchiveEntry>();

  for (const entry of entries) {
    for (const alias of getObjectReferenceAliases(entry)) {
      if (!lookup.has(alias)) {
        lookup.set(alias, entry);
      }
    }
  }

  return lookup;
}

export function resolveObjectReference(
  entriesOrLookup: ArchiveEntry[] | Map<string, ArchiveEntry>,
  value: unknown
): ArchiveEntry | undefined {
  const normalized = normalizeObjectReference(value);
  if (!normalized) {
    return undefined;
  }

  if (entriesOrLookup instanceof Map) {
    return entriesOrLookup.get(normalized);
  }

  return entriesOrLookup.find((entry) => matchesObjectReference(entry, normalized));
}

export function getObjectRelations(entry: ArchiveEntry): ObjectRelation[] {
  const data = entry.data as Record<string, unknown>;
  const related = normalizeStringArray(data.related).map((slug) => makeRelation('related', slug));
  const dependencies = normalizeStringArray(data.dependencies).map((slug) => makeRelation('dependency', slug));

  const connections = Array.isArray(data.connections)
    ? data.connections
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null;
          }

          const record = item as Record<string, unknown>;
          return makeRelation('connection', normalizeText(record.ref), {
            role: normalizeText(record.role) || undefined,
            display: normalizeText(record.display) || undefined,
          });
        })
        .filter((item): item is ObjectRelation => Boolean(item))
    : [];

  const included = Array.isArray(data.includedObjects)
    ? data.includedObjects
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null;
          }

          const record = item as Record<string, unknown>;
          return makeRelation('included', normalizeText(record.ref), {
            role: normalizeText(record.role) || undefined,
          });
        })
        .filter((item): item is ObjectRelation => Boolean(item))
    : [];

  const relations = [...related, ...dependencies, ...connections, ...included].filter(
    (item): item is ObjectRelation => Boolean(item)
  );

  const seen = new Set<string>();
  return relations.filter((relation) => {
    const key = [relation.kind, relation.slug, relation.role || '', relation.display || ''].join('|');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function getObjectKeywords(entry: ArchiveEntry): string[] {
  return uniqueStrings([
    getTypeLabel(entry.collection),
    getObjectDataType(entry),
    ...getObjectThemes(entry),
    ...entry.data.constellations,
    ...getObjectTags(entry),
  ]);
}

export function getObjectImageUrls(entry: ArchiveEntry): string[] {
  const data = entry.data as Record<string, unknown>;
  const mediaImageUrls = entry.data.media
    .filter((item) => item.kind === 'image')
    .map((item) => item.src);
  const directImageUrls = normalizeStringArray(data.images);

  return uniqueStrings([...mediaImageUrls, ...directImageUrls]).map((value) => toSiteUrl(value));
}

export function getObjectExport(entry: ArchiveEntry): ObjectExportRecord {
  const contributors = getAuthorProfiles(entry);
  const author = getPrimaryAuthor(entry);
  const themes = getObjectThemes(entry);
  const tags = getObjectTags(entry);

  return {
    id: getObjectStableId(entry),
    archive_id: entry.data.id,
    slug: getObjectSlug(entry),
    url: getObjectCanonicalUrl(entry),
    type: getObjectDataType(entry),
    title: formatDisplayTitle(entry.data.title),
    summary: getObjectSummary(entry),
    content_text: getObjectContentText(entry),
    content_markdown: entry.body.trim(),
    author,
    contributors,
    date_published: getObjectPublishedAt(entry).toISOString(),
    date_modified: getObjectUpdatedAt(entry).toISOString(),
    status: entry.data.status,
    visibility: entry.data.visibility,
    language: 'en-US',
    axes: {
      scale: entry.data.scale ?? null,
      depth: entry.data.depth ?? null,
      focus: entry.data.focus ?? null,
      function: entry.data.function ?? null,
    },
    themes,
    constellations: [...entry.data.constellations],
    tags,
    keywords: getObjectKeywords(entry),
    relations: getObjectRelations(entry),
    media: [...entry.data.media],
  };
}

export function getObjectJsonLd(entry: ArchiveEntry): Record<string, unknown> {
  const exported = getObjectExport(entry);
  const primaryImageUrls = getObjectImageUrls(entry);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': SCHEMA_TYPE_BY_COLLECTION[entry.collection],
    '@id': exported.url,
    identifier: exported.id,
    url: exported.url,
    name: exported.title,
    headline: exported.title,
    description: exported.summary,
    datePublished: exported.date_published,
    dateModified: exported.date_modified,
    inLanguage: exported.language,
    genre: getTypeLabel(entry.collection),
    keywords: exported.keywords,
    author: {
      '@type': 'Person',
      name: exported.author.name,
    },
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_TITLE,
      url: toSiteUrl('/'),
    },
  };

  if (primaryImageUrls.length === 1) {
    jsonLd.image = primaryImageUrls[0];
  } else if (primaryImageUrls.length > 1) {
    jsonLd.image = primaryImageUrls;
  }

  return jsonLd;
}

function yamlQuote(value: string): string {
  return JSON.stringify(value);
}

function yamlOptionalLine(key: string, value: string | undefined | null): string | null {
  if (!value) {
    return null;
  }

  return `${key}: ${yamlQuote(value)}`;
}

function yamlStringArray(key: string, values: string[]): string[] {
  if (values.length === 0) {
    return [`${key}: []`];
  }

  return [
    `${key}:`,
    ...values.map((value) => `  - ${yamlQuote(value)}`),
  ];
}

function yamlRecord(key: string, value: Record<string, unknown>): string[] {
  const entries = Object.entries(value).filter(([, fieldValue]) => fieldValue !== null && fieldValue !== undefined && fieldValue !== '');
  if (entries.length === 0) {
    return [`${key}: {}`];
  }

  return [
    `${key}:`,
    ...entries.map(([fieldKey, fieldValue]) => `  ${fieldKey}: ${yamlQuote(String(fieldValue))}`),
  ];
}

function yamlObjectArray(key: string, values: Array<Record<string, unknown>>): string[] {
  if (values.length === 0) {
    return [`${key}: []`];
  }

  const lines: string[] = [`${key}:`];

  for (const value of values) {
    const entries = Object.entries(value).filter(([, fieldValue]) => fieldValue !== null && fieldValue !== undefined && fieldValue !== '');

    if (entries.length === 0) {
      lines.push('  - {}');
      continue;
    }

    entries.forEach(([fieldKey, fieldValue], index) => {
      const prefix = index === 0 ? '  - ' : '    ';
      lines.push(`${prefix}${fieldKey}: ${yamlQuote(String(fieldValue))}`);
    });
  }

  return lines;
}

export function serializeObjectMarkdown(entry: ArchiveEntry): string {
  const exported = getObjectExport(entry);
  const lines: Array<string | null> = [
    '---',
    `id: ${yamlQuote(exported.id)}`,
    `archive_id: ${yamlQuote(exported.archive_id)}`,
    `slug: ${yamlQuote(exported.slug)}`,
    `url: ${yamlQuote(exported.url)}`,
    `type: ${yamlQuote(exported.type)}`,
    `title: ${yamlQuote(exported.title)}`,
    `summary: ${yamlQuote(exported.summary)}`,
    `date_published: ${yamlQuote(exported.date_published)}`,
    `date_modified: ${yamlQuote(exported.date_modified)}`,
    `status: ${yamlQuote(exported.status)}`,
    `visibility: ${yamlQuote(exported.visibility)}`,
    `language: ${yamlQuote(exported.language)}`,
    ...yamlRecord('axes', exported.axes),
    ...yamlStringArray('themes', exported.themes),
    ...yamlStringArray('constellations', exported.constellations),
    ...yamlStringArray('tags', exported.tags),
    ...yamlStringArray('keywords', exported.keywords),
    ...yamlRecord('author', exported.author as Record<string, unknown>),
    ...yamlObjectArray(
      'contributors',
      exported.contributors.map((contributor) => contributor as Record<string, unknown>)
    ),
    ...yamlObjectArray(
      'relations',
      exported.relations.map((relation) => relation as Record<string, unknown>)
    ),
    ...yamlObjectArray(
      'media',
      exported.media.map((item) => item as Record<string, unknown>)
    ),
    '---',
    '',
    entry.body.trim(),
    '',
  ];

  return lines.filter((line): line is string => Boolean(line)).join('\n');
}
