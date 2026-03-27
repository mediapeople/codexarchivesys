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

export type MythmechLoadLevel = 'critical' | 'high' | 'medium' | 'low' | '';

export type MythmechInspectNode = {
  id: string;
  label: string;
  role: string;
  load: MythmechLoadLevel;
  summary: string;
  detail: string;
  hinge: boolean;
};

export type MythmechInspectEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  flow: string;
};

export type MythmechInspectModel = {
  enabled: boolean;
  hingeId: string;
  hingeLabel: string;
  nodes: MythmechInspectNode[];
  edges: MythmechInspectEdge[];
  reverseTrace: string[];
  parentRefs: string[];
  childRefs: string[];
  relationRefs: string[];
  candidateRefs: string[];
  stateLabels: string[];
  signalRefs: string[];
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

function slugifyToken(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractId(item: unknown): string {
  if (typeof item === 'string') {
    return slugifyToken(item);
  }

  const record = asRecord(item);
  if (!record) {
    return '';
  }

  return slugifyToken(
    asString(record.id) ||
      asString(record.ref) ||
      asString(record.label) ||
      asString(record.title)
  );
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

function extractEdgeLabel(item: unknown): string {
  if (typeof item === 'string') {
    return titleCase(item);
  }

  const record = asRecord(item);
  if (!record) {
    return '';
  }

  return titleCase(
    asString(record.label) ||
      asString(record.type) ||
      asString(record.kind) ||
      asString(record.flow)
  );
}

function extractNodeCopy(item: unknown): string {
  const record = asRecord(item);
  if (!record) {
    return '';
  }

  return normalizeCopy(
    asString(record.summary) ||
      asString(record.description) ||
      asString(record.note) ||
      asString(record.value) ||
      asString(record.copy)
  );
}

function extractNodeRoleLabel(item: unknown): string {
  const role = extractNodeRole(item);
  return role ? titleCase(role) : 'Node';
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

export function extractMythmechInspectModel(value: unknown): MythmechInspectModel | null {
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
  const nodesRaw = asList(mythmech.nodes);
  const edgesRaw = asList(mythmech.edges);
  const hingeLabel = extractHingeLabel(tensor, nodesRaw);
  const reverseTrace = uniqueStrings(
    [
      ...asList(root.reverse_trace).map((item) => extractLabel(item) || asString(item)),
      ...asList(mythmech.reverse_trace).map((item) => extractLabel(item) || asString(item)),
      ...asList(tensor?.reverse_trace).map((item) => extractLabel(item) || asString(item)),
    ].filter(Boolean)
  );

  const nodes = nodesRaw.map((item, index) => {
    const label = extractLabel(item) || `Node ${index + 1}`;
    const id = extractId(item) || `node-${index + 1}`;
    const role = extractNodeRoleLabel(item);
    const load = extractLoadLevel(item);
    const summary = extractNodeCopy(item);
    const hinge =
      asRecord(item)?.hinge === true ||
      extractNodeRole(item) === 'hinge' ||
      (hingeLabel && label === hingeLabel);

    return {
      id,
      label,
      role,
      load,
      summary: summary || `${role} in the Mythmech structure map.`,
      detail: summary || `${label} holds a ${load || 'stored'} role in the current inspection map.`,
      hinge,
    };
  });

  if (nodes.length === 0 && hingeLabel) {
    nodes.push({
      id: extractId(hingeLabel) || 'hinge',
      label: hingeLabel,
      role: 'Hinge',
      load: 'critical',
      summary: `${hingeLabel} anchors the current inspection map.`,
      detail: `${hingeLabel} is stored as the hinge for this object.`,
      hinge: true,
    });
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = edgesRaw
    .map((item, index) => {
      const record = asRecord(item);
      if (!record) {
        return null;
      }

      const from = slugifyToken(asString(record.from));
      const to = slugifyToken(asString(record.to));
      if (!from || !to) {
        return null;
      }

      return {
        id: extractId(item) || `edge-${index + 1}`,
        from,
        to,
        label: extractEdgeLabel(item) || 'Connects',
        flow: extractFlowLabel(record.flow) || extractFlowLabel(item),
      };
    })
    .filter((item): item is MythmechInspectEdge => Boolean(item))
    .filter((item) => nodeIds.has(item.from) && nodeIds.has(item.to));

  const hingeNodeId =
    nodes.find((node) => node.hinge)?.id ||
    nodes.find((node) => node.label === hingeLabel)?.id ||
    nodes[0]?.id ||
    '';

  const loadOrder: Record<MythmechLoadLevel, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    '': 4,
  };

  const orderedNodes = [...nodes].sort((left, right) => {
    if (left.id === hingeNodeId) return -1;
    if (right.id === hingeNodeId) return 1;
    const loadDelta = loadOrder[left.load] - loadOrder[right.load];
    if (loadDelta !== 0) return loadDelta;
    return left.label.localeCompare(right.label);
  });

  return {
    enabled: mythmech.enabled !== false,
    hingeId: hingeNodeId,
    hingeLabel,
    nodes: orderedNodes,
    edges,
    reverseTrace,
    parentRefs: uniqueStrings(asList(lineage.parents).map((item) => extractLabel(item) || asString(item)).filter(Boolean)),
    childRefs: uniqueStrings(asList(lineage.children).map((item) => extractLabel(item) || asString(item)).filter(Boolean)),
    relationRefs: uniqueStrings(asList(lineage.relations).map((item) => extractLabel(item) || asString(item)).filter(Boolean)),
    candidateRefs: uniqueStrings(asList(spawn.candidates).map((item) => extractLabel(item) || asString(item)).filter(Boolean)),
    stateLabels: uniqueStrings(
      Object.entries(states)
        .map(([key, stateValue]) => formatStateLabel(key, stateValue))
        .filter(Boolean)
    ),
    signalRefs: uniqueStrings(asList(marginalia.refs).map((item) => asString(item)).filter(Boolean)),
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
    return `Mythmech is attached and tracking spawnable vectors for this object.`;
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
  const spawnCopy = summary.spawnCandidateCount > 0 ? `Spawnable vectors ${summary.spawnCandidateCount}` : '';
  const stateCopy = summary.stateCount > 0 ? `States ${summary.stateCount}` : '';
  const marginaliaCopy =
    summary.marginaliaSignals.length > 0
      ? `Marginalia ${summary.marginaliaSignals.join(' · ')}`
      : summary.marginaliaCount > 0
        ? `Marginalia ${summary.marginaliaCount}`
        : '';

  return uniqueStrings([hingeCopy, loadCopy, flowCopy, lineageCopy, spawnCopy, stateCopy, marginaliaCopy]).join(' · ');
}
