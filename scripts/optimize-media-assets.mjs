#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`Usage:
  node scripts/optimize-media-assets.mjs <file> [file...]

Supported:
  - .jpg/.jpeg (resize + recompress in place)
  - .mov (transcode to .mp4 sibling)
  - .mp4 (transcode and replace in place)

Environment:
  MEDIA_MAX_DIM=2400         Max long edge for JPEG resize (default: 2400)
  JPEG_QUALITY=68            JPEG quality for JPEG optimization (default: 68)
  AVCONVERT_PRESET=PresetMediumQuality   Apple transcode preset (default)
`);
  process.exit(args.length === 0 ? 1 : 0);
}

const mediaMaxDim = Number(process.env.MEDIA_MAX_DIM || 2400);
const jpegQuality = Number(process.env.JPEG_QUALITY || 68);
const avconvertPreset = process.env.AVCONVERT_PRESET || 'PresetMediumQuality';

function exists(command) {
  const result = spawnSync('which', [command], { encoding: 'utf8' });
  return result.status === 0;
}

const hasSips = exists('sips');
const hasFfmpeg = exists('ffmpeg');
const hasAvconvert = exists('avconvert');

async function loadSharp() {
  const candidates = [
    path.resolve(process.cwd(), 'astro/node_modules/sharp/lib/index.js'),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), '../astro/node_modules/sharp/lib/index.js'),
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    const module = await import(pathToFileURL(candidate).href);
    return module.default ?? module;
  }

  return null;
}

const sharp = await loadSharp();

function run(cmd, argv) {
  const result = spawnSync(cmd, argv, { stdio: 'pipe', encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${cmd} failed: ${result.stderr || result.stdout || 'unknown error'}`);
  }
  return result;
}

function formatMB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function ensureFile(file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new Error(`file not found: ${file}`);
  }
}

async function optimizeJpeg(file) {
  const before = fs.statSync(file).size;
  const tmpOut = `${file}.opt-tmp.jpg`;

  if (sharp) {
    let pipeline = sharp(file)
      .rotate()
      .resize({
      width: mediaMaxDim,
      height: mediaMaxDim,
      fit: 'inside',
      withoutEnlargement: true,
      });

    if (typeof pipeline.keepIccProfile === 'function') {
      pipeline = pipeline.keepIccProfile();
    }

    await pipeline
      .jpeg({
        quality: jpegQuality,
        mozjpeg: true,
      })
      .toFile(tmpOut);
  } else {
    if (!hasSips) {
      throw new Error('sharp or sips is required for JPEG optimization');
    }

    run('sips', [
      '-Z',
      String(mediaMaxDim),
      '-s',
      'format',
      'jpeg',
      '-s',
      'formatOptions',
      String(jpegQuality),
      file,
      '--out',
      tmpOut,
    ]);
  }

  fs.renameSync(tmpOut, file);
  const after = fs.statSync(file).size;
  const normalizedBy = sharp ? 'sharp' : 'sips';
  console.log(`[image] ${file} :: ${formatMB(before)} -> ${formatMB(after)} (${normalizedBy}, EXIF orientation normalized)`);
}

function transcodeVideo(inputFile) {
  const ext = path.extname(inputFile).toLowerCase();
  const isMov = ext === '.mov';
  const isMp4 = ext === '.mp4';
  if (!isMov && !isMp4) {
    throw new Error(`unsupported video extension: ${inputFile}`);
  }

  const before = fs.statSync(inputFile).size;
  const outputFile = isMov
    ? inputFile.replace(/\.mov$/i, '.mp4')
    : `${inputFile}.opt-tmp.mp4`;

  if (hasFfmpeg) {
    run('ffmpeg', [
      '-y',
      '-i',
      inputFile,
      '-vf',
      "scale='min(1920,iw)':-2",
      '-c:v',
      'libx264',
      '-crf',
      '27',
      '-preset',
      'veryfast',
      '-movflags',
      '+faststart',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      outputFile,
    ]);
  } else if (hasAvconvert) {
    run('avconvert', [
      '--source',
      inputFile,
      '--preset',
      avconvertPreset,
      '--output',
      outputFile,
      '--replace',
    ]);
  } else {
    throw new Error('ffmpeg or avconvert is required for video optimization');
  }

  if (isMp4) {
    fs.renameSync(outputFile, inputFile);
  }

  const finalFile = isMp4 ? inputFile : outputFile;
  const after = fs.statSync(finalFile).size;
  console.log(`[video] ${inputFile} -> ${finalFile} :: ${formatMB(before)} -> ${formatMB(after)}`);
}

for (const file of args) {
  try {
    ensureFile(file);
    const ext = path.extname(file).toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg') {
      await optimizeJpeg(file);
      continue;
    }

    if (ext === '.mov' || ext === '.mp4') {
      transcodeVideo(file);
      continue;
    }

    console.log(`[skip] unsupported extension: ${file}`);
  } catch (error) {
    console.error(`[error] ${file}: ${error.message}`);
    process.exitCode = 1;
  }
}
