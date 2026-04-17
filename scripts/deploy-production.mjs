#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const astroRoot = path.join(repoRoot, 'astro');
const extraArgs = process.argv.slice(2);

if (extraArgs.includes('--help') || extraArgs.includes('-h')) {
  console.log('Usage: node scripts/deploy-production.mjs [extra netlify args]');
  console.log('');
  console.log('Runs the guarded production Netlify deploy.');
  console.log('This deploy lane is allowed only from a clean checkout of main.');
  process.exit(0);
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

const result = spawnSync('npx', ['netlify', 'deploy', '--build', '--prod', '--json', ...extraArgs], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    CODEX_ENFORCE_PROD_DEPLOY_GUARD: '1',
  },
});

process.exit(result.status ?? 1);
