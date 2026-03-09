#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { loadObjects } from './object-utils.mjs';

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

const sourceDir = process.argv[2] || 'objects';
const outFile = process.argv[3] || 'astro/public/graph.json';

const objects = loadObjects(sourceDir);
const byId = new Map(
  objects
    .map((item) => [String(item.fields.id || '').trim(), item])
    .filter(([id]) => Boolean(id))
);

const nodes = objects.map((item) => ({
  id: String(item.fields.id || ''),
  type: String(item.fields.type || ''),
  title: String(item.fields.title || ''),
  date: String(item.fields.date || ''),
  themes: item.fields.themes || [],
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
    const aId = String(a.fields.id || '').trim();
    const bId = String(b.fields.id || '').trim();

    const sharedThemes = overlapCount(a.fields.themes, b.fields.themes);
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
  const sourceId = String(obj.fields.id || '').trim();
  for (const connection of obj.fields.connections || []) {
    if (byId.has(connection.ref)) {
      upsertEdge(sourceId, connection.ref, connection.display === 'feature' ? 5 : 4, 'explicit-connection');
    }
  }

  for (const relatedId of obj.fields.related || []) {
    if (byId.has(relatedId)) {
      upsertEdge(sourceId, relatedId, 3, 'explicit-related');
    }
  }

  const raw = fs.readFileSync(obj.file, 'utf8');
  const fm = extractFrontmatter(raw);
  const refs = parseIncludedRefs(fm);
  for (const ref of refs) {
    if (byId.has(ref)) {
      upsertEdge(sourceId, ref, 4, 'nexus-inclusion');
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
fs.writeFileSync(outPath, `${JSON.stringify(graph, null, 2)}\n`, 'utf8');

console.log(`Wrote ${outPath}`);
console.log(`Nodes: ${graph.nodeCount}`);
console.log(`Edges: ${graph.edgeCount}`);
