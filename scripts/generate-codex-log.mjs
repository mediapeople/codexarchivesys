#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { loadObjects, validateObjects } from './object-utils.mjs';

function countValues(items) {
  const counts = new Map();
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function intersectCount(a, b) {
  const bSet = new Set(b);
  let count = 0;
  for (const value of a) {
    if (bSet.has(value)) {
      count += 1;
    }
  }
  return count;
}

const rootDir = process.argv[2] || 'objects';
const requestedDate = process.argv[3];
const runDate = requestedDate || new Date().toISOString().slice(0, 10);

const objects = loadObjects(rootDir);
const validation = validateObjects(objects);

const ids = new Set(
  objects
    .map((obj) => String(obj.fields.id || '').trim())
    .filter(Boolean)
);

const typeCounts = countValues(
  objects.map((obj) => String(obj.fields.type || '').trim()).filter(Boolean)
);
const themeCounts = countValues(objects.flatMap((obj) => obj.fields.themes));
const constellationCounts = countValues(
  objects.flatMap((obj) => obj.fields.constellations)
);

const uniqueEdges = new Set();
const edgeReasonSets = {
  explicitRelated: new Set(),
  sharedTheme: new Set(),
  sharedConstellation: new Set(),
  nexusInclusion: new Set(),
};

function edgeKey(a, b) {
  if (!a || !b || a === b) {
    return null;
  }
  return [a, b].sort().join('::');
}

function registerEdge(a, b, reason) {
  const key = edgeKey(a, b);
  if (!key) {
    return;
  }
  uniqueEdges.add(key);
  edgeReasonSets[reason].add(key);
}

for (const obj of objects) {
  const id = String(obj.fields.id || '').trim();
  if (!id) {
    continue;
  }

  for (const relatedId of obj.fields.related) {
    if (ids.has(relatedId)) {
      registerEdge(id, relatedId, 'explicitRelated');
    }
  }

  if (String(obj.fields.type) === 'nexus') {
    for (const ref of obj.includedRefs) {
      if (ids.has(ref)) {
        registerEdge(id, ref, 'nexusInclusion');
      }
    }
  }
}

for (let i = 0; i < objects.length; i += 1) {
  for (let j = i + 1; j < objects.length; j += 1) {
    const a = objects[i];
    const b = objects[j];
    const aId = String(a.fields.id || '').trim();
    const bId = String(b.fields.id || '').trim();
    if (!aId || !bId) {
      continue;
    }

    const themeOverlap = intersectCount(a.fields.themes, b.fields.themes);
    if (themeOverlap > 0) {
      registerEdge(aId, bId, 'sharedTheme');
    }

    const constellationOverlap = intersectCount(
      a.fields.constellations,
      b.fields.constellations
    );
    if (constellationOverlap > 0) {
      registerEdge(aId, bId, 'sharedConstellation');
    }
  }
}

const logLines = [];
logLines.push(`# Codex Log — ${runDate}`);
logLines.push('');
logLines.push(`Generated: ${runDate}`);
logLines.push(`Source: \`${rootDir}/\``);
logLines.push('');
logLines.push('## Snapshot');
logLines.push('');
logLines.push(`- Objects: ${objects.length}`);
logLines.push(`- Unique IDs: ${ids.size}`);
logLines.push(`- Types in use: ${typeCounts.length}`);
logLines.push(`- Themes in use: ${themeCounts.length}`);
logLines.push(`- Constellations in use: ${constellationCounts.length}`);
logLines.push(`- Graph edges (unique): ${uniqueEdges.size}`);
logLines.push('');
logLines.push('## Type Counts');
logLines.push('');
for (const [type, count] of typeCounts) {
  logLines.push(`- ${type}: ${count}`);
}
logLines.push('');
logLines.push('## Theme Counts');
logLines.push('');
for (const [theme, count] of themeCounts) {
  logLines.push(`- ${theme}: ${count}`);
}
logLines.push('');
logLines.push('## Constellation Counts');
logLines.push('');
if (constellationCounts.length === 0) {
  logLines.push('- none');
} else {
  for (const [constellation, count] of constellationCounts) {
    logLines.push(`- ${constellation}: ${count}`);
  }
}
logLines.push('');
logLines.push('## Edge Reasons');
logLines.push('');
logLines.push(
  `- explicit-related: ${edgeReasonSets.explicitRelated.size}`
);
logLines.push(`- shared-theme: ${edgeReasonSets.sharedTheme.size}`);
logLines.push(
  `- shared-constellation: ${edgeReasonSets.sharedConstellation.size}`
);
logLines.push(`- nexus-inclusion: ${edgeReasonSets.nexusInclusion.size}`);
logLines.push('');
logLines.push('## Validation');
logLines.push('');
logLines.push(`- errors: ${validation.errorCount}`);
logLines.push(`- warnings: ${validation.warningCount}`);
if (validation.findings.length > 0) {
  logLines.push('');
  logLines.push('### Findings');
  logLines.push('');
  for (const finding of validation.findings) {
    logLines.push(`- [${finding.level}] ${finding.file}: ${finding.message}`);
  }
}

const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const outPath = path.join(logDir, `codex-log-${runDate}.md`);
fs.writeFileSync(outPath, `${logLines.join('\n')}\n`, 'utf8');

console.log(`Wrote ${outPath}`);
console.log(
  `Validation: ${validation.errorCount} error(s), ${validation.warningCount} warning(s)`
);

process.exit(validation.errorCount > 0 ? 1 : 0);

