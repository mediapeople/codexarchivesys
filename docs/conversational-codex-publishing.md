# Conversational Codex Publishing

## Desired Experience

The operator should be able to say:

> Post this to ndcodex.

When “this” is unambiguous, that sentence is the editorial approval and the production request. The publishing coworker should not turn it into a checklist for the operator.

## Coworker Contract

1. Read the named source completely.
2. Preserve the author's wording and rhythm unless a rewrite is requested.
3. Supply clean archive metadata, a stable slug, summary, excerpt, and source reference.
4. Write exactly one public Codex Markdown entry, plus only the explicitly required media or sidecars.
5. Use the dedicated fast lane.
6. Return the canonical URL as soon as `origin/main` accepts the commit.
7. Say `queued` until Netlify reports the deploy live; do not imply that a just-pushed URL is already serving the new commit.

The operator does not need to choose between Git, Astro, or Netlify steps. Those are implementation details of the lane.

## Command

```bash
./scripts/publish-codex.mjs \
  --file astro/src/content/codex/<slug>.md
```

Related assets are always explicit:

```bash
./scripts/publish-codex.mjs \
  --file astro/src/content/codex/<slug>.md \
  --include astro/public/media/<asset>
```

Add `--wait` only when the same command must remain attached until Netlify marks production ready.

## Safety Contract

The command:

- runs only on `main`;
- accepts one primary file directly inside `astro/src/content/codex/`;
- requires `type: codex`, `status: published`, and `visibility: public`;
- refuses working-tree changes outside the explicitly named paths;
- runs Astro content validation before committing;
- audits every referenced delivery asset before committing;
- automatically optimizes explicitly included JPEG, PNG, WebP, and MP4 assets when they exceed delivery limits;
- rejects camera-native HEIC/HEIF and MOV files, mismatched extensions, oversized assets, and images over the pixel budget;
- checks the staged diff for whitespace errors;
- commits the named files only;
- uses the guarded `origin/main` production lane;
- never invokes a manual Netlify production deploy.

If validation or the production handoff fails, the command stops and states whether a local commit was already created. It never hides unrelated work inside a post commit.

## Rendering Contract

Public post pages remain prerendered static HTML. Machine-readable JSON and Markdown exports, plus the unlinked experimental HUD, render on demand and use Netlify's deploy-scoped durable cache. This avoids rebuilding three collection-wide derivative route families for every new post while preserving their URLs and access rules.

The HUD remains `noindex, nofollow` and absent from public reading navigation.

## Media Delivery Budget

Source captures stay in intake/archive storage. Public pages receive derivatives under `astro/public/media/`.

| Asset | Target | Hard publish limit |
| --- | ---: | ---: |
| JPEG, PNG, WebP, GIF | 750 KiB | 2 MiB and 2400px long edge |
| SVG | compact source | 256 KiB |
| MP4 | 10 MiB | 20 MiB |

- Use JPEG for photographic work when transparency is not required.
- Use PNG only when transparency or crisp lossless line work materially matters.
- Use WebP when it produces a smaller appropriate delivery asset without compromising the archive's source workflow.
- Use MP4 with web streaming metadata; never publish MOV directly.
- Give content-bearing images meaningful alt text. Empty alt text is reserved for genuinely decorative images.
- Preserve originals outside the public delivery tree; optimization should operate on derivatives.

Audit the entire current library without changing it:

```bash
./scripts/check-publish-media.mjs --all
```

New conversational posts use the strict version automatically for every referenced or included media file.

## Carrier Pigeon Parity

The same boundary applies to `/pigeon` and `/api/pigeon` uploads:

- at most 8 images and 50 MiB of source images per post;
- at most 25 MiB per source image;
- JPEG and HEIC/HEIF sources become optimized JPEG derivatives;
- PNG, WebP, and still GIF sources become optimized WebP derivatives;
- animated GIF is accepted only when it already fits the delivery budget; otherwise use MP4;
- delivery images finish at or below 2400px long edge and 2 MiB;
- capture dimensions, time, camera, and location can be recorded in archive metadata, while EXIF—including GPS—is stripped from the public derivative.

Carrier Pigeon commits only the derivative to `astro/public/media/`. The original remains in the operator's source system or intake archive; it is not made public by the upload endpoint.

For the hosted `/pigeon` route, the phone app also compresses the complete multipart image set toward a 3.6 MiB request budget before transmission. This stays below Netlify's effective binary Function request ceiling while leaving room for the note and multipart framing. Local Pigeon can accept the larger source limits above because it does not cross that hosted request boundary.
