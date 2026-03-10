# CODEX ARCHIVE SYSTEM
## Project Status Document
### v3.7.0 - March 9, 2026

---

## CURRENT VERSION

**v3.7.0**

This document supersedes `docs/codex-status-v2.7.md` as the active status reference.

Spine remains stable.
Operations now include explicit connection surfacing and place-aware object modeling through `loremap`.

---

## STATUS SUMMARY

```
SPEC            complete        v2.2 Master Specification
FIELD REGISTRY  complete        docs/field-registry.md
SCHEMA          complete        astro/src/content/config.ts + loremap + universal place fields
INTAKE PROMPT   active          docs/llm-intake-prompt.md + docs/fragment-optimal-ingest-form.md
ASTRO BUILD     active          feed, object pages, nexus, graph, orientation
OBJECT ARCHIVE  active          canonical objects + codex release chain through v3.7 loremap foundation
INBOX SYSTEM    active          drop/processing/needs-info/ready
RELATION ENGINE complete        astro/src/lib/relations.ts + build graph pipeline
RESPAWN CHAIN   complete        docs/respawn-system-files-v3.md + quickstart
DEPLOYMENT      live            ndcodex.com on Netlify (GitHub-linked deploys)
```

---

## WHAT v3+ ADDS

v3+ extends the v3 ingest discipline with presentation-runtime hardening.

1. Canonical release object added:
   - `codex-archive-system-v3-plus-notes`
2. WIP/revision intake guidance now requires linking to newest relevant updates.
3. WIP/revision artifact graph now includes reciprocal links to current release notes.
4. Promotion flow now explicitly supports media normalization from capture formats (e.g., HEIC -> JPG).
5. Status and respawn references advanced to a v3 chain in one pass.
6. Media slimming workflow is now documented and repeatable via `scripts/optimize-media-assets.mjs`.
7. Object pages now emit type-aware share metadata (Open Graph + Twitter + canonical).
8. Fallback social image is now explicit for no-media pages: `/social/ndcodex-minimal-og.png`.
9. Favicon set was refreshed to a minimal codex mark.
10. Object-page images are now clickable and expandable for fullscreen inspection.
11. Explicit `connections` now support authored lineage and inline connected-context rendering.
12. Place-aware work now has a first-class lane via `loremap`, plus universal `location`, `geo`, and `terrain`.

---

## RUNTIME POLISH ADDENDUM (March 7, 2026 — late pass)

1. Feed hero rendering moved from local container treatment to full-bleed/global layering.
2. Large linework motif now persists behind page sections (no hero clipping).
3. Feed `Archive Pulse` panel now uses restrained glass treatment (transparent blur + subtle highlight).
4. Graph page supporting labels were brightened for readability on textured dark backgrounds.
5. Object metadata expression was tightened: verbose source bio moved out of object footers.
6. Orientation page now carries the expanded operator bio and external source links.
7. Inbox drop hygiene pass completed:
   - processed source payloads archived under `inbox/archive/drop/2026-03-07-sweep-01`
   - active `inbox/drop/` reset for next intake cycle

---

## BUILD PATCH ADDENDUM (March 8, 2026 — v3.1.1)

1. Canonical patch-level release object added:
   - `codex-archive-system-v3-1-build-notes`
2. Mobile viewport overflow containment now explicitly handled for feed + graph small-screen sessions.
3. Feed atlas/footer label contrast adjusted for legibility on dark textured surfaces.
4. Inbox post-publish cleanup is now scriptable via:
   - `node scripts/finalize-approved-ready.mjs`
   - `node scripts/promote-ready.mjs`
   - `node scripts/reconcile-inbox.mjs`
   - `node scripts/cleanup-inbox-drop.mjs --auto-published`
   - `node scripts/cleanup-inbox-drop.mjs ...`
   - cleanup audit logs:
     - `inbox/archive/ready/cleanup-log.ndjson`
     - `inbox/archive/drop/cleanup-log.ndjson`
5. Update-note convention added for operator scan speed:
   - every codex update post must include one short `Operator value prop` line
   - every work chunk in that post must include a short `Value prop` phrase

---

## FRAGMENT FEED ADDENDUM (March 8, 2026 — v3.2.0)

1. Canonical release object added:
   - `codex-archive-system-v3-2-fragment-feed-notes`
2. Fragments now publish in the feed as direct communication rather than generic teaser cards.
3. Feed fragments now use a dedicated interlude renderer with natural height and quiet footer labeling.
4. Prompt/return exchanges now preview as readable `Prompt` and `Return` contact.
5. Conversational fragment measure was widened so system returns do not collapse into narrow vertical stacks.
6. Dedicated fragment ingest guidance now exists at:
   - `docs/fragment-optimal-ingest-form.md`

---

## MODEST TABLE ADDENDUM (March 8, 2026 — v3.3.0)

1. Canonical release object added:
   - `codex-archive-system-v3-3-modest-table-notes`
2. Image-backed feed and related cards now present objects on a contained specimen stage instead of hard crops.
3. The table/image surface now has its own lightbox path while the rest of the card remains the canonical post link.
4. Mobile lightbox interaction now uses a cleaner touch tray with larger controls and shorter CTA copy.
5. Mobile table staging now gives raw camera-native objects more top/bottom breathing room.

---

## IMAGE EXPERIENCE ADDENDUM (March 8, 2026 — v3.4.0)

1. Canonical release object added:
   - `codex-archive-system-v3-4-image-experience-notes`
2. Image handling moved from simple expand-on-click to full gallery continuity across object pages.
3. Media surfaces now preserve relation between lead and supporting images more consistently on smaller screens.
4. Reading rhythm around image-backed objects was loosened so inspection does not collapse the surrounding copy.

---

## CONTROL SURFACE ADDENDUM (March 8, 2026 — v3.5.0)

1. Canonical release object added:
   - `codex-archive-system-v3-5-control-surface-notes`
2. Feed search and filter controls now share one collapse/open behavior across desktop and mobile.
3. Collapsed controls now report active query state instead of hiding it.
4. Header conceal/reveal rhythm and top-edge fade were tightened into one coherent viewing behavior.

---

## READING SURFACE ADDENDUM (March 8, 2026 — v3.6.0)

1. Canonical release object added:
   - `codex-archive-system-v3-6-reading-surface-notes`
2. Hero headings, longform object titles, and paragraph measure were normalized across major reading surfaces.
3. Feed cards now hold two-column reading longer before collapsing.
4. Section-head cadence now leaves clearer room beneath `h2` markers for sustained reading.

---

## CONNECTED CONTEXT + LOREMAP FOUNDATION ADDENDUM (March 9, 2026 — v3.7.0)

1. Canonical release object added:
   - `codex-archive-system-v3-7-loremap-foundation-notes`
2. Explicit `connections` are now first-class schema fields and render above generic `related` stacks on object pages.
3. `loremap` is now a first-class object type rather than borrowed `scroll` semantics for place-primary work.
4. Universal place fields now exist:
   - `location`
   - `geo`
   - `terrain`
5. Feed filters, related/feed cards, orientation type definitions, and the orientation field-contract surface now reflect the new type.
6. `suwanee-ga-loremap` was migrated into the new collection as the first canonical loremap.
7. Loremap objects now carry a dedicated atlas/header treatment and lighter field-reading rhythms for sectioned geo-mythic text.

---

## EXPANDED LEARNINGS (v3+)

1. Ingest quality is relation quality; a clean object with weak links is still under-indexed.
2. WIP objects need temporal context links to stay useful after subsequent releases.
3. Media normalization should happen at promotion time, not deferred.
4. Release-note updates should ingest operational learnings immediately, while context is fresh.
5. Version moves are safer when status docs, respawn docs, and canonical release objects advance together.
6. Camera-native assets must be compressed before publish; web compatibility is insufficient without payload control.
7. Social cards need deterministic fallback behavior to avoid crawler ambiguity.
8. Media-rich objects require inspectability as a first-class reading behavior.
9. When object lineage is explicit, it should surface as explicit context rather than getting buried in generic relation stacks.
10. Place-primary work becomes cleaner when terrain is modeled as structure, not implied inside prose alone.

---

## MEDIA HANDLING NOTES (v3+)

1. Image handling (current default):
   - Convert HEIC to JPG at ingest/promotion time.
   - Resize to max long edge (`2400px`) and recompress for delivery.
2. Video handling (current default):
   - Convert MOV to MP4 before publish.
   - Prefer medium-quality transcode preset for balance between fidelity and size.
3. Source preservation:
   - Keep original capture files in `inbox/drop/` during active intake.
   - After promotion, move them to `inbox/archive/drop/<dated-sweep>/`.
   - Publish optimized derivatives in `astro/public/media/`.
4. Operational command:
   - `node scripts/optimize-media-assets.mjs <file> [file...]`
5. Sharing fallback:
   - Use a lightweight default social image for pages without object media.

---

## AI COWORKER ORIENTATION (FAST PATH)

Use this exact sequence when a new AI coworker joins mid-stream.

1. Confirm root:
   `/Users/nathandavis/Projects/codex-archive-mega-site`
2. Load:
   `docs/respawn-system-files-v3.md`
3. Then ingest in order:
   `docs/codex-status-v3.md` ->
   `docs/field-registry.md` ->
   `docs/constitutional-implementation-map.md` ->
   `docs/codex_addendum_structural_metering.md` ->
   `docs/llm-intake-prompt.md` ->
   `docs/phase-1-orientation.md`
4. Resume from current git state without reverting unrelated changes.

---

## IMMEDIATE NEXT MOVES

### 1) Run the next real loremap through the new lane

Use the next place-primary archive object to verify `loremap` ingest, place fields, and relationship surfacing under real load.

### 2) Seed explicit connections where lineage is already known

Prefer authored `connections` for version chains, WIP -> evolution -> final artifact chains, and public/internal doctrine pairs.

### 3) Decide how far to automate loremap HUD media

The schema and first reading surface are live; next decision is whether loremap HUD thumbs become generated media or stay optional/operator-authored.

### 4) Keep version references synchronized

Advance status + respawn + current release object in the same commit when versioning.

### 5) Keep the active inbox honest

Archive promoted ready drafts out of `inbox/ready` so the operator sees real pending review need.
Operator shorthand: `keeping the beast fed :) and not chewing cud`

### 6) Activate promotion cleanly

Use conversation + explicit operator confirmation as the approval point, then hand the rest to:
- `node scripts/finalize-approved-ready.mjs --source <ready-draft> --note "<approval reason>"`

Low-level promotion remains available, but the intended flow is:
- human talks through draft
- human confirms
- AI/system runs promotion, reconciliation, cleanup, validation, and build

The approval record remains durable in `logs/promotion-log.ndjson`.

---

## v3+ DONE CONDITION

- `docs/codex-status-v3.md` exists and is current.
- `docs/respawn-system-files-v3.md` exists and is current.
- `docs/respawn-quickstart.md` points to v3 chain.
- `codex-archive-system-v3-7-loremap-foundation-notes` is present in canonical object stores.
- Validation and build pass.
