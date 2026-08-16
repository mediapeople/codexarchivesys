# Carrier Pigeon Notes

## HUD Product Status
- The HUD is active research and development, not a retired feature and not yet part of the public reading contract.
- Ordinary public object and Codex pages must not advertise or link to the HUD while its public meaning is still being refined.
- Keep direct HUD access available at `/objects/{slug}/hud` for intentional testing and development.
- HUD pages must remain `noindex, nofollow` until the product status changes explicitly.
- `/codex/{slug}/hud` and `/codex/{slug}/plate` are legacy compatibility aliases, not independent surfaces.
- Do not delete the HUD implementation or promote it back into public navigation without an explicit product decision.
- The detailed status and reactivation criteria live in `docs/hud-status.md`.

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
- Carrier Pigeon creates browser-safe public derivatives from uploaded images before either local or GitHub-backed writes. It enforces the same 2400px / 2 MiB image budget as conversational publishing and never writes raw HEIC/HEIF captures into the public tree.
- For phone testing against a writable local machine, use `scripts/pigeon-local-server.mjs`, which reuses the same endpoint logic and serves `/api/pigeon` over HTTP.
- The local server also serves a phone upload app at `/` with Apple touch icon + manifest metadata for Add to Home Screen on iPhone.
- The deployed site serves a public phone upload app at `/pigeon`, which stores the publishing key in browser storage on that device and sends authenticated requests to `/api/pigeon`.

## Phone Publishing Flow
- Phone note lives in the Obsidian vault named `Dispatch`.
- The recommended remote flow is Safari or a one-action Shortcut opening `/pigeon`.
- The local fallback flow is the Mac-hosted upload app or local server.
- Carrier Pigeon reads `object_type` from the note and writes markdown into the matching content folder.
- Phone image uploads are normalized in memory: JPEG/HEIC become delivery JPEG; PNG/WebP become delivery WebP; EXIF capture facts are retained in content metadata while public derivatives strip EXIF/GPS.
- Codex entries render at `/codex/{slug}`.
- Other object types render through the existing archive route at `/objects/{slug}` after the next local refresh or site rebuild/deploy.
- For local device tests, point the Shortcut at your Mac running `node scripts/pigeon-local-server.mjs`.
- The recommended minimal Shortcut now just opens the upload app URL, either the deployed `/pigeon` page or the Mac-hosted local server.

## Production Publishing
- `origin/main` is the only production source of truth.
- Routine production publishing is one command from a clean `main`: `node scripts/deploy-production.mjs`.
- That command fetches and safely rebases non-conflicting remote updates, runs fast content validation, pushes `main`, and waits for the Git-linked Netlify production deploy by default.
- Use `node scripts/deploy-production.mjs --no-wait` only when an acknowledged handoff is sufficient and live verification will happen elsewhere.
- Do not run `netlify deploy --prod` for routine publishing. Manual Netlify production deploys are recovery-only.
- `astro/public/graph.json` is generated during dev/build and must not be committed.
- Do not create or maintain a second permanent `main` worktree for deployment.

## Conversational Codex Publishing
- “Post this to ndcodex” or “publish this to ndcodex” is explicit approval when the source and intended post are unambiguous. Do not add a procedural confirmation step.
- Preserve the author's voice. Make only the light editorial and metadata changes needed for a clean public post unless a rewrite is requested.
- Write the post to `astro/src/content/codex/{slug}.md` with public, published Codex metadata.
- Run `./scripts/publish-codex.mjs --file astro/src/content/codex/{slug}.md` for the safe fast lane. Pass related new media or sidecars with repeated `--include` arguments.
- The fast lane validates content and referenced media, refuses unrelated working-tree changes, commits only the named files, pushes through `origin/main`, and returns the canonical URL without waiting on the production build.
- Delivery media belongs under `astro/public/media/`. The lane enforces the budgets and derivative/source rules in `docs/conversational-codex-publishing.md`; never ship HEIC/HEIF or MOV captures directly.
- The cross-lane media policy and legacy audit status live in `docs/media-delivery-status.md`. Do not bulk-recompress historical public art without bounded visual review and preserved originals.
- Use `--wait` when the user explicitly needs live verification in the same handoff. Otherwise report the accepted URL immediately and describe it as queued until Netlify finishes.
- Never add a public HUD link as part of ordinary Codex publishing.
- Full operator guidance lives in `docs/conversational-codex-publishing.md`.

## Codex Queue
- Scheduled Codex bundles live at `publishing/codex-queue/<slug>/post.md` with optional colocated files under `media/`.
- `publishAt` must be an ISO timestamp with an explicit timezone. If it is omitted, the bundle is held for manual approval.
- Queue media is referenced as `media/<filename>` in both Markdown and frontmatter. Every queued asset must be referenced.
- `node scripts/drip-codex.mjs --publish` synchronizes clean `main`, releases at most one due post, processes media, consumes the bundle, and uses the existing safe publisher.
- The intended recurring owner is the always-on MINI project. The runner itself remains deterministic and does not require agent judgment.
- Queue and MINI handoff status is documented in `docs/codex-queue-automation.md`.
