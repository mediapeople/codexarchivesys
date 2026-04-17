#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

function readFlag(name) {
  return /^(1|true|yes)$/i.test(String(process.env[name] || '').trim());
}

function readGit(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function tryReadGit(args, cwd) {
  try {
    return readGit(args, cwd);
  } catch {
    return '';
  }
}

function fail(messageLines) {
  console.error('');
  console.error('ERROR: Production deploy guard blocked this build.');
  console.error('');
  for (const line of messageLines) {
    console.error(line);
  }
  console.error('');
  console.error('Allowed path: deploy from a clean checkout of `main` only.');
  console.error('Use preview deploys for feature branches and dirty local work.');
  console.error('');
  console.error('Override only if absolutely necessary: `CODEX_BYPASS_PROD_DEPLOY_GUARD=1`');
  console.error('');
  process.exit(1);
}

const context = String(process.env.CONTEXT || '').trim().toLowerCase();
const enforce = context === 'production' || readFlag('CODEX_ENFORCE_PROD_DEPLOY_GUARD');
const bypass = readFlag('CODEX_BYPASS_PROD_DEPLOY_GUARD');

if (!enforce || bypass) {
  process.exit(0);
}

const repoRoot = tryReadGit(['rev-parse', '--show-toplevel'], process.cwd());
if (!repoRoot) {
  fail([
    'The guard could not resolve the git repository root from this build context.',
    `Current working directory: ${process.cwd()}`,
  ]);
}

const dirtyStatus = tryReadGit(['status', '--porcelain'], repoRoot);
if (dirtyStatus) {
  fail([
    'The working tree is not clean.',
    'Commit or stash local changes before running a production deploy.',
    '',
    'Dirty paths:',
    ...dirtyStatus.split('\n').filter(Boolean).slice(0, 20).map((line) => `  ${line}`),
  ]);
}

const currentBranch = tryReadGit(['branch', '--show-current'], repoRoot);
const headSha = tryReadGit(['rev-parse', 'HEAD'], repoRoot);
const localMainSha = tryReadGit(['rev-parse', 'refs/heads/main'], repoRoot);
const remoteMainSha = tryReadGit(['rev-parse', 'refs/remotes/origin/main'], repoRoot);
const branchEnv = String(process.env.BRANCH || process.env.HEAD || '').trim();

const isMainCheckout =
  currentBranch === 'main' ||
  branchEnv === 'main' ||
  (Boolean(headSha) && (headSha === localMainSha || headSha === remoteMainSha));

if (!isMainCheckout) {
  fail([
    `Current branch: ${currentBranch || '(detached HEAD)'}`,
    `Netlify branch env: ${branchEnv || '(not set)'}`,
    'Production deploys must run from `main` so published content and code stay aligned.',
  ]);
}

process.exit(0);
