# Carrier Pigeon

Carrier Pigeon is the phone-first ingest path for ndcodex.com.

## Flow

`phone -> Obsidian note -> POST /api/pigeon -> astro/src/content/<object_type>/{slug}.md -> rendered archive page`

## Input

`POST /api/pigeon` expects JSON:

```json
{
  "object_type": "codex",
  "title": "Carrier Pigeon Test",
  "date": "2026-03-14",
  "tags": ["test", "codex"],
  "body": "First ingest test from Carrier Pigeon.",
  "images": []
}
```

Field HUD style JSON requests can also attach sidecars:

- `packet` writes `<slug>.packet.json`
- `respawn_summary` writes `<slug>.respawn.txt`
- `mythmech` writes `<slug>.mythmech.sidecar`
- `plate_prompt` writes `<slug>.plate-prompt.txt`

Example sidecar payload shape:

```json
{
  "collection": "codex",
  "title": "Mythmech System",
  "date": "2026-03-26",
  "body": "# Mythmech System\n\nInspection lens attached.",
  "mythmech": {
    "version": 1,
    "mythmech": { "enabled": true, "nodes": [], "edges": [], "states": {} },
    "lineage": { "parents": [], "children": [], "relations": [] },
    "spawn": { "candidates": [] },
    "marginalia": { "entries": [] }
  },
  "plate_prompt": "vintage engineering diagram, exploded modular system"
}
```

It also accepts a raw markdown note as the request body, which is the easiest option for iPhone Shortcuts:

```md
---
title: Carrier Pigeon Test
object_type: codex
date: 2026-03-14
tags: test, codex
images:
---
First ingest test from Carrier Pigeon.
```

## What the endpoint does

1. Validates the incoming JSON payload.
2. Or parses a raw markdown note with frontmatter.
3. Generates a slug from `title`.
4. Chooses the destination collection from `object_type`.
5. Writes a markdown file into `astro/src/content/<object_type>/`.
6. Stores the simple phone-facing fields:
   - `title`
   - `object_type`
   - `date`
   - `tags`
   - `images`
   - `state`
7. Adds compatibility fields needed by the existing archive:
   - `id`
   - `type`
   - `status`
   - `visibility`
   - `themes`
   - `media`

## Rendering

- The collection schema lives in `astro/src/content/config.ts`.
- Codex pages live in `astro/src/pages/codex/[slug].astro`.
- Non-codex objects reuse the existing `astro/src/pages/objects/[id].astro` route.
- Markdown body content is rendered into the matching archive surface based on object type.

## Local phone testing

- Run `node scripts/pigeon-local-server.mjs` from the repo root.
- The local server exposes:
  - `GET /`
  - `GET /health`
  - `POST /api/pigeon`
- On your phone, open `http://<your-mac-ip>:8787/`.
- The upload page is styled for Safari on iPhone and supports Add to Home Screen.
- The page serves the local icon/manifest assets so the bookmark looks like an app on the phone home screen.
- This local server reuses the actual `astro/src/pages/api/pigeon.ts` handler, so it writes the same markdown files as the site endpoint.
- Example signal note:

```md
---
title: Signal Phone Test
object_type: signal
date: 2026-03-14
tags:
  - signal
images:
---
Signals are epiphanies prepared for transmission.
```

## Publish from anywhere

For remote phone publishing, Carrier Pigeon can commit directly into GitHub instead of writing to local disk.

Required environment variables on the deployed site:

- `PIGEON_SHARED_SECRET`
- `PIGEON_GITHUB_TOKEN`
- `PIGEON_GITHUB_REPO`

Optional environment variables:

- `PIGEON_GITHUB_BRANCH`
- `PIGEON_GITHUB_CONTENT_ROOT`

Recommended values:

- `PIGEON_GITHUB_REPO=owner/repo`
- `PIGEON_GITHUB_BRANCH=main`
- `PIGEON_GITHUB_CONTENT_ROOT=astro/src/content`

Production governance:

- The production site should keep `PIGEON_GITHUB_BRANCH=main`.
- Carrier Pigeon publishes content commits; it does not become a second deploy authority.
- Netlify production should follow the normal Git-linked `origin/main` path.

How it works in hosted mode:

1. The phone opens `/pigeon`.
2. The user enters the shared secret once on the device.
3. The page sends the markdown note to `POST /api/pigeon` with `Authorization: Bearer <secret>`.
4. The API route validates the secret.
5. The route commits `astro/src/content/<object_type>/<slug>.md` into the GitHub repo.
6. Netlify rebuilds and publishes the new page from `main`.

## Phone app page

- Public upload page: `/pigeon`
- Local upload page: `http://<your-mac-ip>:8787/`

The public `/pigeon` page:

- is styled for Safari on iPhone
- stores the publishing key only in local browser storage on that device
- supports `Add to Home Screen`
- posts raw markdown notes directly to `/api/pigeon`
- exposes the published object immediately after submit
- auto-generates a HUD link for published `scroll` entries

The older `/tools/field-hud-codex-app.html` URL now redirects into `/pigeon` so publishing stays on one lane.

## Minimal shortcut

If you still want a Shortcut, keep it tiny:

1. Create a shortcut named `Carrier Pigeon`.
2. Add one action: `Open URLs`.
3. Use `https://ndcodex.com/pigeon` as the URL for remote publishing.
4. For LAN-only local publishing, use `http://<your-mac-ip>:8787/`.
5. In the shortcut settings, choose `Add to Home Screen` and pick a glyph/color you like.

That gives you a one-tap launcher into the working Safari upload flow without fighting file-upload actions in Shortcuts.

## Publishing reality

Carrier Pigeon writes a source markdown file. Because Astro content collections are part of the site build, a new file becomes part of the published site after the next rebuild or redeploy. In local dev, the new entry should appear after the source file is created and the dev server refreshes. In deployed environments, the GitHub commit triggers the normal Netlify deploy path from `origin/main`, and the page appears after that deploy completes.
