import { getCollection, type CollectionEntry } from 'astro:content';

export const COLLECTIONS = [
  'scroll',
  'artifact',
  'fieldlog',
  'codex',
  'fragment',
  'nexus',
  'signal',
] as const;

export type CodexCollection = (typeof COLLECTIONS)[number];

export type ArchiveEntry =
  | CollectionEntry<'scroll'>
  | CollectionEntry<'artifact'>
  | CollectionEntry<'fieldlog'>
  | CollectionEntry<'codex'>
  | CollectionEntry<'fragment'>
  | CollectionEntry<'nexus'>
  | CollectionEntry<'signal'>;

function byDateDesc(a: ArchiveEntry, b: ArchiveEntry) {
  const bTimestamp = (b.data.postedAt || b.data.date).valueOf();
  const aTimestamp = (a.data.postedAt || a.data.date).valueOf();
  return bTimestamp - aTimestamp;
}

export async function getAllEntries(): Promise<ArchiveEntry[]> {
  const [scroll, artifact, fieldlog, codex, fragment, nexus, signal] =
    await Promise.all([
      getCollection('scroll'),
      getCollection('artifact'),
      getCollection('fieldlog'),
      getCollection('codex'),
      getCollection('fragment'),
      getCollection('nexus'),
      getCollection('signal'),
    ]);

  return [
    ...scroll,
    ...artifact,
    ...fieldlog,
    ...codex,
    ...fragment,
    ...nexus,
    ...signal,
  ].sort(byDateDesc);
}

export function getTypeLabel(type: string): string {
  const labelMap: Record<string, string> = {
    scroll: 'Scroll',
    artifact: 'Artifact',
    fieldlog: 'Field Log',
    codex: 'Codex',
    fragment: 'Fragment',
    nexus: 'Nexus',
    signal: 'Signal',
  };
  return labelMap[type] || type;
}
