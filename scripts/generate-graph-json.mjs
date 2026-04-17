#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  getCanonicalObjectSlug,
  getObjectAliases,
  loadObjects,
  normalizeObjectRef,
  sanitizeDiscoveryTerms,
} from './object-utils.mjs';

function overlapCount(a = [], b = []) {
  const setB = new Set(b);
  let count = 0;
  for (const value of a) {
    if (setB.has(value)) {
      count += 1;
    }
  }
  return count;
}

function makeEdgeKey(a, b) {
  if (!a || !b || a === b) {
    return null;
  }
  return [a, b].sort().join('::');
}

function parseIncludedRefs(frontmatterText) {
  const refs = [];
  const lines = frontmatterText.split(/\r?\n/);
  let inIncluded = false;

  for (const line of lines) {
    if (!inIncluded) {
      if (/^includedObjects:\s*$/.test(line)) {
        inIncluded = true;
      }
      continue;
    }

    if (/^[A-Za-z][\w-]*:\s*/.test(line)) {
      break;
    }

    const match = line.match(/^\s*-\s*ref:\s*(.+)\s*$/) || line.match(/^\s*ref:\s*(.+)\s*$/);
    if (match?.[1]) {
      refs.push(match[1].replace(/^['"]|['"]$/g, '').trim());
    }
  }

  return refs;
}

function extractFrontmatter(raw) {
  const lines = raw.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') {
    return '';
  }
  const end = lines.slice(1).findIndex((line) => line.trim() === '---');
  if (end === -1) {
    return '';
  }
  return lines.slice(1, end + 1).join('\n');
}

function resolveDefaultSourceDir() {
  const candidates = ['src/content', 'astro/src/content', 'objects'];
  for (const candidate of candidates) {
    if (fs.existsSync(path.resolve(candidate))) {
      return candidate;
    }
  }
  return 'astro/src/content';
}

function resolveDefaultOutFile() {
  const candidates = ['public/graph.json', 'astro/public/graph.json'];
  for (const candidate of candidates) {
    if (fs.existsSync(path.resolve(path.dirname(candidate)))) {
      return candidate;
    }
  }
  return 'astro/public/graph.json';
}

const sourceDir = process.argv[2] || resolveDefaultSourceDir();
const outFile = process.argv[3] || resolveDefaultOutFile();

const objects = loadObjects(sourceDir);
const graphIdByAlias = new Map();
const getDiscoveryThemes = (item) => sanitizeDiscoveryTerms(item.fields.themes || []);

function getGraphNodeId(item) {
  return getCanonicalObjectSlug(item.fields) || normalizeObjectRef(item.fields.id) || String(item.fields.id || '').trim();
}

for (const item of objects) {
  const graphId = getGraphNodeId(item);
  if (!graphId) {
    continue;
  }

  for (const alias of getObjectAliases(item.fields)) {
    if (!graphIdByAlias.has(alias)) {
      graphIdByAlias.set(alias, graphId);
    }
  }
}

const nodes = objects.map((item) => ({
  id: getGraphNodeId(item),
  slug: getCanonicalObjectSlug(item.fields),
  url: String(item.fields.url || ''),
  stableId: getCanonicalObjectSlug(item.fields)
    ? `codex://object/${getCanonicalObjectSlug(item.fields)}`
    : '',
  type: String(item.fields.type || ''),
  title: String(item.fields.title || ''),
  date: String(item.fields.date || ''),
  themes: getDiscoveryThemes(item),
  constellations: item.fields.constellations || [],
}));

const edgeMap = new Map();

function upsertEdge(source, target, weight, reason) {
  const key = makeEdgeKey(source, target);
  if (!key) {
    return;
  }
  const existing = edgeMap.get(key);
  if (!existing) {
    edgeMap.set(key, {
      source,
      target,
      weight,
      reasons: [reason],
    });
    return;
  }
  existing.weight += weight;
  if (!existing.reasons.includes(reason)) {
    existing.reasons.push(reason);
  }
}

for (let i = 0; i < objects.length; i += 1) {
  for (let j = i + 1; j < objects.length; j += 1) {
    const a = objects[i];
    const b = objects[j];
    const aId = getGraphNodeId(a);
    const bId = getGraphNodeId(b);

    const sharedThemes = overlapCount(getDiscoveryThemes(a), getDiscoveryThemes(b));
    if (sharedThemes > 0) {
      upsertEdge(aId, bId, sharedThemes, 'shared-theme');
    }

    const sharedConstellations = overlapCount(
      a.fields.constellations,
      b.fields.constellations
    );
    if (sharedConstellations > 0) {
      upsertEdge(aId, bId, sharedConstellations * 2, 'shared-constellation');
    }
  }
}

for (const obj of objects) {
  const sourceId = getGraphNodeId(obj);
  for (const connection of obj.fields.connections || []) {
    const targetId = graphIdByAlias.get(normalizeObjectRef(connection.ref));
    if (targetId) {
      upsertEdge(sourceId, targetId, connection.display === 'feature' ? 5 : 4, 'explicit-connection');
    }
  }

  for (const relatedId of obj.fields.related || []) {
    const targetId = graphIdByAlias.get(normalizeObjectRef(relatedId));
    if (targetId) {
      upsertEdge(sourceId, targetId, 3, 'explicit-related');
    }
  }

  const raw = fs.readFileSync(obj.file, 'utf8');
  const fm = extractFrontmatter(raw);
  const refs = parseIncludedRefs(fm);
  for (const ref of refs) {
    const targetId = graphIdByAlias.get(normalizeObjectRef(ref));
    if (targetId) {
      upsertEdge(sourceId, targetId, 4, 'nexus-inclusion');
    }
  }
}

const edges = [...edgeMap.values()]
  .map((edge) => {
    const [a, b] = [edge.source, edge.target].sort();
    return {
      source: a,
      target: b,
      weight: edge.weight,
      reasons: edge.reasons,
    };
  })
  .sort((a, b) => {
    if (a.weight === b.weight) {
      return `${a.source}:${a.target}`.localeCompare(`${b.source}:${b.target}`);
    }
    return b.weight - a.weight;
  });

const graph = {
  generatedAt: new Date().toISOString(),
  sourceDir,
  nodeCount: nodes.length,
  edgeCount: edges.length,
  nodes,
  edges,
};

const outPath = path.resolve(outFile);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

function toComparableGraphPayload(value) {
  return {
    sourceDir: value?.sourceDir || '',
    nodeCount: value?.nodeCount || 0,
    edgeCount: value?.edgeCount || 0,
    nodes: Array.isArray(value?.nodes) ? value.nodes : [],
    edges: Array.isArray(value?.edges) ? value.edges : [],
  };
}

let existingRaw = '';
let existingGraph = null;

if (fs.existsSync(outPath)) {
  try {
    existingRaw = fs.readFileSync(outPath, 'utf8');
    existingGraph = JSON.parse(existingRaw);
  } catch {
    existingRaw = '';
    existingGraph = null;
  }
}

if (
  existingGraph &&
  JSON.stringify(toComparableGraphPayload(existingGraph)) === JSON.stringify(toComparableGraphPayload(graph))
) {
  graph.generatedAt = typeof existingGraph.generatedAt === 'string' ? existingGraph.generatedAt : graph.generatedAt;
}

const nextRaw = `${JSON.stringify(graph, null, 2)}\n`;
if (nextRaw !== existingRaw) {
  fs.writeFileSync(outPath, nextRaw, 'utf8');
}

console.log(`Wrote ${outPath}`);
console.log(`Nodes: ${graph.nodeCount}`);
console.log(`Edges: ${graph.edgeCount}`);
