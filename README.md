# Codex Archive (Mega Site)

This repository contains the Codex archive workspace and an Astro app in `astro/`.

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
