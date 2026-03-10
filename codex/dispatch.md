# Codex Archive - Dispatch
Date: 2026-03-10

Read this file first when the task is clearly one of these:
- ingest
- publishing
- dev

## Always True
- Objects are the primary reading surface.
- `inbox/drop` = raw source.
- `inbox/ready` = drafted, awaiting decision.
- `objects/` and `astro/src/content/` = canonical publish state.
- Do not publish without explicit operator approval.
- Do not change schema without explicit operator approval.

## Ingest
Goal: move source from `inbox/drop` to a clean draft in `inbox/ready`.

Do:
- inspect `inbox/drop`
- draft metadata and body in `inbox/ready`
- use `INTAKE_TEMPLATE.md`
- flag unclear material in `inbox/needs-info`

Do not:
- publish
- promote
- reconcile
- finalize

Useful files:
- `INTAKE_TEMPLATE.md`
- `codex/pipeline.md`
- `scripts/prepare-ready.mjs`

Command:
```bash
find inbox/drop -maxdepth 2 -type f | sort
```

## Publishing
Goal: move approved ready drafts into canonical publish state and verify the site builds.

Do:
- confirm explicit operator approval
- run finalize on approved drafts
- let the pipeline promote, reconcile, clean up, validate, and build

Do not:
- publish unapproved drafts
- batch publish without explicit batch approval

Useful files:
- `README.md`
- `codex/pipeline.md`
- `scripts/finalize-approved-ready.mjs`
- `scripts/promote-ready.mjs`

Command:
```bash
node scripts/finalize-approved-ready.mjs --source inbox/ready/<file>.md --note "Operator approved for publish"
```

## Dev
Goal: work on the Astro app, presentation layer, archive logic, or supporting scripts.

App cues:
- `astro/src/pages/index.astro` = feed
- `astro/src/pages/objects/[id].astro` = canonical object page
- `astro/src/content/config.ts` = schema
- `astro/src/lib/archive.ts` = collection loading
- `astro/src/lib/relations.ts` = related-object logic

Command:
```bash
cd astro
npm run dev
```

## If More Context Is Needed
Read:
1. `codex/root.md`
2. `codex/system.md`
3. `codex/pipeline.md`
4. `codex/current.md`
5. `codex/respawn.md`

## Starter Prompt
```text
Read /Users/nathandavis/Projects/codex-archive-mega-site/codex/dispatch.md and orient to <INGEST|PUBLISHING|DEV> only. Summarize scope, boundaries, exact commands, and next actions. Do not cross into other modes unless I ask.
```
