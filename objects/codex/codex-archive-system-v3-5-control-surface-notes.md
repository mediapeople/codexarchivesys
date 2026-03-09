---
id: codex-archive-system-v3-5-control-surface-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3.5 CONTROL SURFACE NOTES"
date: 2026-03-08
postedAt: 2026-03-09T03:08:00Z
status: published
visibility: public

excerpt: "v3.5 unifies feed search and filter controls across desktop and mobile, and tightens header conceal/reveal rhythm."

themes:
  - systems
  - architecture
  - methodology
  - signal
  - observation

constellations:
  - Cascade Psalms

related:
  - codex-archive-system-v3-4-image-experience-notes
  - codex-archive-system-v3-3-modest-table-notes
  - codex-archive-system-v3-2-fragment-feed-notes
  - codex-archive-system-v3-1-build-notes
  - codex-archive-system-v3-plus-notes
  - on-object-oriented-archives
  - cities-built-on-ruin-reminiscence
  - bezalel-the-designated-hand

connections:
  - ref: codex-archive-system-v3-4-image-experience-notes
    role: previous version
    display: feature
  - ref: codex-archive-system-v3-6-reading-surface-notes
    role: next update

media: []

version: "3.5.0"
scope: "feed control-surface unification, sticky header conceal/reveal rhythm, and top-edge reading fade"
systemArea: "viewer"
changeType: minor
dependencies:
  - codex-archive-system-v3-4-image-experience-notes
  - codex-archive-system-v3-3-modest-table-notes
---

v3.5 extends [Codex Archive System v3.4 Image Experience Notes](/objects/codex-archive-system-v3-4-image-experience-notes).
Use v3.4 as viewing-surface context and v3.5 for current feed-control and header behavior.

v3.5 is the control-surface release.

Operator value prop:
- Search, filters, and header concealment now behave like one coherent reading surface instead of separate mobile and desktop exceptions.

Work chunks and wins:

1. Feed controls now collapse the same way on desktop and mobile
   Value prop: There is one operator gesture for opening the filter surface, regardless of viewport.
   - Promote the existing `Search & filters` toggle into the desktop feed surface.
   - Keep inactive controls collapsed by default.
   - Auto-open the panel when a search, type, or theme filter becomes active.
   - Let operators collapse the panel again without losing state.

2. Collapsed controls now reflect active state
   Value prop: A closed panel can still report what it is doing.
   - Show a compact active count when the control surface is collapsed.
   - Surface a short summary of active search/filter state in the collapsed bar.
   - Keep the `Clear` action and full active-filter line inside the open panel.

3. Header conceal/reveal motion was tightened
   Value prop: The top edge gets out of the way faster, with less drag.
   - Smooth header shadow and top-edge veil intensity from scroll progress instead of threshold jumps.
   - Reduce the hide trigger and sharpen the transform easing so the header tucks upward more quickly.
   - Keep a narrow residual strip in view so the page retains top-edge weight without a full chrome bar.

4. Content now fades under the top edge with lighter pressure
   Value prop: The reading field softens into the boundary instead of hitting a hard cut.
   - Place the top-edge veil under the sticky header and above the scrolling content.
   - Lighten the fade so it supports reading depth without feeling smoky.
   - Keep the effect tied to scroll state, not always-on decoration.

No schema expansion is proposed in v3.5.
No new object type is proposed in v3.5.
