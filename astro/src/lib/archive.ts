import { getCollection, type CollectionEntry } from 'astro:content';

export const COLLECTIONS = [
  'scroll',
  'artifact',
  'fieldlog',
  'codex',
  'fragment',
  'nexus',
] as const;

export type CodexCollection = (typeof COLLECTIONS)[number];

export type ArchiveEntry =
  | CollectionEntry<'scroll'>
  | CollectionEntry<'artifact'>
  | CollectionEntry<'fieldlog'>
  | CollectionEntry<'codex'>
  | CollectionEntry<'fragment'>
  | CollectionEntry<'nexus'>;

function byDateDesc(a: ArchiveEntry, b: ArchiveEntry) {
  return b.data.date.valueOf() - a.data.date.valueOf();
}

export async function getAllEntries(): Promise<ArchiveEntry[]> {
  const [scroll, artifact, fieldlog, codex, fragment, nexus] =
    await Promise.all([
      getCollection('scroll'),
      getCollection('artifact'),
      getCollection('fieldlog'),
      getCollection('codex'),
      getCollection('fragment'),
      getCollection('nexus'),
    ]);

  return [
    ...scroll,
    ...artifact,
    ...fieldlog,
    ...codex,
    ...fragment,
    ...nexus,
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
  };
  return labelMap[type] || type;
}

