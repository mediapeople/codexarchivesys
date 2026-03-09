#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadObjects, validateObjects } from './object-utils.mjs';

const rootDir = process.argv[2] || 'objects';
const objects = loadObjects(rootDir);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const resolvedRoot = path.resolve(repoRoot, rootDir);
const objectsRoot = path.join(repoRoot, 'objects');
const relativeRoot = path.relative(repoRoot, resolvedRoot).replace(/\\/g, '/');

const shouldLoadCanonicalReferences =
  relativeRoot === 'inbox/ready' ||
  relativeRoot.startsWith('inbox/ready/') ||
  relativeRoot === 'inbox/archive/ready' ||
  relativeRoot.startsWith('inbox/archive/ready/');

const referenceObjects =
  shouldLoadCanonicalReferences && resolvedRoot !== objectsRoot
    ? loadObjects(objectsRoot)
    : [];

const result = validateObjects(objects, { referenceObjects });

console.log(`Validated ${objects.length} object file(s) in ${rootDir}`);

if (referenceObjects.length > 0) {
  console.log(`Reference context: ${referenceObjects.length} canonical object(s) from objects/`);
}

if (result.findings.length === 0) {
  console.log('No findings.');
  process.exit(0);
}

for (const finding of result.findings) {
  console.log(`[${finding.level}] ${finding.file}: ${finding.message}`);
}

console.log(
  `Summary: ${result.errorCount} error(s), ${result.warningCount} warning(s)`
);

process.exit(result.errorCount > 0 ? 1 : 0);
