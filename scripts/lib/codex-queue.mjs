import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { detectActualMediaFormat } from '../media-utils.mjs';

const PUBLISH_AT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const ALLOWED_MEDIA_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.heic',
  '.heif',
  '.svg',
  '.mp4',
  '.mov',
  '.m4v',
]);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_SVG_BYTES = 256 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const MAX_SOURCE_MEDIA_BYTES = 100 * 1024 * 1024;

function fail(message) {
  throw new Error(message);
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function yamlQuote(value) {
  return JSON.stringify(String(value));
}

function parseScalar(value) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === 'string' ? parsed : trimmed;
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }

  return trimmed.replace(/\s+#.*$/, '').trim();
}

export function splitFrontmatter(raw) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    fail('post.md must begin with YAML frontmatter.');
  }

  return {
    frontmatter: match[1],
    body: raw.slice(match[0].length),
  };
}

export function readFrontmatterScalar(frontmatter, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = frontmatter.match(new RegExp(`^${escapedKey}:\\s*(.*?)\\s*$`, 'm'));
  return match ? parseScalar(match[1]) : '';
}

function findTopLevelKey(lines, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return lines.findIndex((line) => new RegExp(`^${escapedKey}:`).test(line));
}

function setScalar(lines, key, value, quoted = false) {
  const line = `${key}: ${quoted ? yamlQuote(value) : value}`;
  const index = findTopLevelKey(lines, key);
  if (index >= 0) {
    lines[index] = line;
  } else {
    lines.push(line);
  }
}

function ensureEmptyList(lines, key) {
  if (findTopLevelKey(lines, key) < 0) {
    lines.push(`${key}: []`);
  }
}

function removeTopLevelKey(lines, key) {
  const index = findTopLevelKey(lines, key);
  if (index >= 0) {
    lines.splice(index, 1);
  }
}

export function normalizeQueuedPost(raw, slug, now) {
  const parsed = splitFrontmatter(raw);
  const title = readFrontmatterScalar(parsed.frontmatter, 'title');
  const existingId = readFrontmatterScalar(parsed.frontmatter, 'id');
  const existingSlug = readFrontmatterScalar(parsed.frontmatter, 'slug');
  const existingType = readFrontmatterScalar(parsed.frontmatter, 'type');

  if (!title) {
    fail(`${slug}/post.md needs a title in frontmatter.`);
  }
  if (existingId && existingId !== slug) {
    fail(`${slug}/post.md has id "${existingId}"; it must match the bundle folder.`);
  }
  if (existingSlug && existingSlug !== slug) {
    fail(`${slug}/post.md has slug "${existingSlug}"; it must match the bundle folder.`);
  }
  if (existingType && existingType !== 'codex') {
    fail(`${slug}/post.md has type "${existingType}"; queued posts must be codex.`);
  }

  const lines = parsed.frontmatter.split(/\r?\n/);
  removeTopLevelKey(lines, 'publishAt');
  setScalar(lines, 'id', slug);
  setScalar(lines, 'slug', slug, true);
  setScalar(lines, 'url', `https://ndcodex.com/codex/${slug}`, true);
  setScalar(lines, 'type', 'codex');
  setScalar(lines, 'title', title, true);
  if (!readFrontmatterScalar(parsed.frontmatter, 'date')) {
    setScalar(lines, 'date', now.toISOString().slice(0, 10), true);
  }
  setScalar(lines, 'postedAt', now.toISOString(), true);
  setScalar(lines, 'state', 'published');
  setScalar(lines, 'status', 'published');
  setScalar(lines, 'visibility', 'public');
  ensureEmptyList(lines, 'tags');
  ensureEmptyList(lines, 'images');
  ensureEmptyList(lines, 'dependencies');
  ensureEmptyList(lines, 'themes');
  ensureEmptyList(lines, 'media');

  return {
    title,
    markdown: `---\n${lines.join('\n')}\n---\n${parsed.body}`,
  };
}

function parsePublishAt(rawValue) {
  if (!PUBLISH_AT_PATTERN.test(rawValue)) {
    fail('publishAt must be an ISO timestamp with a timezone, such as 2026-08-22T09:00:00-04:00.');
  }

  const timestamp = Date.parse(rawValue);
  if (!Number.isFinite(timestamp)) {
    fail(`publishAt is not a valid timestamp: ${rawValue}`);
  }
  return timestamp;
}

function walkFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

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

export function scanCodexQueue(queueRoot, now = new Date()) {
  if (!fs.existsSync(queueRoot)) {
    return [];
  }

  return fs.readdirSync(queueRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.'))
    .map((entry) => {
      const slug = entry.name;
      const bundleDir = path.join(queueRoot, slug);
      const postPath = path.join(bundleDir, 'post.md');
      const base = { slug, bundleDir, postPath, title: slug, publishAt: '', timestamp: null };

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        return { ...base, state: 'invalid', error: 'bundle folder must be a lowercase kebab-case slug' };
      }
      if (!fs.existsSync(postPath) || !fs.statSync(postPath).isFile()) {
        return { ...base, state: 'invalid', error: 'bundle is missing post.md' };
      }

      try {
        const raw = fs.readFileSync(postPath, 'utf8');
        const { frontmatter } = splitFrontmatter(raw);
        normalizeQueuedPost(raw, slug, now);
        const title = readFrontmatterScalar(frontmatter, 'title') || slug;
        const publishAt = readFrontmatterScalar(frontmatter, 'publishAt');
        if (!publishAt) {
          return { ...base, title, state: 'held' };
        }
        const timestamp = parsePublishAt(publishAt);
        return {
          ...base,
          title,
          publishAt,
          timestamp,
          state: timestamp <= now.getTime() ? 'due' : 'scheduled',
        };
      } catch (error) {
        return {
          ...base,
          state: 'invalid',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
    .sort((left, right) => {
      const leftTime = left.timestamp ?? Number.POSITIVE_INFINITY;
      const rightTime = right.timestamp ?? Number.POSITIVE_INFINITY;
      return leftTime - rightTime || left.slug.localeCompare(right.slug);
    });
}

function safeDeliveryStem(relativePath) {
  const extension = path.extname(relativePath);
  const withoutExtension = toPosix(relativePath.slice(0, -extension.length));
  const stem = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem || 'media';
}

function validateMediaSourcePath(relativePath) {
  const normalized = toPosix(relativePath);
  if (normalized.split('/').some((segment) => !/^[A-Za-z0-9._-]+$/.test(segment))) {
    fail(`Queue media paths must be URL-safe (letters, numbers, dot, dash, underscore): media/${normalized}`);
  }
  const extension = path.extname(normalized).toLowerCase();
  if (!ALLOWED_MEDIA_EXTENSIONS.has(extension)) {
    fail(`Unsupported queue media type ${extension || '(none)'}: media/${normalized}`);
  }
}

function run(command, args, cwd, failureMessage) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if ((result.status ?? 1) !== 0) {
    fail(failureMessage || `${command} ${args.join(' ')} failed.`);
  }
}

async function prepareImage(sourcePath, repoRoot) {
  const modulePath = path.join(repoRoot, 'astro', 'src', 'lib', 'pigeonImageIntelligence.ts');
  const { preparePigeonDeliveryImage } = await import(pathToFileURL(modulePath).href);
  return preparePigeonDeliveryImage({
    buffer: fs.readFileSync(sourcePath),
    contentType: '',
    originalFilename: path.basename(sourcePath),
  });
}

function prepareVideo(sourcePath, repoRoot) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ndcodex-queue-video-'));
  try {
    const detected = detectActualMediaFormat(sourcePath);
    const temporaryExtension = detected === 'mov' ? '.mov' : '.mp4';
    const temporaryInput = path.join(temporaryRoot, `source${temporaryExtension}`);
    fs.copyFileSync(sourcePath, temporaryInput);
    run(
      process.execPath,
      [path.join(repoRoot, 'scripts', 'optimize-media-assets.mjs'), temporaryInput],
      repoRoot,
      `Video optimization failed for ${path.basename(sourcePath)}.`
    );
    const output = temporaryExtension === '.mov'
      ? temporaryInput.replace(/\.mov$/i, '.mp4')
      : temporaryInput;
    if (!fs.existsSync(output)) {
      fail(`Video optimization did not produce MP4 output for ${path.basename(sourcePath)}.`);
    }
    return fs.readFileSync(output);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function replaceMediaReference(markdown, relativePath, publicPath) {
  const escaped = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `(^|[\\s"'(<\\[=:])(?:\\./)?media/${escaped}(?=$|[\\s"')>\\]}?#,])`,
    'gm'
  );
  let replacements = 0;
  const next = markdown.replace(pattern, (_match, prefix) => {
    replacements += 1;
    return `${prefix}${publicPath}`;
  });
  return { markdown: next, replacements };
}

async function prepareBundleMedia({ bundleDir, slug, repoRoot, publicRoot, markdown }) {
  const sourceRoot = path.join(bundleDir, 'media');
  const sourceFiles = walkFiles(sourceRoot);
  if (sourceFiles.length === 0) {
    const unresolved = markdown.match(/(^|[\s"'(<\[=:])(?:\.\/)?media\/[A-Za-z0-9._~!$&'()*+,;=@%/-]+/m);
    if (unresolved) {
      fail(`post.md references queue media that was not found: ${unresolved[0].trim()}`);
    }
    return { markdown, destinationFiles: [], destinationDir: null };
  }

  const destinationDir = path.join(publicRoot, 'media', 'codex', slug);
  if (fs.existsSync(destinationDir)) {
    fail(`Delivery media destination already exists: ${toPosix(path.relative(repoRoot, destinationDir))}`);
  }

  const mappings = [];
  const destinationNames = new Set();
  fs.mkdirSync(destinationDir, { recursive: true });

  try {
    for (const sourcePath of sourceFiles) {
      const relativePath = toPosix(path.relative(sourceRoot, sourcePath));
      validateMediaSourcePath(relativePath);
      const sourceSize = fs.statSync(sourcePath).size;
      if (sourceSize > MAX_SOURCE_MEDIA_BYTES) {
        fail(`media/${relativePath} exceeds the 100 MiB queue source limit.`);
      }

      const sourceExtension = path.extname(relativePath).toLowerCase();
      const format = sourceExtension === '.svg' ? 'svg' : detectActualMediaFormat(sourcePath);
      const stem = safeDeliveryStem(relativePath);
      let extension;
      let output;

      if (format === 'svg') {
        extension = 'svg';
        output = fs.readFileSync(sourcePath);
        if (output.length > MAX_SVG_BYTES) {
          fail(`media/${relativePath} exceeds the 256 KiB SVG limit.`);
        }
      } else if (format === 'mp4' || format === 'mov') {
        extension = 'mp4';
        output = prepareVideo(sourcePath, repoRoot);
        if (output.length > MAX_VIDEO_BYTES) {
          fail(`media/${relativePath} remains above the 20 MiB video limit after optimization.`);
        }
      } else {
        const delivery = await prepareImage(sourcePath, repoRoot);
        extension = delivery.extension;
        output = delivery.buffer;
        if (output.length > MAX_IMAGE_BYTES) {
          fail(`media/${relativePath} remains above the 2 MiB image limit after optimization.`);
        }
      }

      const destinationName = `${stem}.${extension}`;
      if (destinationNames.has(destinationName)) {
        fail(`Queue media filenames collide after normalization: ${destinationName}`);
      }
      destinationNames.add(destinationName);

      const destinationPath = path.join(destinationDir, destinationName);
      fs.writeFileSync(destinationPath, output);
      mappings.push({
        relativePath,
        publicPath: `/media/codex/${slug}/${destinationName}`,
        destinationPath,
      });
    }

    let rewritten = markdown;
    for (const mapping of mappings.sort((a, b) => b.relativePath.length - a.relativePath.length)) {
      const result = replaceMediaReference(rewritten, mapping.relativePath, mapping.publicPath);
      if (result.replacements === 0) {
        fail(`media/${mapping.relativePath} is not referenced by post.md.`);
      }
      rewritten = result.markdown;
    }

    const unresolved = rewritten.match(/(^|[\s"'(<\[=:])(?:\.\/)?media\/[A-Za-z0-9._~!$&'()*+,;=@%/-]+/m);
    if (unresolved) {
      fail(`post.md references queue media that was not found: ${unresolved[0].trim()}`);
    }

    return {
      markdown: rewritten,
      destinationFiles: mappings.map((mapping) => mapping.destinationPath),
      destinationDir,
    };
  } catch (error) {
    fs.rmSync(destinationDir, { recursive: true, force: true });
    throw error;
  }
}

export async function promoteCodexQueueBundle({
  item,
  repoRoot,
  now = new Date(),
  codexRoot = path.join(repoRoot, 'astro', 'src', 'content', 'codex'),
  publicRoot = path.join(repoRoot, 'astro', 'public'),
}) {
  const destinationPost = path.join(codexRoot, `${item.slug}.md`);
  if (fs.existsSync(destinationPost)) {
    fail(`A published Codex post already exists for ${item.slug}.`);
  }

  const bundleFiles = walkFiles(item.bundleDir);
  const unexpected = bundleFiles.filter((file) => {
    const relative = toPosix(path.relative(item.bundleDir, file));
    return relative !== 'post.md' && !relative.startsWith('media/');
  });
  if (unexpected.length > 0) {
    fail(`Queue bundles may contain only post.md and media/: ${unexpected.map((file) => path.basename(file)).join(', ')}`);
  }

  const raw = fs.readFileSync(item.postPath, 'utf8');
  const normalized = normalizeQueuedPost(raw, item.slug, now);
  let preparedMedia = null;

  try {
    preparedMedia = await prepareBundleMedia({
      bundleDir: item.bundleDir,
      slug: item.slug,
      repoRoot,
      publicRoot,
      markdown: normalized.markdown,
    });
    fs.writeFileSync(destinationPost, preparedMedia.markdown);
    fs.rmSync(item.bundleDir, { recursive: true });
  } catch (error) {
    fs.rmSync(destinationPost, { force: true });
    if (preparedMedia?.destinationDir) {
      fs.rmSync(preparedMedia.destinationDir, { recursive: true, force: true });
    }
    throw error;
  }

  return {
    title: normalized.title,
    destinationPost,
    destinationMedia: preparedMedia.destinationFiles,
    consumedFiles: bundleFiles,
  };
}
