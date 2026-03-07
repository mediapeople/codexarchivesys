#!/usr/bin/env node

import path from 'node:path';

const cwd = process.cwd();
const normalized = cwd.replace(/\\/g, '/');

const ICLOUD_SEGMENTS = [
  '/Library/Mobile Documents/',
  '/com~apple~CloudDocs/',
  '/iCloud',
];

const inIcloud = ICLOUD_SEGMENTS.some((segment) => normalized.includes(segment));

if (!inIcloud) {
  process.exit(0);
}

const recommendedRoot = '/Users/nathandavis/Projects/codex-archive-mega-site';
const recommendedAstro = path.join(recommendedRoot, 'astro');

console.error('');
console.error('ERROR: This workspace is running from an iCloud-synced path.');
console.error('Build/dev can break due to iCloud file sync and locking behavior.');
console.error('');
console.error(`Current path: ${cwd}`);
console.error(`Use local path: ${recommendedAstro}`);
console.error('');
console.error('Fix:');
console.error('1) Move/copy the repo to /Users/nathandavis/Projects');
console.error('2) Run commands from the local copy only');
console.error('');

process.exit(1);
