---
id: codex-archive-system-v3-10-media-handoff-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3.10 MEDIA HANDOFF NOTES"
date: 2026-03-13
postedAt: 2026-03-13T19:15:00.000Z
status: published
visibility: public

excerpt: "v3.10 hardens image delivery at the publish handoff so HEIC-heavy fieldlogs arrive in cards, galleries, and object pages without manual rescue."

themes:
  - systems
  - methodology
  - observation
  - transmission
  - architecture

constellations:
  - Cascade Psalms
  - Maintenance Psalms

related:
  - codex-archive-system-v3-9-orientation-clarity-notes
  - codex-archive-system-v3-8-specimen-surface-notes
  - codex-archive-system-v3-4-image-experience-notes
  - return-of-the-joker

connections:
  - ref: codex-archive-system-v3-9-orientation-clarity-notes
    role: previous version
    display: feature
  - ref: codex-archive-system-v3-8-specimen-surface-notes
    role: delivery image precedent
  - ref: return-of-the-joker
    role: proving specimen
    display: feature

media: []

version: "3.10.0"
scope: "publish-time media prep, HEIC-aware delivery normalization, and narrower operator handoffs from ready draft to local publish"
systemArea: "publish pipeline and image delivery"
changeType: minor
dependencies:
  - codex-archive-system-v3-9-orientation-clarity-notes
  - codex-archive-system-v3-8-specimen-surface-notes
  - codex-archive-system-v3-4-image-experience-notes
---

v3.10 extends [Codex Archive System v3.9 Orientation Clarity Notes](/objects/codex-archive-system-v3-9-orientation-clarity-notes).
Use v3.9 for public-facing clarity and v3.10 for current media handoff reliability across intake, publish, and gallery delivery.

v3.10 is the media-handoff release.

Operator value prop:
- A fieldlog with phone-native HEIC source can now move from `inbox/drop` to local publish without the operator having to manually diagnose broken cards, broken lightboxes, or mislabeled camera exports.

Work chunks and wins:

1. Finalize now owns the media handoff
   Value prop: Approval can trigger one reliable publish lane instead of a markdown handoff plus a separate image side quest.
   - Added a publish-time media step that reads source-to-public mappings directly from the ready draft.
   - Wired `scripts/finalize-approved-ready.mjs` to prepare mapped assets before promotion, reconciliation, cleanup, validation, and build.
   - Kept the operator boundary narrow: review, confirm, and let the pipeline finish the rest.

2. HEIC and HEIF are treated as first-class intake reality
   Value prop: Camera-native stills no longer arrive as browser-broken ghosts just because the source filename lied.
   - Detect actual media format from file signatures instead of trusting the extension.
   - Normalize HEIC and HEIF delivery to `.jpg` assets for the public web path.
   - Remove stale sibling files with the same basename but the wrong extension so old broken targets stop lingering in `astro/public`.

3. Fieldlog intake now plans the real delivery artifact
   Value prop: The draft itself carries a truthful handoff map, which makes later publish automation possible.
   - Moved media-format detection into shared utilities so intake and publish agree about what a file actually is.
   - Fieldlog ready drafts now plan `/media/...` targets from actual bytes, not optimistic suffixes.
   - Intake notes remain the handoff contract until promotion strips them from canonical publish state.

4. Image handling and object delivery now agree about trust
   Value prop: The same object can survive card preview, object page, and gallery expansion without separate repair steps.
   - HEIC-heavy fieldlogs now arrive in a browser-safe format before Astro computes image metadata and preview framing.
   - Publish delivery is less fragile when a drop item mixes real JPGs with mislabeled phone exports.
   - The proving specimen for this pass was `return-of-the-joker`, where broken card previews exposed the handoff gap.

No schema migration is required for v3.10.
No new object type is introduced in v3.10.

Implementation note:
- v3.10 is a trust-widening release. The point is not just better image conversion; it is that the approval handoff now owns the boring but critical work that used to fall between draft planning and public delivery.
