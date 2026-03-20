#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_SOURCE_DIR = 'astro/src/content';
const SITE_ORIGIN = 'https://ndcodex.com';

function walkMarkdownFiles(rootDir) {
  const files = [];

  function visit(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  visit(rootDir);
  files.sort();
  return files;
}

function extractFrontmatter(raw) {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  if (lines[0]?.trim() !== '---') {
    return null;
  }

  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (closingIndex === -1) {
    return null;
  }

  return {
    lines,
    frontmatterLines: lines.slice(1, closingIndex),
    bodyLines: lines.slice(closingIndex + 1),
    closingIndex,
  };
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function findKeyIndex(lines, key) {
  return lines.findIndex((line) => new RegExp(`^${key}:\\s*`).test(line));
}

function yamlQuote(value) {
  return JSON.stringify(value);
}

function buildObjectUrl(slug) {
  return `${SITE_ORIGIN}/objects/${slug}/`;
}

function normalizeSummary(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function updateFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = extractFrontmatter(raw);
  if (!parsed) {
    return { file, changed: false, reason: 'missing-frontmatter' };
  }

  const frontmatterLines = [...parsed.frontmatterLines];
  const idIndex = findKeyIndex(frontmatterLines, 'id');
  if (idIndex === -1) {
    return { file, changed: false, reason: 'missing-id' };
  }

  const idValue = parseScalar(frontmatterLines[idIndex].replace(/^id:\s*/, ''));
  const basename = path.basename(file, '.md');
  const slugIndex = findKeyIndex(frontmatterLines, 'slug');
  const urlIndex = findKeyIndex(frontmatterLines, 'url');
  const summaryIndex = findKeyIndex(frontmatterLines, 'summary');
  const excerptIndex = findKeyIndex(frontmatterLines, 'excerpt');
  const visibilityIndex = findKeyIndex(frontmatterLines, 'visibility');
  const slugValue =
    slugIndex >= 0
      ? parseScalar(frontmatterLines[slugIndex].replace(/^slug:\s*/, ''))
      : idValue || basename;
  const excerptValue =
    excerptIndex >= 0
      ? normalizeSummary(parseScalar(frontmatterLines[excerptIndex].replace(/^excerpt:\s*/, '')))
      : '';

  let changed = false;

  if (slugIndex === -1) {
    frontmatterLines.splice(idIndex + 1, 0, `slug: ${yamlQuote(slugValue)}`);
    changed = true;
  }

  const nextUrlIndex = findKeyIndex(frontmatterLines, 'url');
  if (nextUrlIndex === -1) {
    const anchorIndex = findKeyIndex(frontmatterLines, 'slug');
    frontmatterLines.splice(anchorIndex + 1, 0, `url: ${yamlQuote(buildObjectUrl(slugValue))}`);
    changed = true;
  }

  if (summaryIndex === -1 && excerptValue) {
    const insertAt = excerptIndex >= 0
      ? findKeyIndex(frontmatterLines, 'excerpt')
      : visibilityIndex >= 0
        ? findKeyIndex(frontmatterLines, 'visibility') + 1
        : findKeyIndex(frontmatterLines, 'status') + 1;
    frontmatterLines.splice(insertAt, 0, `summary: ${yamlQuote(excerptValue)}`);
    changed = true;
  }

  if (!changed) {
    return { file, changed: false };
  }

  const output = [
    '---',
    ...frontmatterLines,
    '---',
    ...parsed.bodyLines,
  ].join('\n');

  fs.writeFileSync(file, output, 'utf8');
  return { file, changed: true };
}

const sourceDir = path.resolve(process.argv[2] || DEFAULT_SOURCE_DIR);
const files = walkMarkdownFiles(sourceDir);
const results = files.map(updateFile);
const changed = results.filter((result) => result.changed);

console.log(`Scanned ${files.length} markdown file(s) in ${sourceDir}`);
console.log(`Updated ${changed.length} file(s)`);

if (changed.length > 0) {
  for (const result of changed.slice(0, 20)) {
    console.log(`updated ${path.relative(process.cwd(), result.file)}`);
  }
  if (changed.length > 20) {
    console.log(`...and ${changed.length - 20} more`);
  }
}
