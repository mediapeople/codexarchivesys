---
id: codex-archive-system-v3-12-marginalia-live-publish-notes
slug: "codex-archive-system-v3-12-marginalia-live-publish-notes"
url: "https://ndcodex.com/objects/codex-archive-system-v3-12-marginalia-live-publish-notes/"
type: codex
title: "CODEX ARCHIVE SYSTEM v3.12.1 MARGINALIA LIVE PUBLISH NOTES"
date: 2026-03-17
postedAt: 2026-03-17T22:17:52Z
status: published
visibility: public

summary: "v3.12.1 hardens live marginalia publishing by teaching Carrier Pigeon to accept quoted markdown frontmatter scalars, including the inline composer's ISO date."
excerpt: "v3.12.1 hardens live marginalia publishing by teaching Carrier Pigeon to accept quoted markdown frontmatter scalars, including the inline composer's ISO date."
scale: macro
depth: structural
focus: system
function: diagnostic

themes:
  - systems
  - maintenance
  - publishing
  - fragments
  - continuity

constellations:
  - Maintenance Psalms

related:
  - codex-archive-system-v3-12-marginalia-notes
  - carrier-pigeon-publishing-system
  - codex-archive-system-v3-11-lattice-groundwork-notes

connections:
  - ref: codex-archive-system-v3-12-marginalia-notes
    role: previous version
    display: feature
  - ref: carrier-pigeon-publishing-system
    role: ingest path
  - ref: codex-archive-system-v3-11-lattice-groundwork-notes
    role: upstream groundwork

media: []

version: "3.12.1"
scope: "live marginalia publish hardening through quoted frontmatter scalar parsing"
systemArea: "Carrier Pigeon markdown ingest"
changeType: patch
dependencies:
  - codex-archive-system-v3-12-marginalia-notes
  - carrier-pigeon-publishing-system
---

v3.12.1 extends [Codex Archive System v3.12 Marginalia Notes](/objects/codex-archive-system-v3-12-marginalia-notes).
Use v3.12 for the feature release and v3.12.1 for the production hardening pass that closed the live submit gap.

v3.12.1 is the live marginalia publish correction.

Operator value prop:
- The inline marginalia composer now survives the same real submit path it uses in production, without changing keys, login assumptions, or archive structure.

Reader value prop:
- The marginalia layer remains modest and archival because the fix happened at ingest, not by introducing a second publish path or loosening the object model.

Work chunks and wins:

1. Quoted frontmatter scalars now parse as real values
   Value prop: raw markdown notes behave like actual YAML instead of brittle bare-token input.
   - Carrier Pigeon now unwraps quoted scalar frontmatter before validation.
   - The fix covers the inline marginalia composer's generated `title` and ISO `date`.
   - The same normalization also hardens quoted `status`, `visibility`, `object_type`, and axis values for future operator-authored notes.

2. Live marginalia submit now matches the operator surface
   Value prop: the page can do what it promises in the field.
   - The live failure came from the raw markdown parser, not the marginalia UI itself.
   - Fixing the ingest boundary means existing composer output can publish without manual frontmatter surgery.
   - The operator key path, browser storage behavior, and inline composer posture remain unchanged.

3. The release chain now records the correction explicitly
   Value prop: future coworkers see the real system, not only the first version of it.
   - Added this patch note as the new top release object.
   - Advanced current-state and respawn references to v3.12.1.
   - Left the original v3.12 note intact as the feature release, with this patch linked as the next update.

Minimum active state after v3.12.1:
- marginalia still publishes as fragment-backed archive content
- inline operator publishing still reuses the existing Carrier Pigeon key path
- raw markdown ingest now accepts quoted scalar frontmatter used by the live composer
- no new auth model, reply model, or public conversation surface was introduced

Not changed in v3.12.1:
- the marginalia rendering model
- the fragment-backed storage convention
- primary-surface filtering rules
- the operator-only publish posture
