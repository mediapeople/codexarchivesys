#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadObjects } from './object-utils.mjs';

const args = process.argv.slice(2);

function printUsage() {
  console.log(`Usage:
  node scripts/cleanup-inbox-drop.mjs [options]

Options:
  --item <name>          Item inside inbox/drop (repeatable)
  --source <path>        Absolute or relative path to a drop item (repeatable)
  --auto-published       Archive drop items referenced by ready drafts already published in objects/
  --all                  Process all items currently in inbox/drop
  --mode <archive|purge> Cleanup mode (default: archive)
  --sweep <name>         Archive sweep folder name (archive mode only)
  --note <text>          Cleanup note for audit log
  --dry-run              Print actions without changing files
  -h, --help             Show help

Examples:
  node scripts/cleanup-inbox-drop.mjs --item "Complete Collage, It cost us dearly" --note "Published: /objects/artifact-jsa-collage-001"
  node scripts/cleanup-inbox-drop.mjs --auto-published --note "Auto post-publish cleanup"
  node scripts/cleanup-inbox-drop.mjs --all --note "End-of-day sweep"
  node scripts/cleanup-inbox-drop.mjs --mode purge --item "duplicate-drop"
`);
}

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

const options = {
  mode: 'archive',
  items: [],
  sources: [],
  autoPublished: false,
  all: false,
  sweep: '',
  note: '',
  dryRun: false,
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

  if (arg === '--item') {
    const value = args[i + 1];
    if (!value) {
      console.error('Missing value for --item');
      process.exit(1);
    }
    options.items.push(value);
    i += 1;
    continue;
  }

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

  if (arg === '--mode') {
    const value = (args[i + 1] || '').toLowerCase();
    if (value !== 'archive' && value !== 'purge') {
      console.error('Invalid --mode. Use archive or purge.');
      process.exit(1);
    }
    options.mode = value;
    i += 1;
    continue;
  }

  if (arg === '--sweep') {
    const value = args[i + 1];
    if (!value) {
      console.error('Missing value for --sweep');
      process.exit(1);
    }
    options.sweep = value;
    i += 1;
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

  if (arg === '--all') {
    options.all = true;
    continue;
  }

  if (arg === '--auto-published') {
    options.autoPublished = true;
    continue;
  }

  if (arg === '--dry-run') {
    options.dryRun = true;
    continue;
  }

  console.error(`Unknown argument: ${arg}`);
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const inboxRoot = path.join(repoRoot, 'inbox');
const dropRoot = path.join(inboxRoot, 'drop');
const readyRoot = path.join(inboxRoot, 'ready');
const readyArchiveRoot = path.join(inboxRoot, 'archive', 'ready');
const archiveRoot = path.join(inboxRoot, 'archive', 'drop');
const objectsRoot = path.join(repoRoot, 'objects');
const now = new Date();
const timestamp = now.toISOString();

if (!fs.existsSync(dropRoot)) {
  console.error(`Missing inbox drop directory: ${dropRoot}`);
  process.exit(1);
}

function toPosix(relativePath) {
  return relativePath.replace(/\\/g, '/');
}

function ensureInsideDrop(targetPath) {
  const rel = path.relative(dropRoot, targetPath);
  if (!rel || rel === '.') {
    return;
  }
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Path is outside inbox/drop: ${targetPath}`);
  }
}

function dateStamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nextSweepName() {
  const prefix = `${dateStamp(now)}-sweep-`;
  let max = 0;

  if (fs.existsSync(archiveRoot)) {
    const entries = fs.readdirSync(archiveRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith(prefix)) {
        continue;
      }
      const suffix = entry.name.slice(prefix.length);
      const numeric = Number.parseInt(suffix, 10);
      if (Number.isFinite(numeric)) {
        max = Math.max(max, numeric);
      }
    }
  }

  return `${prefix}${String(max + 1).padStart(2, '0')}`;
}

function extractDropTargetsFromReadyDraft(raw) {
  const targets = new Set();
  const matches = raw.matchAll(/`(inbox\/drop\/[^`\n]+)`/g);

  for (const match of matches) {
    const relativeSource = match[1].replace(/^inbox\/drop\//, '');
    const topLevelName = relativeSource.split('/')[0];
    if (!topLevelName) {
      continue;
    }

    targets.add(path.resolve(dropRoot, topLevelName));
  }

  return [...targets];
}

function collectAutoPublishedTargets() {
  if (!fs.existsSync(objectsRoot)) {
    return [];
  }

  const publishedIds = new Set(
    loadObjects(objectsRoot)
      .filter((obj) => String(obj.fields.status || '').trim() === 'published')
      .map((obj) => String(obj.fields.id || '').trim())
      .filter(Boolean)
  );

  const targets = [];
  const readyDrafts = [];

  if (fs.existsSync(readyRoot)) {
    readyDrafts.push(...loadObjects(readyRoot));
  }

  if (fs.existsSync(readyArchiveRoot)) {
    readyDrafts.push(...loadObjects(readyArchiveRoot));
  }

  for (const readyDraft of readyDrafts) {
    const readyId = String(readyDraft.fields.id || '').trim();
    if (!readyId || !publishedIds.has(readyId)) {
      continue;
    }

    const raw = fs.readFileSync(readyDraft.file, 'utf8');
    for (const target of extractDropTargetsFromReadyDraft(raw)) {
      if (fs.existsSync(target)) {
        targets.push(target);
      }
    }
  }

  return [...new Set(targets.map((target) => path.resolve(target)))];
}

function collectTargets() {
  const explicit = [];

  for (const item of options.items) {
    explicit.push(path.resolve(dropRoot, item));
  }

  for (const source of options.sources) {
    const resolved = path.isAbsolute(source) ? source : path.resolve(repoRoot, source);
    explicit.push(resolved);
  }

  let targets = explicit;

  if (options.autoPublished) {
    targets = targets.concat(collectAutoPublishedTargets());
  }

  if (options.all) {
    const dropEntries = fs
      .readdirSync(dropRoot, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith('.'))
      .map((entry) => path.join(dropRoot, entry.name));
    targets = targets.concat(dropEntries);
  }

  const deduped = [...new Set(targets.map((target) => path.resolve(target)))];

  if (deduped.length === 0) {
    if (options.autoPublished) {
      return [];
    }
    throw new Error('No targets selected. Use --item, --source, or --all.');
  }

  for (const target of deduped) {
    if (!fs.existsSync(target)) {
      throw new Error(`Target not found: ${target}`);
    }
    ensureInsideDrop(target);
  }

  return deduped;
}

function appendCleanupLog(records) {
  fs.mkdirSync(archiveRoot, { recursive: true });
  const logPath = path.join(archiveRoot, 'cleanup-log.ndjson');
  const lines = records.map((record) => JSON.stringify(record)).join('\n') + '\n';
  fs.appendFileSync(logPath, lines, 'utf8');
}

const targets = collectTargets();
if (targets.length === 0) {
  console.log('No cleanup targets found.');
  process.exit(0);
}

const records = [];

let sweepName = '';
let sweepDir = '';

if (options.mode === 'archive') {
  sweepName = options.sweep || nextSweepName();
  sweepDir = path.join(archiveRoot, sweepName);
}

for (const target of targets) {
  const sourceRel = toPosix(path.relative(repoRoot, target));

  if (options.mode === 'archive') {
    const destination = path.join(sweepDir, path.basename(target));
    if (fs.existsSync(destination)) {
      throw new Error(`Archive destination already exists: ${destination}`);
    }

    console.log(`[archive] ${sourceRel} -> ${toPosix(path.relative(repoRoot, destination))}`);
    if (!options.dryRun) {
      fs.mkdirSync(sweepDir, { recursive: true });
      fs.renameSync(target, destination);
    }

    records.push({
      timestamp,
      action: 'archive',
      note: options.note || null,
      source: sourceRel,
      destination: toPosix(path.relative(repoRoot, destination)),
      sweep: sweepName,
    });
    continue;
  }

  console.log(`[purge] ${sourceRel}`);
  if (!options.dryRun) {
    fs.rmSync(target, { recursive: true, force: false });
  }

  records.push({
    timestamp,
    action: 'purge',
    note: options.note || null,
    source: sourceRel,
    destination: null,
    sweep: null,
  });
}

if (!options.dryRun) {
  appendCleanupLog(records);
}

console.log(`Done. mode=${options.mode} count=${records.length} dryRun=${options.dryRun ? 'yes' : 'no'}`);
if (options.mode === 'archive') {
  console.log(`Sweep: ${sweepName}`);
}
