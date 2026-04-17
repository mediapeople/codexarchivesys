#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const extraArgs = process.argv.slice(2);

if (extraArgs.includes('--help') || extraArgs.includes('-h')) {
  console.log('Usage: node scripts/deploy-preview.mjs [extra netlify args]');
  console.log('');
  console.log('Runs a preview Netlify deploy from the current checkout.');
  console.log('This is the canonical lane for feature branches and dirty local work.');
  process.exit(0);
}

const result = spawnSync('npx', ['netlify', 'deploy', '--build', '--json', ...extraArgs], {
  cwd: repoRoot,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
