# CODEX ARCHIVE SYSTEM
## Project Status Document
### v2.7 - March 7, 2026

---

## CURRENT VERSION

**v2.7**

This document supersedes `docs/codex-status-v2.6.md` as the active status reference.

Spine remains stable.
System is now live in public runtime.

---

## STATUS SUMMARY

```
SPEC            complete        v2.2 Master Specification
FIELD REGISTRY  complete        docs/field-registry.md
SCHEMA          complete        astro/src/content/config.ts
INTAKE PROMPT   active          docs/llm-intake-prompt.md (v2.7 preflight refs)
ASTRO BUILD     active          feed, object pages, nexus, graph
OBJECT ARCHIVE  active          canonical objects + codex v2.7 notes + go-live milestone
INBOX SYSTEM    active          drop/processing/needs-info/ready
RELATION ENGINE complete        astro/src/lib/relations.ts + build graph pipeline
RESPAWN CHAIN   complete        docs/respawn-system-files-v2.7.md + quickstart
DEPLOYMENT      live            ndcodex.com on Netlify (GitHub-linked deploys)
```

---

## WHAT v2.7 ADDS

v2.7 is a production launch and mobile resilience release.

1. Public deployment is live on `ndcodex.com`.
2. GitHub push-to-deploy path is active for production updates.
3. Feed and object related cards were hardened for mobile rendering stability.
4. Mosaic and cross-card mobile layout behavior was normalized.
5. Feed controls now support mobile toggle behavior for search and filters.
6. Canonical release objects added:
   - `codex-archive-system-v2-7-notes`
   - `go-live-milestone`
7. Respawn/status references advanced to v2.7.

---

## EXPANDED LEARNINGS (v2.7)

1. Deployment state is part of system state and must be versioned.
2. Mobile QA is release-critical, not post-release polish.
3. Hosting and DNS transition work must be logged as first-class archive events.
4. A release is complete only when docs, objects, and runtime all align.
5. Fast rollback and fast patch loops matter more after go-live than before.

---

## AI COWORKER ORIENTATION (FAST PATH)

Use this exact sequence when a new AI coworker joins mid-stream.

1. Confirm root:
   `/Users/nathandavis/Projects/codex-archive-mega-site`
2. Load:
   `docs/respawn-system-files-v2.7.md`
3. Then ingest in order:
   `docs/codex-status-v2.7.md` ->
   `docs/field-registry.md` ->
   `docs/constitutional-implementation-map.md` ->
   `docs/codex_addendum_structural_metering.md` ->
   `docs/llm-intake-prompt.md` ->
   `docs/phase-1-orientation.md`
4. Resume from current git state without reverting unrelated changes.

---

## IMMEDIATE NEXT MOVES

### 1) Add post-deploy monitoring notes

Record runtime checks for uptime, asset loading, and publish latency.

### 2) Add release checklist gate for mobile

Require iPhone and narrow-width QA before each production push.

### 3) Continue inbox intake as live cadence

Promote new archive objects while keeping status and respawn docs aligned.

### 4) Keep version references synchronized

Advance status + respawn + current release object in the same commit when versioning.

---

## v2.7 DONE CONDITION

- `docs/codex-status-v2.7.md` exists and is current.
- `docs/respawn-system-files-v2.7.md` exists and is current.
- `docs/respawn-quickstart.md` points to v2.7 chain.
- `codex-archive-system-v2-7-notes` is present in canonical object stores.
- `go-live-milestone` is present in canonical object stores.
- Validation and build pass.
