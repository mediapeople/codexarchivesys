---
id: codex-archive-system-v3-11-lattice-groundwork-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3.11 LATTICE GROUNDWORK NOTES"
date: 2026-03-17
postedAt: 2026-03-17T21:30:00.000Z
status: published
visibility: public

excerpt: "v3.11 gives the archive its first coordinate backbone: axis-aware ingest, phone-side review, and a concrete path from object archive to lattice navigation."
scale: macro
depth: structural
focus: system
function: revelatory

themes:
  - systems
  - methodology
  - transmission
  - navigation
  - architecture

constellations:
  - Maintenance Psalms

related:
  - codex-archive-system-v3-10-media-handoff-notes
  - carrier-pigeon-publishing-system
  - nd-codex-object-classification
  - codex-archive-system-v3-2-fragment-feed-notes

connections:
  - ref: codex-archive-system-v3-10-media-handoff-notes
    role: previous version
    display: feature
  - ref: carrier-pigeon-publishing-system
    role: mobile publishing surface
  - ref: nd-codex-object-classification
    role: taxonomy contract
    display: feature
  - ref: codex-archive-system-v3-2-fragment-feed-notes
    role: fragment reading precedent

media: []

version: "3.11.0"
scope: "axis metadata, phone-side coordinate review, fragment inspection cleanup, and implementation-ready lattice seams"
systemArea: "archive navigation and ingest classification"
changeType: minor
dependencies:
  - codex-archive-system-v3-10-media-handoff-notes
  - carrier-pigeon-publishing-system
  - nd-codex-object-classification
---

v3.11 extends [Codex Archive System v3.10 Media Handoff Notes](/objects/codex-archive-system-v3-10-media-handoff-notes).
Use v3.10 for delivery reliability and v3.11 for the first coordinate-aware layer of the archive.

v3.11 is the lattice-groundwork release.

Operator value prop:
- You no longer have to publish a note as only a file in a folder. The archive can now begin to understand where the note sits: how large it is, how deep it goes, what it centers, and what it is trying to do.

Reader value prop:
- ndcodex is still an object archive, but it now has the first real infrastructure required to become a navigation surface rather than a timeline.

Work chunks and wins:

1. Axis metadata now exists as a real archive contract
   Value prop: a piece can be placed, not just typed.
   - Added `scale`, `depth`, `focus`, and `function` to the shared content schema.
   - Built shared normalization and inference logic so ingest and UI can speak the same coordinate language.
   - Rendered axis values on object pages so placement is visible instead of hidden system state.

2. Carrier Pigeon can now review coordinates before publish
   Value prop: field publishing stays fast without making classification invisible.
   - Ingest now infers axes when the note does not provide them.
   - The phone publishing surface now previews inferred axes and allows manual override before transmit.
   - Type selection in Carrier Pigeon now pins the actual frontmatter value instead of only changing the interface badge.

3. Fragment inspection got lighter
   Value prop: the reading surface now opens closer to the line itself.
   - Feed fragments already behave as interludes instead of generic cards.
   - Full fragment inspection now avoids repeating the excerpt as a decorative subhead before the real body.
   - This keeps the inspection surface truer to the object and reduces redundant framing.

4. The lattice now has implementation seams instead of only theory
   Value prop: the next phase is buildable.
   - Wrote a concrete integration checklist covering schema, Carrier Pigeon, feed filters, graph payload, and object-page surfaces.
   - Clarified the core architectural guardrail: the existing object classes remain stable, while the lattice grows as a relational and navigational layer on top.
   - Reduced the risk of chasing an abstract taxonomy rewrite when the real leverage is additive metadata plus navigation.

Minimum active state after v3.11:
- axes are inferred during ingest
- axes can be reviewed and overridden on the phone
- axes are stored in frontmatter
- axes are visible on object pages
- fragment inspection is cleaner and less repetitive

Not yet active:
- lattice membership as a publishable field
- clickable axis and lattice filters on the live feed
- graph clustering by axis or lattice
- intersections, multiplications, and strata as first-class reading surfaces

No object taxonomy replacement is proposed in v3.11.
No new object type is introduced in v3.11.
No mandatory schema migration beyond additive axis metadata is required in v3.11.

Implementation note:
- The point of v3.11 is not that the lattice is finished. The point is that ndcodex now has a real coordinate backbone. The archive can begin to feel lighter and more connected because placement has started to become part of publication itself.
