#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const astroRoot = path.join(repoRoot, 'astro');
const codexRoot = path.join(astroRoot, 'src', 'content', 'codex');
const publicRoot = path.join(astroRoot, 'public');
const mediaRoot = path.join(publicRoot, 'media');
const args = process.argv.slice(2);

function fail(message) {
  console.error('');
  console.error(`ERROR: ${message}`);
  console.error('');
  process.exit(1);
}

function printHelp() {
  console.log('Usage: ./scripts/publish-codex.mjs --file <post.md> [options]');
  console.log('');
  console.log('Validates, commits, and hands one approved Codex post to production.');
  console.log('The command returns after the Git-linked Netlify deploy starts.');
  console.log('');
  console.log('Options:');
  console.log('  --file <path>       Codex markdown file to publish (required)');
  console.log('  --include <path>    Additional explicit media or sidecar path (repeatable)');
  console.log('  --message <text>    Override the generated Git commit message');
  console.log('  --wait              Wait until Netlify reports the production deploy ready');
  console.log('  -h, --help          Show this help');
}

function parseArgs(values) {
  const options = {
    file: '',
    includes: [],
    message: '',
    wait: false,
  };

  for (let index = 0; index < values.length; index += 1) {
    const arg = values[index];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    if (arg === '--wait') {
      options.wait = true;
      continue;
    }
    if (arg === '--file' || arg === '--include' || arg === '--message') {
      const value = values[index + 1];
      if (!value || value.startsWith('--')) {
        fail(`${arg} requires a value.`);
      }
      if (arg === '--file') {
        if (options.file) {
          fail('Pass exactly one --file value.');
        }
        options.file = value;
      } else if (arg === '--include') {
        options.includes.push(value);
      } else {
        options.message = value.trim();
      }
      index += 1;
      continue;
    }
    fail(`Unknown argument: ${arg}`);
  }

  if (!options.file) {
    fail('A Codex markdown path is required via --file.');
  }

  return options;
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? repoRoot,
    stdio: options.stdio ?? 'inherit',
    encoding: options.encoding,
  });

  if ((result.status ?? 1) !== 0) {
    fail(options.failureMessage ?? `${command} ${commandArgs.join(' ')} failed.`);
  }

  return result;
}

function read(command, commandArgs) {
  return run(command, commandArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  }).stdout.trim();
}

function repoRelativePath(inputPath) {
  const absolutePath = path.resolve(repoRoot, inputPath);
  const relativePath = path.relative(repoRoot, absolutePath);
  if (!relativePath || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    fail(`Publish paths must resolve inside the repository: ${inputPath}`);
  }
  return relativePath.split(path.sep).join('/');
}

function readChangedPaths() {
  const tracked = read('git', ['diff', '--name-only', '-z', 'HEAD', '--'])
    .split('\0')
    .filter(Boolean);
  const untracked = read('git', ['ls-files', '--others', '--exclude-standard', '-z', '--'])
    .split('\0')
    .filter(Boolean);
  return [...new Set([...tracked, ...untracked])];
}

function readFrontmatterScalar(markdown, key) {
  const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  if (!frontmatterMatch) {
    fail('The Codex post must start with YAML frontmatter.');
  }

  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fieldMatch = frontmatterMatch[1].match(new RegExp(`^${escapedKey}:\\s*(.*?)\\s*$`, 'm'));
  if (!fieldMatch) {
    return '';
  }

  const rawValue = fieldMatch[1].trim();
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1).trim();
  }
  return rawValue;
}

function extractReferencedMedia(markdown) {
  const references = new Set();
  const matches = markdown.matchAll(/\/media\/[A-Za-z0-9._~!$&()*+,;=:@%/-]+/g);
  for (const match of matches) {
    let webPath = match[0].replace(/[.,;:]+$/, '');
    try {
      webPath = decodeURIComponent(webPath);
    } catch {
      fail(`Media reference contains invalid URL encoding: ${webPath}`);
    }

    const absolutePath = path.resolve(publicRoot, webPath.replace(/^\/+/, ''));
    const relativeToMedia = path.relative(mediaRoot, absolutePath);
    if (!relativeToMedia || relativeToMedia.startsWith(`..${path.sep}`) || path.isAbsolute(relativeToMedia)) {
      fail(`Media reference escapes astro/public/media: ${webPath}`);
    }
    if (!fs.existsSync(absolutePath)) {
      fail(`Referenced media file does not exist: ${webPath}`);
    }
    references.add(absolutePath);
  }
  return [...references];
}

const options = parseArgs(args);
const primaryPath = repoRelativePath(options.file);
const primaryAbsolutePath = path.join(repoRoot, primaryPath);
const allowedExtensions = new Set(['.md', '.mdx']);

if (!fs.existsSync(primaryAbsolutePath) || !fs.statSync(primaryAbsolutePath).isFile()) {
  fail(`Codex post does not exist: ${primaryPath}`);
}

if (
  path.dirname(primaryAbsolutePath) !== codexRoot ||
  !allowedExtensions.has(path.extname(primaryAbsolutePath).toLowerCase())
) {
  fail('The primary post must be a Markdown file directly inside astro/src/content/codex/.');
}

const includedPaths = options.includes.map(repoRelativePath);
for (const includedPath of includedPaths) {
  const includedAbsolutePath = path.join(repoRoot, includedPath);
  if (fs.existsSync(includedAbsolutePath) && fs.statSync(includedAbsolutePath).isFile()) {
    continue;
  }

  const trackedDeletion = spawnSync(
    'git',
    ['ls-files', '--error-unmatch', '--', includedPath],
    { cwd: repoRoot, stdio: 'ignore' }
  );
  if ((trackedDeletion.status ?? 1) !== 0) {
    fail(`Included publish file does not exist and is not a tracked deletion: ${includedPath}`);
  }
}

const publishPaths = [...new Set([primaryPath, ...includedPaths])];
const currentBranch = read('git', ['branch', '--show-current']);
if (currentBranch !== 'main') {
  fail(`Conversational Codex publishing requires main; current branch is ${currentBranch || '(detached)'}.`);
}

const changedPaths = readChangedPaths();
if (!changedPaths.includes(primaryPath)) {
  fail(`No unpublished change was found in ${primaryPath}.`);
}

const unexpectedPaths = changedPaths.filter((changedPath) => !publishPaths.includes(changedPath));
if (unexpectedPaths.length > 0) {
  fail(
    [
      'The working tree contains changes outside this post.',
      'Commit, stash, or explicitly pass related files with --include:',
      ...unexpectedPaths.map((changedPath) => `  ${changedPath}`),
    ].join('\n')
  );
}

const markdown = fs.readFileSync(primaryAbsolutePath, 'utf8');
const title = readFrontmatterScalar(markdown, 'title');
const type = readFrontmatterScalar(markdown, 'type');
const status = readFrontmatterScalar(markdown, 'status');
const visibility = readFrontmatterScalar(markdown, 'visibility');

if (!title) {
  fail('The Codex post needs a title in frontmatter.');
}
if (type !== 'codex') {
  fail(`The direct Codex lane requires type: codex; found ${type || '(missing)'}.`);
}
if (status !== 'published' || visibility !== 'public') {
  fail('The direct Codex lane requires status: published and visibility: public.');
}

const includedMedia = includedPaths
  .map((includedPath) => path.join(repoRoot, includedPath))
  .filter((includedPath) => {
    if (!fs.existsSync(includedPath) || !fs.statSync(includedPath).isFile()) {
      return false;
    }
    const relative = path.relative(mediaRoot, includedPath);
    return Boolean(relative) && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
  });
const referencedMedia = extractReferencedMedia(markdown);

if (includedMedia.length > 0) {
  run(process.execPath, [
    path.join(scriptDir, 'check-publish-media.mjs'),
    '--fix',
    '--strict',
    ...includedMedia,
  ], {
    failureMessage: 'Included delivery media could not be brought within the ndcodex media budget.',
  });
}

const existingReferencedMedia = referencedMedia.filter(
  (referencedPath) => !includedMedia.includes(referencedPath)
);
if (existingReferencedMedia.length > 0) {
  run(process.execPath, [
    path.join(scriptDir, 'check-publish-media.mjs'),
    '--strict',
    ...existingReferencedMedia,
  ], {
    failureMessage: [
      'Referenced delivery media does not meet the ndcodex media budget.',
      'Optimize it and pass the changed asset explicitly with --include.',
    ].join('\n'),
  });
}

console.log(`Preparing: ${title}`);
console.log(`URL: https://ndcodex.com/codex/${path.basename(primaryPath, path.extname(primaryPath))}`);
console.log('');

run('npm', ['run', 'validate:content'], {
  cwd: astroRoot,
  failureMessage: 'Astro content validation failed; nothing was committed.',
});

run('git', ['add', '--', ...publishPaths]);
run('git', ['diff', '--cached', '--check'], {
  failureMessage: 'The publish files contain whitespace errors; nothing was committed.',
});

const commitMessage = options.message || `Publish ${title}`;
run('git', ['commit', '-m', commitMessage]);

const deployArgs = [path.join(scriptDir, 'deploy-production.mjs')];
if (!options.wait) {
  deployArgs.push('--no-wait');
}

run(process.execPath, deployArgs, {
  failureMessage: [
    'The post was committed locally, but the production handoff did not finish.',
    'The commit is preserved. Resolve the reported issue, then run:',
    '  node scripts/deploy-production.mjs',
  ].join('\n'),
});

const slug = path.basename(primaryPath, path.extname(primaryPath));
const headSha = read('git', ['rev-parse', '--short', 'HEAD']);

console.log('');
console.log(options.wait ? 'LIVE' : 'QUEUED');
console.log(`Post: https://ndcodex.com/codex/${slug}`);
console.log(`Commit: ${headSha}`);
if (!options.wait) {
  console.log('Netlify is building the accepted origin/main commit in the background.');
}
