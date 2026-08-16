# Media Delivery Status

Date: 2026-08-16

## Product Status

The ndcodex media delivery boundary is active for all new publication lanes:

- conversational Codex publishing;
- Carrier Pigeon phone/API uploads;
- approved ready-draft promotion.

Source captures and public delivery assets are different things. HEIC/HEIF, MOV, full-resolution camera originals, and metadata-rich captures remain in source/intake storage. Public pages receive optimized derivatives under `astro/public/media/`.

## Active Budget

| Asset | Target | Hard publish limit |
| --- | ---: | ---: |
| JPEG, PNG, WebP, GIF | 750 KiB | 2 MiB and 2400px long edge |
| SVG | compact source | 256 KiB |
| MP4 | 10 MiB | 20 MiB |

New work is blocked when it remains outside the hard limit. Fixable explicitly included images are optimized before the block is evaluated.

## Carrier Pigeon

Carrier Pigeon normalizes uploads in memory before it writes locally or commits through GitHub:

- JPEG and HEIC/HEIF source → JPEG derivative;
- PNG, WebP, and still GIF source → WebP derivative;
- animated GIF → preserved only if already inside budget, otherwise rejected in favor of MP4;
- EXIF capture facts → retained in archive metadata when readable;
- public file EXIF/GPS → stripped from the derivative.

The endpoint accepts no more than 8 images, 25 MiB per source image, or 50 MiB total source images per post.

The hosted phone app applies an additional transport budget: it adaptively compresses the complete image set toward 3.6 MiB before transmission. This is separate from the final 2 MiB-per-image public derivative budget and exists to keep the multipart request below Netlify's effective binary Function request ceiling.

## Legacy Baseline

The first read-only audit inspected 229 existing delivery assets. It found 29 files with 32 hard policy issues and 124 target-size warnings.

Historical files are not silently recompressed. Art and image-heavy objects need a visual review after any lossy conversion, so the backlog should be reduced in bounded batches with before/after verification.

Run a read-only audit:

```bash
./scripts/check-publish-media.mjs --all
```

Run a strict check for selected delivery derivatives:

```bash
./scripts/check-publish-media.mjs --strict astro/public/media/<asset>
```

Use `--fix` only on public derivatives whose source original is preserved elsewhere.
