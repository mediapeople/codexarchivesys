#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateGlyphForSource,
  formatGlyphMediaBlockLines,
  repoRoot,
} from './generate-codex-glyph.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function printUsage() {
  console.log(`Usage:
  node scripts/prepare-ready.mjs --source <ready-draft> [options]

Options:
  --glyph             Generate a glyph and wire it into the draft media block
  --dry-run           Print the prepared frontmatter without writing changes
  -h, --help          Show help

What it does:
  - prepares a ready draft before final approval
  - runs only the requested prep actions
  - keeps glyph generation optional, since not every object should carry one

Example:
  node scripts/prepare-ready.mjs --source inbox/ready/2026-03-08-example.md --glyph
`);
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

function isTopLevelField(line) {
  return /^[A-Za-z][\w-]*:\s*/.test(line);
}

function findBlock(lines, key) {
  const keyPattern = new RegExp(`^${key}:\\s*`);

  for (let i = 0; i < lines.length; i += 1) {
    if (!keyPattern.test(lines[i])) {
      continue;
    }

    let end = i + 1;
    while (end < lines.length && !isTopLevelField(lines[end])) {
      end += 1;
    }

    return { start: i, end };
  }

  return null;
}

function injectGlyphMedia(frontmatter, mediaLines, glyphSrc) {
  const lines = frontmatter.split('\n');
  const mediaBlock = findBlock(lines, 'media');

  if (mediaBlock) {
    const blockLines = lines.slice(mediaBlock.start, mediaBlock.end);
    const blockText = blockLines.join('\n');

    if (blockText.includes(`src: ${glyphSrc}`)) {
      return {
        frontmatter,
        changed: false,
        message: 'Glyph media already present in draft frontmatter.',
      };
    }

    const replacement = /^media:\s*\[\]\s*$/.test(blockLines[0])
      ? [...mediaLines]
      : [blockLines[0], ...mediaLines.slice(1), ...blockLines.slice(1)];

    if (mediaBlock.end < lines.length && lines[mediaBlock.end] !== '') {
      replacement.push('');
    }

    lines.splice(mediaBlock.start, mediaBlock.end - mediaBlock.start, ...replacement);
    return {
      frontmatter: lines.join('\n'),
      changed: true,
      message: 'Inserted glyph media into existing media block.',
    };
  }

  const anchor =
    findBlock(lines, 'connections') ||
    findBlock(lines, 'related') ||
    findBlock(lines, 'themes') ||
    findBlock(lines, 'excerpt') ||
    findBlock(lines, 'visibility');
  const insertAt = anchor ? anchor.end : lines.length;
  const insertion = [...mediaLines];

  if (insertAt > 0 && lines[insertAt - 1] !== '') {
    insertion.unshift('');
  }

  if (insertAt < lines.length && lines[insertAt] !== '') {
    insertion.push('');
  }

  lines.splice(insertAt, 0, ...insertion);
  return {
    frontmatter: lines.join('\n'),
    changed: true,
    message: 'Added new media block with glyph entry.',
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const options = {
    source: '',
    glyph: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--source') {
      options.source = args[i + 1] || '';
      i += 1;
      continue;
    }

    if (arg === '--glyph') {
      options.glyph = true;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
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

  if (!options.glyph) {
    console.error('No prep actions selected. Re-run with --glyph when the draft should ship with a glyph.');
    process.exit(1);
  }

  const sourcePath = path.isAbsolute(options.source)
    ? options.source
    : path.resolve(repoRoot, options.source);

  if (!fs.existsSync(sourcePath)) {
    console.error(`Ready draft not found: ${sourcePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(sourcePath, 'utf8');
  const { frontmatter, body } = splitFrontmatter(raw);
  const glyph = generateGlyphForSource(sourcePath, { write: !options.dryRun });
  const mediaLines = formatGlyphMediaBlockLines(glyph.mediaItem);
  const mediaUpdate = injectGlyphMedia(frontmatter, mediaLines, glyph.mediaItem.src);
  const nextRaw = `---\n${mediaUpdate.frontmatter}\n---\n${body}`;

  if (!options.dryRun) {
    fs.writeFileSync(sourcePath, nextRaw, 'utf8');
  }

  console.log(`[prepare] ${path.relative(repoRoot, sourcePath)}`);
  console.log(`- glyph: ${options.dryRun ? 'previewed' : 'generated'} -> ${glyph.webPath}`);
  console.log(`- draft: ${mediaUpdate.message}`);

  if (options.dryRun) {
    console.log('');
    console.log('Prepared frontmatter preview:');
    console.log('---');
    console.log(mediaUpdate.frontmatter);
    console.log('---');
  } else {
    console.log('');
    console.log('Next step:');
    console.log(
      `node ${path.relative(repoRoot, path.join(scriptDir, 'finalize-approved-ready.mjs'))} --source ${path.relative(repoRoot, sourcePath)} --note "<approval reason>"`
    );
  }
}

main();
