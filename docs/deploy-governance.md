# Deploy Governance

This document defines the deploy contract for humans, Carrier Pigeon, and any future publishing service.

## Canonical Truth

- `origin/main` is the only source of truth for production content, media, and deployable code.
- Production is the Netlify build of `origin/main`, not whatever happens to exist in a local checkout.
- Generated files such as `astro/public/graph.json` are derived artifacts, not authoritative source.

## Actor Rules

- Human feature work:
  Use local branches and preview deploys only.
- Human production work:
  Deploy from a clean checkout of `main` only.
- Carrier Pigeon:
  May publish content and media by committing to GitHub `main` only. It does not deploy production directly.
- Any future service:
  Must follow the same rule as Carrier Pigeon. Services may write commits to `main`; they may not become a second production deploy lane.

## Approved Lanes

- Preview lane:
  `node scripts/deploy-preview.mjs`
- Production lane:
  `node scripts/deploy-production.mjs`

These commands establish the expected split:

- preview deploys are allowed from feature branches and in-progress local work
- production publishes are allowed only from clean `main`
- the production command fetches `origin/main` and safely rebases clean, non-conflicting local publish commits when the remote moved
- the production command runs fast Astro content validation before it pushes `main`
- Netlify's Git integration performs the deploy, and the command waits for that deploy by default
- `node scripts/deploy-production.mjs --no-wait` is the explicit handoff-only variant
- local `netlify deploy --prod` is reserved for explicit recovery work, not routine publishing

## Guards

- `scripts/assert-production-deploy-safe.mjs` blocks production builds from dirty checkouts and non-`main` branches.
- `scripts/deploy-production.mjs` aborts and restores the pre-publish state if automatic synchronization encounters a rebase conflict.
- `scripts/deploy-production.mjs` rejects whitespace errors in commits that have not reached `origin/main`.
- `astro/package.json` runs that guard during production-enforced builds.
- `netlify.toml` forces the guard on the production context.
- Carrier Pigeon production publishing rejects non-`main` GitHub targets unless explicitly overridden.
- `astro/public/graph.json` is ignored and regenerated during local dev and every build so it cannot dirty or conflict with the publishing line.

## Service Contract

Any service that writes content into the archive must satisfy all of the following:

- write into the repo, never into a separate shadow store
- target `origin/main` for production publishing
- rely on Netlify's normal Git-linked production deploy path
- avoid manual or local-disk-only production deploy behavior
- treat generated outputs as rebuildable derivatives

## Incident Response

If production appears to go backward or diverge from expected content:

1. Compare local checkout state to `origin/main`.
2. Treat `origin/main` as the restore source unless there is strong evidence it is wrong.
3. Restore production from a clean worktree of `origin/main`.
4. Audit whether any manual production deploy bypassed the Git-linked content line.

## Carrier Pigeon Note

For the production site, keep:

- `PIGEON_GITHUB_BRANCH=main`
- `PIGEON_GITHUB_CONTENT_ROOT=astro/src/content`

Carrier Pigeon is a publishing service, not a parallel deploy system.
