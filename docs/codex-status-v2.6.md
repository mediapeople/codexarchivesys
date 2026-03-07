# CODEX ARCHIVE SYSTEM
## Project Status Document
### v2.6 — March 7, 2026

---

## CURRENT VERSION

**v2.6**

This document supersedes `docs/codex-status-v2.5.md` as the active status reference.

Spine remains stable.
Orientation is now optimized for fast coworker handoff.

---

## STATUS SUMMARY

```
SPEC            complete        v2.2 Master Specification
FIELD REGISTRY  complete        docs/field-registry.md
SCHEMA          complete        astro/src/content/config.ts
INTAKE PROMPT   active          docs/llm-intake-prompt.md (v2.6 orientation notes added)
ASTRO BUILD     active          feed, object pages, nexus, graph
OBJECT ARCHIVE  active          canonical objects + codex v2.6 notes
INBOX SYSTEM    active          drop/processing/needs-info/ready
RELATION ENGINE complete        astro/src/lib/relations.ts + build graph pipeline
RESPAWN CHAIN   complete        docs/respawn-system-files-v2.6.md + quickstart
DEPLOYMENT      pending         preview is local-first
```

---

## WHAT v2.6 ADDS

v2.6 is an orientation and presentation-governance release.

1. Object-first layout is now global across object pages.
2. Footer triptych (`Source`, `Object State`, `Taxonomy`) is standardized as the mega-meta zone.
3. Triptych font system is simplified into consistent label/value roles.
4. Feed now supports a second mode: `Mosaic` view (parallel to stack view).
5. Preview cards are reduced to prioritize title/excerpt over non-essential metadata.
6. Non-link boxed tags were removed from previews to reduce false affordance noise.
7. Respawn docs were advanced to v2.6 with a strict, minimal load chain.

---

## EXPANDED LEARNINGS (v2.6)

1. Presentation order is part of information architecture, not cosmetic polish.
2. If an element is non-interactive, it must not look like a control.
3. A secondary view mode is justified only when it changes reading behavior.
4. Orientation speed depends on file order and command certainty, not document volume.
5. Versioning works best when status, respawn, and object notes advance together.
6. Card UI should bias toward engagement with content, not metadata inventory.

---

## AI COWORKER ORIENTATION (FAST PATH)

Use this exact sequence when a new AI coworker joins mid-stream.

1. Confirm root:
   `/Users/nathandavis/Projects/codex-archive-mega-site`
2. Load:
   `docs/respawn-system-files-v2.6.md`
3. Then ingest in order:
   `docs/codex-status-v2.6.md` →
   `docs/field-registry.md` →
   `docs/constitutional-implementation-map.md` →
   `docs/codex_addendum_structural_metering.md` →
   `docs/llm-intake-prompt.md` →
   `docs/phase-1-orientation.md`
4. Resume from current git state without reverting unrelated changes.

---

## IMMEDIATE NEXT MOVES

### 1) Publish a short design governance note for feed modes

Document when to use stack vs mosaic and which content signals should be visible in each.

### 2) Add link behavior for taxonomy tags where useful

If tags remain non-linking in a context, keep them de-emphasized and never chip-boxed.

### 3) Continue real inbox intake runs

Run intake on fresh material and record where prompt/schema friction still appears.

### 4) Keep respawn docs current by version

On each significant change: update status + respawn files in the same pass.

---

## v2.6 DONE CONDITION

- `docs/codex-status-v2.6.md` exists and is current.
- `docs/respawn-system-files-v2.6.md` exists and is current.
- `docs/respawn-quickstart.md` points to v2.6 chain.
- `codex-archive-system-v2-6-notes` is present in canonical object stores.
- Validation and build pass.
