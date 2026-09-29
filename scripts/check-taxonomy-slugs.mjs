#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadObjects,
  sanitizeDiscoveryTerms,
  slugifyDiscoveryTerm,
} from './object-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const contentRoot = process.argv[2]
  ? path.resolve(repoRoot, process.argv[2])
  : path.join(repoRoot, 'astro', 'src', 'content');

const publicEntries = loadObjects(contentRoot).filter((entry) => {
  const status = String(entry.fields.status || '').trim();
  const visibility = String(entry.fields.visibility || 'public').trim();
  return status === 'published' && visibility === 'public';
});

const collisions = [];

for (const kind of ['theme', 'constellation']) {
  const key = kind === 'theme' ? 'themes' : 'constellations';
  const termBySlug = new Map();

  for (const entry of publicEntries) {
    const rawTerms = Array.isArray(entry.fields[key]) ? entry.fields[key] : [];
    const terms = kind === 'theme' ? sanitizeDiscoveryTerms(rawTerms) : rawTerms;

    for (const rawTerm of terms) {
      const term = String(rawTerm || '').trim();
      const slug = slugifyDiscoveryTerm(term);
      if (!term || !slug) {
        continue;
      }

      const existing = termBySlug.get(slug);
      if (existing && existing.term !== term) {
        collisions.push({
          kind,
          slug,
          firstTerm: existing.term,
          firstFile: existing.file,
          secondTerm: term,
          secondFile: entry.file,
        });
        continue;
      }

      if (!existing) {
        termBySlug.set(slug, { term, file: entry.file });
      }
    }
  }
}

if (collisions.length > 0) {
  console.error('Taxonomy slug validation failed:');
  console.error('');
  for (const collision of collisions) {
    console.error(
      `Duplicate ${collision.kind} slug "${collision.slug}" for ` +
      `"${collision.firstTerm}" (${path.relative(repoRoot, collision.firstFile)}) and ` +
      `"${collision.secondTerm}" (${path.relative(repoRoot, collision.secondFile)})`
    );
  }
  console.error('');
  process.exit(1);
}

console.log(`Taxonomy slugs valid across ${publicEntries.length} public published objects.`);
