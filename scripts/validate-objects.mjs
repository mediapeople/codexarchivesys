#!/usr/bin/env node

import { loadObjects, validateObjects } from './object-utils.mjs';

const rootDir = process.argv[2] || 'objects';
const objects = loadObjects(rootDir);
const result = validateObjects(objects);

console.log(`Validated ${objects.length} object file(s) in ${rootDir}`);

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

