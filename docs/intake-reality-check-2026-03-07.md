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
