#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadObjectFile, ALLOWED_TYPES } from './object-utils.mjs';

const args = process.argv.slice(2);

function printUsage() {
  console.log(`Usage:
  node scripts/generate-codex-glyph.mjs --source <markdown-file> [--out <svg-path>]

What it does:
  - reads a ready/object/content markdown file
  - derives a deterministic glyph from id, type, themes, and status
  - writes an SVG asset into astro/public/media by default
  - prints the web path and a suggested media block

Examples:
  node scripts/generate-codex-glyph.mjs --source inbox/ready/2026-03-08-codex-glyph-system-first-emergence.md
  node scripts/generate-codex-glyph.mjs --source objects/codex/codex-archive-system-v3-plus-notes.md --out astro/public/media/codex/v3-plus-glyph.svg
`);
}

if (args.includes('-h') || args.includes('--help')) {
  printUsage();
  process.exit(0);
}

const options = {
  source: '',
  out: '',
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

  if (arg === '--source') {
    options.source = args[i + 1] || '';
    i += 1;
    continue;
  }

  if (arg === '--out') {
    options.out = args[i + 1] || '';
    i += 1;
    continue;
  }

  console.error(`Unknown argument: ${arg}`);
  process.exit(1);
}

if (!options.source) {
  console.error('Missing required --source path.');
  printUsage();
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const sourcePath = path.resolve(repoRoot, options.source);

if (!fs.existsSync(sourcePath)) {
  console.error(`Source file not found: ${sourcePath}`);
  process.exit(1);
}

const object = loadObjectFile(sourcePath);
const { id = '', type = '', title = '', status = 'draft', themes = [] } = object.fields;

if (!id || !type) {
  console.error('Source frontmatter must include id and type.');
  process.exit(1);
}

if (!ALLOWED_TYPES.has(type)) {
  console.error(`Unsupported type for glyph generation: ${type}`);
  process.exit(1);
}

const mediaDirByType = {
  scroll: 'scrolls',
  artifact: 'artifacts',
  fieldlog: 'fieldlogs',
  codex: 'codex',
  fragment: 'fragments',
  nexus: 'nexus',
  signal: 'signals',
};

const defaultOutPath = path.join(
  repoRoot,
  'astro',
  'public',
  'media',
  mediaDirByType[type],
  `${id}-glyph.svg`
);
const outPath = path.resolve(repoRoot, options.out || defaultOutPath);
const webPath = `/${path.relative(path.join(repoRoot, 'astro', 'public'), outPath).split(path.sep).join('/')}`;

function hashChunks(input) {
  const hex = crypto.createHash('sha256').update(input).digest('hex');
  const numbers = [];
  for (let i = 0; i < hex.length; i += 8) {
    numbers.push(parseInt(hex.slice(i, i + 8), 16));
  }
  return numbers;
}

function pick(seed, index, min, max) {
  const span = max - min;
  return min + (seed[index % seed.length] % (span + 1));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function polar(cx, cy, radius, angleDeg) {
  return {
    x: Number((cx + Math.cos(toRad(angleDeg)) * radius).toFixed(2)),
    y: Number((cy + Math.sin(toRad(angleDeg)) * radius).toFixed(2)),
  };
}

function buildFrame(statusValue) {
  if (statusValue === 'published') {
    return `
  <rect x="196" y="196" width="808" height="808" rx="20" stroke="url(#frameGlow)" stroke-width="18"/>
`;
  }

  if (statusValue === 'archived') {
    return `
  <rect x="208" y="208" width="784" height="784" rx="20" stroke="#7f6b4a" stroke-width="12" opacity="0.7"/>
  <rect x="252" y="252" width="696" height="696" rx="16" stroke="#544532" stroke-width="6" opacity="0.6"/>
`;
  }

  if (statusValue === 'review') {
    return `
  <path d="M210 210H500" stroke="url(#frameGlow)" stroke-width="18" stroke-linecap="round"/>
  <path d="M700 210H990V500" stroke="url(#frameGlow)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M990 700V990H700" stroke="url(#frameGlow)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M500 990H210V700" stroke="url(#frameGlow)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
`;
  }

  return `
  <path d="M210 238V990H962" stroke="url(#frameGlow)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M962 210H700" stroke="url(#frameGlow)" stroke-width="18" stroke-linecap="round"/>
  <path d="M990 238V500" stroke="url(#frameGlow)" stroke-width="18" stroke-linecap="round"/>
`;
}

function buildTypeGeometry(typeValue, seed) {
  const cx = 600;
  const cy = 600;

  if (typeValue === 'scroll') {
    return `
  <path d="M600 600C600 600 643 595 660 566C677 537 667 497 636 478C591 451 534 472 514 522C492 579 516 651 579 681C652 716 741 681 781 605C823 521 797 410 701 355C586 289 444 330 381 451" stroke="#f4c56a" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
`;
  }

  if (typeValue === 'artifact') {
    const shardA = polar(cx, cy, 286, pick(seed, 1, 225, 255));
    const shardB = polar(cx, cy, 230, pick(seed, 2, 300, 332));
    const shardC = polar(cx, cy, 268, pick(seed, 3, 18, 46));
    const shardD = polar(cx, cy, 214, pick(seed, 4, 110, 138));
    return `
  <path d="M${shardA.x} ${shardA.y}L${cx} ${cy}L${shardB.x} ${shardB.y}L${cx + 78} ${cy + 178}Z" stroke="#f4c56a" stroke-width="14" stroke-linejoin="round"/>
  <path d="M${cx - 152} ${cy - 42}L${shardC.x} ${shardC.y}L${cx + 142} ${cy - 152}L${cx + 38} ${cy + 24}Z" stroke="#de6d2f" stroke-width="10" stroke-linejoin="round"/>
  <path d="M${cx - 92} ${cy + 184}L${cx + 38} ${cy + 24}L${shardD.x} ${shardD.y}" stroke="#f4c56a" stroke-width="10" stroke-linecap="round"/>
`;
  }

  if (typeValue === 'fieldlog') {
    const ticks = [];
    for (let i = 0; i < 7; i += 1) {
      const y = 360 + i * 78;
      const width = pick(seed, i, 170, 290);
      ticks.push(`<path d="M${600 - width / 2} ${y}H${600 + width / 2}" stroke="#f4c56a" stroke-width="${i === 3 ? 18 : 10}" stroke-linecap="round"/>`);
    }
    return `\n  ${ticks.join('\n  ')}\n`;
  }

  if (typeValue === 'fragment') {
    return `
  <path d="M398 566C430 470 540 418 636 448C703 469 748 526 756 594" stroke="#f4c56a" stroke-width="14" stroke-linecap="round"/>
  <path d="M754 626C730 710 654 772 566 774C503 775 447 744 410 694" stroke="#de6d2f" stroke-width="14" stroke-linecap="round"/>
  <path d="M540 436L594 382" stroke="#f4c56a" stroke-width="10" stroke-linecap="round"/>
  <path d="M686 758L742 812" stroke="#de6d2f" stroke-width="10" stroke-linecap="round"/>
`;
  }

  if (typeValue === 'nexus') {
    return `
  <circle cx="600" cy="600" r="212" stroke="#f4c56a" stroke-width="12"/>
  <circle cx="600" cy="600" r="322" stroke="#de6d2f" stroke-width="8" opacity="0.9"/>
  <path d="M600 278L742 448L876 560L774 742L600 922L448 754L292 648L354 450Z" stroke="#f4c56a" stroke-width="10" stroke-linejoin="round"/>
`;
  }

  if (typeValue === 'signal') {
    return `
  <path d="M600 260L648 484L872 438L714 594L896 736L664 710L640 940L560 714L332 770L492 606L304 444L542 486Z" stroke="#f4c56a" stroke-width="12" stroke-linejoin="round"/>
`;
  }

  return `
  <path d="M382 348H818V852H382Z" stroke="#f4c56a" stroke-width="12" stroke-linejoin="round"/>
  <path d="M474 438H726" stroke="#f4c56a" stroke-width="10" stroke-linecap="round"/>
  <path d="M474 548H726" stroke="#f4c56a" stroke-width="10" stroke-linecap="round"/>
  <path d="M474 658H672" stroke="#f4c56a" stroke-width="10" stroke-linecap="round"/>
  <path d="M418 348V852" stroke="#de6d2f" stroke-width="8" opacity="0.9"/>
`;
}

function buildThemeGeometry(activeThemes, seed) {
  const lines = [];
  const nodes = [];
  const nodeCount = Math.min(Math.max(activeThemes.length, 4), 7);
  const themeSet = new Set(activeThemes);
  const angleStart = pick(seed, 5, -40, 10);
  const angleStep = 360 / nodeCount;
  const outerRadius = pick(seed, 6, 248, 330);
  const innerRadius = pick(seed, 7, 72, 136);

  for (let i = 0; i < nodeCount; i += 1) {
    const angle = angleStart + i * angleStep;
    const inner = polar(600, 600, innerRadius, angle);
    const outer = polar(600, 600, outerRadius, angle);
    lines.push(`<path d="M${inner.x} ${inner.y}L${outer.x} ${outer.y}" stroke="#f4c56a" stroke-width="${themeSet.has('signal') ? 12 : 8}" stroke-linecap="round" opacity="${themeSet.has('signal') ? '0.95' : '0.72'}"/>`);
    nodes.push(`<circle cx="${outer.x}" cy="${outer.y}" r="${themeSet.has('signal') ? 16 : 12}" fill="#f4c56a"/>`);
  }

  if (themeSet.has('architecture') || themeSet.has('structure')) {
    lines.push('<path d="M336 336H864V864H336Z" stroke="#de6d2f" stroke-width="6" opacity="0.72"/>');
  }

  if (themeSet.has('systems')) {
    lines.push('<path d="M600 280V920" stroke="#de6d2f" stroke-width="8" opacity="0.62" stroke-linecap="round"/>');
    lines.push('<path d="M280 600H920" stroke="#de6d2f" stroke-width="8" opacity="0.62" stroke-linecap="round"/>');
  }

  if (themeSet.has('methodology')) {
    lines.push('<path d="M430 784H770" stroke="#f4c56a" stroke-width="8" opacity="0.62" stroke-linecap="round"/>');
    lines.push('<path d="M468 724H732" stroke="#f4c56a" stroke-width="8" opacity="0.62" stroke-linecap="round"/>');
  }

  if (themeSet.has('transmission')) {
    lines.push('<path d="M352 462C442 402 530 372 600 372C679 372 766 401 848 458" stroke="#de6d2f" stroke-width="8" opacity="0.75" stroke-linecap="round"/>');
  }

  return `
  <g stroke-linejoin="round">
    ${lines.join('\n    ')}
  </g>
  <g>
    ${nodes.join('\n    ')}
  </g>
`;
}

const seed = hashChunks([id, type, status, ...themes].join(':'));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" fill="none">
  <rect width="1200" height="1200" fill="#0d0b09"/>
  <defs>
    <linearGradient id="frameGlow" x1="174" y1="174" x2="1026" y2="1026" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#f4c56a"/>
      <stop offset="1" stop-color="#de6d2f"/>
    </linearGradient>
    <radialGradient id="ember" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(600 600) rotate(90) scale(428)">
      <stop offset="0" stop-color="#f7c978" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#f7c978" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="600" cy="600" r="428" fill="url(#ember)"/>
${buildFrame(status)}
${buildTypeGeometry(type, seed)}
${buildThemeGeometry(themes, seed)}
</svg>
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, svg, 'utf8');

console.log(`Generated glyph for ${title || id}`);
console.log(`Source: ${path.relative(repoRoot, sourcePath)}`);
console.log(`Output: ${path.relative(repoRoot, outPath)}`);
console.log(`Web path: ${webPath}`);
console.log('');
console.log('Suggested media block:');
console.log('media:');
console.log('  - kind: image');
console.log(`    src: ${webPath}`);
console.log('    role: hero');
console.log(`    alt: "Generated glyph for ${title || id}."`);
