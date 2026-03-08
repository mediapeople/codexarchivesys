---
id: codex-archive-system-v3-1-build-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v3.1 BUILD NOTES"
date: 2026-03-08
postedAt: 2026-03-08T09:55:00-05:00
status: published
visibility: public

excerpt: "v3.1 locks mobile reading surfaces to the viewport, improves feed legibility, and keeps the active inbox honest."

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
scope: "mobile viewport containment, feed readability, and honest-inbox cleanup automation"
systemArea: "runtime"
changeType: patch
dependencies:
  - codex-archive-system-v3-plus-notes
  - go-live-milestone
---

v3.1 is a runtime polish and operations cleanup patch layered on v3+.

Operator value prop:
- Ship clean and stay clean: mobile reading stays locked in-frame, and the active inbox reflects real pending work.

Work chunks and wins:

1. Mobile overflow containment
   Value prop: No horizontal drift on feed/graph mobile sessions, so reading stays anchored.
   - Add horizontal overflow guards at global layout level.
   - Collapse graph list grid earlier on small screens to prevent width blowout.

2. Feed readability consistency
   Value prop: Operators can scan atlas/meta labels at a glance without contrast strain.
   - Raise low-contrast footer/atlas labels from dim token usage to readable mid token usage.
   - Normalize small UI labels toward shared 12px conventions where intended.

3. Honest inbox activation
   Value prop: The human operator can move from detected source to published object without mixing live work and completed work.
   - Name the operator loop explicitly: `Talk -> Confirm -> Hand-off -> Ping-back`.
   - Add `scripts/finalize-approved-ready.mjs` so post-confirmation work can run as one system handoff.
   - Add `scripts/promote-ready.mjs` for the deliberate `inbox/ready` -> canonical publish step.
   - Require explicit operator approval via `--approve` before canonical files are written.
   - Require an approval note and append promotion records to `logs/promotion-log.ndjson`.
   - Require `--approve-all` for batch promotion so one broad command cannot masquerade as item-level review.
   - Add `scripts/reconcile-inbox.mjs` to archive ready drafts once they have canonical `objects/` counterparts.
   - Extend `scripts/cleanup-inbox-drop.mjs` with `--auto-published` for source-payload sweeps discoverable from ready/archive-ready drafts.
   - Write cleanup audit records to both `inbox/archive/ready/cleanup-log.ndjson` and `inbox/archive/drop/cleanup-log.ndjson`.
   - Keep active `inbox/ready/` limited to real pending review.
   - Operator shorthand: `keeping the beast fed :) and not chewing cud`

No schema expansion is proposed in v3.1.
No new object type is proposed in v3.1.
