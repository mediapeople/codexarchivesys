# Publishing Process Review — 2026-08-16

## Trigger

Publishing `The Instantiation of Dog` exposed three useful conditions:

1. `origin/main` advanced while a local publish commit was being prepared.
2. A full local build regenerated legacy HUD and plate copies for every published object.
3. The production handoff succeeded quickly, but the Git-linked Netlify build required another five minutes before the canonical URL became live.

## Measured Baseline

- Fast Astro content sync: 1.65–1.90 seconds
- Full local build before route cleanup: 175.59 seconds
- Git-linked Netlify production deploy: 5 minutes 2 seconds
- Generated local `dist`: approximately 368 MB
- Media inside `dist`: approximately 322 MB
- Published object set during the review: approximately 260 objects

The dominant local build cost was collection-wide static route fan-out. Each generator that rendered every published object cost roughly 26–30 seconds.

## Changes Made

### Production command

`node scripts/deploy-production.mjs` now:

1. requires a clean `main` checkout;
2. fetches `origin/main`;
3. automatically rebases clean, non-conflicting local publish commits when the remote moved;
4. aborts and restores the pre-publish state if that rebase conflicts;
5. rejects whitespace errors in commits not yet on `origin/main`;
6. runs fast Astro content validation;
7. pushes `main` through the existing Git-linked production lane;
8. waits for the Netlify deploy by default.

`--no-wait` preserves an explicit handoff-only mode.

### HUD route fan-out

- Removed the separately generated `/codex/{slug}/hud` copy.
- Removed the byte-identical `/codex/{slug}/plate` copy.
- Preserved both paths as Netlify redirects to `/objects/{slug}/hud`.
- Preserved the canonical HUD implementation for direct research access.
- Removed HUD links from public reading templates.
- Marked the HUD surface `noindex, nofollow`.

## Measured Result

- Full local build after route cleanup: 125.46 seconds
- Time removed: 50.13 seconds
- Improvement: 28.6%
- Canonical HUD pages generated per build: approximately 260
- Legacy Codex HUD and plate copies generated per build: zero

## Current Publish Contract

For routine human publishing:

```bash
node scripts/deploy-production.mjs
```

For a fast local content check without a full static build:

```bash
cd astro
npm run validate:content
```

The full build still runs in GitHub Actions and Netlify. Local publishing uses the fast validation path so the same content-only work is not blocked on two consecutive full builds.

## Deferred Optimization Candidates

These are evidence-backed candidates, not approved changes:

1. Generate HUD pages only for an explicit research allowlist or objects with inspect sidecars. This could remove another collection-wide generator, but it would end direct source-first HUD access for arbitrary objects.
2. Re-evaluate whether both per-object JSON and Markdown exports must be prerendered. Each export family currently costs roughly one collection-wide pass.
3. Decide whether GitHub Actions should repeat the full build on every `main` push when Netlify already performs the authoritative production build. Keeping both improves independent failure detection but duplicates compute.
4. Audit media payloads separately. Media dominates output size, but it was not the dominant static route-generation cost measured in this review.
5. Revisit universal `/objects/{id}` compatibility pages only after the canonical URL contract for every object type is explicit.

## Decision Rule

Optimize aliases and duplicated derivations first. Preserve canonical objects, public URLs, export contracts, and experimental instruments until a separate product decision explicitly changes them.
