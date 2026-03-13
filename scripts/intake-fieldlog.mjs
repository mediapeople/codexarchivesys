#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACTIVE_THEMES, loadObjects } from './object-utils.mjs';
import {
  detectActualMediaFormat,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
  getDeliveryExtension,
  getMediaKind,
} from './media-utils.mjs';
const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);
const THEME_KEYWORDS = [
  { theme: 'collage', keywords: ['collage'] },
  { theme: 'comics', keywords: ['comic', 'batman', 'joker', 'dc comics'] },
  { theme: 'observation', keywords: ['field log', 'field note', 'snapshot', 'observe', 'workbench', 'bench'] },
  { theme: 'signal', keywords: ['signal', 'distributed'] },
  { theme: 'methodology', keywords: ['process', 'cut', 'rearrang', 'layout', 'workbench state'] },
  { theme: 'memory', keywords: ['memory', 'childhood', 'nostalgia'] },
  { theme: 'place', keywords: ['studio', 'site', 'aisle', 'shop'] },
  { theme: 'systems', keywords: ['system', 'network', 'infrastructure'] },
  { theme: 'architecture', keywords: ['axis', 'structure'] },
];

function printUsage() {
  console.log(`Usage:
  node scripts/intake-fieldlog.mjs --source <drop-markdown> [options]

Options:
  --title <text>       Override the generated fieldlog title stem
  --id <slug>          Override the generated object id
  --project <text>     Override project
  --phase <text>       Override phase
  --context <text>     Override context
  --force              Overwrite an existing ready draft target
  --dry-run            Print the generated draft without writing it
  -h, --help           Show help

What it does:
  - turns one inbox/drop markdown source into a schema-valid fieldlog draft
  - normalizes invalid source metadata into ready-state frontmatter
  - plans media paths for later prep/publish without promoting anything

Example:
  node scripts/intake-fieldlog.mjs --source "inbox/drop/return of the joker/Return of the joker.md"
`);
}

function splitFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: '',
      body: raw,
    };
  }

  return {
    frontmatter: match[1],
    body: match[2],
  };
}

function extractScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!match) {
    return '';
  }

  return stripQuotes(match[1].trim());
}

function extractList(frontmatter, key) {
  const lines = frontmatter.split('\n');
  const values = [];
  let collecting = false;

  for (const line of lines) {
    if (!collecting) {
      if (new RegExp(`^${key}:\\s*$`).test(line)) {
        collecting = true;
        continue;
      }

      const inlineMatch = line.match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`));
      if (inlineMatch) {
        return inlineMatch[1]
          .split(',')
          .map((item) => stripQuotes(item.trim()))
          .filter(Boolean);
      }

      continue;
    }

    if (/^[A-Za-z][\w-]*:\s*/.test(line)) {
      break;
    }

    const itemMatch = line.match(/^\s*-\s+(.+)\s*$/);
    if (itemMatch) {
      values.push(stripQuotes(itemMatch[1].trim()));
    }
  }

  return values;
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function toAsciiText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2193/g, '->')
    .replace(/\u2026/g, '...')
    .replace(/[^\x00-\x7F]/g, '');
}

function stripMarkdownInline(value) {
  return String(value || '')
    .replace(/!\[\[[^\]]+\]\]/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1');
}

function slugify(value) {
  return toAsciiText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function humanizeToken(value) {
  return toAsciiText(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitleCase(value) {
  const words = humanizeToken(value).split(' ').filter(Boolean);

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && index < words.length - 1 && SMALL_WORDS.has(lower)) {
        return lower;
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function cleanTitleStem(rawTitle, fallback) {
  const candidate = humanizeToken(rawTitle)
    .replace(/\bfield log\b/gi, '')
    .replace(/\bcollage field\b/gi, '')
    .replace(/\bworkbench state\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const chosen = candidate || fallback;
  return toTitleCase(chosen);
}

function findDropItemPath(sourcePath, dropRoot) {
  const relativeToDrop = path.relative(dropRoot, sourcePath);
  if (relativeToDrop.startsWith('..') || path.isAbsolute(relativeToDrop)) {
    throw new Error(`Source must live inside inbox/drop: ${sourcePath}`);
  }

  const firstSegment = relativeToDrop.split(path.sep)[0];
  return path.join(dropRoot, firstSegment);
}

function normalizeDate(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return new Date().toISOString().slice(0, 10);
  }

  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}

function collectMediaFiles(dropItemPath, sourcePath) {
  const mediaPaths = [];
  const preferredDirs = [
    path.join(dropItemPath, 'images'),
    path.join(dropItemPath, 'media'),
    path.dirname(sourcePath),
  ];

  for (const dirPath of preferredDirs) {
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      continue;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(extension) && !VIDEO_EXTENSIONS.has(extension)) {
        continue;
      }

      mediaPaths.push(path.join(dirPath, entry.name));
    }
  }

  return [...new Set(mediaPaths.map((item) => path.resolve(item)))].sort((a, b) => a.localeCompare(b));
}

function inferThemeSet(seedText) {
  const themes = [];
  const haystack = toAsciiText(seedText).toLowerCase();

  for (const entry of THEME_KEYWORDS) {
    if (entry.keywords.some((keyword) => haystack.includes(keyword))) {
      themes.push(entry.theme);
    }
  }

  if (!themes.includes('observation')) {
    themes.unshift('observation');
  }

  if (!themes.includes('signal') && haystack.includes('signal')) {
    themes.push('signal');
  }

  const deduped = [...new Set(themes)].filter((theme) => ACTIVE_THEMES.has(theme));

  if (deduped.length > 0) {
    return deduped.slice(0, 4);
  }

  return ['observation', 'signal'];
}

function deriveExcerpt(body) {
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))
    .filter((line) => !line.startsWith('![['));

  const paragraph = stripMarkdownInline(lines.slice(0, 4).join(' '));
  const ascii = toAsciiText(paragraph).replace(/\s+/g, ' ').trim();
  if (!ascii) {
    return 'Field observations captured for review before publish.';
  }

  const sentenceMatches = ascii.match(/[^.!?]+[.!?]/g) || [];
  if (sentenceMatches.length >= 2) {
    const twoSentenceExcerpt = sentenceMatches.slice(0, 2).join(' ').trim();
    if (twoSentenceExcerpt.length <= 180) {
      return twoSentenceExcerpt;
    }
  }

  if (sentenceMatches.length >= 1 && sentenceMatches[0].trim().length >= 60) {
    return sentenceMatches[0].trim();
  }

  if (ascii.length <= 165) {
    return ascii;
  }

  const shortened = ascii.slice(0, 162);
  return `${shortened.slice(0, shortened.lastIndexOf(' '))}.`;
}

function cleanupBody(body, rawTitle) {
  const lines = toAsciiText(body)
    .replace(/\r/g, '')
    .split('\n');
  const cleaned = [];
  let skippedTitle = false;
  let skippedSubtitle = false;
  const titleNeedle = humanizeToken(rawTitle).toLowerCase();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!skippedTitle && trimmed.startsWith('#')) {
      const headingText = humanizeToken(trimmed.replace(/^#+\s*/, '')).toLowerCase();
      if (headingText && titleNeedle && headingText.includes(titleNeedle)) {
        skippedTitle = true;
        continue;
      }
    }

    if (skippedTitle && !skippedSubtitle && /^\*\(.+\)\*$/.test(trimmed)) {
      skippedSubtitle = true;
      continue;
    }

    if (/^!\[\[.+\]\]\s*$/.test(trimmed)) {
      continue;
    }

    cleaned.push(line.replace(/\s+$/g, ''));
  }

  return cleaned.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function derivePhase(rawStage, body) {
  const normalizedStage = humanizeToken(rawStage).toLowerCase();
  if (normalizedStage) {
    return normalizedStage;
  }

  const haystack = toAsciiText(body).toLowerCase();
  if (haystack.includes('workbench')) {
    return 'workbench state';
  }
  if (haystack.includes('studio')) {
    return 'studio observation';
  }

  return 'observation';
}

function deriveProject(titleStem, rawMedium) {
  const medium = humanizeToken(rawMedium).toLowerCase();
  if (medium.includes('collage')) {
    return `${titleStem} collage`;
  }

  return titleStem;
}

function deriveContext(phase, rawMedium, sourceMaterial) {
  const parts = [];
  const medium = humanizeToken(rawMedium);

  parts.push(`${toTitleCase(phase)} record`);

  if (medium) {
    parts.push(`of a ${medium.toLowerCase()} in active formation`);
  }

  if (sourceMaterial.length > 0) {
    if (sourceMaterial.length === 1) {
      parts.push(`built from ${sourceMaterial[0]}`);
    } else {
      const head = sourceMaterial.slice(0, -1).join(', ');
      const tail = sourceMaterial[sourceMaterial.length - 1];
      parts.push(`built from ${head}, and ${tail}`);
    }
  }

  return `${toAsciiText(parts.join(' ')).replace(/\s+/g, ' ').trim()}.`;
}

function deriveSignals(body, rawTitle) {
  const haystack = toAsciiText(`${rawTitle}\n${body}`).toLowerCase();
  const signals = [];

  if (haystack.includes('joker')) {
    signals.push('distributed joker signal');
  }
  if (haystack.includes('batman')) {
    signals.push('batman panel fragments');
  }
  if (haystack.includes('workbench') || haystack.includes('bench')) {
    signals.push('bench-pause snapshots');
  }
  if (haystack.includes('axis') || haystack.includes('structure')) {
    signals.push('provisional axis');
  }
  if (haystack.includes('mid-formation') || haystack.includes('temporary')) {
    signals.push('mid-formation collage field');
  }

  if (signals.length === 0) {
    signals.push('live process evidence');
  }

  return signals.slice(0, 4);
}

function deriveActions(body, mediaCount, sourceMaterialCount) {
  const haystack = toAsciiText(body).toLowerCase();
  const actions = ['documented the collage field mid-formation'];

  if (mediaCount > 0) {
    actions.push(`captured ${mediaCount} workbench reference ${mediaCount === 1 ? 'file' : 'files'}`);
  }

  if (haystack.includes('rearrang') || haystack.includes('move') || haystack.includes('cut')) {
    actions.push('recorded the layout before the next cutting pass');
  }

  if (sourceMaterialCount > 0) {
    actions.push('logged source material for the current pass');
  }

  return actions.slice(0, 4);
}

function deriveLocation(rawLocation, phase, body) {
  const scalarLocation = humanizeToken(rawLocation);
  if (scalarLocation) {
    return scalarLocation;
  }

  const haystack = toAsciiText(`${phase}\n${body}`).toLowerCase();
  if (haystack.includes('workbench') || haystack.includes('studio')) {
    return 'studio workbench';
  }

  return '';
}

function buildMediaEntries(mediaFiles, objectId, titleStem) {
  if (mediaFiles.length === 0) {
    return [];
  }

  return mediaFiles.map((filePath, index) => {
    const kind = getMediaKind(filePath);
    const deliveryExtension = getFieldlogDeliveryExtension(filePath);
    const role =
      index === 0
        ? 'hero'
        : index === mediaFiles.length - 1
          ? 'process'
          : 'detail';

    let alt = `${titleStem} field capture ${index + 1}.`;
    let caption = `Field capture ${index + 1}.`;

    if (role === 'hero') {
      alt = `Workbench view from the ${titleStem} session.`;
      caption = 'Workbench overview.';
    } else if (role === 'process') {
      alt = `Process frame from the ${titleStem} session.`;
      caption = 'Process frame.';
    } else if (kind === 'video') {
      alt = `Video capture from the ${titleStem} session.`;
      caption = 'Process video.';
    } else {
      alt = `Detail view from the ${titleStem} session.`;
      caption = `Workbench detail ${index + 1}.`;
    }

    return {
      kind,
      role,
      alt,
      caption,
      src: `/media/fieldlogs/${objectId}-${index + 1}${deliveryExtension}`,
      sourcePath: filePath,
    };
  });
}

function getFieldlogDeliveryExtension(filePath) {
  const format = detectActualMediaFormat(filePath);

  if (format === 'jpeg' || format === 'heif') {
    return '.jpg';
  }

  if (format === 'gif') {
    return '.gif';
  }

  if (format === 'mov' || format === 'mp4') {
    return '.mp4';
  }

  return getDeliveryExtension(filePath);
}

function buildSpecs(rawMedium, phase, sourceMaterial, mediaCount) {
  const specs = [];
  const medium = toTitleCase(rawMedium);

  if (medium) {
    specs.push({ label: 'Medium', value: medium });
  }

  if (phase) {
    specs.push({ label: 'Stage', value: toTitleCase(phase) });
  }

  if (sourceMaterial.length > 0) {
    specs.push({
      label: 'Source',
      value: toAsciiText(sourceMaterial[0]),
      note: sourceMaterial.slice(1).map((item) => toAsciiText(item)).join(' / '),
    });
  }

  if (mediaCount > 0) {
    specs.push({
      label: 'Captures',
      value: `${mediaCount} ${mediaCount === 1 ? 'reference file' : 'reference files'}`,
      note: 'Still staged in inbox/drop until media prep.',
    });
  }

  return specs;
}

function formatListBlock(key, values, indent = '  ') {
  if (!values || values.length === 0) {
    return `${key}: []`;
  }

  return [ `${key}:`, ...values.map((value) => `${indent}- ${value}`) ].join('\n');
}

function formatMediaBlock(entries) {
  if (entries.length === 0) {
    return 'media: []';
  }

  const lines = ['media:'];
  for (const entry of entries) {
    lines.push(`  - kind: ${entry.kind}`);
    lines.push(`    src: ${entry.src}`);
    lines.push(`    role: ${entry.role}`);
    lines.push(`    alt: "${entry.alt.replace(/"/g, '\\"')}"`);
    lines.push(`    caption: "${entry.caption.replace(/"/g, '\\"')}"`);
  }

  return lines.join('\n');
}

function formatSpecsBlock(specs) {
  if (specs.length === 0) {
    return 'specs: []';
  }

  const lines = ['specs:'];
  for (const spec of specs) {
    lines.push(`  - label: ${spec.label}`);
    lines.push(`    value: ${spec.value}`);
    if (spec.note) {
      lines.push(`    note: "${spec.note.replace(/"/g, '\\"')}"`);
    }
  }

  return lines.join('\n');
}

function ensureIdAvailable(objectId, repoRoot, outputFile, force) {
  const known = [
    ...loadObjects(path.join(repoRoot, 'objects')),
    ...loadObjects(path.join(repoRoot, 'inbox', 'ready')),
  ];

  for (const object of known) {
    const knownId = String(object.fields.id || '').trim();
    if (!knownId || knownId !== objectId) {
      continue;
    }

    if (force && path.resolve(object.file) === path.resolve(outputFile)) {
      continue;
    }

    throw new Error(`Object id already exists in workspace: ${objectId} (${object.file})`);
  }
}

function buildIntakeNotes(options) {
  const mediaLines = options.mediaEntries.map(
    (entry) => `- \`${options.toRepoPath(entry.sourcePath)}\` -> \`${entry.src}\``
  );
  const themeList = options.themes.map((theme) => `\`${theme}\``).join(', ');

  const lines = [
    '## INTAKE NOTES',
    '',
    '**Suggested type:** fieldlog',
    '**Confidence:** medium-high',
    '',
    `**Source markdown:** \`${options.toRepoPath(options.sourcePath)}\``,
    `**Drop item:** \`${options.toRepoPath(options.dropItemPath)}\``,
    '',
    '**Why fieldlog:** This source reads as live studio/process evidence rather than a finished artifact. The emphasis is on observation, temporary structure, and the next move still being open.',
    '',
    `**Theme notes:** Raw source language was normalized into active archive themes: ${themeList}.`,
    '',
    '**Media notes:**',
    ...(mediaLines.length > 0 ? mediaLines : ['- No media files detected beside the source markdown.']),
    '',
    '**Ambiguities for human review:**',
    '- Confirm whether this should remain a fieldlog or later split into a finished artifact once the collage locks.',
    '- Media files are still in inbox/drop; copy or optimize them before publish.',
  ];

  return `${lines.join('\n')}\n`;
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const options = {
    source: '',
    title: '',
    id: '',
    project: '',
    phase: '',
    context: '',
    force: false,
    dryRun: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--source') {
      options.source = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (arg === '--title') {
      options.title = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (arg === '--id') {
      options.id = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (arg === '--project') {
      options.project = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (arg === '--phase') {
      options.phase = args[index + 1] || '';
      index += 1;
      continue;
    }
    if (arg === '--context') {
      options.context = args[index + 1] || '';
      index += 1;
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

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.source) {
    throw new Error('Missing required --source path.');
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, '..');
  const dropRoot = path.join(repoRoot, 'inbox', 'drop');
  const readyRoot = path.join(repoRoot, 'inbox', 'ready');
  const sourcePath = path.isAbsolute(options.source)
    ? options.source
    : path.resolve(repoRoot, options.source);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source markdown not found: ${sourcePath}`);
  }

  const dropItemPath = findDropItemPath(sourcePath, dropRoot);
  const raw = fs.readFileSync(sourcePath, 'utf8');
  const { frontmatter, body } = splitFrontmatter(raw);
  const rawTitle = extractScalar(frontmatter, 'title');
  const titleFallback = path.basename(dropItemPath);
  const titleStem = options.title
    ? toTitleCase(options.title)
    : cleanTitleStem(rawTitle, titleFallback);
  const objectId = slugify(options.id || titleStem);
  const dateValue = normalizeDate(extractScalar(frontmatter, 'date'));
  const outputPath = path.join(readyRoot, `${dateValue}-${objectId}.md`);

  if (fs.existsSync(outputPath) && !options.force && !options.dryRun) {
    throw new Error(`Ready draft already exists: ${outputPath}`);
  }

  ensureIdAvailable(objectId, repoRoot, outputPath, options.force);

  const cleanedBody = cleanupBody(body, rawTitle || titleStem);
  const sourceMaterial = extractList(frontmatter, 'source_material').map((item) => toAsciiText(item));
  const rawThemes = extractList(frontmatter, 'themes');
  const themes = inferThemeSet([rawTitle, rawThemes.join(' '), cleanedBody].join('\n'));
  const phase = options.phase || derivePhase(extractScalar(frontmatter, 'stage'), cleanedBody);
  const project = options.project || deriveProject(titleStem, extractScalar(frontmatter, 'medium'));
  const context = options.context || deriveContext(phase, extractScalar(frontmatter, 'medium'), sourceMaterial);
  const location = deriveLocation(extractScalar(frontmatter, 'location'), phase, cleanedBody);
  const mediaEntries = buildMediaEntries(collectMediaFiles(dropItemPath, sourcePath), objectId, titleStem);
  const specs = buildSpecs(extractScalar(frontmatter, 'medium'), phase, sourceMaterial, mediaEntries.length);
  const signals = deriveSignals(cleanedBody, rawTitle || titleStem);
  const actions = deriveActions(cleanedBody, mediaEntries.length, sourceMaterial.length);
  const excerpt = toAsciiText(extractScalar(frontmatter, 'excerpt') || deriveExcerpt(cleanedBody));
  const toRepoPath = (targetPath) => path.relative(repoRoot, targetPath).replace(/\\/g, '/');

  const frontmatterLines = [
    '---',
    `id: ${objectId}`,
    'type: fieldlog',
    `title: "Field Log: ${titleStem}"`,
    `date: ${dateValue}`,
    'status: draft',
    'visibility: public',
    '',
    `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    '',
    formatListBlock('themes', themes),
    '',
    'related: []',
    '',
    'connections: []',
    '',
    formatMediaBlock(mediaEntries),
  ];

  if (location) {
    frontmatterLines.push('', `location: "${location.replace(/"/g, '\\"')}"`);
  }

  frontmatterLines.push(
    `project: "${project.replace(/"/g, '\\"')}"`,
    `phase: "${phase.replace(/"/g, '\\"')}"`,
    `context: "${context.replace(/"/g, '\\"')}"`
  );

  frontmatterLines.push(
    '',
    formatSpecsBlock(specs),
    '',
    formatListBlock('signals', signals),
    '',
    formatListBlock('actions', actions),
    '---',
    '',
    cleanedBody.trim(),
    '',
    '---',
    '',
    buildIntakeNotes({
      sourcePath,
      dropItemPath,
      mediaEntries,
      themes,
      toRepoPath,
    }).trimEnd(),
    '',
  );

  const output = `${frontmatterLines.join('\n')}\n`;

  if (options.dryRun) {
    console.log(output);
    return;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output, 'utf8');

  console.log(`[fieldlog-intake] ${toRepoPath(sourcePath)} -> ${toRepoPath(outputPath)}`);
  console.log(`- title: Field Log: ${titleStem}`);
  console.log(`- project: ${project}`);
  console.log(`- planned media entries: ${mediaEntries.length}`);
  console.log('Next step: review the ready draft, prep media if needed, then finalize only after explicit approval.');
}

main();
