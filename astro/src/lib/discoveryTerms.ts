import type { ArchiveEntry } from './archive';

const LOW_SIGNAL_DISCOVERY_SLUGS = new Set([
  'across',
  'another',
  'arrived',
  'away',
  'become',
  'built',
  'counts',
  'does',
  'everything',
  'here',
  'http',
  'https',
  'keeps',
  'leave',
  'maybe',
  'much',
  'once',
  'what',
  'when',
  'www',
]);

const URLISH_TERM_RE =
  /^(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:ai|app|co|com|dev|edu|gov|io|me|net|org|tv|us))(?:[/?#].*)?$/i;

function normalizeDiscoveryTerm(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function termKey(value: string): string {
  return value.trim().toLowerCase();
}

export function slugifyDiscoveryTerm(term: string): string {
  return normalizeDiscoveryTerm(term)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isLowSignalDiscoveryTerm(value: unknown): boolean {
  const normalized = normalizeDiscoveryTerm(value);
  if (!normalized) {
    return true;
  }

  if (URLISH_TERM_RE.test(normalized)) {
    return true;
  }

  const slug = slugifyDiscoveryTerm(normalized);
  if (!slug || slug.length <= 2) {
    return true;
  }

  return LOW_SIGNAL_DISCOVERY_SLUGS.has(slug);
}

export function sanitizeDiscoveryTerms(values: Iterable<unknown>): string[] {
  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const value of values) {
    const normalized = normalizeDiscoveryTerm(value);
    if (!normalized || isLowSignalDiscoveryTerm(normalized)) {
      continue;
    }

    const key = termKey(normalized);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    sanitized.push(normalized);
  }

  return sanitized;
}

export function buildThemeCountMap(entries: ArchiveEntry[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    for (const theme of sanitizeDiscoveryTerms(entry.data.themes || [])) {
      const key = termKey(theme);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return counts;
}

export function isIndexableThemeTerm(
  term: string,
  themeCounts: ReadonlyMap<string, number>,
  minCount = 2
): boolean {
  if (isLowSignalDiscoveryTerm(term)) {
    return false;
  }

  return (themeCounts.get(termKey(term)) || 0) >= minCount;
}

export function buildIndexableThemeSet(
  entries: ArchiveEntry[],
  minCount = 2
): Set<string> {
  const counts = buildThemeCountMap(entries);
  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count >= minCount)
      .map(([key]) => key)
  );
}
