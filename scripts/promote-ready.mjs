#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadObjects } from './object-utils.mjs';

const args = process.argv.slice(2);

function printUsage() {
  console.log(`Usage:
  node scripts/promote-ready.mjs [options]

Options:
  --source <path>     Ready draft path (repeatable)
  --all               Promote all markdown drafts in inbox/ready
  --approve           Confirm explicit operator approval for write actions
  --approve-all       Confirm explicit operator approval for batch promotion
  --note <text>       Required approval note for write actions
  --status <value>    Target status for canonical objects (default: published)
  --force             Overwrite existing canonical targets
  --dry-run           Print actions without writing files
  -h, --help          Show help

Examples:
  node scripts/promote-ready.mjs --approve --note "Approved for publish" --source inbox/ready/2026-03-08-art-is-for-people-who-want-to-feel-alive.md
  node scripts/promote-ready.mjs --all --approve --approve-all --note "Approved batch for review" --status review
`);
}

if (args.includes('-h') || args.includes('--help')) {
  printUsage();
  process.exit(0);
}

const options = {
  sources: [],
  all: false,
  approve: false,
  approveAll: false,
  note: '',
  status: 'published',
  force: false,
  dryRun: false,
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

  if (arg === '--source') {
    const value = args[i + 1];
    if (!value) {
      console.error('Missing value for --source');
      process.exit(1);
    }
    options.sources.push(value);
    i += 1;
    continue;
  }

  if (arg === '--all') {
    options.all = true;
    continue;
  }

  if (arg === '--approve') {
    options.approve = true;
    continue;
  }

  if (arg === '--approve-all') {
    options.approveAll = true;
    continue;
  }

  if (arg === '--note') {
    const value = args[i + 1];
    if (!value) {
      console.error('Missing value for --note');
      process.exit(1);
    }
    options.note = value;
    i += 1;
    continue;
  }

  if (arg === '--status') {
    const value = args[i + 1];
    if (!value) {
      console.error('Missing value for --status');
      process.exit(1);
    }
    options.status = value;
    i += 1;
    continue;
  }

  if (arg === '--force') {
    options.force = true;
    continue;
  }

  if (arg === '--dry-run') {
    options.dryRun = true;
    continue;
  }

  console.error(`Unknown argument: ${arg}`);
  process.exit(1);
}

if (!options.dryRun && !options.approve) {
  console.error(
    'Promotion requires explicit operator approval. Re-run with --approve to write canonical files.'
  );
  process.exit(1);
}

if (!options.dryRun && !options.note.trim()) {
  console.error(
    'Promotion requires an approval note. Re-run with --note "<reason>" to record operator intent.'
  );
  process.exit(1);
}

if (!options.dryRun && options.all && !options.approveAll) {
  console.error(
    'Batch promotion requires explicit batch approval. Re-run with --approve-all to promote all selected drafts.'
  );
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const readyRoot = path.join(repoRoot, 'inbox', 'ready');
const objectsRoot = path.join(repoRoot, 'objects');
const astroContentRoot = path.join(repoRoot, 'astro', 'src', 'content');
const logsRoot = path.join(repoRoot, 'logs');
const timestamp = new Date().toISOString();

function normalizeSource(source) {
  return path.isAbsolute(source) ? source : path.resolve(repoRoot, source);
}

function collectReadyDrafts() {
  const selected = new Set();

  if (options.all) {
    for (const obj of loadObjects(readyRoot)) {
      selected.add(path.resolve(obj.file));
    }
  }

  for (const source of options.sources) {
    selected.add(normalizeSource(source));
  }

  if (selected.size === 0) {
    throw new Error('No ready drafts selected. Use --source or --all.');
  }

  return [...selected].sort();
}

function splitFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid markdown frontmatter.');
  }

  return {
    frontmatter: match[1],
    body: match[2],
  };
}

function cleanFrontmatter(frontmatter, targetStatus) {
  const lines = frontmatter.split('\n');
  const cleaned = [];

  for (const line of lines) {
    if (line.trim().startsWith('#')) {
      continue;
    }

    if (/^status:\s*/.test(line)) {
      cleaned.push(`status: ${targetStatus}`);
      continue;
    }

    cleaned.push(line);
  }

  return cleaned.join('\n').replace(/\n{3,}/g, '\n\n');
}

function stripIntakeNotes(body) {
  const marker = '\n---\n\n## INTAKE NOTES';
  const markerIndex = body.indexOf(marker);
  if (markerIndex === -1) {
    return body.trimEnd() + '\n';
  }

  return body.slice(0, markerIndex).trimEnd() + '\n';
}

function writeFile(targetPath, content) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
}

function appendPromotionLog(records) {
  if (records.length === 0) {
    return;
  }

  fs.mkdirSync(logsRoot, { recursive: true });
  const logPath = path.join(logsRoot, 'promotion-log.ndjson');
  const lines = records.map((record) => JSON.stringify(record)).join('\n') + '\n';
  fs.appendFileSync(logPath, lines, 'utf8');
}

const readyDraftFiles = collectReadyDrafts();
const readyObjectsByFile = new Map(loadObjects(readyRoot).map((obj) => [path.resolve(obj.file), obj]));
let promotedCount = 0;
const promotionRecords = [];

for (const readyFile of readyDraftFiles) {
  const readyObject = readyObjectsByFile.get(path.resolve(readyFile));
  if (!readyObject) {
    throw new Error(`Ready draft not found in inbox/ready: ${readyFile}`);
  }

  const objectType = String(readyObject.fields.type || '').trim();
  const objectId = String(readyObject.fields.id || '').trim();

  if (!objectType || !objectId) {
    throw new Error(`Missing id/type in ready draft: ${readyFile}`);
  }

  const raw = fs.readFileSync(readyFile, 'utf8');
  const { frontmatter, body } = splitFrontmatter(raw);
  const canonical = `---\n${cleanFrontmatter(frontmatter, options.status)}\n---\n\n${stripIntakeNotes(body)}`;

  const objectTarget = path.join(objectsRoot, objectType, `${objectId}.md`);
  const astroTarget = path.join(astroContentRoot, objectType, `${objectId}.md`);

  if (!options.force) {
    for (const target of [objectTarget, astroTarget]) {
      if (fs.existsSync(target)) {
        throw new Error(`Target already exists: ${target}`);
      }
    }
  }

  console.log(`[promote] ${path.relative(repoRoot, readyFile)} -> ${path.relative(repoRoot, objectTarget)}`);
  console.log(`[sync] ${path.relative(repoRoot, objectTarget)} -> ${path.relative(repoRoot, astroTarget)}`);

  if (!options.dryRun) {
    writeFile(objectTarget, canonical);
    writeFile(astroTarget, canonical);
  }

  promotionRecords.push({
    timestamp,
    action: 'promote',
    note: options.note || null,
    source: path.relative(repoRoot, readyFile).replace(/\\/g, '/'),
    objectTarget: path.relative(repoRoot, objectTarget).replace(/\\/g, '/'),
    astroTarget: path.relative(repoRoot, astroTarget).replace(/\\/g, '/'),
    status: options.status,
    batch: options.all,
    explicitApproval: options.approve,
    explicitBatchApproval: options.approveAll,
  });

  promotedCount += 1;
}

if (!options.dryRun) {
  appendPromotionLog(promotionRecords);
}

console.log(`Done. promoted=${promotedCount} dryRun=${options.dryRun ? 'yes' : 'no'}`);
