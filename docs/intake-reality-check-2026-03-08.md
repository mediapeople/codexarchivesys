# Intake Reality Check — 2026-03-08

Scope: promote the March 8 inbox batch from `inbox/ready/` into canonical stores and clarify the deliberate activation path from source detection to publish state.

## Inputs Processed

1. `inbox/ready/2026-03-08-art-is-for-people-who-want-to-feel-alive.md`
2. `inbox/ready/2026-03-08-suwanee-ga-loremap.md`

## Promotion Decisions

- `art-is-for-people-who-want-to-feel-alive` — approved and promoted (`scroll`)
- `suwanee-ga-loremap` — approved and promoted (`scroll`)

## Curatorial Decisions Applied

- Added canonical `related` links before promotion so the published objects do not launch isolated.
- Kept constellations unassigned for both items because no active constellation was a clean fit.
- Preserved source provenance in the ready drafts so post-publish reconciliation could archive matching drop payloads automatically.

## Canonical Outputs

- `objects/scroll/art-is-for-people-who-want-to-feel-alive.md`
- `astro/src/content/scroll/art-is-for-people-who-want-to-feel-alive.md`
- `objects/scroll/suwanee-ga-loremap.md`
- `astro/src/content/scroll/suwanee-ga-loremap.md`

## Process Activation Update

New activation path now made explicit in repo docs and scripts:

1. Detect raw source in `inbox/drop/`
2. Draft to `inbox/ready/`
3. Talk through the draft and get explicit operator confirmation
4. Finalize with `node scripts/finalize-approved-ready.mjs --source <ready-draft> --note "<approval reason>"`
5. Let the system handle promotion, queue reconciliation, cleanup, validation, and build

Operator shorthand:

- `keeping the beast fed :) and not chewing cud`

## Inbox Cleanup Result

- Archived promoted ready drafts to `inbox/archive/ready/2026-03-08-sweep-03/`
- Archived source payloads to `inbox/archive/drop/2026-03-08-sweep-03/`
- Purged Finder artifact `inbox/drop/.DS_Store`
- Active `inbox/ready/` reset to pending-only state (empty after this batch)
- Active `inbox/drop/` reset to pending-only state (no live source payloads after this batch)

## Validation / Build

- `node scripts/validate-objects.mjs objects` -> pass (`40` object files)
- `node scripts/validate-objects.mjs inbox/ready` -> pass (`0` ready drafts)
- `cd astro && npm run build` -> pass
- Graph regenerated: `40` nodes, `563` edges

Build note:

- Astro emitted one duplicate-id warning for `codex-archive-system-v3-1-build-notes`; build still completed successfully. This warning was not introduced by the two new promoted scrolls.
