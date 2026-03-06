# Codex Work Order
Date: 2026-03-06
Owner: Nathan
Project Root: `/Users/nathandavis/Projects/codex-archive-mega-site`

## Situation Snapshot

- Astro MVP is running from non-iCloud path.
- Current object count: 19 (7 original + 12 draft batch).
- Current routes: feed, object pages, nexus index/reader, graph.
- Validation/build status: passing.
- Latest commit: `fba6bab` (12-object draft variety batch synced).

## Objective (Current Sprint)

Move from "working MVP" to "reviewed MVP ready for first public deploy."

## Work Order (Priority Sequence)

### P0 — Curatorial Review Pass (Required First)

Goal: reduce disorientation by locking the content baseline.

Tasks:
- Review all 12 newly generated draft objects in `objects/`.
- For each object, choose one: `keep`, `edit`, or `drop`.
- For kept objects, confirm:
  - excerpt quality
  - themes are accurate
  - at least one meaningful cross-type relation
  - constellation usage is intentional
- Keep status `draft` until reviewed.

Deliverable:
- Reviewed object set with clear keep/edit/drop decisions.

### P1 — Intake Reality Check (3 Real Inputs)

Goal: validate the "LLM-assisted, human-governed" workflow with real material.

Tasks:
- Put 3 real source items into `inbox/drop/`.
- Run intake prompt process manually for each.
- Move outcomes through `processing` -> `ready` or `needs-info`.
- Port only approved items into `objects/` and `astro/src/content/`.

Deliverable:
- 3 real intake runs documented, with at least 1 approved item added.

### P2 — Structural Health + Logs

Goal: keep doctrine measurable.

Tasks:
- Run validation and log generation after each review batch.
- Regenerate graph JSON.
- Confirm no broken links/ids.

Commands:

```bash
cd "/Users/nathandavis/Projects/codex-archive-mega-site"
node scripts/validate-objects.mjs objects
node scripts/generate-codex-log.mjs objects $(date +%F)
node scripts/generate-graph-json.mjs objects astro/public/graph.json
cd astro && npm run build
```

Deliverable:
- Clean validation, updated codex log, updated graph data, passing build.

### P3 — Deployment Readiness

Goal: be one click away from publish.

Tasks:
- Add remote and push `main`.
- Choose host (Netlify recommended).
- Connect repo and run first preview deploy.
- Verify routes:
  - `/`
  - `/nexus`
  - `/nexus/signal-descent-002`
  - `/graph`
  - representative `/objects/*` pages

Commands:

```bash
cd "/Users/nathandavis/Projects/codex-archive-mega-site"
git remote add origin <REPO_URL>
git push -u origin main
```

Deliverable:
- Live preview URL with full route smoke test complete.

## Definition of Done (This Work Order)

- Curated object set is reviewed and coherent.
- Intake process has been tested with real material.
- Validation/log/graph/build all pass.
- Repo is pushed and deploy preview is live.

## Immediate Start (Next 30 Minutes)

1. Review these first 6 drafts (fast pass):
   - `pressure-psalm-v`
   - `maintenance-without-cure`
   - `deck-under-load-ii`
   - `north-georgia-week-2`
   - `systems-survive-tuesdays`
   - `signal-descent-002`
2. Mark each keep/edit/drop in one line.
3. Run validation + build.

