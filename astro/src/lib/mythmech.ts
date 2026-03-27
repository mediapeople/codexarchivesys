import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

type UnknownRecord = Record<string, unknown>;

export type MythmechSummary = {
  enabled: boolean;
  nodeCount: number;
  edgeCount: number;
  flowCount: number;
  flowLabels: string[];
  stateCount: number;
  stateLabels: string[];
  hingeLabel: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  loadBearingCount: number;
  parentCount: number;
  childCount: number;
  relationCount: number;
  relationLabels: string[];
  spawnCandidateCount: number;
  candidateLabels: string[];
  marginaliaCount: number;
  marginaliaTypes: string[];
  marginaliaSignals: string[];
};

const MYTHMECH_SIGNAL_TAGS = new Set(['seed', 'load', 'fail', 'link', 'evol']);

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

function extractMarginaliaSignals(item: unknown): string[] {
  const direct = extractMarginaliaType(item).toLowerCase();
  const directSignals = direct && MYTHMECH_SIGNAL_TAGS.has(direct) ? [titleCase(direct)] : [];

  const record = asRecord(item);
  const valueSignals = record
    ? [...asString(record.value).matchAll(/#([a-z0-9_-]+)/gi)]
        .map((match) => match[1].toLowerCase())
        .filter((tag) => MYTHMECH_SIGNAL_TAGS.has(tag))
        .map((tag) => titleCase(tag))
    : [];

  return uniqueStrings([...directSignals, ...valueSignals]);
}

function normalizeLoadLevel(value: unknown): 'critical' | 'high' | 'medium' | 'low' | '' {
  const normalized = asString(value).toLowerCase();
  if (normalized === 'core') return 'critical';
  if (normalized === 'sensing') return 'high';
  if (normalized === 'support' || normalized === 'release') return 'medium';
  return normalized === 'critical' || normalized === 'high' || normalized === 'medium' || normalized === 'low'
    ? normalized
    : '';
}

function extractLoadLevel(item: unknown): 'critical' | 'high' | 'medium' | 'low' | '' {
  const record = asRecord(item);
  if (!record) {
    return '';
  }

  return normalizeLoadLevel(record.load ?? record.pressure ?? record.weight);
}

function extractNodeRole(item: unknown): string {
  const record = asRecord(item);
  if (!record) {
    return '';
  }

  return asString(record.role).toLowerCase() || asString(record.kind).toLowerCase() || asString(record.type).toLowerCase();
}

function extractFlowLabel(item: unknown): string {
  if (typeof item === 'string') {
    return titleCase(item);
  }

  const record = asRecord(item);
  if (!record) {
    return '';
  }

  return titleCase(
    asString(record.label) ||
      asString(record.flow) ||
      asString(record.kind) ||
      asString(record.type)
  );
}

function extractHingeLabel(tensor: UnknownRecord | null, nodes: unknown[]): string {
  const tensorHinge = tensor ? extractLabel(tensor.hinge) || asString(tensor.hinge) : '';
  if (tensorHinge) {
    return tensorHinge;
  }

  const explicitNode = nodes.find((item) => {
    const record = asRecord(item);
    return record?.hinge === true || extractNodeRole(item) === 'hinge';
  });
  const explicitLabel = extractLabel(explicitNode);
  if (explicitLabel) {
    return explicitLabel;
  }

  const criticalNode = nodes.find((item) => extractLoadLevel(item) === 'critical');
  return extractLabel(criticalNode);
}

function buildLoadSummary(summary: MythmechSummary): string {
  return uniqueStrings([
    summary.criticalCount > 0 ? `${summary.criticalCount} critical` : '',
    summary.highCount > 0 ? `${summary.highCount} high` : '',
    summary.mediumCount > 0 ? `${summary.mediumCount} medium` : '',
    summary.lowCount > 0 ? `${summary.lowCount} low` : '',
  ]).join(' / ');
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

export function mergeMythmechMarginaliaEntries(
  value: unknown,
  entries: unknown[]
): UnknownRecord | null {
  const normalizedEntries = entries
    .map((item) => asRecord(item))
    .filter((item): item is UnknownRecord => Boolean(item))
    .map((item) => ({
      ...item,
      type: asString(item.type).replace(/^#+/, ''),
      value: asString(item.value),
      sourceId: asString(item.sourceId),
    }))
    .filter((item) => item.type && item.value);

  const base = normalizeMythmechSidecar(value);

  if (!base && normalizedEntries.length === 0) {
    return null;
  }

  const root: UnknownRecord = base ? { ...base } : { mythmech: { enabled: true } };
  const marginalia = asRecord(root.marginalia) ? { ...(root.marginalia as UnknownRecord) } : {};
  const existingEntries = asList(marginalia.entries);
  const mergedEntries = [
    ...existingEntries,
    ...normalizedEntries.filter((incoming) => {
      const key = `${incoming.type}:${incoming.value}:${incoming.sourceId}`;
      return !existingEntries.some((existing) => {
        const record = asRecord(existing);
        if (!record) {
          return false;
        }

        const existingKey = `${asString(record.type).replace(/^#+/, '')}:${asString(record.value)}:${asString(record.sourceId)}`;
        return existingKey === key;
      });
    }),
  ];

  const existingRefs = asList(marginalia.refs).map((item) => asString(item)).filter(Boolean);
  const mergedRefs = uniqueStrings([
    ...existingRefs,
    ...normalizedEntries.map((entry) => `#${entry.type}`),
  ]);

  marginalia.entries = mergedEntries;
  if (mergedRefs.length > 0) {
    marginalia.refs = mergedRefs;
  }

  root.marginalia = marginalia;
  return root;
}

export function summarizeMythmech(value: unknown): MythmechSummary | null {
  const root = normalizeMythmechSidecar(value);
  if (!root) {
    return null;
  }

  const mythmech = asRecord(root.mythmech) ?? {};
  const tensor = asRecord(mythmech.tensor) ?? asRecord(root.tensor);
  const lineage = asRecord(root.lineage) ?? {};
  const spawn = asRecord(root.spawn) ?? {};
  const marginalia = asRecord(root.marginalia) ?? {};
  const states = asRecord(mythmech.states) ?? {};
  const nodes = asList(mythmech.nodes);
  const edges = asList(mythmech.edges);
  const tensorFlows = tensor ? asList(tensor.flows) : [];

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
      .flatMap((item) => extractMarginaliaSignals(item).length > 0 ? extractMarginaliaSignals(item) : [extractMarginaliaType(item)])
      .map((item) => (item ? titleCase(item) : ''))
      .filter(Boolean),
    4
  );
  const flowLabels = uniqueStrings(
    [...tensorFlows.map((item) => extractFlowLabel(item)), ...edges.map((item) => extractFlowLabel(item))].filter(Boolean),
    4
  );
  const hingeLabel = extractHingeLabel(tensor, nodes);
  const criticalCount = nodes.filter((item) => extractLoadLevel(item) === 'critical').length;
  const highCount = nodes.filter((item) => extractLoadLevel(item) === 'high').length;
  const mediumCount = nodes.filter((item) => extractLoadLevel(item) === 'medium').length;
  const lowCount = nodes.filter((item) => extractLoadLevel(item) === 'low').length;
  const marginaliaSignals = uniqueStrings(
    asList(marginalia.entries).flatMap((item) => extractMarginaliaSignals(item)),
    5
  );
  const flowCount = tensorFlows.length > 0 ? tensorFlows.length : edges.length;

  return {
    enabled: mythmech.enabled !== false,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    flowCount,
    flowLabels,
    stateCount: Object.keys(states).length,
    stateLabels,
    hingeLabel,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    loadBearingCount: criticalCount + highCount,
    parentCount: asList(lineage.parents).length,
    childCount: asList(lineage.children).length,
    relationCount: asList(lineage.relations).length,
    relationLabels,
    spawnCandidateCount: asList(spawn.candidates).length,
    candidateLabels,
    marginaliaCount: asList(marginalia.entries).length,
    marginaliaTypes,
    marginaliaSignals,
  };
}

export function buildMythmechLead(summary: MythmechSummary): string {
  if (summary.hingeLabel) {
    const loadCopy =
      summary.loadBearingCount === 1 ? '1 load-bearing node' : `${summary.loadBearingCount} load-bearing nodes`;
    const flowCopy = summary.flowCount === 1 ? '1 flow' : `${summary.flowCount} flows`;
    return `Mythmech centers on "${summary.hingeLabel}" and maps ${loadCopy} across ${flowCopy}.`;
  }

  if (summary.loadBearingCount > 0) {
    const loadCopy =
      summary.loadBearingCount === 1 ? '1 load-bearing node' : `${summary.loadBearingCount} load-bearing nodes`;
    const flowCopy = summary.flowCount === 1 ? '1 flow' : `${summary.flowCount} flows`;
    return `Mythmech highlights ${loadCopy} across ${flowCopy}.`;
  }

  if (summary.nodeCount > 0 || summary.flowCount > 0) {
    const nodesCopy = summary.nodeCount === 1 ? '1 node' : `${summary.nodeCount} nodes`;
    const flowsCopy = summary.flowCount === 1 ? '1 flow' : `${summary.flowCount} flows`;
    return `Mythmech maps ${nodesCopy} and ${flowsCopy} for inspect mode.`;
  }

  if (summary.spawnCandidateCount > 0) {
    return `Mythmech is attached and tracking spawn candidates for this object.`;
  }

  return summary.enabled
    ? 'Mythmech is attached as the structural inspection lens for this object.'
    : 'Mythmech metadata is stored for this object.';
}

export function buildMythmechSupport(summary: MythmechSummary): string {
  const hingeCopy = summary.hingeLabel ? `Hinge ${summary.hingeLabel}` : '';
  const loadSummary = buildLoadSummary(summary);
  const loadCopy = loadSummary ? `Load ${loadSummary}` : '';
  const flowCopy = summary.flowCount > 0 ? `Flow ${summary.flowCount}` : '';
  const lineageCopy =
    summary.parentCount > 0 || summary.childCount > 0 || summary.relationCount > 0
      ? `Lineage ${summary.parentCount} parents / ${summary.childCount} children / ${summary.relationCount} relations`
      : '';
  const spawnCopy = summary.spawnCandidateCount > 0 ? `Spawn ${summary.spawnCandidateCount} candidates` : '';
  const stateCopy = summary.stateCount > 0 ? `States ${summary.stateCount}` : '';
  const marginaliaCopy =
    summary.marginaliaSignals.length > 0
      ? `Marginalia ${summary.marginaliaSignals.join(' · ')}`
      : summary.marginaliaCount > 0
        ? `Marginalia ${summary.marginaliaCount}`
        : '';

  return uniqueStrings([hingeCopy, loadCopy, flowCopy, lineageCopy, spawnCopy, stateCopy, marginaliaCopy]).join(' · ');
}
