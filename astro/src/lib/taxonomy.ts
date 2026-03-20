import type { ArchiveEntry } from './archive';
import {
  buildThemeCountMap,
  isIndexableThemeTerm,
  sanitizeDiscoveryTerms,
} from './discoveryTerms';
import { getPublicObjectEntries } from './follow';
import { getObjectUpdatedAt } from './objectInterop';
import { compareByPureTimeline } from './timeline';

export type TaxonomyKind = 'theme' | 'constellation';

export interface TaxonomyRecord {
  kind: TaxonomyKind;
  term: string;
  slug: string;
  count: number;
  entries: ArchiveEntry[];
  updatedAt: Date;
}

function normalizeTerm(value: string): string {
  return value.trim();
}

function getEntryTerms(entry: ArchiveEntry, kind: TaxonomyKind): string[] {
  if (kind === 'theme') {
    return sanitizeDiscoveryTerms(entry.data.themes || []);
  }

  return entry.data.constellations;
}

export function slugifyTaxonomyTerm(term: string): string {
  return normalizeTerm(term)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getTaxonomyLabel(kind: TaxonomyKind, plural = false): string {
  if (kind === 'theme') {
    return plural ? 'Themes' : 'Theme';
  }

  return plural ? 'Constellations' : 'Constellation';
}

export function getTaxonomyDefinition(kind: TaxonomyKind): string {
  if (kind === 'theme') {
    return 'Themes preserve recurring signals across object types and help retrieval stay legible over time.';
  }

  return 'Constellations are editor-assigned clusters that bind related objects into durable reading paths.';
}

export function getTaxonomyIndexPath(kind: TaxonomyKind): string {
  return kind === 'theme' ? '/themes' : '/constellations';
}

export function getTaxonomyTermPath(kind: TaxonomyKind, term: string): string {
  return `${getTaxonomyIndexPath(kind)}/${encodeURIComponent(slugifyTaxonomyTerm(term))}`;
}

export function collectTaxonomyRecords(entries: ArchiveEntry[], kind: TaxonomyKind): TaxonomyRecord[] {
  const recordByTerm = new Map<string, TaxonomyRecord>();
  const termBySlug = new Map<string, string>();

  for (const entry of entries) {
    for (const rawTerm of getEntryTerms(entry, kind)) {
      const term = normalizeTerm(rawTerm);
      if (!term) {
        continue;
      }

      const slug = slugifyTaxonomyTerm(term);
      const existingTerm = termBySlug.get(slug);
      if (existingTerm && existingTerm !== term) {
        throw new Error(`Duplicate ${kind} slug "${slug}" for "${existingTerm}" and "${term}"`);
      }
      termBySlug.set(slug, term);

      const existing = recordByTerm.get(term);
      if (existing) {
        existing.entries.push(entry);
        existing.count += 1;
        if (getObjectUpdatedAt(entry).valueOf() > existing.updatedAt.valueOf()) {
          existing.updatedAt = getObjectUpdatedAt(entry);
        }
        continue;
      }

      recordByTerm.set(term, {
        kind,
        term,
        slug,
        count: 1,
        entries: [entry],
        updatedAt: getObjectUpdatedAt(entry),
      });
    }
  }

  const records = [...recordByTerm.values()]
    .map((record) => ({
      ...record,
      entries: [...record.entries].sort(compareByPureTimeline),
    }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));

  if (kind !== 'theme') {
    return records;
  }

  const themeCounts = buildThemeCountMap(entries);
  return records.filter((record) => isIndexableThemeTerm(record.term, themeCounts));
}

export async function getPublicTaxonomyRecords(kind: TaxonomyKind): Promise<TaxonomyRecord[]> {
  return collectTaxonomyRecords(await getPublicObjectEntries(), kind);
}

export async function getPublicTaxonomyRecordBySlug(
  kind: TaxonomyKind,
  slug: string | undefined
): Promise<TaxonomyRecord | undefined> {
  const normalizedSlug = String(slug || '').trim().toLowerCase();
  if (!normalizedSlug) {
    return undefined;
  }

  return (await getPublicTaxonomyRecords(kind)).find((record) => record.slug === normalizedSlug);
}

export function collectRelatedTaxonomyTerms(
  entries: ArchiveEntry[],
  kind: TaxonomyKind,
  excludedTerms: string[] = [],
  limit = 8
): Array<{ term: string; slug: string; count: number }> {
  const excluded = new Set(excludedTerms.map((term) => normalizeTerm(term).toLowerCase()));
  const counts = new Map<string, number>();
  const labels = new Map<string, string>();

  for (const entry of entries) {
    for (const rawTerm of getEntryTerms(entry, kind)) {
      const term = normalizeTerm(rawTerm);
      if (!term || excluded.has(term.toLowerCase())) {
        continue;
      }

      const key = term.toLowerCase();
      labels.set(key, term);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const filtered =
    kind === 'theme'
      ? ranked.filter(([key]) => isIndexableThemeTerm(labels.get(key) || key, counts))
      : ranked;

  return filtered.slice(0, limit).map(([key, count]) => {
    const term = labels.get(key) || key;
    return {
      term,
      slug: slugifyTaxonomyTerm(term),
      count,
    };
  });
}
