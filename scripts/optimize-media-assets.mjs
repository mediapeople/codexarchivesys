#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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
  JPEG_QUALITY=68            JPEG quality for sips formatOptions (default: 68)
  AVCONVERT_PRESET=PresetMediumQuality   Apple transcode preset (default)
`);
  process.exit(args.length === 0 ? 1 : 0);
}

const mediaMaxDim = Number(process.env.MEDIA_MAX_DIM || 2400);
const jpegQuality = String(process.env.JPEG_QUALITY || '68');
const avconvertPreset = process.env.AVCONVERT_PRESET || 'PresetMediumQuality';

function exists(command) {
  const result = spawnSync('which', [command], { encoding: 'utf8' });
  return result.status === 0;
}

const hasSips = exists('sips');
const hasFfmpeg = exists('ffmpeg');
const hasAvconvert = exists('avconvert');

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

function optimizeJpeg(file) {
  if (!hasSips) {
    throw new Error('sips is required for JPEG optimization');
  }

  const before = fs.statSync(file).size;
  const tmpOut = `${file}.opt-tmp.jpg`;

  run('sips', [
    '-Z',
    String(mediaMaxDim),
    '-s',
    'format',
    'jpeg',
    '-s',
    'formatOptions',
    jpegQuality,
    file,
    '--out',
    tmpOut,
  ]);

  fs.renameSync(tmpOut, file);
  const after = fs.statSync(file).size;
  console.log(`[image] ${file} :: ${formatMB(before)} -> ${formatMB(after)}`);
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
      optimizeJpeg(file);
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
