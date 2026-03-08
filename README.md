# Codex Archive (Mega Site)

This repository contains the Codex archive workspace and an Astro app in `astro/`.

## Workspace Path Policy

Canonical local path:

`/Users/nathandavis/Projects/codex-archive-mega-site`

Deprecated path (do not run builds from here):

`/Users/nathandavis/Library/Mobile Documents/com~apple~CloudDocs/Projects/codex archive (mega site)`

Why: iCloud-synced paths have caused build/dev instability and path confusion.
The `astro` npm scripts now hard-fail when run from an iCloud path.

## What You Need

- Git account (GitHub/GitLab/Bitbucket)
- Hosting account (Netlify, Vercel, or Cloudflare Pages)
- Local Node.js 22+

You do **not** need an Astro account to build or host this.

## Local Development

```bash
cd astro
npm install
npm run dev
```

Build:

```bash
cd astro
npm run build
```

Generate relationship graph JSON:

```bash
node scripts/generate-graph-json.mjs objects astro/public/graph.json
```

Note: `astro` now runs this automatically before every `npm run build`.

Generate codex log + design evolution ingest report:

```bash
node scripts/generate-codex-log.mjs objects $(date +%F)
node scripts/ingest-design-evolution.mjs objects $(date +%F)
```

Optimize media payloads for web delivery:

```bash
node scripts/optimize-media-assets.mjs <file1> <file2> ...
```

Defaults:
- JPEG: resize to max long edge `2400px`, recompress quality `68`
- Video: transcode to MP4 (uses `ffmpeg` if present, else macOS `avconvert`)

Clean up processed inbox drop items:

```bash
# archive one processed drop item into inbox/archive/drop/<YYYY-MM-DD-sweep-##>
node scripts/cleanup-inbox-drop.mjs --item "Complete Collage, It cost us dearly" --note "Published: /objects/artifact-jsa-collage-001"

# archive everything currently in inbox/drop (end-of-day sweep)
node scripts/cleanup-inbox-drop.mjs --all --note "End-of-day sweep"

# hard purge from drop without archiving (use sparingly)
node scripts/cleanup-inbox-drop.mjs --mode purge --item "duplicate-drop"
```

Notes:
- Archives are moved to `inbox/archive/drop/<dated-sweep>/`.
- Every cleanup run appends an audit record to `inbox/archive/drop/cleanup-log.ndjson`.

## Push This Repo To Remote

From repository root:

```bash
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

## Deploy Option A: Netlify (Recommended)

This repo includes `netlify.toml`, so Netlify can read build settings automatically.

- Base directory: `astro`
- Build command: `npm run build`
- Publish directory: `dist`

## Deploy Option B: Vercel

This repo includes `vercel.json` with monorepo-aware commands.

- Install command: `cd astro && npm install`
- Build command: `cd astro && npm run build`
- Output directory: `astro/dist`

## CI

GitHub Actions workflow is included at `.github/workflows/astro-build.yml`.
It runs `npm ci` and `npm run build` inside `astro/` on pushes and PRs.

## Respawn Files (v3)

Primary coworker load chain (new):

1. `codex/root.md`
2. `codex/system.md`
3. `codex/pipeline.md`
4. `codex/current.md`
5. `codex/respawn.md`

Extended archive context (legacy + governance):

1. `docs/respawn-system-files-v3.md`
2. `docs/codex-status-v3.md`
3. `docs/field-registry.md`
4. `docs/constitutional-implementation-map.md`
5. `docs/codex_addendum_structural_metering.md`
6. `docs/llm-intake-prompt.md`
