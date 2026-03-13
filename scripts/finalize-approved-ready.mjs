#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);

function printUsage() {
  console.log(`Usage:
  node scripts/finalize-approved-ready.mjs [options]

Options:
  --source <path>     Ready draft path (repeatable)
  --all               Finalize all drafts currently in inbox/ready
  --note <text>       Approval note recorded in promotion/cleanup logs
  --status <value>    Target canonical status (default: published)
  --skip-media        Skip publish-time media prep
  --skip-validate     Skip object validation
  --skip-build        Skip Astro build
  -h, --help          Show help

What it does:
  1. prepare mapped media into astro/public for the selected ready drafts
  2. promote approved ready drafts into canonical objects + Astro content
  3. reconcile inbox/ready so promoted drafts leave the active queue
  4. archive any matching drop payloads discovered from ready provenance
  5. purge inbox/drop/.DS_Store if present
  6. validate objects and build Astro unless skipped

Examples:
  node scripts/finalize-approved-ready.mjs --source inbox/ready/2026-03-08-art-is-for-people-who-want-to-feel-alive.md --note "Operator approved for publish"
  node scripts/finalize-approved-ready.mjs --all --note "Operator approved pending batch"
`);
}

if (args.includes('-h') || args.includes('--help')) {
  printUsage();
  process.exit(0);
}

const options = {
  sources: [],
  all: false,
  note: '',
  status: 'published',
  skipMedia: false,
  skipValidate: false,
  skipBuild: false,
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

  if (arg === '--source') {
    const value = args[i + 1];
    if (!value) {
      console.error('Missing value for --source');
      process.exit(1);
    }
    options.sources.push(value);
    i += 1;
    continue;
  }

  if (arg === '--all') {
    options.all = true;
    continue;
  }

  if (arg === '--note') {
    const value = args[i + 1];
    if (!value) {
      console.error('Missing value for --note');
      process.exit(1);
    }
    options.note = value;
    i += 1;
    continue;
  }

  if (arg === '--status') {
    const value = args[i + 1];
    if (!value) {
      console.error('Missing value for --status');
      process.exit(1);
    }
    options.status = value;
    i += 1;
    continue;
  }

  if (arg === '--skip-validate') {
    options.skipValidate = true;
    continue;
  }

  if (arg === '--skip-media') {
    options.skipMedia = true;
    continue;
  }

  if (arg === '--skip-build') {
    options.skipBuild = true;
    continue;
  }

  console.error(`Unknown argument: ${arg}`);
  process.exit(1);
}

if (!options.all && options.sources.length === 0) {
  console.error('No ready drafts selected. Use --source or --all.');
  process.exit(1);
}

if (!options.note.trim()) {
  console.error('Missing required approval note. Use --note "<reason>".');
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const dropDsStore = path.join(repoRoot, 'inbox', 'drop', '.DS_Store');

function runNodeScript(scriptName, scriptArgs, cwd = repoRoot) {
  execFileSync(process.execPath, [path.join(scriptDir, scriptName), ...scriptArgs], {
    cwd,
    stdio: 'inherit',
  });
}

const promoteArgs = [];
const mediaArgs = [];
if (options.all) {
  promoteArgs.push('--all', '--approve-all');
  mediaArgs.push('--all');
}
for (const source of options.sources) {
  promoteArgs.push('--source', source);
  mediaArgs.push('--source', source);
}
promoteArgs.push('--approve', '--note', options.note, '--status', options.status);

runNodeScript('promote-ready.mjs', [...promoteArgs, '--dry-run']);

if (!options.skipMedia) {
  runNodeScript('publish-ready-media.mjs', mediaArgs);
}

runNodeScript('promote-ready.mjs', promoteArgs);
runNodeScript('reconcile-inbox.mjs', ['--note', options.note]);
runNodeScript('cleanup-inbox-drop.mjs', ['--auto-published', '--note', options.note]);

if (fs.existsSync(dropDsStore)) {
  runNodeScript('cleanup-inbox-drop.mjs', [
    '--mode',
    'purge',
    '--source',
    'inbox/drop/.DS_Store',
    '--note',
    options.note,
  ]);
}

if (!options.skipValidate) {
  runNodeScript('validate-objects.mjs', ['objects']);
}

if (!options.skipBuild) {
  execFileSync('npm', ['run', 'build'], {
    cwd: path.join(repoRoot, 'astro'),
    stdio: 'inherit',
  });
}

console.log('Finalize complete.');
