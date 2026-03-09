---
id: codex-archive-system-v3-3-modest-table-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3.3 MODEST TABLE NOTES"
date: 2026-03-08
status: published
visibility: public

excerpt: "v3.3 gives image-backed feed cards a modest table, a separate lightbox path, and cleaner mobile inspection."

themes:
  - systems
  - architecture
  - methodology
  - signal
  - observation

constellations:
  - Cascade Psalms

related:
  - codex-archive-system-v3-2-fragment-feed-notes
  - codex-archive-system-v3-1-build-notes
  - codex-archive-system-v3-plus-notes
  - jsa-collage-evolution-003
  - artifact-jsa-collage-001
  - cities-built-on-ruin
  - when-the-commit-leaves-your-hands
  - on-object-oriented-archives

connections:
  - ref: codex-archive-system-v3-2-fragment-feed-notes
    role: previous version
    display: feature
  - ref: codex-archive-system-v3-4-image-experience-notes
    role: next update

media: []

version: "3.3.0"
scope: "feed and related card image staging, independent image lightbox behavior, and mobile lightbox polish"
systemArea: "viewer"
changeType: minor
dependencies:
  - codex-archive-system-v3-2-fragment-feed-notes
  - codex-archive-system-v3-plus-notes
---

v3.3 extends [Codex Archive System v3.2 Fragment Feed Notes](/objects/codex-archive-system-v3-2-fragment-feed-notes).
Use v3.2 as feed/interlude context and v3.3 for current card-image staging and inspection behavior.

v3.3 is the specimen-stage release.

Operator value prop:
- The image can now behave like an object in the feed: inspect it directly, then move into the post only if you want more context.

Work chunks and wins:

1. The legendary modest table solution
   Value prop: Raw camera-native art updates can keep their real silhouette instead of being flattened into teaser crops.
   - Replace hard image cropping on feed/related cards with a contained specimen stage.
   - Give image-backed cards a quiet table surface, restrained shadow, and slightly taller profile.
   - Preserve the exact shape of the item so vertical captures remain legible.

2. Split image interaction from card navigation
   Value prop: The operator can inspect the object and open the post as separate intents.
   - Keep the card body as the canonical link to the object page.
   - Promote the table/image stage to its own click target.
   - Add a lightweight card-image lightbox with a direct `Open attached post` link.
   - Mark the image stage with a small expand cue instead of extra chrome.

3. Mobile lightbox polish
   Value prop: Touch inspection stays legible and tappable on a narrow viewport.
   - Convert the mobile lightbox controls into a bottom action tray with larger tap targets.
   - Shorten CTA copy so long titles do not bloat the control row.
   - Increase mobile-only top/bottom breathing room inside the table stage so the object is not visually crammed.

4. Presentation lesson now codified
   Value prop: Click behavior can become more precise without destabilizing the archive spine.
   - The card can hold two linked but distinct reading surfaces.
   - Feed presentation can become more object-aware without changing schema.
   - Direct inspection works better when it feels like handling a specimen, not launching a modal billboard.

No schema expansion is proposed in v3.3.
No new object type is proposed in v3.3.
