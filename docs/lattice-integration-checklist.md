# ND Codex Lattice Integration Checklist

Date: 2026-03-17

## Objective

Turn ndcodex from a linear object archive into a coordinate-aware navigation system.

The archive keeps its current object classes.
The lattice is added as a relational layer on top.

## Guardrails

- Do not replace the primary object taxonomy: `signal`, `fragment`, `fieldlog`, `artifact`, `scroll`, `codex`, `loremap`, `nexus` remain the canonical object classes.
- Treat `axes` and `lattices` as additive metadata, not new object types.
- Keep the schema slow and additive. Do not force `intersections`, `multiplications`, or `strata` into every object yet.
- Build navigation from real labeled content, not from speculative empty structures.

## Current Foundation

- [x] Axis fields exist in the content schema.
  Files: `astro/src/content/config.ts`
- [x] Axis inference and normalization exist as shared logic.
  Files: `astro/src/lib/axes.ts`
- [x] Carrier Pigeon ingest infers, validates, and stores axes.
  Files: `astro/src/pages/api/pigeon.ts`
- [x] Carrier Pigeon UI previews axes and allows manual override before publish.
  Files: `astro/src/lib/pigeon-app.js`
- [x] Object pages render axes for review.
  Files: `astro/src/pages/objects/[id].astro`, `astro/src/pages/codex/[slug].astro`

This means the axis backbone is already operational.

## Phase 1 - Add Lattice Metadata

- [ ] Add optional `lattices` field to the shared schema.
  Files: `astro/src/content/config.ts`
- [ ] Define allowed lattice values and normalization rules.
  Files: `astro/src/lib/axes.ts` or a new `astro/src/lib/lattices.ts`
- [ ] Accept lattice overrides in Carrier Pigeon ingest.
  Files: `astro/src/pages/api/pigeon.ts`
- [ ] Surface lattice controls in Carrier Pigeon UI.
  Files: `astro/src/lib/pigeon-app.js`
- [ ] Document the field contract.
  Files: `docs/field-registry.md`, `INTAKE_TEMPLATE.md`, `docs/pigeon.md`

Acceptance:

- A note can be published with zero or more `lattices`.
- Lattice values survive phone -> ingest -> markdown -> build.
- Invalid lattice values fail cleanly instead of silently drifting.

## Phase 2 - Make Axes and Lattices Navigable

- [ ] Add feed query parameters for `scale`, `depth`, `focus`, `function`, and `lattice`.
  Files: `astro/src/pages/index.astro`
- [ ] Render active axis and lattice filters in the feed UI.
  Files: `astro/src/pages/index.astro`
- [ ] Make object-page axis pills clickable.
  Files: `astro/src/pages/objects/[id].astro`, `astro/src/pages/codex/[slug].astro`
- [ ] Make lattice pills clickable from object pages.
  Files: `astro/src/pages/objects/[id].astro`, `astro/src/pages/codex/[slug].astro`
- [ ] Ensure object cards and feed results respect combined filters.
  Files: `astro/src/components/ObjectCard.astro`, `astro/src/pages/index.astro`

Acceptance:

- A reader can browse all `recursive` objects.
- A reader can browse all `witness` objects.
- A reader can browse all objects inside a given lattice.
- Filters compose without breaking the existing type/theme search flow.

## Phase 3 - Graph to Lattice Map

- [ ] Emit axes into the graph payload.
  Files: `scripts/generate-graph-json.mjs`
- [ ] Emit lattices into the graph payload.
  Files: `scripts/generate-graph-json.mjs`
- [ ] Add graph filtering by axis and lattice.
  Files: `astro/src/pages/graph.astro`
- [ ] Distinguish structural relation lines from lattice-cluster grouping.
  Files: `astro/src/pages/graph.astro`, `astro/src/lib/relations.ts`
- [ ] Keep node click-through wired to canonical object routes.
  Files: `astro/src/pages/graph.astro`

Acceptance:

- The graph can isolate one lattice cluster.
- The graph can isolate one axis value.
- The graph still works as a relationship map when no lattice filter is active.

## Phase 4 - Coordinate Surface on Object Pages

- [ ] Render a compact coordinate block from existing metadata.
  Files: `astro/src/pages/objects/[id].astro`, `astro/src/pages/codex/[slug].astro`
- [ ] Keep the block generated from metadata, not hand-authored page chrome.
  Files: `astro/src/pages/objects/[id].astro`, `astro/src/pages/codex/[slug].astro`
- [ ] Avoid duplicating body language as decorative summary text for fragments and signals.
  Files: `astro/src/pages/objects/[id].astro`

Acceptance:

- Every labeled object has a visible coordinate signature.
- The coordinate block does not compete with the main reading surface.

## Phase 5 - Seed Set and Backfill

- [ ] Backfill axes on key canonical objects where inference needs correction.
  Files: `astro/src/content/**/*`
- [ ] Label the first lattice seed set across recurring motifs.
  Files: `astro/src/content/**/*`
- [ ] Start with anchor objects, not the whole archive.
  Suggested anchors: core codex notes, recurring fragments, major scrolls, active loremaps, nexus issues.

Acceptance:

- The first lattice views feel real with existing content.
- The graph and filters return enough content to reveal pattern, not just placeholders.

## Deferred Until Seed Set Exists

- [ ] `intersections`
- [ ] `multiplications`
- [ ] `strata`
- [ ] random-node navigation mode
- [ ] dedicated lattice landing pages

Reason:

These are meaningful only after the archive has enough labeled coordinates to justify them.

## Recommended Build Order

1. Finish `lattices` as metadata.
2. Make axes and lattices clickable in the feed and on object pages.
3. Extend the graph payload and graph UI.
4. Backfill a seed set.
5. Add intersections and multiplications only after real use appears.

## Done Condition

The lattice integration is meaningfully active when:

- Carrier Pigeon can place a note by axis and lattice.
- Object pages show those placements.
- The feed can filter by those placements.
- The graph can visualize those placements.
- Readers can move through the archive by coordinate instead of chronology alone.
