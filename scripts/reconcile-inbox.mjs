#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadObjects } from './object-utils.mjs';

const args = process.argv.slice(2);

function printUsage() {
  console.log(`Usage:
  node scripts/reconcile-inbox.mjs [options]

Options:
  --sweep <name>   Archive sweep folder name
  --note <text>    Cleanup note for audit logs
  --dry-run        Print actions without changing files
  -h, --help       Show help

What it does:
  - archives promoted ready drafts out of inbox/ready
  - archives matching source items still present in inbox/drop
  - leaves only actual pending review items in the active inbox

Examples:
  node scripts/reconcile-inbox.mjs --dry-run
  node scripts/reconcile-inbox.mjs --note "Keep active inbox honest"
`);
}

if (args.includes('-h') || args.includes('--help')) {
  printUsage();
  process.exit(0);
}

const options = {
  sweep: '',
  note: '',
  dryRun: false,
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

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
const readyRoot = path.join(inboxRoot, 'ready');
const dropRoot = path.join(inboxRoot, 'drop');
const readyArchiveRoot = path.join(inboxRoot, 'archive', 'ready');
const dropArchiveRoot = path.join(inboxRoot, 'archive', 'drop');
const objectsRoot = path.join(repoRoot, 'objects');
const now = new Date();
const timestamp = now.toISOString();

function toPosix(relativePath) {
  return relativePath.replace(/\\/g, '/');
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

  for (const archiveRoot of [readyArchiveRoot, dropArchiveRoot]) {
    if (!fs.existsSync(archiveRoot)) {
      continue;
    }

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

function appendCleanupLog(archiveRoot, records) {
  if (records.length === 0) {
    return;
  }

  fs.mkdirSync(archiveRoot, { recursive: true });
  const logPath = path.join(archiveRoot, 'cleanup-log.ndjson');
  const lines = records.map((record) => JSON.stringify(record)).join('\n') + '\n';
  fs.appendFileSync(logPath, lines, 'utf8');
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

    const target = path.resolve(dropRoot, topLevelName);
    if (fs.existsSync(target)) {
      targets.add(target);
    }
  }

  return [...targets];
}

if (!fs.existsSync(readyRoot) || !fs.existsSync(objectsRoot)) {
  console.error('Missing inbox/ready or objects directory.');
  process.exit(1);
}

const objectIds = new Set(
  loadObjects(objectsRoot)
    .map((obj) => String(obj.fields.id || '').trim())
    .filter(Boolean)
);

const promotedReadyDrafts = loadObjects(readyRoot)
  .filter((draft) => objectIds.has(String(draft.fields.id || '').trim()))
  .sort((a, b) => a.file.localeCompare(b.file));

if (promotedReadyDrafts.length === 0) {
  console.log('Inbox already honest. No promoted ready drafts found in inbox/ready.');
  process.exit(0);
}

const sweepName = options.sweep || nextSweepName();
const readySweepDir = path.join(readyArchiveRoot, sweepName);
const dropSweepDir = path.join(dropArchiveRoot, sweepName);
const readyRecords = [];
const dropRecords = [];
const seenDropTargets = new Set();

for (const draft of promotedReadyDrafts) {
  const sourceRel = toPosix(path.relative(repoRoot, draft.file));
  const destination = path.join(readySweepDir, path.basename(draft.file));
  const destinationRel = toPosix(path.relative(repoRoot, destination));

  if (fs.existsSync(destination)) {
    throw new Error(`Ready archive destination already exists: ${destination}`);
  }

  console.log(`[ready] ${sourceRel} -> ${destinationRel}`);
  const raw = fs.readFileSync(draft.file, 'utf8');

  if (!options.dryRun) {
    fs.mkdirSync(readySweepDir, { recursive: true });
    fs.renameSync(draft.file, destination);
  }

  readyRecords.push({
    timestamp,
    action: 'archive',
    note: options.note || null,
    source: sourceRel,
    destination: destinationRel,
    sweep: sweepName,
  });

  for (const target of extractDropTargetsFromReadyDraft(raw)) {
    const resolved = path.resolve(target);
    if (seenDropTargets.has(resolved)) {
      continue;
    }

    seenDropTargets.add(resolved);
    const dropSourceRel = toPosix(path.relative(repoRoot, resolved));
    const dropDestination = path.join(dropSweepDir, path.basename(resolved));
    const dropDestinationRel = toPosix(path.relative(repoRoot, dropDestination));

    if (fs.existsSync(dropDestination)) {
      throw new Error(`Drop archive destination already exists: ${dropDestination}`);
    }

    console.log(`[drop] ${dropSourceRel} -> ${dropDestinationRel}`);
    if (!options.dryRun) {
      fs.mkdirSync(dropSweepDir, { recursive: true });
      fs.renameSync(resolved, dropDestination);
    }

    dropRecords.push({
      timestamp,
      action: 'archive',
      note: options.note || null,
      source: dropSourceRel,
      destination: dropDestinationRel,
      sweep: sweepName,
    });
  }
}

if (!options.dryRun) {
  appendCleanupLog(readyArchiveRoot, readyRecords);
  appendCleanupLog(dropArchiveRoot, dropRecords);
}

console.log(
  `Done. ready=${readyRecords.length} drop=${dropRecords.length} dryRun=${options.dryRun ? 'yes' : 'no'}`
);
console.log(`Sweep: ${sweepName}`);
