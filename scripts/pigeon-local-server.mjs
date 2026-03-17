import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import {
  PIGEON_APP_SCRIPT,
  PIGEON_APP_STYLES,
  renderPigeonAppMarkup,
  serializePigeonAppConfig,
} from '../astro/src/lib/pigeon-app.js';
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
      background_color: '#111009',
      theme_color: '#111009',
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
  const uiConfig = {
    eyebrow: 'Mac-hosted upload relay',
    deck:
      'Choose a markdown note from Files, tweak it if needed, and send it straight into the right archive collection from your phone.',
    attachNote:
      'Attach matching image files if the note uses local Obsidian image references.',
    keyNote:
      'Optional in local mode. If this server is protected with a shared secret, the key will be sent as a bearer token.',
    workflowTitle: 'Phone workflow',
    workflowSteps: [
      'Open this page from your phone or add it to the home screen',
      'Paste raw text and run Smart Draft, or select type and load a template shell',
      'Or load an existing .md file - images attach separately',
      'Confirm telemetry shows correct type, slug, and path',
      'Send Pigeon - local mode writes directly into source content',
    ],
    copyButtonLabel: 'Copy Upload URL',
    archiveHref: 'https://ndcodex.com/',
    archiveLabel: '<- ND Codex Archive',
  };

  const appConfig = {
    endpoint: '/api/pigeon',
    authRequired: false,
    keyStorageKey: 'carrier-pigeon.local-key',
    draftStorageKey: 'carrier-pigeon.local-draft',
    contentRoot: 'astro/src/content',
    copyUrlValue: `${base}/`,
    copySuccessMessage: 'Upload page URL copied to the clipboard.',
    copyFailureMessage: 'Could not copy the upload URL from this browser.',
    imageReadyMessage: 'Carrier Pigeon will upload and attach the selected images.',
    successMessage: 'Source file written. Rebuild or redeploy to update the public site.',
    networkErrorMessage: 'Could not reach Carrier Pigeon on your Mac.',
    noNoteMessage: 'Paste a markdown note or choose a file first.',
    noKeyMessage: 'Add the shared secret first.',
    preparingMessage: 'Sending note into the local archive source.',
    preparingImagesMessage: 'Compressing images for local upload.',
    restoredDraftMessage: 'Recovered the last local draft stored on this device.',
    keyClearedMessage: 'The saved key has been removed from this device.',
    templateLoadedMessage: 'Fill in title and date, then publish.',
    fileLoadedMessage: 'Review the note and publish when ready.',
    editorClearedMessage: 'Editor cleared.',
    smartDraftReadyMessage: 'Smart Draft inferred frontmatter. Review it, then send again.',
    smartDraftButtonMessage: 'Review the inferred frontmatter, then send when ready.',
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Carrier Pigeon</title>
    <meta name="description" content="Phone-first markdown publishing into the ndcodex archive." />
    <meta name="theme-color" content="#111009" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Carrier Pigeon" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet" />
    <link rel="apple-touch-icon" href="${base}/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="${base}/icon-192.png" />
    <link rel="icon" type="image/svg+xml" href="${base}/favicon.svg" />
    <link rel="manifest" href="${base}/site.webmanifest" />
    <style>${PIGEON_APP_STYLES}</style>
  </head>
  <body>
    ${renderPigeonAppMarkup(uiConfig)}
    <script id="pigeon-app-config" type="application/json">${serializePigeonAppConfig(appConfig)}</script>
    <script>${PIGEON_APP_SCRIPT}</script>
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
