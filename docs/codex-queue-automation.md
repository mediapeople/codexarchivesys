# Codex Queue Automation

Status: runner implemented; MINI scheduling handoff pending project visibility.

## The surface

1. Create `publishing/codex-queue/<slug>/post.md`.
2. Add an optional `media/` folder beside it.
3. Set `publishAt` to an ISO timestamp with an explicit timezone.
4. Commit the bundle to `main` and walk away.

The oldest due bundle is published on each automated run. A bundle without
`publishAt` remains held until it is manually released with `--slug`.

## Runner contract

MINI only needs to run this command from a clean `main` checkout:

```bash
node scripts/drip-codex.mjs --publish
```

The command is idempotent when nothing is due. It exits successfully without
changing the repository.

When a post is due, it:

1. Selects the oldest eligible bundle.
2. Normalizes public Codex metadata and removes `publishAt`.
3. Converts queued media to stable paths under
   `/media/codex/<slug>/`, rewrites post references, and validates budgets.
4. Removes the consumed queue bundle.
5. Uses `publish-codex.mjs` to validate, commit, synchronize, and push `main`.
6. Lets the Git-linked Netlify build publish the post and regenerate
   `graph.json`.

Only one post is released per run so a backlog drips rather than floods.

## Media contract

Queue media is colocated at `media/<filename>` and must be referenced from
`post.md`. Unreferenced or missing assets stop the run before publication.

- JPEG and HEIC/HEIF become optimized JPEG.
- PNG, WebP, and still GIF become optimized WebP.
- Animated GIF is preserved only when already inside the delivery budget.
- MOV/M4V/MP4 becomes web-ready MP4.
- SVG is preserved within the SVG budget.
- Public image derivatives strip embedded EXIF/GPS; explicitly authored
  `capture` facts in frontmatter remain.
- Audio is intentionally rejected until a delivery policy exists.

Current delivery limits remain the canonical ndcodex limits:

- Raster images: 2400px long edge, 2 MiB hard, 750 KiB target.
- SVG: 256 KiB hard.
- MP4: 20 MiB hard, 10 MiB target.

## Operations

```bash
# Visible queue status
node scripts/drip-codex.mjs --status

# Show the next action without changing anything
node scripts/drip-codex.mjs --dry-run

# Manually approve a held or future bundle
node scripts/drip-codex.mjs --publish --slug <slug> --wait
```

The runner refuses a dirty working tree, a non-`main` branch, uncommitted queue
sources, invalid timestamps, duplicate slugs, missing media, unsupported media,
and delivery-budget failures.

## MINI handoff

The intended recurring owner is the always-on MINI project on the Mac mini.
Official OpenAI documentation notes that local scheduled tasks need the machine
powered on, the desktop app running, and the project directory available. That
makes MINI the appropriate scheduler once the MINI project is visible to the
current Codex host.

Recommended cadence: hourly at a non-round minute. The timestamp inside each
post controls eligibility; the recurring task only asks the runner whether
anything is due.

Suggested MINI task prompt:

```text
Act as the ndcodex queue keeper. Honor MINI's current operator pulse and do
nothing if all-stop is active. In the clean ndcodex main checkout, run
`node scripts/drip-codex.mjs --publish`. Do not edit queued prose, invent
metadata, bypass media failures, force a non-fast-forward update, or publish
more than the runner selects. If nothing is due, finish quietly. If a post is
published, report its title and URL. If the runner fails, preserve the queue and
report the exact blocker for human review.
```

Use failed-run notifications by default; successful no-op checks should stay
quiet.
