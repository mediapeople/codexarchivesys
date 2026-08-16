#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { detectActualMediaFormat } from './media-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const mediaRoot = path.join(repoRoot, 'astro', 'public', 'media');
const args = process.argv.slice(2);

const MAX_LONG_EDGE = 2400;
const HARD_IMAGE_BYTES = 2 * 1024 * 1024;
const TARGET_IMAGE_BYTES = 750 * 1024;
const HARD_SVG_BYTES = 256 * 1024;
const HARD_VIDEO_BYTES = 20 * 1024 * 1024;
const TARGET_VIDEO_BYTES = 10 * 1024 * 1024;
const DELIVERY_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.mp4',
]);

function printHelp() {
  console.log(`Usage:
  ./scripts/check-publish-media.mjs [options] <file> [file...]

Options:
  --all       Audit every delivery asset under astro/public/media
  --fix       Optimize fixable oversized raster images and videos, then recheck
  --strict    Exit nonzero when any hard policy violation remains
  -h, --help  Show help

Delivery policy:
  - images: max 2400px long edge and 2 MiB hard limit (750 KiB target)
  - SVG: max 256 KiB
  - video: MP4 only, 20 MiB hard limit (10 MiB target)
  - capture formats such as HEIC/HEIF and MOV never ship directly
`);
}

const options = {
  all: false,
  fix: false,
  strict: false,
  files: [],
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '-h' || arg === '--help') {
    printHelp();
    process.exit(0);
  }
  if (arg === '--all') {
    options.all = true;
    continue;
  }
  if (arg === '--fix') {
    options.fix = true;
    continue;
  }
  if (arg === '--strict') {
    options.strict = true;
    continue;
  }
  if (arg.startsWith('--')) {
    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }
  options.files.push(arg);
}

function walkFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile() && DELIVERY_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.push(entryPath);
      }
    }
  }
  return files.sort();
}

function normalizeFile(file) {
  return path.isAbsolute(file) ? path.resolve(file) : path.resolve(repoRoot, file);
}

function toRepoPath(file) {
  return path.relative(repoRoot, file).split(path.sep).join('/');
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
  }
  return `${Math.ceil(bytes / 1024)} KiB`;
}

async function loadSharp() {
  const candidate = path.join(repoRoot, 'astro', 'node_modules', 'sharp', 'lib', 'index.js');
  if (!fs.existsSync(candidate)) {
    return null;
  }
  const loaded = await import(pathToFileURL(candidate).href);
  return loaded.default ?? loaded;
}

function extensionMatchesFormat(extension, format) {
  if (format === 'jpeg') {
    return extension === '.jpg' || extension === '.jpeg';
  }
  if (format === 'mp4') {
    return extension === '.mp4';
  }
  return extension === `.${format}`;
}

function isInsideMediaRoot(file) {
  const relative = path.relative(mediaRoot, file);
  return Boolean(relative) && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

const sharp = await loadSharp();

async function inspectFile(file) {
  const extension = path.extname(file).toLowerCase();
  const size = fs.statSync(file).size;
  const hard = [];
  const warnings = [];
  let format = extension === '.svg' ? 'svg' : detectActualMediaFormat(file);
  let dimensions = '';

  if (!DELIVERY_EXTENSIONS.has(extension)) {
    hard.push(`unsupported delivery extension ${extension || '(none)'}`);
    return { file, format, size, dimensions, hard, warnings };
  }

  if (!extensionMatchesFormat(extension, format)) {
    hard.push(`extension ${extension} does not match detected ${format} data`);
  }

  if (format === 'heif' || format === 'mov' || format === 'unknown') {
    hard.push(`${format.toUpperCase()} is not a browser delivery format for ndcodex`);
  }

  if (['jpeg', 'png', 'webp', 'gif'].includes(format)) {
    if (!sharp) {
      hard.push('sharp is unavailable, so pixel dimensions cannot be verified');
    } else {
      try {
        const metadata = await sharp(file, { animated: true }).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;
        dimensions = width && height ? `${width}x${height}` : '';
        if (Math.max(width, height) > MAX_LONG_EDGE) {
          hard.push(`${dimensions} exceeds the ${MAX_LONG_EDGE}px long-edge limit`);
        }
      } catch (error) {
        hard.push(`image metadata could not be read: ${error.message}`);
      }
    }

    if (size > HARD_IMAGE_BYTES) {
      hard.push(`${formatBytes(size)} exceeds the 2 MiB image limit`);
    } else if (size > TARGET_IMAGE_BYTES) {
      warnings.push(`${formatBytes(size)} exceeds the 750 KiB image target`);
    }
  } else if (format === 'svg') {
    if (size > HARD_SVG_BYTES) {
      hard.push(`${formatBytes(size)} exceeds the 256 KiB SVG limit`);
    }
  } else if (format === 'mp4') {
    if (size > HARD_VIDEO_BYTES) {
      hard.push(`${formatBytes(size)} exceeds the 20 MiB video limit`);
    } else if (size > TARGET_VIDEO_BYTES) {
      warnings.push(`${formatBytes(size)} exceeds the 10 MiB video target`);
    }
  }

  return { file, format, size, dimensions, hard, warnings };
}

function canOptimize(report) {
  return ['jpeg', 'png', 'webp', 'mp4'].includes(report.format) && report.hard.length > 0;
}

function optimize(file) {
  const result = spawnSync(process.execPath, [path.join(scriptDir, 'optimize-media-assets.mjs'), file], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  return (result.status ?? 1) === 0;
}

const selectedFiles = new Set(options.files.map(normalizeFile));
if (options.all) {
  for (const file of walkFiles(mediaRoot)) {
    selectedFiles.add(file);
  }
}

if (selectedFiles.size === 0) {
  printHelp();
  process.exit(1);
}

let failedFiles = 0;
let failureIssues = 0;
let warnings = 0;
let fixed = 0;

for (const file of [...selectedFiles].sort()) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    console.error(`[fail] ${toRepoPath(file)} :: file not found`);
    failedFiles += 1;
    failureIssues += 1;
    continue;
  }
  if (!isInsideMediaRoot(file)) {
    console.error(`[fail] ${toRepoPath(file)} :: delivery media must live under astro/public/media`);
    failedFiles += 1;
    failureIssues += 1;
    continue;
  }

  let report = await inspectFile(file);
  if (options.fix && canOptimize(report)) {
    console.log(`[fix] ${toRepoPath(file)}`);
    if (optimize(file)) {
      report = await inspectFile(file);
      if (report.hard.length === 0) {
        fixed += 1;
      }
    }
  }

  for (const issue of report.hard) {
    console.error(`[fail] ${toRepoPath(file)} :: ${issue}`);
    failureIssues += 1;
  }
  if (report.hard.length > 0) {
    failedFiles += 1;
  }
  for (const warning of report.warnings) {
    console.warn(`[warn] ${toRepoPath(file)} :: ${warning}`);
    warnings += 1;
  }
}

console.log(
  `Media audit: files=${selectedFiles.size} fixed=${fixed} ` +
  `failedFiles=${failedFiles} failureIssues=${failureIssues} warnings=${warnings}`
);

if (options.strict && failedFiles > 0) {
  process.exit(1);
}
