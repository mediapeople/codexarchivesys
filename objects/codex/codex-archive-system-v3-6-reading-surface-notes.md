---
id: codex-archive-system-v3-6-reading-surface-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3.6 READING SURFACE NOTES"
date: 2026-03-08
postedAt: 2026-03-09T03:37:34Z
status: published
visibility: public

excerpt: "v3.6 normalizes hero heading rhythm, holds feed cards in two columns longer, and tightens longform measure for deeper reading."

themes:
  - systems
  - architecture
  - methodology
  - observation
  - signal

constellations:
  - Cascade Psalms

related:
  - codex-archive-system-v3-5-control-surface-notes
  - codex-archive-system-v3-4-image-experience-notes
  - cities-built-on-ruin-reminiscence
  - builder-lineage-reflection
  - bezalel-the-designated-hand

connections:
  - ref: codex-archive-system-v3-5-control-surface-notes
    role: previous version
    display: feature
  - ref: codex-archive-system-v3-4-image-experience-notes
    role: earlier version

media: []

version: "3.6.0"
scope: "hero heading rhythm, longform title measure, paragraph width, section cadence, and later feed-card collapse"
systemArea: "reading surface"
changeType: minor
dependencies:
  - codex-archive-system-v3-5-control-surface-notes
  - codex-archive-system-v3-4-image-experience-notes
---

v3.6 extends [Codex Archive System v3.5 Control Surface Notes](/objects/codex-archive-system-v3-5-control-surface-notes).
Use v3.5 for control-surface behavior and v3.6 for current reading rhythm and measure.

v3.6 is the reading-surface typography release.

Operator value prop:
- Page heads, object titles, and longform paragraphs now read with clearer measure and steadier cadence across feed, orientation, graph, nexus, and object pages.

Work chunks and wins:

1. Main-page hero headings now carry explicit rhythm
   Value prop: Feed, orientation, and graph no longer drift because they are not depending on shared inherited line-height alone.
   - Set explicit hero heading leading on feed, orientation, and graph.
   - Pull orientation hero upward so its opening line starts in the same visual band as the other main pages.
   - Keep the size contrast strong without letting the line breaks feel brittle.

2. Nexus titles now behave as intentional reading surfaces
   Value prop: Nexus stream cards and nexus issue heads now read like designed titles instead of incidental inherited display text.
   - Set explicit leading on nexus stream `h2` titles.
   - Set explicit leading on nexus issue `h1` titles.

3. Feed cards now hold two columns longer
   Value prop: The archive preserves the copy/preview relationship deeper into medium widths before collapsing to one column.
   - Delay the single-column break.
   - Slim the intermediate image-column ratios and gaps instead of collapsing early.

4. Longform object titles and paragraphs now keep tighter measure
   Value prop: Scrolls, field logs, and codex pages now sustain deeper reading on desktop with less horizontal drift.
   - Add explicit leading and width caps to longform object titles.
   - Narrow longform paragraph measure on desktop.
   - Keep mobile and narrower screens at full width where needed.

5. Section heads now leave more room below
   Value prop: `h2` markers can land with more authority before body copy resumes.
   - Increase object-page `h2` bottom margin on the reading surface.
   - Keep the smaller-screen version proportionally looser too.

No schema expansion is proposed in v3.6.
No new object type is proposed in v3.6.
