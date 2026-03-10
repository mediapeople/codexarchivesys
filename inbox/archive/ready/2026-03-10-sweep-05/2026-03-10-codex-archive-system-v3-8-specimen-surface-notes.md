---
id: codex-archive-system-v3-8-specimen-surface-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3.8 SPECIMEN SURFACE NOTES"
date: 2026-03-10
status: draft
visibility: public

excerpt: "v3.8 makes fieldlog data plates first-class, keeps object-gallery chrome inside the stage, and hardens delivery images for real-world sharing."

themes:
  - systems
  - architecture
  - methodology
  - observation
  - signal

constellations:
  - Cascade Psalms

related:
  - codex-archive-system-v3-7-loremap-foundation-notes
  - codex-archive-system-v3-4-image-experience-notes
  - race-to-the-top-six-bridges
  - mothers-calendar
  - citizen-network-dispatch

connections:
  - ref: codex-archive-system-v3-7-loremap-foundation-notes
    role: previous version
    display: feature
  - ref: race-to-the-top-six-bridges
    role: specimen surface
    display: feature
  - ref: mothers-calendar
    role: companion specimen

media: []

version: "3.8.0"
scope: "fieldlog structured data plates, companion-fieldlog linkage, safe lightbox chrome, upright delivery assets, and published-only nexus surfacing"
systemArea: "object surface and publish delivery"
changeType: minor
dependencies:
  - codex-archive-system-v3-7-loremap-foundation-notes
  - codex-archive-system-v3-4-image-experience-notes
---

v3.8 extends [Codex Archive System v3.7 Loremap Foundation Notes](/objects/codex-archive-system-v3-7-loremap-foundation-notes).
Use v3.7 for place-aware modeling and v3.8 for specimen-grade fieldlog surfaces and delivery reliability.

v3.8 is the specimen-surface release.

Operator value prop:
- A fieldlog can now open with designed instrumentation, hold companion context near the primary specimen, and ship media that survives gallery, thumbnail, and social delivery without drifting.

Work chunks and wins:

1. Fieldlog specs now have a real render lane
   Value prop: Beer, place, and observation data no longer have to hide inside body prose.
   - Added a reusable `specs` shape to the fieldlog schema.
   - Documented the field in the registry and intake template so it is operational, not one-off.
   - Established a path for structured specimen facts to render as first-class object data.

2. The readout became a dedicated plate surface
   Value prop: The opening of a specimen post can read like a designed instrument panel instead of a generic metadata grid.
   - Extracted a dedicated `FieldlogDataPlate` component instead of styling readout cards inline inside the object page.
   - Rebuilt the surface with stronger hierarchy: hero datum, supporting rack, signal-note strip, and warmer material contrast.
   - Floated the plate directly under the title and excerpt so the opening resolves as one composed surface, following the loremap lesson from v3.7.

3. Companion fieldlogs now resolve as explicit nearby context
   Value prop: Same-room observations can stay distinct without being forced into one overgrown object.
   - Promoted `mothers-calendar` as a companion fieldlog from the same Six Bridges visit.
   - Linked it to `race-to-the-top-six-bridges` with an explicit feature connection instead of leaving the relation implicit.
   - Confirmed that the object page can now stage the specimen and its companion note as part of one readable cluster.

4. Object-gallery chrome now stays inside the inspected object
   Value prop: Expanded media no longer feels pinned to the browser shell instead of the archive surface.
   - Padded the lightbox stage so close and navigation controls sit inside a safer internal frame.
   - Kept the gallery session object-aware while reducing the sense that controls are hugging the browser edge.

5. Delivery images now arrive upright in the wild
   Value prop: Social cards, thumbnails, and meta scrapers now see the same specimen orientation operators see on the object page.
   - Baked the Six Bridges JPG rotations into the pixel data.
   - Normalized orientation metadata so preview consumers do not improvise their own 90-degree correction.
   - Verified the object build after the asset rewrite to confirm the route and gallery still resolve cleanly.

6. Nexus now respects publication state at the route layer
   Value prop: Leftover drafts no longer leak into the public nexus stream just because content files exist.
   - Filtered nexus index and issue routes to published, public entries only.
   - Preserved draft work in content without allowing it to masquerade as released issues.

No schema migration beyond the additive fieldlog `specs` surface is required for v3.8.
No new object type is introduced in v3.8.

Implementation note:
- v3.8 is less about new taxonomy than about trust. A specimen post now reads better, shares better, and clusters better because the opening plate, companion linkage, and delivery assets all agree about what the object is.
