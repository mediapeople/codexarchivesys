---
id: codex-archive-system-v3-13-hud-clarity-notes
slug: "codex-archive-system-v3-13-hud-clarity-notes"
url: "https://ndcodex.com/objects/codex-archive-system-v3-13-hud-clarity-notes/"
type: codex
title: "CODEX ARCHIVE SYSTEM v3.13 HUD CLARITY NOTES"
date: 2026-03-27
postedAt: 2026-03-28T00:35:31Z
status: published
visibility: public

tags:
  - hud
  - mythmech
  - publishing
  - carrier-pigeon
  - release-notes
images: []
state: published

summary: "v3.13 collapses HUD publishing into Carrier Pigeon, moves HUD access out of the reading flow, and reshapes the inspect surface around consequence, structure, and visual anchors."
excerpt: "v3.13 collapses HUD publishing into Carrier Pigeon, moves HUD access out of the reading flow, and reshapes the inspect surface around consequence, structure, and visual anchors."
scale: macro
depth: structural
focus: system
function: diagnostic

themes:
  - systems
  - publishing
  - structure
  - architecture
  - continuity

constellations:
  - Maintenance Psalms

related:
  - codex-archive-system-v3-12-marginalia-live-publish-notes
  - carrier-pigeon-publishing-system
  - codex-archive-system-v3-10-media-handoff-notes
  - mythmech-system-note

connections:
  - ref: codex-archive-system-v3-12-marginalia-live-publish-notes
    role: previous version
    display: feature
  - ref: carrier-pigeon-publishing-system
    role: publish lane
  - ref: codex-archive-system-v3-10-media-handoff-notes
    role: media groundwork
  - ref: mythmech-system-note
    role: inspect grammar

media: []

version: "3.13.0"
scope: "HUD access, consequence-first inspection, visual anchors, and Carrier Pigeon HUD convergence"
systemArea: "object inspection surface and publishing flow"
changeType: minor
dependencies:
  - codex-archive-system-v3-12-marginalia-live-publish-notes
  - carrier-pigeon-publishing-system
  - codex-archive-system-v3-10-media-handoff-notes
  - mythmech-system-note
---

v3.13 extends [Codex Archive System v3.12.1 Marginalia Live Publish Notes](/objects/codex-archive-system-v3-12-marginalia-live-publish-notes).
Use v3.12.1 for the live marginalia publish correction and v3.13 for the current HUD product shape: one publish lane, one inspect surface, and a clearer explanation of why the state matters.

v3.13 is the HUD clarity release.

Operator value prop:
- Published scrolls now surface HUD automatically through the normal Carrier Pigeon path, without a second field-HUD workflow or extra publish ceremony.

Reader value prop:
- The reading page stays primary while the HUD becomes a deliberate inspect surface that explains what matters, why it matters, and where to go deeper.

Work chunks and wins:

1. HUD publishing now collapses back into Carrier Pigeon
   Value prop: the enhanced-object lane is no longer a separate product to remember.
   - The dedicated field-HUD publish tool now routes back into `/pigeon`.
   - Published scrolls automatically receive object-native HUD routes.
   - Carrier Pigeon can now hand back the object and the HUD from the same publish flow.

2. Object-page HUD access now respects the reading surface
   Value prop: inspection is present, but it no longer interrupts the object body.
   - Removed the large embedded inspect widget from the body flow.
   - Replaced it with a modest `Enhanced Object / View HUD` access point.
   - Desktop now treats HUD access like a utility tag in the page frame.
   - Mobile now collapses that access into a quieter aside-style link.
   - Tightened object body column width so the prose reads as a real column again.

3. The HUD now translates state into consequence
   Value prop: a user can tell why the current state matters without decoding internal telemetry first.
   - Rebuilt the hierarchy around `Strike Layer`, `Hinge`, `Flow Vector`, and `Depth`.
   - Rewrote the top-level copy so each layer says what it is in relation to the object and why it matters.
   - Reduced repeated truths, duplicate cards, and passive pill chrome.
   - Kept labels small and technical while the real explanation becomes larger and human.

4. The HUD center now uses a true anchor
   Value prop: the inspection surface has one center of gravity instead of many equal-weight boxes.
   - If a strong visual is present, the HUD centers on that visual.
   - If no visual is present, the hinge becomes the center plate.
   - The HUD now behaves more like a command surface: diagnostic rail on the left, anchor in the center, consequence rail on the right.
   - No parallel asset lane was introduced; the HUD reuses the object's own preview media path.

5. Depth stays available without bloating the first read
   Value prop: complexity remains accessible without becoming the default burden.
   - `Structure`, `Fragment`, and `Memory` remain on-demand depth views.
   - Mythmech detail, respawn memory, and supporting packet context are still available below the initial surface.
   - The object body remains untouched and sidecars remain the inspection layer.

Minimum active state after v3.13:
- published scrolls auto-surface HUD through Carrier Pigeon
- object pages expose one quiet HUD access point instead of a large inline instrument block
- HUD opens with a central anchor and side rails, not a stack of equal cards
- state is paired with consequence, not only taxonomy
- structure, fragment, and memory remain available as optional depth

Not changed in v3.13:
- the object body is still the primary reading unit
- Mythmech sidecars remain optional and adjacent
- spawn and lineage are not yet fully interactive from the HUD
- no forced authoring structure was added to scroll publishing

Implementation note:
- This pass is less about adding more telemetry than making telemetry legible. The system now says more clearly what the object is doing, what is acting on it, and why the user should care.
