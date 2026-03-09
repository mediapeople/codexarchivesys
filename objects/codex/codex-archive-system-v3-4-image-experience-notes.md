---
id: codex-archive-system-v3-4-image-experience-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3.4 IMAGE EXPERIENCE NOTES"
date: 2026-03-08
postedAt: 2026-03-08T23:16:07Z
status: published
visibility: public

excerpt: "v3.4 extends image handling from simple expansion to full gallery continuity, gentler mobile inspection, and roomier reading rhythm."

themes:
  - systems
  - architecture
  - methodology
  - signal
  - observation

constellations:
  - Cascade Psalms

related:
  - codex-archive-system-v3-3-modest-table-notes
  - codex-archive-system-v3-2-fragment-feed-notes
  - codex-archive-system-v3-1-build-notes
  - codex-archive-system-v3-plus-notes
  - jsa-collage-evolution-003
  - artifact-jsa-collage-001
  - cities-built-on-ruin
  - when-the-commit-leaves-your-hands
  - on-object-oriented-archives

connections:
  - ref: codex-archive-system-v3-3-modest-table-notes
    role: previous version
    display: feature
  - ref: codex-archive-system-v3-5-control-surface-notes
    role: next update

media: []

version: "3.4.0"
scope: "multi-image inspection continuity, mobile gallery tap/swipe behavior, and roomier mobile reading rhythm across cards and object pages"
systemArea: "viewer"
changeType: minor
dependencies:
  - codex-archive-system-v3-3-modest-table-notes
  - codex-archive-system-v3-plus-notes
---

v3.4 extends [Codex Archive System v3.3 Modest Table Notes](/objects/codex-archive-system-v3-3-modest-table-notes).
Use v3.3 as specimen-stage context and v3.4 for current gallery continuity and mobile reading behavior.

v3.4 is the image-experience release.

Operator value prop:
- Multi-image objects now read like one continuous viewing session instead of a stack of separate image interruptions.

Work chunks and wins:

1. Card lightbox now understands the whole object
   Value prop: A multi-image fieldlog can be inspected from the feed without repeated open-close cycles.
   - Feed and related cards now pass the full image set into the lightbox, not just the primary image.
   - Multi-image cards mark the table with a quiet `1 / n` cue.
   - The table remains the inspection zone while the rest of the card stays the canonical post link.

2. Object-page image viewing now behaves like a gallery
   Value prop: Once inside the object, inspection can continue without breaking concentration.
   - Object-page media now opens into a navigable gallery session.
   - Desktop supports arrow-key movement.
   - Mobile supports swipe and split tap zones directly inside the lightbox frame.

3. Mobile lightbox chrome was reduced on purpose
   Value prop: The image gets the majority of the viewport instead of competing with controls.
   - Explicit mobile previous/next button rows were removed.
   - Gallery state is now signaled by a quieter count and faint directional cues.
   - Left-side tap reverses and right-side tap advances inside the lightbox image field.

4. Gallery motion was softened
   Value prop: Navigation feels like handling material, not operating a carousel.
   - Image changes now use a restrained fade-slide handoff.
   - Travel distance was reduced so movement reads as continuity, not spectacle.
   - Reduced-motion preferences still disable the effect.

5. Mobile reading rhythm was loosened
   Value prop: Titles and supporting copy can breathe before the image arrives.
   - Feed and related card stacks now use larger mobile headings and more vertical separation.
   - Object-page mobile headers now open with more title scale and clearer body entry spacing.
   - Related and object surfaces now feel less signal-dense on phones.

No schema expansion is proposed in v3.4.
No new object type is proposed in v3.4.
