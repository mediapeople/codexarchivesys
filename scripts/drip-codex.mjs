#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promoteCodexQueueBundle, scanCodexQueue } from './lib/codex-queue.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const queueRoot = path.join(repoRoot, 'publishing', 'codex-queue');
const args = process.argv.slice(2);

function fail(message) {
  console.error('');
  console.error(`ERROR: ${message}`);
  console.error('');
  process.exit(1);
}

function printHelp() {
  console.log(`Usage:
  node scripts/drip-codex.mjs [--status | --dry-run | --publish] [options]

Modes:
  --status          Show held, scheduled, due, and invalid queue bundles (default)
  --dry-run         Show the one due post that the next run would publish
  --publish         Publish the oldest due post and hand it to Netlify

Options:
  --slug <slug>     With --publish, manually release this bundle regardless of date
  --now <ISO>       Override the clock for deterministic testing
  --wait            Wait for the Netlify production deploy to report ready
  -h, --help        Show help

Queue bundle:
  publishing/codex-queue/<slug>/post.md
  publishing/codex-queue/<slug>/media/*   (optional)
`);
}

const options = {
  mode: 'status',
  slug: '',
  now: new Date(),
  wait: false,
};
let explicitMode = '';

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '-h' || arg === '--help') {
    printHelp();
    process.exit(0);
  }
  if (['--status', '--dry-run', '--publish'].includes(arg)) {
    const mode = arg.slice(2);
    if (explicitMode && explicitMode !== mode) {
      fail('Choose only one mode: --status, --dry-run, or --publish.');
    }
    explicitMode = mode;
    options.mode = mode;
    continue;
  }
  if (arg === '--wait') {
    options.wait = true;
    continue;
  }
  if (arg === '--slug' || arg === '--now') {
    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      fail(`${arg} requires a value.`);
    }
    if (arg === '--slug') {
      options.slug = value;
    } else {
      options.now = new Date(value);
      if (Number.isNaN(options.now.getTime())) {
        fail(`Invalid --now timestamp: ${value}`);
      }
    }
    index += 1;
    continue;
  }
  fail(`Unknown argument: ${arg}`);
}

if (options.slug && options.mode !== 'publish') {
  fail('--slug is only available with --publish.');
}
if (options.wait && options.mode !== 'publish') {
  fail('--wait is only available with --publish.');
}

function run(command, commandArgs, settings = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: settings.cwd ?? repoRoot,
    stdio: settings.stdio ?? 'inherit',
    encoding: settings.encoding,
  });
  if ((result.status ?? 1) !== 0) {
    fail(settings.failureMessage ?? `${command} ${commandArgs.join(' ')} failed.`);
  }
  return result;
}

function read(command, commandArgs) {
  return run(command, commandArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  }).stdout.trim();
}

function repoRelative(file) {
  return path.relative(repoRoot, file).split(path.sep).join('/');
}

function walkFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }
  return files.sort();
}

function printQueue(items) {
  console.log(`Codex queue at ${options.now.toISOString()}`);
  console.log('');
  if (items.length === 0) {
    console.log('Queue is empty.');
    return;
  }

  for (const item of items) {
    const schedule = item.publishAt || '(manual hold)';
    const detail = item.error ? ` :: ${item.error}` : '';
    console.log(`${item.state.padEnd(9)} ${item.slug} :: ${schedule} :: ${item.title}${detail}`);
  }

  const counts = Object.fromEntries(
    ['held', 'scheduled', 'due', 'invalid'].map((state) => [
      state,
      items.filter((item) => item.state === state).length,
    ])
  );
  console.log('');
  console.log(
    `Queue summary: due=${counts.due} scheduled=${counts.scheduled} ` +
    `held=${counts.held} invalid=${counts.invalid}`
  );
}

if (options.mode === 'publish') {
  const currentBranch = read('git', ['branch', '--show-current']);
  if (currentBranch !== 'main') {
    fail(`Queue publication requires main; current branch is ${currentBranch || '(detached)'}.`);
  }

  const dirty = read('git', ['status', '--porcelain=v1']);
  if (dirty) {
    fail('Queue publication requires a clean working tree. Commit the queue bundle first.');
  }

  run('git', ['fetch', 'origin', 'main'], {
    failureMessage: 'Unable to refresh origin/main before checking the queue.',
  });
  const [aheadRaw, behindRaw] = read(
    'git',
    ['rev-list', '--left-right', '--count', 'HEAD...origin/main']
  ).split(/\s+/);
  const ahead = Number(aheadRaw || 0);
  const behind = Number(behindRaw || 0);

  if (ahead > 0) {
    fail('Local main contains unpublished commits. Synchronize them before the automated drip runs.');
  }
  if (behind > 0) {
    run('git', ['merge', '--ff-only', 'origin/main'], {
      failureMessage: 'Local main could not fast-forward to origin/main.',
    });
  }
}

const items = scanCodexQueue(queueRoot, options.now);
printQueue(items);

if (options.mode === 'status') {
  process.exit(0);
}

const invalid = items.filter((item) => item.state === 'invalid');
if (invalid.length > 0) {
  fail('Fix invalid queue bundles before running the publisher.');
}

const selected = options.slug
  ? items.find((item) => item.slug === options.slug)
  : items.find((item) => item.state === 'due');

if (!selected) {
  if (options.slug) {
    fail(`Queue bundle not found: ${options.slug}`);
  }
  console.log('');
  console.log('No post is due. Nothing changed.');
  process.exit(0);
}

if (options.mode === 'dry-run') {
  console.log('');
  console.log(`Would publish: ${selected.title} (${selected.slug})`);
  console.log(`Post: https://ndcodex.com/codex/${selected.slug}`);
  process.exit(0);
}

for (const sourceFile of walkFiles(selected.bundleDir)) {
  const sourcePath = repoRelative(sourceFile);
  const tracked = spawnSync('git', ['ls-files', '--error-unmatch', '--', sourcePath], {
    cwd: repoRoot,
    stdio: 'ignore',
  });
  if ((tracked.status ?? 1) !== 0) {
    fail(`Queue source is not committed: ${sourcePath}`);
  }
}

console.log('');
console.log(`Promoting: ${selected.title}`);

const promoted = await promoteCodexQueueBundle({
  item: selected,
  repoRoot,
  now: options.now,
}).catch((error) => fail(error instanceof Error ? error.message : String(error)));

const publishArgs = [
  path.join(scriptDir, 'publish-codex.mjs'),
  '--file',
  repoRelative(promoted.destinationPost),
  '--message',
  `Drip ${promoted.title}`,
];

for (const include of [...promoted.destinationMedia, ...promoted.consumedFiles]) {
  publishArgs.push('--include', repoRelative(include));
}
if (options.wait) {
  publishArgs.push('--wait');
}

run(process.execPath, publishArgs, {
  failureMessage: [
    'The queue bundle was prepared but publication did not finish.',
    'No queue source was lost: its committed version remains recoverable from Git.',
  ].join('\n'),
});

const remainingDue = items.filter((item) => item.state === 'due' && item.slug !== selected.slug).length;
console.log('');
console.log(`Drip complete. Remaining due posts: ${remainingDue}`);
