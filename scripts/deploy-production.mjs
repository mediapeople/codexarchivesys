#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const astroRoot = path.join(repoRoot, 'astro');
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node scripts/deploy-production.mjs');
  console.log('');
  console.log('Publishes clean `main` to `origin/main`.');
  console.log('Netlify then deploys that commit through the Git-linked production lane.');
  process.exit(0);
}

if (args.length > 0) {
  console.error(`Unknown argument: ${args[0]}`);
  console.error('Run with --help for usage.');
  process.exit(1);
}

const guard = spawnSync(
  process.execPath,
  [path.join(scriptDir, 'assert-production-deploy-safe.mjs')],
  {
    cwd: astroRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      CODEX_ENFORCE_PROD_DEPLOY_GUARD: '1',
    },
  }
);

if ((guard.status ?? 1) !== 0) {
  process.exit(guard.status ?? 1);
}

const fetchResult = spawnSync('git', ['fetch', 'origin', 'main'], {
  cwd: repoRoot,
  stdio: 'inherit',
});

if ((fetchResult.status ?? 1) !== 0) {
  process.exit(fetchResult.status ?? 1);
}

const remoteIsAncestor = spawnSync(
  'git',
  ['merge-base', '--is-ancestor', 'origin/main', 'HEAD'],
  {
    cwd: repoRoot,
    stdio: 'ignore',
  }
);

if ((remoteIsAncestor.status ?? 1) !== 0) {
  console.error('');
  console.error('ERROR: origin/main moved or diverged.');
  console.error('Run `git pull --ff-only origin main`, resolve the history first, then publish again.');
  console.error('');
  process.exit(1);
}

const pushResult = spawnSync('git', ['push', 'origin', 'main'], {
  cwd: repoRoot,
  stdio: 'inherit',
});

if ((pushResult.status ?? 1) !== 0) {
  process.exit(pushResult.status ?? 1);
}

console.log('');
console.log('Production publish handed to Netlify through origin/main.');
console.log('Site: https://ndcodex.com');
