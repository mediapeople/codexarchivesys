# Codex Phase 1 Orientation

Date: 2026-03-06

## What Is Now Scaffolded

- `astro/src/content/config.ts` copied from `genisis_bin/config.ts`
- Content collection dirs created:
  - `astro/src/content/scroll/`
  - `astro/src/content/artifact/`
  - `astro/src/content/fieldlog/`
  - `astro/src/content/codex/`
  - `astro/src/content/fragment/`
  - `astro/src/content/nexus/`
- Canonical docs copied:
  - `docs/field-registry.md`
  - `docs/llm-intake-prompt.md`
  - `docs/codex-status-v2.3.md`
  - `docs/constitutional-implementation-map.md`
  - `docs/codex_addendum_structural_metering.md`
- Inbox pipeline dirs created:
  - `inbox/drop/`
  - `inbox/processing/`
  - `inbox/needs-info/`
  - `inbox/ready/`
- Durable content store scaffolded:
  - `objects/scroll/`
  - `objects/artifact/`
  - `objects/fieldlog/`
  - `objects/codex/`
  - `objects/fragment/`
  - `objects/nexus/`
- `logs/` created for codex self-observation output.

## Seed Port Plan (7 Objects)

Target files:

- `objects/scroll/signal-harvest.md`
- `objects/scroll/the-bones-hold.md`
- `objects/artifact/under-load.md`
- `objects/fieldlog/north-georgia-march-2026.md`
- `objects/fragment/on-object-oriented-archives.md`
- `objects/codex/codex-archive-system-v2-2.md`
- `objects/nexus/signal-descent-001.md`

## Normalization Rules During Port

- Normalize type name to schema enum: use `fieldlog` (not `field-log`).
- Keep `id` stable and kebab-case.
- Set `status: draft` for intake-origin material unless explicitly curated otherwise.
- Keep themes inside active registry unless flagged for review.
- Keep editor-owned fields as suggestions when unresolved.

## Immediate Next Execution Step

1. Bootstrap the Astro app shell (`package.json`, `astro.config.*`, and install deps) so schema checks can run in `astro/`.
2. Port base layout/feed components from prototype behavior.
3. Add relationship + graph libs under `astro/src/lib/`.

## Scripts Added

- `scripts/validate-objects.mjs`
- `scripts/generate-codex-log.mjs`
- `scripts/object-utils.mjs`

Run:

```bash
node scripts/validate-objects.mjs objects
node scripts/generate-codex-log.mjs objects 2026-03-06
```

Current generated log:

- `logs/codex-log-2026-03-06.md`

## Astro Runtime Bootstrap (Completed)

- Runtime files now live in `astro/`:
  - `astro/package.json`
  - `astro/astro.config.mjs`
  - `astro/tsconfig.json`
  - `astro/src/pages/index.astro`
  - `astro/src/content/config.ts`
- Commands:

```bash
cd astro
npm run dev
npm run build
npm run preview
```

Notes:

- Scripts include `ASTRO_TELEMETRY_DISABLED=1` to avoid sandbox permission issues in this workspace path.
- A generator scaffold folder remains at `astro/blue-bar/` from initial CLI output; it is no longer required for runtime.
