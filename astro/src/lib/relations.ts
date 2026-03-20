import type { ArchiveEntry } from './archive';
import { isMarginaliaEntry } from './marginalia';
import { getObjectReferenceAliases, normalizeObjectReference } from './objectInterop';

export interface RelatedHit {
  entry: ArchiveEntry;
  score: number;
  reasons: string[];
}

function countOverlap(a: string[] = [], b: string[] = []) {
  const bSet = new Set(b);
  let count = 0;
  for (const value of a) {
    if (bSet.has(value)) {
      count += 1;
    }
  }
  return count;
}

function getIncludedRefs(entry: ArchiveEntry): string[] {
  const maybeIncluded = (entry.data as Record<string, unknown>).includedObjects;
  if (!Array.isArray(maybeIncluded)) {
    return [];
  }
  return maybeIncluded
    .map((item) => {
      if (
        item &&
        typeof item === 'object' &&
        'ref' in item &&
        typeof (item as { ref: unknown }).ref === 'string'
      ) {
        return (item as { ref: string }).ref;
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
}

function getConnectionRefs(entry: ArchiveEntry): string[] {
  const maybeConnections = (entry.data as Record<string, unknown>).connections;
  if (!Array.isArray(maybeConnections)) {
    return [];
  }

  return maybeConnections
    .map((item) => {
      if (
        item &&
        typeof item === 'object' &&
        'ref' in item &&
        typeof (item as { ref: unknown }).ref === 'string'
      ) {
        return (item as { ref: string }).ref;
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
}

export function computeRelatedEntries(
  source: ArchiveEntry,
  allEntries: ArchiveEntry[],
  limit = 3
): RelatedHit[] {
  if (isMarginaliaEntry(source)) {
    return [];
  }

  const sourceAliases = new Set(getObjectReferenceAliases(source));
  const sourceRelated = new Set((source.data.related || []).map((value) => normalizeObjectReference(value)));
  const sourceConnections = new Set(getConnectionRefs(source).map((value) => normalizeObjectReference(value)));
  const sourceIncluded = new Set(getIncludedRefs(source).map((value) => normalizeObjectReference(value)));

  const scored = allEntries
    .filter(
      (candidate) => candidate.data.id !== source.data.id && !isMarginaliaEntry(candidate)
    )
    .map((candidate) => {
      const candidateAliases = getObjectReferenceAliases(candidate);
      let score = 0;
      const reasons: string[] = [];

      const sharedThemes = countOverlap(source.data.themes, candidate.data.themes);
      if (sharedThemes > 0) {
        score += sharedThemes * 2;
        reasons.push(`themes:${sharedThemes}`);
      }

      const sharedConstellations = countOverlap(
        source.data.constellations,
        candidate.data.constellations
      );
      if (sharedConstellations > 0) {
        score += sharedConstellations * 3;
        reasons.push(`constellations:${sharedConstellations}`);
      }

      if (candidateAliases.some((alias) => sourceRelated.has(alias))) {
        score += 5;
        reasons.push('explicit-link');
      }

      if (candidateAliases.some((alias) => sourceConnections.has(alias))) {
        score += 6;
        reasons.push('explicit-connection');
      }

      const candidateRelated = new Set(
        (candidate.data.related || []).map((value) => normalizeObjectReference(value))
      );
      if ([...sourceAliases].some((alias) => candidateRelated.has(alias))) {
        score += 2;
        reasons.push('reverse-link');
      }

      const candidateConnections = new Set(
        getConnectionRefs(candidate).map((value) => normalizeObjectReference(value))
      );
      if ([...sourceAliases].some((alias) => candidateConnections.has(alias))) {
        score += 3;
        reasons.push('reverse-connection');
      }

      const candidateIncluded = new Set(
        getIncludedRefs(candidate).map((value) => normalizeObjectReference(value))
      );
      if (candidateAliases.some((alias) => sourceIncluded.has(alias))) {
        score += 4;
        reasons.push('nexus-inclusion');
      }
      if ([...sourceAliases].some((alias) => candidateIncluded.has(alias))) {
        score += 4;
        reasons.push('included-by-nexus');
      }

      return {
        entry: candidate,
        score,
        reasons,
      };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => {
      if (a.score === b.score) {
        return b.entry.data.date.valueOf() - a.entry.data.date.valueOf();
      }
      return b.score - a.score;
    });

  return scored.slice(0, limit);
}
