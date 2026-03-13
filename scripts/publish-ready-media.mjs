#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadObjects } from './object-utils.mjs';
import { detectActualMediaFormat, getDeliveryExtension } from './media-utils.mjs';

const args = process.argv.slice(2);

function printUsage() {
  console.log(`Usage:
  node scripts/publish-ready-media.mjs [options]

Options:
  --source <path>     Ready draft path (repeatable)
  --all               Prepare media for all drafts currently in inbox/ready
  --force             Overwrite existing public targets
  --dry-run           Print planned actions without writing files
  -h, --help          Show help

What it does:
  - reads intake media mappings from ready drafts
  - copies or converts source assets into astro/public
  - normalizes HEIC/HEIF delivery to .jpg assets
  - removes stale sibling targets with the same basename but wrong extension

Examples:
  node scripts/publish-ready-media.mjs --source inbox/ready/2026-03-08-example.md
  node scripts/publish-ready-media.mjs --all --force
`);
}

if (args.includes('-h') || args.includes('--help')) {
  printUsage();
  process.exit(0);
}

const options = {
  sources: [],
  all: false,
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

if (!options.all && options.sources.length === 0) {
  console.error('No ready drafts selected. Use --source or --all.');
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const readyRoot = path.join(repoRoot, 'inbox', 'ready');
const publicRoot = path.join(repoRoot, 'astro', 'public');
const STALE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.mp4',
  '.mov',
  '.m4v',
  '.heic',
  '.heif',
]);

function normalizeSource(source) {
  return path.isAbsolute(source) ? source : path.resolve(repoRoot, source);
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function runNodeScript(scriptName, scriptArgs) {
  execFileSync(process.execPath, [path.join(scriptDir, scriptName), ...scriptArgs], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

function runCommand(command, commandArgs) {
  execFileSync(command, commandArgs, {
    cwd: repoRoot,
    stdio: 'pipe',
  });
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

  return [...selected].sort();
}

function extractMediaMappings(raw) {
  const matches = raw.matchAll(/^- `([^`]+)` -> `(\/[^`]+)`\s*$/gm);
  return [...matches].map((match) => ({
    sourceRef: match[1],
    targetWebPath: match[2],
  }));
}

function hasPlannedPublicMedia(raw) {
  return /^\s+src:\s+\/media\/.+$/m.test(raw);
}

function resolveArchivedSource(sourceRef, readyFile) {
  const normalizedRef = sourceRef.replace(/\\/g, '/');
  const readyPath = path.resolve(readyFile).replace(/\\/g, '/');
  const archiveMatch = readyPath.match(/\/inbox\/archive\/ready\/([^/]+)\//);

  if (!archiveMatch || !normalizedRef.startsWith('inbox/drop/')) {
    return null;
  }

  const archiveSweep = archiveMatch[1];
  const archivedRef = `inbox/archive/drop/${archiveSweep}/${normalizedRef.slice('inbox/drop/'.length)}`;
  const archivedPath = path.resolve(repoRoot, archivedRef);
  return fs.existsSync(archivedPath) ? archivedPath : null;
}

function resolveSourcePath(sourceRef, readyFile) {
  const directPath = path.isAbsolute(sourceRef)
    ? sourceRef
    : path.resolve(repoRoot, sourceRef);

  if (fs.existsSync(directPath)) {
    return directPath;
  }

  return resolveArchivedSource(sourceRef, readyFile);
}

function resolveTargetPath(targetWebPath) {
  if (!targetWebPath.startsWith('/')) {
    throw new Error(`Target media path must begin with "/": ${targetWebPath}`);
  }

  const cleanWebPath = targetWebPath.split(/[?#]/, 1)[0];
  const targetPath = path.resolve(publicRoot, cleanWebPath.replace(/^\/+/, ''));
  const relativePath = path.relative(publicRoot, targetPath);

  if (
    !relativePath ||
    relativePath.startsWith('..') ||
    relativePath.includes('/../') ||
    relativePath.includes('\\..\\')
  ) {
    throw new Error(`Target media path escapes astro/public: ${targetWebPath}`);
  }

  return targetPath;
}

function isExpectedDeliveryExtension(actualFormat, targetExtension) {
  if (targetExtension === '.jpg' || targetExtension === '.jpeg') {
    return actualFormat === 'jpeg' || actualFormat === 'heif' || actualFormat === 'png';
  }

  if (actualFormat === 'jpeg' || actualFormat === 'heif') {
    return targetExtension === '.jpg' || targetExtension === '.jpeg';
  }

  if (actualFormat === 'png') {
    return targetExtension === '.png';
  }

  if (actualFormat === 'webp') {
    return targetExtension === '.webp';
  }

  if (actualFormat === 'gif') {
    return targetExtension === '.gif';
  }

  if (actualFormat === 'mov' || actualFormat === 'mp4') {
    return targetExtension === '.mp4';
  }

  return false;
}

function removeStaleSiblingTargets(targetPath) {
  const targetDir = path.dirname(targetPath);
  const targetExt = path.extname(targetPath).toLowerCase();
  const targetBase = path.basename(targetPath, targetExt);

  if (!fs.existsSync(targetDir)) {
    return [];
  }

  const removed = [];
  for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    const entryExt = path.extname(entry.name).toLowerCase();
    const entryBase = path.basename(entry.name, entryExt);
    if (entryBase !== targetBase || entryExt === targetExt || !STALE_EXTENSIONS.has(entryExt)) {
      continue;
    }

    const stalePath = path.join(targetDir, entry.name);
    if (!options.dryRun) {
      fs.rmSync(stalePath, { force: true });
    }
    removed.push(stalePath);
  }

  return removed;
}

function removeKnownFile(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { force: true });
  }
}

function ensureTargetWritable(targetPath) {
  if (fs.existsSync(targetPath) && !options.force) {
    throw new Error(`Target already exists. Re-run with --force to overwrite: ${toRepoPath(targetPath)}`);
  }

  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  }
}

function stageJpegTarget(sourcePath, targetPath, actualFormat) {
  if (actualFormat === 'jpeg') {
    fs.copyFileSync(sourcePath, targetPath);
  } else if (actualFormat === 'heif' || actualFormat === 'png') {
    runCommand('sips', ['-s', 'format', 'jpeg', sourcePath, '--out', targetPath]);
  } else {
    throw new Error(`Cannot convert ${actualFormat} into JPEG delivery: ${toRepoPath(sourcePath)}`);
  }

  runNodeScript('optimize-media-assets.mjs', [targetPath]);
}

function stageVideoTarget(sourcePath, targetPath, actualFormat) {
  if (actualFormat === 'mp4') {
    fs.copyFileSync(sourcePath, targetPath);
    runNodeScript('optimize-media-assets.mjs', [targetPath]);
    return;
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-ready-media-'));
  const tempInput = path.join(tempDir, `source${path.extname(sourcePath).toLowerCase() || '.mov'}`);

  try {
    fs.copyFileSync(sourcePath, tempInput);
    runNodeScript('optimize-media-assets.mjs', [tempInput]);

    const tempOutput = tempInput.replace(/\.[^.]+$/, '.mp4');
    if (!fs.existsSync(tempOutput)) {
      throw new Error(`Expected transcoded video not found: ${tempOutput}`);
    }

    fs.renameSync(tempOutput, targetPath);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function stagePublicTarget(sourcePath, targetPath) {
  const actualFormat = detectActualMediaFormat(sourcePath);
  const targetExtension = path.extname(targetPath).toLowerCase();

  if (!isExpectedDeliveryExtension(actualFormat, targetExtension)) {
    const expectedExtension = getDeliveryExtension(sourcePath);
    throw new Error(
      `Mapped target extension ${targetExtension || '(none)'} does not match ${actualFormat} source ${toRepoPath(sourcePath)}. Expected ${expectedExtension}.`
    );
  }

  if (targetExtension === '.jpg' || targetExtension === '.jpeg') {
    stageJpegTarget(sourcePath, targetPath, actualFormat);
    if (actualFormat === 'heif') {
      return 'converted HEIF to JPEG';
    }
    if (actualFormat === 'png') {
      return 'converted PNG to JPEG';
    }
    return 'copied JPEG';
  }

  if (actualFormat === 'png' || actualFormat === 'webp' || actualFormat === 'gif') {
    fs.copyFileSync(sourcePath, targetPath);
    return `copied ${actualFormat.toUpperCase()}`;
  }

  if (actualFormat === 'mov' || actualFormat === 'mp4') {
    stageVideoTarget(sourcePath, targetPath, actualFormat);
    return actualFormat === 'mov' ? 'transcoded MOV to MP4' : 'copied MP4';
  }

  throw new Error(`Unsupported media format for publish: ${actualFormat} (${toRepoPath(sourcePath)})`);
}

let preparedDrafts = 0;
let preparedAssets = 0;

for (const readyFile of collectReadyDrafts()) {
  if (!fs.existsSync(readyFile)) {
    throw new Error(`Ready draft not found: ${readyFile}`);
  }

  const raw = fs.readFileSync(readyFile, 'utf8');
  const mappings = extractMediaMappings(raw);

  if (mappings.length === 0) {
    if (hasPlannedPublicMedia(raw)) {
      throw new Error(
        `Ready draft references public media but has no machine-readable intake mappings: ${toRepoPath(readyFile)}`
      );
    }

    console.log(`[media] ${toRepoPath(readyFile)} :: no intake media mappings found`);
    continue;
  }

  console.log(`[media] ${toRepoPath(readyFile)}`);

  for (const mapping of mappings) {
    const sourcePath = resolveSourcePath(mapping.sourceRef, readyFile);
    if (!sourcePath) {
      throw new Error(`Mapped source asset not found: ${mapping.sourceRef}`);
    }

    const targetPath = resolveTargetPath(mapping.targetWebPath);
    ensureTargetWritable(targetPath);

    const actualFormat = detectActualMediaFormat(sourcePath);
    if (options.dryRun) {
      const removedStale = removeStaleSiblingTargets(targetPath);
      if (removedStale.length > 0) {
        for (const stalePath of removedStale) {
          console.log(`  - would remove stale sibling: ${toRepoPath(stalePath)}`);
        }
      }
      console.log(
        `  - would publish ${mapping.sourceRef} -> ${mapping.targetWebPath} (${actualFormat})`
      );
      preparedAssets += 1;
      continue;
    }

    const stagedTempPath = `${targetPath}.stage${path.extname(targetPath).toLowerCase()}`;

    removeKnownFile(stagedTempPath);
    let action = '';

    try {
      action = stagePublicTarget(sourcePath, stagedTempPath);
      fs.renameSync(stagedTempPath, targetPath);
    } finally {
      removeKnownFile(stagedTempPath);
    }

    const removedStale = removeStaleSiblingTargets(targetPath);
    if (removedStale.length > 0) {
      for (const stalePath of removedStale) {
        console.log(`  - removed stale sibling: ${toRepoPath(stalePath)}`);
      }
    }

    console.log(
      `  - ${action}: ${toRepoPath(sourcePath)} -> ${toRepoPath(targetPath)}`
    );
    preparedAssets += 1;
  }

  preparedDrafts += 1;
}

console.log(
  `Done. drafts=${preparedDrafts} assets=${preparedAssets} dryRun=${options.dryRun ? 'yes' : 'no'}`
);
