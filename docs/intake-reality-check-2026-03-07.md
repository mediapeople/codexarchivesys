# Intake Reality Check — 2026-03-07

Scope: promote real inbox items from `inbox/ready/` into canonical stores (`objects/` + `astro/src/content/`).

## Inputs Processed

1. `inbox/ready/2026-03-06-stairwell-signal.md`
2. `inbox/ready/2026-03-06-studio-bench-cycle.md`
3. `inbox/ready/2026-03-06-reduce-novelty-before-care.md`
4. `inbox/ready/2026-03-06-scroll-from-the-perimeter.md`

## Promotion Decisions

- `stairwell-signal` — approved and promoted (`scroll`)
- `studio-bench-cycle` — approved and promoted (`fieldlog`)
- `reduce-novelty-before-care` — approved and promoted (`fragment`)
- `scroll-from-the-perimeter` — approved and promoted (`scroll`, with media assets copied into `astro/public/media/scrolls/`)

## Curatorial Edits During Promotion

- Removed intake-note scaffolding from canonical object files.
- Converted editor suggestions to explicit curatorial decisions where appropriate:
  - Added `Maintenance Psalms` for relevant scrolls.
  - Added `Archaeological Objects` for `studio-bench-cycle`.
- Added explicit `related` links to preserve relation integrity and ensure cross-type connectivity.

## Failure Modes Observed

- Intake outputs in `inbox/ready/` are structurally valid but not deploy-ready until intake notes are stripped.
- Related links are frequently empty in intake drafts and need human curation before promotion.
- Constellation suggestions remain comments and require explicit editor acceptance/rejection.

## Result

- Real intake runs documented: 4
- Approved and promoted items: 4
- Requirement "at least 1 approved item added" is satisfied.

## Additional Intake Batch (same day)

Source drop item added after initial pass:

- `inbox/drop/Apparatus_Ledger_poem/apparatus-ledger.md`
- media: `inbox/drop/Apparatus_Ledger_poem/app-ledger-image-associate.png`

Processing outcome:

- Created ready draft: `inbox/ready/2026-03-07-apparatus-ledger.md`
- Promoted canonical object: `objects/scroll/apparatus-ledger.md`
- Synced Astro content: `astro/src/content/scroll/apparatus-ledger.md`
- Copied media: `astro/public/media/scrolls/apparatus-ledger-associate.png`

Validation/build result:

- Objects validated: `24`
- Build status: pass
- Graph regenerated: `24` nodes, `165` edges

Updated cumulative total for 2026-03-07 intake checks:

- Real intake runs documented: 5
- Approved and promoted items: 5

## Additional Intake Batch (WIP artifact source)

Source drop item added:

- `inbox/drop/WIP, Collage in process, JSA primary source/artifact - wip.md`
- media:
  - `inbox/drop/WIP, Collage in process, JSA primary source/photos/IMG_2863.HEIC`
  - `inbox/drop/WIP, Collage in process, JSA primary source/photos/IMG_2864.HEIC`
  - `inbox/drop/WIP, Collage in process, JSA primary source/photos/IMG_2865.HEIC`
  - `inbox/drop/WIP, Collage in process, JSA primary source/photos/IMG_2866.HEIC`
  - `inbox/drop/WIP, Collage in process, JSA primary source/photos/IMG_2867.HEIC`

Processing outcome:

- Created ready draft: `inbox/ready/2026-03-07-jsa-collage-wip-001.md`
- Promoted canonical object: `objects/artifact/artifact-jsa-collage-wip-001.md`
- Synced Astro content: `astro/src/content/artifact/artifact-jsa-collage-wip-001.md`
- Converted and copied media:
  - `astro/public/media/artifacts/jsa-collage-wip-001-1.jpg`
  - `astro/public/media/artifacts/jsa-collage-wip-001-2.jpg`
  - `astro/public/media/artifacts/jsa-collage-wip-001-3.jpg`
  - `astro/public/media/artifacts/jsa-collage-wip-001-4.jpg`
  - `astro/public/media/artifacts/jsa-collage-wip-001-5.jpg`
- Publication status: `published`

Notes:

- Intake draft remains `draft`; canonical object promoted with curatorial decisions applied.
- Constellation assignment set explicitly to `Archaeological Objects`.

Updated cumulative total for 2026-03-07 intake checks:

- Real intake runs documented: 6
- Approved and promoted items: 6

Validation/build result (post-promotion):

- Objects validated: `32`
- Build status: pass
- Graph regenerated: `32` nodes, `325` edges

## System Note Adjustments (v3 codex update)

Following ingest and relation learnings, system notes were advanced to v3.

Updates:

- Added canonical release object: `objects/codex/codex-archive-system-v3-notes.md`
- Added active status doc: `docs/codex-status-v3.md`
- Added active respawn file chain doc: `docs/respawn-system-files-v3.md`
- Advanced quickstart/orientation/intake preflight references from v2.7 to v3
- Added relation continuity links from WIP/revision objects to newest release notes

Validation/build result (post-v3 update):

- Objects validated: `33`
- Build status: pass
- Graph regenerated: `33` nodes, `355` edges

## Additional Intake Batch (first evo test)

Source drop item added:

- `inbox/drop/Update to WIP, JSA primary source/artifact evo.md`
- media:
  - `inbox/drop/Update to WIP, JSA primary source/IMG_2869.HEIC`
  - `inbox/drop/Update to WIP, JSA primary source/IMG_2870.HEIC`
  - `inbox/drop/Update to WIP, JSA primary source/IMG_2872.HEIC`
  - `inbox/drop/Update to WIP, JSA primary source/IMG_2873.HEIC`
  - `inbox/drop/Update to WIP, JSA primary source/IMG_2874.MOV`

Processing outcome:

- Created ready draft: `inbox/ready/2026-03-07-jsa-collage-evolution-001.md`
- Promoted canonical object: `objects/fieldlog/jsa-collage-evolution-001.md`
- Synced Astro content: `astro/src/content/fieldlog/jsa-collage-evolution-001.md`
- Converted/copied media:
  - `astro/public/media/fieldlogs/jsa-collage-evolution-001-1.jpg`
  - `astro/public/media/fieldlogs/jsa-collage-evolution-001-2.jpg`
  - `astro/public/media/fieldlogs/jsa-collage-evolution-001-3.jpg`
  - `astro/public/media/fieldlogs/jsa-collage-evolution-001-4.jpg`
  - `astro/public/media/fieldlogs/jsa-collage-evolution-001-process.mp4`
- Publication status: `published`

Notes:

- Source `type: artifact-update` is out-of-schema; canonical mapping used `fieldlog`.
- Source media list in raw frontmatter referenced older filenames; ingest used actual dropped update assets.
- Post-ingest media optimization pass reduced JPG payload and transcoded process video to MP4.
- Added reciprocal relation links among:
  - `jsa-collage-evolution-001`
  - `artifact-jsa-collage-wip-001`
  - `codex-archive-system-v3-notes`

Updated cumulative total for 2026-03-07 intake checks:

- Real intake runs documented: 7
- Approved and promoted items: 7

Validation/build result (post-evo ingest):

- Objects validated: `34`
- Build status: pass
- Graph regenerated: `34` nodes, `383` edges

## System Rules Check (post-evo + media pass)

Compliance summary:

- Schema unchanged (`astro/src/content/config.ts` untouched).
- Intake drafts remained `status: draft` in `inbox/ready/`.
- Canonical publish moved through deliberate human promotion (`inbox/ready` -> `objects/`).
- New canonical object types remain in allowed enum (`fieldlog` used for evolution state record).
- Theme/constellation usage stayed within active registries.
- Related references validated (no broken refs in `validate-objects`).

Operational check:

- `node scripts/validate-objects.mjs objects` -> pass
- `cd astro && npm run build` -> pass

## Inbox Drop Cleanup Sweep (same day)

Scope: non-destructive hygiene for `inbox/drop/` after evo ingest.

Actions:

- Removed Finder metadata artifacts (`.DS_Store`) from:
  - `inbox/`
  - `inbox/drop/`
  - `inbox/drop/WIP, Collage in process, JSA primary source/`
- Preserved all raw capture files and source markdown in `inbox/drop/` as source-of-record.
- Confirmed `inbox/drop/` still contains the full provenance set for processed March 6-7 ingest batches.

Follow-up flag:

- `inbox/drop/raw-2026-03-06-index-card-line.md` remains in drop without a documented ready/promotion pass and should be triaged in the next inbox sweep.

## System Note Adjustments (v3+ codex update)

Following presentation-runtime learnings, system notes were advanced to v3+.

Updates:

- Added canonical release object: `objects/codex/codex-archive-system-v3-plus-notes.md`
- Synced Astro content copy: `astro/src/content/codex/codex-archive-system-v3-plus-notes.md`
- Marked `codex-archive-system-v3-notes` as superseded context
- Added newest-release links from live WIP/evolution/go-live/fragment objects to `codex-archive-system-v3-plus-notes`
- Updated status/respawn/current-state docs to reflect v3+ as active operational patch level
- Added feed runtime adjustment: force recent-first ordering with optional single pinned feature (`?pin=<object-id>`)

Validation/build result (post-v3+ update):

- Objects validated: `35`
- Build status: pass
- Graph regenerated: `35` nodes, `414` edges
