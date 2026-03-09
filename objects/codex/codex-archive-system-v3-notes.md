---
id: codex-archive-system-v3-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3 NOTES"
date: 2026-03-07
status: published
visibility: public

excerpt: "v3 codifies ingest learnings: WIP continuity links, promotion-time media normalization, and synchronized release-note updates."

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
  - codex-archive-system-v2-7-notes
  - go-live-milestone
  - jsa-collage-evolution-001
  - artifact-jsa-collage-wip-001
  - apparatus-ledger
  - signal-descent-002
  - lean-mean-governance-machine

connections:
  - ref: codex-archive-system-v3-plus-notes
    role: superseded by
    display: feature
  - ref: codex-archive-system-v2-7-notes
    role: previous version

media: []

version: "3.0.0"
scope: "ingest learnings, relation continuity, and release-note discipline"
systemArea: "pipeline"
changeType: major
dependencies:
  - codex-archive-system-v2-7-notes
  - go-live-milestone
---

v3 notes are now superseded by [Codex Archive System v3+ Notes](/objects/codex-archive-system-v3-plus-notes).
Use v3 as release-history context for ingest discipline updates.

v3 is a systems update focused on ingest learnings and note adjustments, not schema expansion.

The spine remains stable. The upgrade is operational.

Key moves:
- publish the v3 codex note as canonical system context
- advance status/respawn/orientation references to a single active v3 chain
- require WIP/revision intake outputs to suggest links to newest relevant updates
- reinforce reciprocal relation links from WIP artifacts into current release objects
- treat media normalization (for capture-native formats) as promotion-time work
- document a reusable media optimization command for post-ingest slimming

Ingest learnings now codified:
- a draft without update links decays quickly in graph usefulness
- WIP objects need explicit temporal anchors to stay legible after new releases
- canonical note adjustments should ship alongside object/relation adjustments
- promotion should include content + relation + media consistency checks in one pass

Media handling notes:
- image derivatives should be resized/compressed before publish, not just format-converted
- process video should ship as MP4 delivery assets, with originals retained in inbox source drops
- run `node scripts/optimize-media-assets.mjs <file> [file...]` during promotion when payload is heavy

No new object type is proposed in v3.
No schema expansion is proposed in v3.
