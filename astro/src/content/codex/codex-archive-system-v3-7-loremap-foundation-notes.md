---
id: codex-archive-system-v3-7-loremap-foundation-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3.7 LOREMAP FOUNDATION NOTES"
date: 2026-03-09
postedAt: 2026-03-09T22:17:53Z
status: published
visibility: public

excerpt: "v3.7 promotes loremap to a first-class object type and gives place-aware work its own schema, feed presence, and reading surface."

themes:
  - systems
  - architecture
  - methodology
  - place
  - observation

constellations:
  - Cascade Psalms

related:
  - codex-archive-system-v3-6-reading-surface-notes
  - suwanee-ga-loremap
  - north-georgia-march-2026
  - ridge-line-lessons
  - signal-harvest
  - on-object-oriented-archives

connections:
  - ref: codex-archive-system-v3-6-reading-surface-notes
    role: previous version
    display: feature
  - ref: suwanee-ga-loremap
    role: first migrated loremap
    display: feature

media: []

version: "3.7.0"
scope: "loremap object modeling, universal place fields, feed/orientation type reflection, and loremap reading-surface treatment"
systemArea: "schema and reader"
changeType: major
dependencies:
  - codex-archive-system-v3-6-reading-surface-notes
---

v3.7 extends [Codex Archive System v3.6 Reading Surface Notes](/objects/codex-archive-system-v3-6-reading-surface-notes).
Use v3.6 for current reading rhythm and v3.7 for place-aware modeling and loremap presentation.

v3.7 is the loremap foundation release.

Operator value prop:
- Place-based work no longer has to disguise itself as generic scroll or field-log content. The archive can now index terrain as structure.

Work chunks and wins:

1. `loremap` is now a first-class object type
   Value prop: A place-field can be modeled according to what it actually is, not forced into the closest existing type.
   - Added `loremap` to the canonical collection schema.
   - Extended archive loaders, validation, glyph generation, badges, and type labels to recognize the new type.
   - Updated intake guidance so future place-primary work can ingest directly into the correct lane.

2. Place metadata is now durable infrastructure
   Value prop: Recurring location-based work can build on stable fields instead of ad hoc body prose.
   - Promoted `location`, `geo`, and `terrain` into reusable archive fields.
   - Moved place handling out of artifact-only assumptions.
   - Updated registry and intake references so the model is documented, not implied.

3. Feed and orientation now reflect the new type
   Value prop: The system announces its own adaptation in the same places operators use to navigate it.
   - Feed filter counts now include `loremap`.
   - Orientation type legend and field map now include a terrain-field node.
   - The field-contract surface now names place metadata as part of the archive contract.

4. Loremap pages now carry a dedicated reading surface
   Value prop: Terrain data and mythic section grammar can surface without flattening into generic markdown.
   - Added a loremap atlas block ahead of the body for place anchors.
   - Tuned loremap heading rhythm and section markers for phase-led, field-led reading.
   - Folded the loremap type chip into the atlas so the opening surface reads as one integrated plate instead of stacked blocks.
   - Quieted the post-atlas opening sequence by removing repeat proclamation styling, demoting classification copy, and increasing internal atlas spacing.
   - Kept the body scroll-forward while letting loremap-specific structure show itself.

5. Existing place work now has a canonical migration path
   Value prop: The first loremap is already inside the new system, so this is operational reality, not roadmap language.
   - Migrated `suwanee-ga-loremap` from `scroll` into `loremap`.
   - Preserved the same object id and route while changing the collection model beneath it.
   - Added location and terrain metadata to ground future HUD and spatial rendering work.

No HUD automation is required for v3.7.
The schema and reading surface are now in place so HUD behavior can be added without reworking the object model again.

Implementation note:
- A meaningful share of the v3.7 pass was visual fenaggling. The useful outcome was not ornament, but hierarchy control: one opening invocation, one atlas plate, and a calmer runway into `Phase I`.
