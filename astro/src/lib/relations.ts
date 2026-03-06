import type { ArchiveEntry } from './archive';

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

export function computeRelatedEntries(
  source: ArchiveEntry,
  allEntries: ArchiveEntry[],
  limit = 3
): RelatedHit[] {
  const sourceRelated = source.data.related || [];
  const sourceIncluded = getIncludedRefs(source);

  const scored = allEntries
    .filter((candidate) => candidate.data.id !== source.data.id)
    .map((candidate) => {
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

      if (sourceRelated.includes(candidate.data.id)) {
        score += 5;
        reasons.push('explicit-link');
      }

      if (candidate.data.related.includes(source.data.id)) {
        score += 2;
        reasons.push('reverse-link');
      }

      const candidateIncluded = getIncludedRefs(candidate);
      if (sourceIncluded.includes(candidate.data.id)) {
        score += 4;
        reasons.push('nexus-inclusion');
      }
      if (candidateIncluded.includes(source.data.id)) {
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

