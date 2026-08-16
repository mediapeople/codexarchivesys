import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  normalizeQueuedPost,
  promoteCodexQueueBundle,
  scanCodexQueue,
} from '../lib/codex-queue.mjs';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '..', '..');
const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

function temporaryWorkspace(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ndcodex-queue-test-'));
  const queueRoot = path.join(root, 'publishing', 'codex-queue');
  const codexRoot = path.join(root, 'astro', 'src', 'content', 'codex');
  const publicRoot = path.join(root, 'astro', 'public');
  fs.mkdirSync(queueRoot, { recursive: true });
  fs.mkdirSync(codexRoot, { recursive: true });
  fs.mkdirSync(publicRoot, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { root, queueRoot, codexRoot, publicRoot };
}

function writeBundle(queueRoot, slug, frontmatter, body = '# Test\n') {
  const bundleDir = path.join(queueRoot, slug);
  fs.mkdirSync(bundleDir, { recursive: true });
  fs.writeFileSync(path.join(bundleDir, 'post.md'), `---\n${frontmatter}\n---\n${body}`);
  return bundleDir;
}

test('queue scan distinguishes held, scheduled, due, and invalid bundles', (t) => {
  const { queueRoot } = temporaryWorkspace(t);
  writeBundle(queueRoot, 'due-post', 'title: "Due"\npublishAt: "2026-08-16T08:00:00-04:00"');
  writeBundle(queueRoot, 'future-post', 'title: "Future"\npublishAt: "2026-08-17T08:00:00-04:00"');
  writeBundle(queueRoot, 'held-post', 'title: "Held"');
  writeBundle(queueRoot, 'bad-time', 'title: "Bad"\npublishAt: "tomorrow morning"');
  writeBundle(queueRoot, '_template', 'title: "Ignored"');

  const items = scanCodexQueue(queueRoot, new Date('2026-08-16T16:00:00Z'));
  assert.deepEqual(
    Object.fromEntries(items.map((item) => [item.slug, item.state])),
    {
      'due-post': 'due',
      'future-post': 'scheduled',
      'bad-time': 'invalid',
      'held-post': 'held',
    }
  );
});

test('promotion metadata removes scheduling state and makes the post public', () => {
  const raw = `---
type: codex
title: "A Queued Post"
publishAt: "2026-08-20T09:00:00-04:00"
status: draft
visibility: private
---
# A QUEUED POST

Body remains here.
`;
  const normalized = normalizeQueuedPost(raw, 'a-queued-post', new Date('2026-08-20T13:02:00Z'));

  assert.doesNotMatch(normalized.markdown, /^publishAt:/m);
  assert.match(normalized.markdown, /^id: a-queued-post$/m);
  assert.match(normalized.markdown, /^status: published$/m);
  assert.match(normalized.markdown, /^state: published$/m);
  assert.match(normalized.markdown, /^visibility: public$/m);
  assert.match(normalized.markdown, /^postedAt: "2026-08-20T13:02:00.000Z"$/m);
  assert.match(normalized.markdown, /Body remains here\./);
});

test('text-only promotion consumes the bundle without creating a media directory', async (t) => {
  const { queueRoot, codexRoot, publicRoot } = temporaryWorkspace(t);
  const bundleDir = writeBundle(
    queueRoot,
    'text-post',
    'title: "Text Post"\npublishAt: "2026-08-16T08:00:00-04:00"',
    '# TEXT POST\n\nNothing extra required.\n'
  );
  const [item] = scanCodexQueue(queueRoot, new Date('2026-08-16T16:00:00Z'));

  const result = await promoteCodexQueueBundle({
    item,
    repoRoot,
    now: new Date('2026-08-16T16:00:00Z'),
    codexRoot,
    publicRoot,
  });

  assert.deepEqual(result.destinationMedia, []);
  assert.equal(fs.existsSync(bundleDir), false);
  assert.equal(fs.existsSync(path.join(publicRoot, 'media', 'codex', 'text-post')), false);
  assert.match(fs.readFileSync(result.destinationPost, 'utf8'), /Nothing extra required\./);
});

test('promotion converts colocated raster media and rewrites every reference', async (t) => {
  const { queueRoot, codexRoot, publicRoot } = temporaryWorkspace(t);
  const bundleDir = writeBundle(
    queueRoot,
    'media-post',
    `type: codex
title: "Media Post"
publishAt: "2026-08-16T08:00:00-04:00"
images:
  - "media/hero.png"
status: draft
visibility: private
media:
  - kind: image
    src: "media/hero.png"
    role: hero
    alt: "Tiny test image."`,
    '# MEDIA POST\n\n![Tiny test image](media/hero.png)\n'
  );
  const mediaDir = path.join(bundleDir, 'media');
  fs.mkdirSync(mediaDir);
  fs.writeFileSync(path.join(mediaDir, 'hero.png'), tinyPng);
  const [item] = scanCodexQueue(queueRoot, new Date('2026-08-16T16:00:00Z'));

  const result = await promoteCodexQueueBundle({
    item,
    repoRoot,
    now: new Date('2026-08-16T16:00:00Z'),
    codexRoot,
    publicRoot,
  });

  assert.equal(result.destinationMedia.length, 1);
  assert.match(result.destinationMedia[0], /hero\.webp$/);
  assert.ok(fs.statSync(result.destinationMedia[0]).size <= 2 * 1024 * 1024);
  const published = fs.readFileSync(result.destinationPost, 'utf8');
  const publicReference = '/media/codex/media-post/hero.webp';
  assert.equal(published.split(publicReference).length - 1, 3);
  assert.doesNotMatch(published, /["'(]media\/hero\.png/);
  assert.equal(fs.existsSync(bundleDir), false);
});

test('missing media stops promotion without consuming the queue bundle', async (t) => {
  const { queueRoot, codexRoot, publicRoot } = temporaryWorkspace(t);
  const bundleDir = writeBundle(
    queueRoot,
    'missing-media',
    'title: "Missing Media"\npublishAt: "2026-08-16T08:00:00-04:00"',
    '# MISSING MEDIA\n\n![Missing](media/not-here.jpg)\n'
  );
  const [item] = scanCodexQueue(queueRoot, new Date('2026-08-16T16:00:00Z'));

  await assert.rejects(
    promoteCodexQueueBundle({ item, repoRoot, codexRoot, publicRoot }),
    /references queue media that was not found/
  );
  assert.equal(fs.existsSync(bundleDir), true);
  assert.equal(fs.existsSync(path.join(codexRoot, 'missing-media.md')), false);
});

test('unreferenced media stops promotion and cleans generated delivery files', async (t) => {
  const { queueRoot, codexRoot, publicRoot } = temporaryWorkspace(t);
  const bundleDir = writeBundle(
    queueRoot,
    'unused-media',
    'title: "Unused Media"\npublishAt: "2026-08-16T08:00:00-04:00"'
  );
  const mediaDir = path.join(bundleDir, 'media');
  fs.mkdirSync(mediaDir);
  fs.writeFileSync(path.join(mediaDir, 'unused.png'), tinyPng);
  const [item] = scanCodexQueue(queueRoot, new Date('2026-08-16T16:00:00Z'));

  await assert.rejects(
    promoteCodexQueueBundle({ item, repoRoot, codexRoot, publicRoot }),
    /is not referenced by post\.md/
  );
  assert.equal(fs.existsSync(bundleDir), true);
  assert.equal(fs.existsSync(path.join(publicRoot, 'media', 'codex', 'unused-media')), false);
});

test('unsupported audio is rejected before a queue bundle is consumed', async (t) => {
  const { queueRoot, codexRoot, publicRoot } = temporaryWorkspace(t);
  const bundleDir = writeBundle(
    queueRoot,
    'audio-post',
    'title: "Audio Post"\npublishAt: "2026-08-16T08:00:00-04:00"',
    '# AUDIO POST\n\n<audio src="media/voice.mp3"></audio>\n'
  );
  const mediaDir = path.join(bundleDir, 'media');
  fs.mkdirSync(mediaDir);
  fs.writeFileSync(path.join(mediaDir, 'voice.mp3'), Buffer.from('not-a-delivery-file'));
  const [item] = scanCodexQueue(queueRoot, new Date('2026-08-16T16:00:00Z'));

  await assert.rejects(
    promoteCodexQueueBundle({ item, repoRoot, codexRoot, publicRoot }),
    /Unsupported queue media type \.mp3/
  );
  assert.equal(fs.existsSync(bundleDir), true);
});
