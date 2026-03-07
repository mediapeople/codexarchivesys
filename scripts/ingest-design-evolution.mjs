#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { ACTIVE_THEMES, loadObjects } from './object-utils.mjs';

const rootDir = process.argv[2] || 'objects';
const requestedDate = process.argv[3];
const runDate = requestedDate || new Date().toISOString().slice(0, 10);

const THEME_DOMINANCE_THRESHOLD_PCT = 45;
const NO_CONSTELLATION_THRESHOLD_PCT = 60;
const ISOLATED_THRESHOLD_PCT = 40;
const HUB_DEGREE_THRESHOLD = 8;
const MULTI_KIND_MEDIA_THRESHOLD = 3;

const ALLOWED_MEDIA_KINDS = new Set(['image', 'video', 'audio']);

const KNOWN_BASE_FIELDS = new Set([
  'id',
  'type',
  'title',
  'date',
  'status',
  'visibility',
  'excerpt',
  'themes',
  'constellations',
  'related',
  'media',
]);

const KNOWN_TYPE_FIELDS = {
  scroll: new Set(['series', 'cadence', 'tone', 'dedication', 'bodyClass']),
  artifact: new Set([
    'artifactType',
    'materials',
    'year',
    'dimensions',
    'source',
    'location',
    'condition',
  ]),
  fieldlog: new Set(['project', 'phase', 'context', 'signals', 'actions']),
  codex: new Set(['version', 'scope', 'systemArea', 'changeType', 'dependencies']),
  fragment: new Set(['lengthClass', 'origin', 'voice']),
  nexus: new Set([
    'lead',
    'featured',
    'includedObjects',
    'themeStatement',
    'releaseType',
  ]),
  signal: new Set(['origin', 'markers']),
};

function countValues(items) {
  const counts = new Map();
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  return counts;
}

function sortCounts(counts) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function pct(part, total) {
  if (total === 0) {
    return 0;
  }
  return Number(((part / total) * 100).toFixed(1));
}

function formatCounts(counts, limit = 6) {
  const entries = sortCounts(counts);
  if (entries.length === 0) {
    return 'none';
  }
  return entries
    .slice(0, limit)
    .map(([name, count]) => `${name} (${count})`)
    .join(', ');
}

function extractMediaKind(item) {
  if (!item) {
    return null;
  }

  if (typeof item === 'object' && typeof item.kind === 'string') {
    return item.kind.trim().toLowerCase();
  }

  if (typeof item === 'string') {
    const kindMatch = item.match(/(?:^|\s)kind:\s*([A-Za-z0-9_-]+)/);
    if (kindMatch) {
      return kindMatch[1].trim().toLowerCase();
    }
  }

  return null;
}

const objects = loadObjects(rootDir);
const objectCount = objects.length;
const ids = new Set(
  objects.map((obj) => String(obj.fields.id || '').trim()).filter(Boolean)
);
const typeById = new Map(
  objects.map((obj) => [
    String(obj.fields.id || '').trim(),
    String(obj.fields.type || '').trim(),
  ])
);

const themeCounts = countValues(objects.flatMap((obj) => obj.fields.themes));
const constellationCounts = countValues(
  objects.flatMap((obj) => obj.fields.constellations)
);

const unknownThemeCounts = new Map();
for (const [theme, count] of themeCounts.entries()) {
  if (!ACTIVE_THEMES.has(theme)) {
    unknownThemeCounts.set(theme, count);
  }
}

const dominantThemeEntry = sortCounts(themeCounts)[0] || null;
const dominantThemeName = dominantThemeEntry?.[0] || 'none';
const dominantThemeCount = dominantThemeEntry?.[1] || 0;
const dominantThemePct = pct(dominantThemeCount, objectCount);

const objectsWithoutConstellation = objects.filter(
  (obj) => obj.fields.constellations.length === 0
).length;
const objectsWithoutConstellationPct = pct(
  objectsWithoutConstellation,
  objectCount
);

const outbound = new Map();
const inbound = new Map();
for (const id of ids) {
  outbound.set(id, 0);
  inbound.set(id, 0);
}

for (const obj of objects) {
  const id = String(obj.fields.id || '').trim();
  if (!id || !ids.has(id)) {
    continue;
  }

  for (const relatedId of obj.fields.related) {
    if (ids.has(relatedId)) {
      outbound.set(id, (outbound.get(id) || 0) + 1);
      inbound.set(relatedId, (inbound.get(relatedId) || 0) + 1);
    }
  }

  if (String(obj.fields.type) === 'nexus') {
    for (const ref of obj.includedRefs) {
      if (ids.has(ref)) {
        outbound.set(id, (outbound.get(id) || 0) + 1);
        inbound.set(ref, (inbound.get(ref) || 0) + 1);
      }
    }
  }
}

let isolatedCount = 0;
let maxDegreeOverall = 0;
let maxDegreeOverallId = 'none';
let maxNonNexusDegree = 0;
let maxNonNexusDegreeId = 'none';

for (const id of ids) {
  const degree = (outbound.get(id) || 0) + (inbound.get(id) || 0);
  const type = typeById.get(id) || '';
  if (degree === 0) {
    isolatedCount += 1;
  }
  if (degree > maxDegreeOverall) {
    maxDegreeOverall = degree;
    maxDegreeOverallId = id;
  }
  if (type !== 'nexus' && degree > maxNonNexusDegree) {
    maxNonNexusDegree = degree;
    maxNonNexusDegreeId = id;
  }
}

const isolatedPct = pct(isolatedCount, objectCount);

const mediaKindCounts = new Map();
const unknownMediaKindCounts = new Map();
let objectsWithMedia = 0;
let multiKindMediaObjects = 0;

for (const obj of objects) {
  const kindsInObject = new Set();
  const mediaEntries = Array.isArray(obj.fields.media) ? obj.fields.media : [];

  for (const item of mediaEntries) {
    const kind = extractMediaKind(item);
    if (!kind) {
      continue;
    }
    kindsInObject.add(kind);
    mediaKindCounts.set(kind, (mediaKindCounts.get(kind) || 0) + 1);
    if (!ALLOWED_MEDIA_KINDS.has(kind)) {
      unknownMediaKindCounts.set(kind, (unknownMediaKindCounts.get(kind) || 0) + 1);
    }
  }

  if (kindsInObject.size > 0) {
    objectsWithMedia += 1;
  }
  if (kindsInObject.size > 1) {
    multiKindMediaObjects += 1;
  }
}

const unknownFieldCounts = new Map();

for (const obj of objects) {
  const type = String(obj.fields.type || '').trim();
  const typeFields = KNOWN_TYPE_FIELDS[type] || new Set();
  const allowed = new Set([...KNOWN_BASE_FIELDS, ...typeFields]);

  for (const key of Object.keys(obj.fields)) {
    if (!allowed.has(key)) {
      unknownFieldCounts.set(key, (unknownFieldCounts.get(key) || 0) + 1);
    }
  }
}

const themePressure =
  dominantThemePct >= THEME_DOMINANCE_THRESHOLD_PCT || unknownThemeCounts.size > 0;

const constellationPressure =
  objectCount >= 10 &&
  objectsWithoutConstellationPct >= NO_CONSTELLATION_THRESHOLD_PCT;

const relationPressure =
  (objectCount >= 10 && isolatedPct >= ISOLATED_THRESHOLD_PCT) ||
  maxNonNexusDegree >= HUB_DEGREE_THRESHOLD;

const mediaPressure =
  multiKindMediaObjects >= MULTI_KIND_MEDIA_THRESHOLD ||
  unknownMediaKindCounts.size > 0;

const fieldOverridePressure = unknownFieldCounts.size > 0;

const questions = [];

if (unknownThemeCounts.size > 0) {
  questions.push(
    `Should new themes be added to the active registry? Detected: ${formatCounts(
      unknownThemeCounts
    )}.`
  );
}

if (dominantThemePct >= THEME_DOMINANCE_THRESHOLD_PCT) {
  questions.push(
    `Does dominant theme concentration require constellation split or reframing? ${dominantThemeName} appears in ${dominantThemePct}% of objects.`
  );
}

if (constellationPressure) {
  questions.push(
    `Should a new constellation be proposed? ${objectsWithoutConstellationPct}% of objects currently have none.`
  );
}

if (objectCount >= 10 && isolatedPct >= ISOLATED_THRESHOLD_PCT) {
  questions.push(
    `Should relation guidance tighten? ${isolatedPct}% of objects are isolated by explicit relation degree.`
  );
}

if (maxNonNexusDegree >= HUB_DEGREE_THRESHOLD) {
  questions.push(
    `Should high-degree non-nexus hub behavior be curated into a nexus issue? ${maxNonNexusDegreeId} has relation degree ${maxNonNexusDegree}.`
  );
}

if (unknownMediaKindCounts.size > 0) {
  questions.push(
    `Should media kind enum be extended? Unknown kinds: ${formatCounts(unknownMediaKindCounts)}.`
  );
}

if (multiKindMediaObjects >= MULTI_KIND_MEDIA_THRESHOLD) {
  questions.push(
    `Should media layout policy change? ${multiKindMediaObjects} objects contain multi-kind media sets.`
  );
}

if (unknownFieldCounts.size > 0) {
  questions.push(
    `Should unregistered fields be admitted or removed? Found: ${formatCounts(unknownFieldCounts)}.`
  );
}

const lines = [];
lines.push(`# Design Evolution Ingest — ${runDate}`);
lines.push('');
lines.push(`Generated: ${runDate}`);
lines.push(`Source: \`${rootDir}/\``);
lines.push(`Objects evaluated: ${objectCount}`);
lines.push('');
lines.push('## Register Snapshot');
lines.push('');
lines.push(`- \`theme_register\`: ${themePressure ? 'pressure' : 'monitor'}`);
lines.push(
  `  - dominant theme: ${dominantThemeName} (${dominantThemeCount}, ${dominantThemePct}%)`
);
lines.push(
  `  - out-of-registry themes: ${formatCounts(unknownThemeCounts)}`
);
lines.push(
  `  - threshold: dominant theme >= ${THEME_DOMINANCE_THRESHOLD_PCT}% OR any out-of-registry theme`
);
lines.push(`- \`constellation_register\`: ${constellationPressure ? 'pressure' : 'monitor'}`);
lines.push(
  `  - objects without constellation: ${objectsWithoutConstellation}/${objectCount} (${objectsWithoutConstellationPct}%)`
);
lines.push(
  `  - active constellations in use: ${constellationCounts.size}`
);
lines.push(
  `  - threshold: >= ${NO_CONSTELLATION_THRESHOLD_PCT}% without constellation when object count >= 10`
);
lines.push(`- \`relation_density_register\`: ${relationPressure ? 'pressure' : 'monitor'}`);
lines.push(`  - isolated objects: ${isolatedCount}/${objectCount} (${isolatedPct}%)`);
lines.push(
  `  - highest explicit relation degree (overall): ${maxDegreeOverallId} (${maxDegreeOverall})`
);
lines.push(
  `  - highest explicit relation degree (non-nexus): ${maxNonNexusDegreeId} (${maxNonNexusDegree})`
);
lines.push(
  `  - threshold: isolated >= ${ISOLATED_THRESHOLD_PCT}% when object count >= 10 OR non-nexus max degree >= ${HUB_DEGREE_THRESHOLD}`
);
lines.push(`- \`media_mix_register\`: ${mediaPressure ? 'pressure' : 'monitor'}`);
lines.push(`  - objects with media: ${objectsWithMedia}`);
lines.push(`  - media kinds observed: ${formatCounts(mediaKindCounts)}`);
lines.push(
  `  - unknown media kinds: ${formatCounts(unknownMediaKindCounts)}`
);
lines.push(
  `  - threshold: >= ${MULTI_KIND_MEDIA_THRESHOLD} objects with multi-kind media OR any unknown media kind`
);
lines.push(`- \`field_override_register\`: ${fieldOverridePressure ? 'pressure' : 'monitor'}`);
lines.push(`  - unregistered fields: ${formatCounts(unknownFieldCounts)}`);
lines.push('  - threshold: any unregistered frontmatter field present');
lines.push('');
lines.push('## Structural Questions');
lines.push('');
if (questions.length === 0) {
  lines.push('- none');
} else {
  for (const question of questions) {
    lines.push(`- ${question}`);
  }
}
lines.push('');
lines.push('## Protocol Result');
lines.push('');
if (questions.length === 0) {
  lines.push('- no spine change');
} else {
  lines.push('- open `docs/spine-change-review-YYYY-MM-DD.md`');
  lines.push('- evaluate one structural question per register under pressure');
  lines.push('- if approved, update registry before schema and validators');
}

const outDir = path.resolve('logs');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, `design-evolution-${runDate}.md`);
fs.writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`Wrote ${outPath}`);
console.log(`Registers under pressure: ${questions.length}`);
