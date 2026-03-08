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

Activate the inbox pipeline:

Operator loop:
- `Talk` -> review drafts and discuss decisions
- `Confirm` -> operator gives explicit approval
- `Hand-off` -> system runs finalize script
- `Ping-back` -> system returns on completion or blocker

Operator note:
- `Let it breathe` -> after local success and push, allow deploy/cache propagation before judging the remote result

```bash
# inspect fresh source material
find inbox/drop -maxdepth 2 -type f | sort

# after conversation + explicit approval, let the system finish the approved batch
node scripts/finalize-approved-ready.mjs --source inbox/ready/2026-03-08-art-is-for-people-who-want-to-feel-alive.md --note "Operator approved for publish"
```

Notes:
- `inbox/drop/` is raw source detection.
- `inbox/ready/` is human review territory.
- `objects/` + `astro/src/content/` are canonical publish state.
- Human interaction should stay narrow: review drafts, confirm approval, then let the system run the rest.
- After a correct local result and successful push, let it breathe before treating remote lag as a feed-order bug.
- `scripts/finalize-approved-ready.mjs` wraps promotion, inbox reconciliation, cleanup, validation, and build.
- Approval records append to `logs/promotion-log.ndjson`.

Low-level scripts still exist when needed:

```bash
node scripts/promote-ready.mjs --approve --note "Approved for publish" --source inbox/ready/<file>.md
node scripts/reconcile-inbox.mjs --note "Keep active inbox honest"
```

Clean up processed inbox drop items:

```bash
# archive one processed drop item into inbox/archive/drop/<YYYY-MM-DD-sweep-##>
node scripts/cleanup-inbox-drop.mjs --item "Complete Collage, It cost us dearly" --note "Published: /objects/artifact-jsa-collage-001"

# archive published-source payloads still discoverable from ready/archive-ready drafts
node scripts/cleanup-inbox-drop.mjs --auto-published --note "Auto post-publish cleanup"

# archive everything currently in inbox/drop (end-of-day sweep)
node scripts/cleanup-inbox-drop.mjs --all --note "End-of-day sweep"

# hard purge from drop without archiving (use sparingly)
node scripts/cleanup-inbox-drop.mjs --mode purge --item "duplicate-drop"
```

Notes:
- Archives are moved to `inbox/archive/drop/<dated-sweep>/`.
- Every cleanup run appends an audit record to `inbox/archive/drop/cleanup-log.ndjson`.

Keep the active inbox honest:

```bash
# preview which already-promoted ready drafts would leave the active queue
node scripts/reconcile-inbox.mjs --dry-run

# archive promoted ready drafts out of inbox/ready and sweep any still-live source drop payloads
node scripts/reconcile-inbox.mjs --note "Keep active inbox honest"
```

Notes:
- Promoted ready drafts move to `inbox/archive/ready/<dated-sweep>/`.
- Matching source payloads still present in `inbox/drop/` move to `inbox/archive/drop/<dated-sweep>/`.
- Active `inbox/ready/` should reflect actual human review need, not historical churn.
- Operator shorthand: `keeping the beast fed :) and not chewing cud`

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
