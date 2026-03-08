---
id: codex-archive-system-v3-1-build-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3.1 BUILD NOTES"
date: 2026-03-08
postedAt: 2026-03-08T09:55:00-05:00
status: published
visibility: public

excerpt: "v3.1 locks mobile reading surfaces to the viewport, improves feed legibility, and adds one-command inbox drop cleanup with audit logging."

themes:
  - systems
  - architecture
  - methodology
  - maintenance
  - signal

constellations:
  - Cascade Psalms

related:
  - codex-archive-system-v3-plus-notes
  - codex-archive-system-v3-notes
  - go-live-milestone
  - signal-descent-003
  - reduce-novelty-before-care
  - artifact-jsa-collage-001
  - jsa-collage-evolution-001

media: []

version: "3.1.1"
scope: "mobile viewport containment, feed readability, and inbox-drop cleanup automation"
systemArea: "runtime"
changeType: patch
dependencies:
  - codex-archive-system-v3-plus-notes
  - go-live-milestone
---

v3.1 is a runtime polish and operations cleanup patch layered on v3+.

Operator value prop:
- Ship clean and stay clean: mobile reading stays locked in-frame, and processed inbox payloads clear in one command.

Work chunks and wins:

1. Mobile overflow containment
   Value prop: No horizontal drift on feed/graph mobile sessions, so reading stays anchored.
   - Add horizontal overflow guards at global layout level.
   - Collapse graph list grid earlier on small screens to prevent width blowout.

2. Feed readability consistency
   Value prop: Operators can scan atlas/meta labels at a glance without contrast strain.
   - Raise low-contrast footer/atlas labels from dim token usage to readable mid token usage.
   - Normalize small UI labels toward shared 12px conventions where intended.

3. Inbox post-publish cleanup
   Value prop: Completed source drops leave active intake immediately, with traceability preserved.
   - Add `scripts/cleanup-inbox-drop.mjs` for archive/purge workflows.
   - Auto-write cleanup audit records to `inbox/archive/drop/cleanup-log.ndjson`.
   - Move published `Complete Collage, It cost us dearly` source payload into dated archive sweep.

No schema expansion is proposed in v3.1.
No new object type is proposed in v3.1.
