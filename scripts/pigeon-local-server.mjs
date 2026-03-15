import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { POST } from '../astro/src/pages/api/pigeon.ts';

const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const port = Number.parseInt(portArg?.split('=')[1] || process.env.PORT || '8787', 10);

const workspaceRoot = process.cwd();
const publicDir = path.resolve(workspaceRoot, 'astro/public');
const distDir = path.resolve(workspaceRoot, 'astro/dist');

if (!Number.isFinite(port) || port <= 0) {
  throw new Error('Invalid port for pigeon-local-server.');
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const typeMap = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
  };

  return typeMap[ext] || 'application/octet-stream';
}

async function serveFile(res, filePath) {
  const file = await readFile(filePath);
  res.writeHead(200, { 'content-type': getMimeType(filePath) });
  res.end(file);
}

async function fileExists(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

function buildManifest(host) {
  const base = `http://${host}`;
  return JSON.stringify(
    {
      name: 'Carrier Pigeon',
      short_name: 'Pigeon',
      start_url: `${base}/`,
      scope: `${base}/`,
      display: 'standalone',
      background_color: '#140f0b',
      theme_color: '#d59a4a',
      description: 'Phone-first markdown publishing into the ndcodex archive.',
      icons: [
        {
          src: `${base}/apple-touch-icon.png`,
          sizes: '180x180',
          type: 'image/png',
        },
        {
          src: `${base}/icon-192.png`,
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
    null,
    2
  );
}

function renderUploadPage(host) {
  const base = `http://${host}`;
  const endpoint = `${base}/api/pigeon`;
  const sampleSignal = `---\ntitle: Signal Phone Test\nobject_type: signal\ndate: 2026-03-14\ntags:\n  - signal\n---\nSignals are epiphanies prepared for transmission.\n\nSmall enough to move quickly.\nClear enough to travel alone.`;
  const sampleCodex = `---\ntitle: Carrier Pigeon Notes\nobject_type: codex\ndate: 2026-03-14\ntags:\n  - codex\n  - dispatch\n---\nCarrier Pigeon is now routing notes by object type.`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Carrier Pigeon</title>
    <meta name="description" content="Phone-first markdown publishing into the ndcodex archive." />
    <meta name="theme-color" content="#d59a4a" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Carrier Pigeon" />
    <link rel="apple-touch-icon" href="${base}/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="${base}/icon-192.png" />
    <link rel="icon" type="image/svg+xml" href="${base}/favicon.svg" />
    <link rel="manifest" href="${base}/site.webmanifest" />
    <style>
      :root {
        color-scheme: dark;
        --bg: #120d0a;
        --panel: rgba(26, 19, 14, 0.9);
        --panel-strong: rgba(19, 13, 10, 0.96);
        --line: rgba(255, 243, 223, 0.12);
        --line-strong: rgba(255, 230, 190, 0.24);
        --text: #f6efe4;
        --muted: #d3be9d;
        --muted-strong: #edd5b2;
        --accent: #d59a4a;
        --accent-strong: #efb258;
        --success: #9fd1a7;
        --danger: #e38b76;
        --shadow: 0 26px 60px rgba(0, 0, 0, 0.32);
        --radius-soft: 0;
        --radius-hard: 0;
      }

      * {
        box-sizing: border-box;
      }

      html, body {
        margin: 0;
        min-height: 100%;
      }

      body {
        min-height: 100vh;
        padding: max(22px, env(safe-area-inset-top)) 18px max(26px, env(safe-area-inset-bottom));
        background:
          radial-gradient(circle at top, rgba(213, 154, 74, 0.24), transparent 34%),
          radial-gradient(circle at 20% 20%, rgba(207, 113, 64, 0.18), transparent 28%),
          linear-gradient(180deg, #22160e 0%, var(--bg) 55%);
        color: var(--text);
        font-family: "Avenir Next", Avenir, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      main {
        width: min(100%, 760px);
        margin: 0 auto;
      }

      .hero {
        position: relative;
        overflow: hidden;
        padding: 26px 20px 20px;
        border: 1px solid var(--line-strong);
        border-radius: var(--radius-soft);
        background:
          radial-gradient(circle at top right, rgba(255, 214, 153, 0.16), transparent 30%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
          var(--panel);
        box-shadow: var(--shadow);
      }

      .hero::after {
        content: "";
        position: absolute;
        inset: auto -30px -80px auto;
        width: 180px;
        height: 180px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(213, 154, 74, 0.28), transparent 70%);
        pointer-events: none;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        padding: 7px 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius-soft);
        background: rgba(255, 255, 255, 0.04);
        color: var(--muted-strong);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .eyebrow-dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: var(--success);
        box-shadow: 0 0 0 6px rgba(159, 209, 167, 0.14);
      }

      h1 {
        margin: 0;
        font-size: clamp(2.5rem, 7vw, 4.2rem);
        line-height: 0.95;
        letter-spacing: -0.05em;
      }

      .deck {
        margin-top: 12px;
        max-width: 30rem;
        color: var(--muted);
        font-size: 1.08rem;
        line-height: 1.55;
      }

      .grid {
        margin-top: 18px;
        display: grid;
        gap: 14px;
      }

      .panel {
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: var(--radius-soft);
        background: var(--panel-strong);
        box-shadow: var(--shadow);
      }

      .panel-title {
        margin: 0 0 10px;
        font-size: 1.02rem;
        font-weight: 700;
        color: var(--muted-strong);
      }

      .panel-copy {
        margin: 0 0 14px;
        color: var(--muted);
        line-height: 1.5;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .chip {
        appearance: none;
        border: 1px solid var(--line);
        border-radius: var(--radius-soft);
        padding: 10px 14px;
        background: rgba(255, 255, 255, 0.04);
        color: var(--text);
        font: inherit;
        font-size: 14px;
        font-weight: 600;
      }

      .upload-shell {
        display: grid;
        gap: 14px;
      }

      .file-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }

      .file-label {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 16px;
        border-radius: var(--radius-soft);
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--line);
        color: var(--text);
        font-weight: 700;
      }

      .file-name {
        color: var(--muted-strong);
        font-size: 0.95rem;
      }

      input[type="file"] {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      }

      textarea {
        width: 100%;
        min-height: 360px;
        padding: 16px;
        border: 1px solid var(--line);
        border-radius: var(--radius-soft);
        background: rgba(0, 0, 0, 0.26);
        color: var(--text);
        font: inherit;
        font-size: 1rem;
        line-height: 1.55;
        resize: vertical;
      }

      textarea::placeholder {
        color: rgba(244, 239, 228, 0.4);
      }

      .toolbar {
        display: grid;
        gap: 10px;
      }

      .primary {
        appearance: none;
        border: 0;
        border-radius: var(--radius-hard);
        padding: 16px 18px;
        background: linear-gradient(180deg, var(--accent-strong), var(--accent));
        color: #1c140d;
        font: inherit;
        font-size: 1.06rem;
        font-weight: 800;
        letter-spacing: 0.01em;
      }

      .secondary-row {
        display: flex;
        gap: 10px;
      }

      .secondary {
        flex: 1;
        appearance: none;
        border: 1px solid var(--line);
        border-radius: var(--radius-hard);
        padding: 12px 14px;
        background: rgba(255, 255, 255, 0.04);
        color: var(--text);
        font: inherit;
        font-weight: 600;
      }

      .status {
        display: grid;
        gap: 10px;
      }

      .status-bar {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
      }

      .status-label {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: var(--muted-strong);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .status-label::before {
        content: "";
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: var(--muted);
      }

      .status-label.is-success::before {
        background: var(--success);
      }

      .status-label.is-error::before {
        background: var(--danger);
      }

      .status-copy {
        color: var(--muted);
        font-size: 14px;
      }

      pre {
        margin: 0;
        padding: 16px;
        overflow: auto;
        border-radius: var(--radius-soft);
        border: 1px solid var(--line);
        background: rgba(0, 0, 0, 0.3);
        color: var(--text);
        white-space: pre-wrap;
        word-break: break-word;
      }

      .result-meta {
        display: none;
        gap: 10px;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }

      .result-meta.is-visible {
        display: grid;
      }

      .result-meta article {
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius-soft);
        background: rgba(255, 255, 255, 0.03);
      }

      .result-meta p {
        margin: 0 0 4px;
        color: var(--muted);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .result-meta strong,
      .result-meta a {
        color: var(--text);
        font-size: 0.98rem;
        word-break: break-word;
      }

      .install {
        display: grid;
        gap: 8px;
        color: var(--muted);
        font-size: 0.94rem;
        line-height: 1.45;
      }

      .install strong {
        color: var(--muted-strong);
      }

      @media (min-width: 760px) {
        .grid {
          grid-template-columns: 1.2fr 0.8fr;
        }

        .hero {
          padding: 30px 24px 24px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="eyebrow"><span class="eyebrow-dot"></span>Phone-first archive ingest</div>
        <h1>Carrier Pigeon</h1>
        <p class="deck">Choose a markdown note from Files, tweak it if needed, and send it straight into the right archive collection from your phone.</p>
      </section>

      <section class="grid">
        <section class="panel upload-shell">
          <div>
            <h2 class="panel-title">Publish Note</h2>
            <p class="panel-copy">Use <code>object_type</code> in frontmatter to route notes into <code>signal</code>, <code>codex</code>, and the other archive collections.</p>
          </div>

          <div class="actions">
            <button class="chip" type="button" data-template="signal">Signal Template</button>
            <button class="chip" type="button" data-template="codex">Codex Template</button>
          </div>

          <div class="file-row">
            <label class="file-label" for="file">Choose Markdown File</label>
            <span class="file-name" id="file-name">No file selected yet</span>
          </div>
          <input id="file" type="file" accept=".md,.markdown,text/markdown,text/plain" />

          <div class="file-row">
            <label class="file-label" for="images">Attach Images</label>
            <span class="file-name" id="image-name">No images selected yet</span>
          </div>
          <input id="images" type="file" accept="image/*" multiple />

          <p class="panel-copy">Attach matching image files if the note uses local Obsidian image references.</p>

          <textarea id="note" spellcheck="false" placeholder="Paste a markdown note or load one from Files."></textarea>

          <div class="toolbar">
            <button class="primary" id="publish" type="button">Publish To Carrier Pigeon</button>
            <div class="secondary-row">
              <button class="secondary" id="copy-url" type="button">Copy Upload URL</button>
              <button class="secondary" id="clear-note" type="button">Clear Note</button>
            </div>
          </div>
        </section>

        <section class="panel status">
          <div>
            <h2 class="panel-title">Result</h2>
            <p class="panel-copy">This page is home-screen friendly. Use Safari’s share menu and tap <strong>Add to Home Screen</strong> for a one-tap launcher.</p>
          </div>

          <div class="install">
            <div><strong>Minimal Shortcut:</strong> one action, <code>Open URLs</code> -> <code>${base}/</code>.</div>
            <div><strong>Home screen icon:</strong> use the shortcut settings or add this page to the home screen directly from Safari.</div>
          </div>

          <div class="status-bar">
            <span class="status-label" id="status-label">Idle</span>
            <span class="status-copy" id="status-copy">Waiting for note input.</span>
          </div>

          <section class="result-meta" id="result-meta">
            <article>
              <p>Object Type</p>
              <strong id="result-type">-</strong>
            </article>
            <article>
              <p>Slug</p>
              <strong id="result-slug">-</strong>
            </article>
            <article>
              <p>Archive Path</p>
              <a id="result-url" href="${base}/" target="_blank" rel="noreferrer">-</a>
            </article>
          </section>

          <pre id="result">Waiting for note input.</pre>
        </section>
      </section>
    </main>
    <script>
      const endpoint = ${JSON.stringify(endpoint)};
      const hostBase = ${JSON.stringify(base)};
      const sampleTemplates = {
        signal: ${JSON.stringify(sampleSignal)},
        codex: ${JSON.stringify(sampleCodex)},
      };

      const fileInput = document.getElementById('file');
      const fileName = document.getElementById('file-name');
      const imageInput = document.getElementById('images');
      const imageName = document.getElementById('image-name');
      const noteField = document.getElementById('note');
      const result = document.getElementById('result');
      const publishButton = document.getElementById('publish');
      const copyUrlButton = document.getElementById('copy-url');
      const clearNoteButton = document.getElementById('clear-note');
      const statusLabel = document.getElementById('status-label');
      const statusCopy = document.getElementById('status-copy');
      const resultMeta = document.getElementById('result-meta');
      const resultType = document.getElementById('result-type');
      const resultSlug = document.getElementById('result-slug');
      const resultUrl = document.getElementById('result-url');

      function setStatus(kind, label, copy) {
        statusLabel.textContent = label;
        statusLabel.className = 'status-label' + (kind === 'success' ? ' is-success' : kind === 'error' ? ' is-error' : '');
        statusCopy.textContent = copy;
      }

      function showResultMeta(data) {
        if (!data || !data.slug || !data.url) {
          resultMeta.classList.remove('is-visible');
          resultType.textContent = '-';
          resultSlug.textContent = '-';
          resultUrl.textContent = '-';
          resultUrl.href = hostBase + '/';
          return;
        }

        resultMeta.classList.add('is-visible');
        resultType.textContent = data.objectType || data.object_type || 'fragment';
        resultSlug.textContent = data.slug;
        resultUrl.textContent = data.url;
        resultUrl.href = hostBase + data.url;
      }

      function describeImageSelection(files) {
        if (!files.length) {
          return 'No images selected yet';
        }

        if (files.length === 1) {
          return files[0].name;
        }

        return files.length + ' images selected';
      }

      fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        noteField.value = await file.text();
        fileName.textContent = file.name;
        setStatus('idle', 'Loaded', 'Review the note and publish when ready.');
        result.textContent = 'Loaded file: ' + file.name;
        showResultMeta(null);
      });

      imageInput.addEventListener('change', () => {
        const files = Array.from(imageInput.files || []);
        imageName.textContent = describeImageSelection(files);
        if (files.length > 0) {
          setStatus('idle', 'Images ready', 'Carrier Pigeon will upload and attach the selected images.');
          result.textContent = 'Queued ' + describeImageSelection(files) + ' for upload.';
          showResultMeta(null);
        }
      });

      document.querySelectorAll('[data-template]').forEach((button) => {
        button.addEventListener('click', () => {
          const template = sampleTemplates[button.dataset.template];
          noteField.value = template;
          fileName.textContent = 'Template loaded';
          setStatus('idle', 'Template ready', 'Edit the template, then publish.');
          result.textContent = 'Template loaded into the editor.';
          showResultMeta(null);
        });
      });

      copyUrlButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(hostBase + '/');
          setStatus('success', 'Copied', 'Upload page URL copied to the clipboard.');
        } catch {
          setStatus('error', 'Copy failed', 'Could not copy the upload URL from this browser.');
        }
      });

      clearNoteButton.addEventListener('click', () => {
        noteField.value = '';
        fileInput.value = '';
        imageInput.value = '';
        fileName.textContent = 'No file selected yet';
        imageName.textContent = 'No images selected yet';
        setStatus('idle', 'Cleared', 'Paste a note or choose a file.');
        result.textContent = 'Editor cleared.';
        showResultMeta(null);
      });

      publishButton.addEventListener('click', async () => {
        const note = noteField.value.trim();
        if (!note) {
          setStatus('error', 'No note', 'Paste a markdown note or choose a file first.');
          result.textContent = 'Paste a markdown note or choose a file first.';
          showResultMeta(null);
          return;
        }

        publishButton.disabled = true;
        publishButton.textContent = 'Publishing...';
        setStatus('idle', 'Publishing', 'Sending note into the archive.');
        result.textContent = 'Publishing...';

        try {
          const formData = new FormData();
          formData.append('note', note);
          Array.from(imageInput.files || []).forEach((file) => {
            formData.append('images', file, file.name);
          });

          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          });

          const text = await response.text();
          result.textContent = text;

          let parsed = null;
          try {
            parsed = JSON.parse(text);
          } catch {
            parsed = null;
          }

          if (response.ok) {
            setStatus('success', 'Published', 'Source file written. Rebuild or redeploy to update the public site.');
            showResultMeta(parsed);
          } else {
            setStatus('error', 'Publish failed', parsed?.error || 'The archive rejected the note.');
            showResultMeta(parsed);
          }
        } catch (error) {
          setStatus('error', 'Network error', 'Could not reach Carrier Pigeon on your Mac.');
          result.textContent = String(error);
          showResultMeta(null);
        } finally {
          publishButton.disabled = false;
          publishButton.textContent = 'Publish To Carrier Pigeon';
        }
      });
    </script>
  </body>
</html>`;
}

async function tryServeStaticAsset(res, requestPath) {
  const safePath = requestPath.replace(/^\/+/, '');
  if (!safePath || safePath.includes('..')) {
    return false;
  }

  const publicFile = path.resolve(publicDir, safePath);
  if (await fileExists(publicFile)) {
    await serveFile(res, publicFile);
    return true;
  }

  const distTarget = requestPath.endsWith('/')
    ? path.resolve(distDir, `.${requestPath}`, 'index.html')
    : path.resolve(distDir, `.${requestPath}`);
  if (await fileExists(distTarget)) {
    await serveFile(res, distTarget);
    return true;
  }

  const distHtmlTarget = path.resolve(distDir, `.${requestPath}.html`);
  if (await fileExists(distHtmlTarget)) {
    await serveFile(res, distHtmlTarget);
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing request URL.' }));
    return;
  }

  const host = req.headers.host || `127.0.0.1:${port}`;
  const url = new URL(req.url, `http://${host}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/upload')) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(renderUploadPage(host));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/site.webmanifest') {
    res.writeHead(200, { 'content-type': 'application/manifest+json; charset=utf-8' });
    res.end(buildManifest(host));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, route: '/api/pigeon', app: '/' }));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/pigeon') {
    try {
      const body = await readRequestBody(req);
      const response = await POST({
        request: new Request(url, {
          method: 'POST',
          headers: req.headers,
          body,
        }),
      });

      const responseBody = await response.text();
      const headers = Object.fromEntries(response.headers.entries());
      res.writeHead(response.status, headers);
      res.end(responseBody);
      return;
    } catch (error) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Carrier Pigeon local server failed.',
          detail: error instanceof Error ? error.message : String(error),
        })
      );
      return;
    }
  }

  if (req.method === 'GET' && (await tryServeStaticAsset(res, url.pathname))) {
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found.' }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Carrier Pigeon local server listening on http://0.0.0.0:${port}`);
  console.log(`Open the phone app at http://<your-mac-ip>:${port}/`);
  console.log(`POST markdown notes to http://<your-mac-ip>:${port}/api/pigeon`);
});
