---
id: codex-archive-system-v3-12-marginalia-notes
slug: "codex-archive-system-v3-12-marginalia-notes"
url: "https://ndcodex.com/objects/codex-archive-system-v3-12-marginalia-notes/"
type: codex
title: "CODEX ARCHIVE SYSTEM v3.12 MARGINALIA NOTES"
date: 2026-03-17
postedAt: 2026-03-17T22:20:00.000Z
status: published
visibility: public

summary: "v3.12 adds a quiet marginalia layer: operator-authored fragments that attach to an object page without becoming their own public feed."
excerpt: "v3.12 adds a quiet marginalia layer: operator-authored fragments that attach to an object page without becoming their own public feed."
scale: macro
depth: structural
focus: system
function: revelatory

themes:
  - systems
  - methodology
  - fragments
  - publishing
  - continuity

constellations:
  - Maintenance Psalms

related:
  - codex-archive-system-v3-12-marginalia-live-publish-notes
  - codex-archive-system-v3-11-lattice-groundwork-notes
  - carrier-pigeon-publishing-system
  - codex-archive-system-v3-2-fragment-feed-notes
  - the-bones-hold-content-architecture

connections:
  - ref: codex-archive-system-v3-11-lattice-groundwork-notes
    role: previous version
    display: feature
  - ref: codex-archive-system-v3-12-marginalia-live-publish-notes
    role: next update
  - ref: carrier-pigeon-publishing-system
    role: operator auth path
  - ref: codex-archive-system-v3-2-fragment-feed-notes
    role: fragment precedent
    display: feature
  - ref: the-bones-hold-content-architecture
    role: object-surface continuity

media: []

version: "3.12.0"
scope: "object-local marginalia, inline operator publishing, primary-surface filtering, and release-chain alignment"
systemArea: "object page annotation and archive surface control"
changeType: minor
dependencies:
  - codex-archive-system-v3-11-lattice-groundwork-notes
  - carrier-pigeon-publishing-system
  - codex-archive-system-v3-2-fragment-feed-notes
---

v3.12 extends [Codex Archive System v3.11 Lattice Groundwork Notes](/objects/codex-archive-system-v3-11-lattice-groundwork-notes).
These notes are now extended by [Codex Archive System v3.12.1 Marginalia Live Publish Notes](/objects/codex-archive-system-v3-12-marginalia-live-publish-notes).
Use v3.11 for coordinate-aware ingest, v3.12 for the first marginalia layer, and v3.12.1 for the live publish hardening pass that made the inline composer survive production submit.

v3.12 is the marginalia release.

Operator value prop:
- You can now leave a small, object-local note directly on the reading surface and publish it through the existing Carrier Pigeon key flow without opening a separate ingest tool.

Reader value prop:
- Published objects can now carry quiet after-notes and traces without turning ndcodex into a comment system, reply stack, or second timeline.

Work chunks and wins:

1. Marginalia now has a stable archive convention
   Value prop: the layer is real without requiring a taxonomy rewrite.
   - Reused `fragment` as the storage object instead of introducing a new type.
   - Tagged marginalia through `origin: marginalia` and attached it to the parent object with `connections` role `note`.
   - Kept the schema stable by relying on already-supported fragment, origin, visibility, and connection fields.

2. Object pages now carry a dedicated marginalia stack
   Value prop: the mark lives where the reading happened.
   - Added a flat marginalia section below the object body.
   - Rendered marks oldest-first so the layer accumulates as trace rather than as ranking.
   - Added the same stack to the dedicated codex reading surface so codex notes do not lose the layer.

3. Operator-only publishing now happens inline
   Value prop: the layer can be used in practice, not just described in theory.
   - Added an inline composer that reveals itself through operator action.
   - Reused the saved Carrier Pigeon browser key instead of inventing a second auth system.
   - Publish now lands through the existing `/api/pigeon` path and appends into the visible stack immediately after submit.

4. Global archive surfaces now ignore marginalia
   Value prop: the margin stays in the margin.
   - Home feed, follow feeds, and related-object recommendations now treat marginalia as object-local support rather than primary archive inventory.
   - This preserves the no-global-scribbles rule while still keeping every mark as a real archived object.

5. Release-chain documentation is now aligned with the new layer
   Value prop: the system can respawn cleanly after the change.
   - Added this canonical v3.12 release object.
   - Advanced status, respawn, and current-state notes to the same version line.
   - Recorded the marginalia release as a continuity move rather than an undocumented UI flourish.

Minimum active state after v3.12:
- marginalia is stored as fragment-backed archive content
- marginalia renders inline on object pages and codex pages
- operator publishing works through the existing Carrier Pigeon key path
- marginalia stays off the primary feed and follow surfaces
- no replies, likes, rankings, or public conversation mechanics were added

Not yet active:
- shared/private collaborator tiers beyond the current operator-first path
- promotion from marginalia into a fully surfaced standalone fragment workflow
- marginalia on every dedicated route surface outside the generic object page and codex page
- moderation controls beyond normal source editing

No new object type is introduced in v3.12.
No social-comment workflow is introduced in v3.12.
No fragment-feed rollback is required to support marginalia in v3.12.

Implementation note:
- The point of v3.12 is restraint. The archive now supports a modest after-writing layer, but that layer is still governed like archive material, not social exhaust.
