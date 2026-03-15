# Carrier Pigeon Notes

## Archive Content
- Carrier Pigeon writes into Astro content folders under `astro/src/content/<object_type>/`.
- If a note omits `object_type`, Carrier Pigeon defaults to `codex` and writes into `astro/src/content/codex/`.
- Generated Carrier Pigeon files always include archive compatibility fields such as `id`, `type`, `status`, `visibility`, `themes`, and `media`.
- Codex entries also keep the phone-facing `tags`, `images`, and `state` fields because the dedicated codex page uses them.

## Pigeon Ingest
- The ingest endpoint is `astro/src/pages/api/pigeon.ts`.
- It accepts `POST` JSON with `title`, `date`, `tags`, `body`, `images`, and optional `object_type`.
- It also accepts a raw markdown note body and parses frontmatter server-side for simpler phone shortcuts.
- The endpoint slugifies the title and creates `astro/src/content/<object_type>/{slug}.md`.
- In local dev it writes directly to disk; in hosted mode it should use the GitHub-backed write path configured by environment variables.
- Hosted Carrier Pigeon auth is driven by `PIGEON_SHARED_SECRET`.
- Hosted GitHub write mode is driven by `PIGEON_GITHUB_TOKEN`, `PIGEON_GITHUB_REPO`, and optional branch/content-root env vars.
- Astro validates the frontmatter through the existing content collection schemas in `astro/src/content/config.ts`.
- For phone testing against a writable local machine, use `scripts/pigeon-local-server.mjs`, which reuses the same endpoint logic and serves `/api/pigeon` over HTTP.
- The local server also serves a phone upload app at `/` with Apple touch icon + manifest metadata for Add to Home Screen on iPhone.
- The deployed site serves a public phone upload app at `/pigeon`, which stores the publishing key in browser storage on that device and sends authenticated requests to `/api/pigeon`.

## Phone Publishing Flow
- Phone note lives in the Obsidian vault named `Dispatch`.
- The recommended remote flow is Safari or a one-action Shortcut opening `/pigeon`.
- The local fallback flow is the Mac-hosted upload app or local server.
- Carrier Pigeon reads `object_type` from the note and writes markdown into the matching content folder.
- Codex entries render at `/codex/{slug}`.
- Other object types render through the existing archive route at `/objects/{slug}` after the next local refresh or site rebuild/deploy.
- For local device tests, point the Shortcut at your Mac running `node scripts/pigeon-local-server.mjs`.
- The recommended minimal Shortcut now just opens the upload app URL, either the deployed `/pigeon` page or the Mac-hosted local server.
