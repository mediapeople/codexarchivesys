---
id: codex-archive-system-v2-7-notes
type: codex
title: "CODEX ARCHIVE SYSTEM v2.7 NOTES"
date: 2026-03-07
status: published
visibility: public

excerpt: "v2.7 marks go-live: domain online, deploy loop active, and mobile reading surfaces stabilized."

themes:
  - systems
  - architecture
  - methodology
  - signal

constellations:
  - Cascade Psalms

related:
  - codex-archive-system-v3-notes
  - codex-archive-system-v2-6-notes
  - go-live-milestone
  - apparatus-ledger
  - signal-descent-002
  - signal.citizen-agency
  - artifact-jsa-collage-wip-001

connections:
  - ref: codex-archive-system-v3-notes
    role: superseded by
    display: feature
  - ref: codex-archive-system-v2-6-notes
    role: previous version

media: []

version: "2.7.0"
scope: "production launch, mobile resilience, and release operations"
systemArea: "pipeline"
changeType: minor
dependencies:
  - codex-archive-system-v2-6-notes
  - signal-descent-002
---

v2.7 notes are now superseded by [Codex Archive System v3 Notes](/objects/codex-archive-system-v3-notes).
Use v2.7 as release-history context, not the active orientation contract.

v2.7 is the go-live release.

The system crossed from local-first preview into public runtime with a stable deployment path and custom domain routing.

Key moves:
- connected GitHub main branch to Netlify production deploys
- activated ndcodex.com as the public domain endpoint
- validated production publish loop through live push/deploy cycles
- hardened mobile card rendering across feed, related objects, and mosaic view
- added mobile toggle behavior for feed search and filter controls
- formalized the go-live milestone as a canonical field log object

Operational consequences:
- posting to main now updates the public archive automatically
- release work now requires mobile QA as a mandatory gate, not a follow-up task
- version advancement now includes deployment state, not just schema and docs

No schema expansion is proposed in v2.7.
No new object type is proposed in v2.7.
