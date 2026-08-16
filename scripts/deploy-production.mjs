#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const astroRoot = path.join(repoRoot, 'astro');
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node scripts/deploy-production.mjs [--no-wait]');
  console.log('');
  console.log('Synchronizes and validates clean `main`, then pushes it to `origin/main`.');
  console.log('By default, waits for the Git-linked Netlify production deploy to finish.');
  process.exit(0);
}

const unknownArg = args.find((arg) => arg !== '--no-wait');
if (unknownArg) {
  console.error(`Unknown argument: ${unknownArg}`);
  console.error('Run with --help for usage.');
  process.exit(1);
}

const waitForDeploy = !args.includes('--no-wait');

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
  console.log('');
  console.log('origin/main moved; rebasing the clean local publish commit(s).');

  const rebaseResult = spawnSync('git', ['rebase', 'origin/main'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if ((rebaseResult.status ?? 1) !== 0) {
    spawnSync('git', ['rebase', '--abort'], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
    console.error('');
    console.error('ERROR: Automatic rebase conflicted and was aborted.');
    console.error('Resolve the competing changes on `main`, then publish again.');
    console.error('');
    process.exit(rebaseResult.status ?? 1);
  }
}

const diffCheck = spawnSync('git', ['diff', '--check', 'origin/main...HEAD'], {
  cwd: repoRoot,
  stdio: 'inherit',
});

if ((diffCheck.status ?? 1) !== 0) {
  console.error('');
  console.error('ERROR: Publish commit contains whitespace errors.');
  console.error('Fix and amend the commit, then publish again.');
  console.error('');
  process.exit(diffCheck.status ?? 1);
}

const astroBinary = path.join(astroRoot, 'node_modules', '.bin', 'astro');
if (!fs.existsSync(astroBinary)) {
  console.error('');
  console.error('ERROR: Astro dependencies are not installed; content validation cannot run.');
  console.error('Run `npm ci` from `astro/`, then publish again.');
  console.error('');
  process.exit(1);
}

const validationResult = spawnSync('npm', ['run', 'validate:content'], {
  cwd: astroRoot,
  stdio: 'inherit',
});

if ((validationResult.status ?? 1) !== 0) {
  process.exit(validationResult.status ?? 1);
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

if (waitForDeploy) {
  console.log('');
  console.log('Waiting for the Git-linked Netlify production deploy...');

  const waitResult = spawnSync('npx', ['netlify', 'watch'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if ((waitResult.status ?? 1) !== 0) {
    console.warn('');
    console.warn('WARNING: The push succeeded, but automatic Netlify verification was unavailable.');
    console.warn('The Git-linked production deploy is still expected to continue.');
  } else {
    console.log('');
    console.log('Production deploy verified ready.');
  }
}
