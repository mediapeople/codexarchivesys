import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

type UnknownRecord = Record<string, unknown>;

export type MythmechSummary = {
  enabled: boolean;
  nodeCount: number;
  edgeCount: number;
  stateCount: number;
  stateLabels: string[];
  parentCount: number;
  childCount: number;
  relationCount: number;
  relationLabels: string[];
  spawnCandidateCount: number;
  candidateLabels: string[];
  marginaliaCount: number;
  marginaliaTypes: string[];
};

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeCopy(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function uniqueStrings(values: string[], max?: number): string[] {
  const unique = [...new Set(values.map((value) => normalizeCopy(value)).filter(Boolean))];
  return typeof max === 'number' ? unique.slice(0, max) : unique;
}

function formatStateLabel(key: string, value: unknown): string {
  const trimmedKey = titleCase(key);
  if (typeof value === 'boolean') {
    return value ? trimmedKey : '';
  }

  if (typeof value === 'number') {
    return `${trimmedKey} ${value}`;
  }

  const normalizedValue = asString(value);
  if (!normalizedValue) {
    return trimmedKey;
  }

  return `${trimmedKey} ${normalizedValue}`;
}

function extractLabel(item: unknown): string {
  if (typeof item === 'string') {
    return item.trim();
  }

  const record = asRecord(item);
  if (!record) {
    return '';
  }

  return (
    asString(record.label) ||
    asString(record.title) ||
    asString(record.id) ||
    asString(record.ref) ||
    asString(record.kind) ||
    asString(record.type)
  );
}

function extractMarginaliaType(item: unknown): string {
  if (typeof item === 'string') {
    return item.trim().replace(/^#+/, '');
  }

  const record = asRecord(item);
  if (!record) {
    return '';
  }

  return (
    asString(record.type).replace(/^#+/, '') ||
    asString(record.tag).replace(/^#+/, '') ||
    asString(record.label).replace(/^#+/, '')
  );
}

export function normalizePlatePrompt(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.replace(/\r\n?/g, '\n').trim();
  return normalized || null;
}

export function normalizeMythmechSidecar(value: unknown): UnknownRecord | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }

    try {
      return asRecord(parseYaml(normalized));
    } catch {
      return null;
    }
  }

  return asRecord(value);
}

export function stringifyMythmechSidecar(value: unknown): string | null {
  const normalized = normalizeMythmechSidecar(value);
  if (!normalized) {
    return null;
  }

  const serialized = stringifyYaml(normalized).trim();
  return serialized ? `${serialized}\n` : null;
}

export function summarizeMythmech(value: unknown): MythmechSummary | null {
  const root = normalizeMythmechSidecar(value);
  if (!root) {
    return null;
  }

  const mythmech = asRecord(root.mythmech) ?? {};
  const lineage = asRecord(root.lineage) ?? {};
  const spawn = asRecord(root.spawn) ?? {};
  const marginalia = asRecord(root.marginalia) ?? {};
  const states = asRecord(mythmech.states) ?? {};

  const stateLabels = uniqueStrings(
    Object.entries(states)
      .map(([key, stateValue]) => formatStateLabel(key, stateValue))
      .filter(Boolean),
    4
  );
  const relationLabels = uniqueStrings(asList(lineage.relations).map((item) => extractLabel(item)), 3);
  const candidateLabels = uniqueStrings(asList(spawn.candidates).map((item) => extractLabel(item)), 3);
  const marginaliaTypes = uniqueStrings(
    asList(marginalia.entries)
      .map((item) => extractMarginaliaType(item))
      .map((item) => (item ? titleCase(item) : ''))
      .filter(Boolean),
    4
  );

  return {
    enabled: mythmech.enabled !== false,
    nodeCount: asList(mythmech.nodes).length,
    edgeCount: asList(mythmech.edges).length,
    stateCount: Object.keys(states).length,
    stateLabels,
    parentCount: asList(lineage.parents).length,
    childCount: asList(lineage.children).length,
    relationCount: asList(lineage.relations).length,
    relationLabels,
    spawnCandidateCount: asList(spawn.candidates).length,
    candidateLabels,
    marginaliaCount: asList(marginalia.entries).length,
    marginaliaTypes,
  };
}

export function buildMythmechLead(summary: MythmechSummary): string {
  if (summary.nodeCount > 0 || summary.edgeCount > 0) {
    const nodesCopy = summary.nodeCount === 1 ? '1 node' : `${summary.nodeCount} nodes`;
    const edgesCopy = summary.edgeCount === 1 ? '1 edge' : `${summary.edgeCount} edges`;
    return `Mythmech maps ${nodesCopy} and ${edgesCopy} for structural inspection.`;
  }

  if (summary.spawnCandidateCount > 0) {
    return `Mythmech is attached and tracking spawn candidates for this object.`;
  }

  return summary.enabled
    ? 'Mythmech is attached as the structural inspection lens for this object.'
    : 'Mythmech metadata is stored for this object.';
}

export function buildMythmechSupport(summary: MythmechSummary): string {
  const lineageCopy =
    summary.parentCount > 0 || summary.childCount > 0 || summary.relationCount > 0
      ? `Lineage ${summary.parentCount} parents / ${summary.childCount} children / ${summary.relationCount} relations`
      : '';
  const spawnCopy = summary.spawnCandidateCount > 0 ? `Spawn ${summary.spawnCandidateCount} candidates` : '';
  const stateCopy = summary.stateCount > 0 ? `States ${summary.stateCount}` : '';
  const marginaliaCopy = summary.marginaliaCount > 0 ? `Marginalia ${summary.marginaliaCount}` : '';

  return uniqueStrings([lineageCopy, spawnCopy, stateCopy, marginaliaCopy]).join(' · ');
}
