# Garage Dispatch Media Mapping

Date: 2026-03-11

Issue:
- The raw garage dispatch markdown references synthetic publish filenames rather than the actual dropped HEIC files.
- The drop contains 16 HEIC captures, while the current ready draft maps 9 of them to verified scenes.

Mapped into `inbox/ready/2026-03-11-garage-dispatch-001.md`:
- `IMG_3038.HEIC` -> `/media/artifacts/garage-dispatch-001-1.jpg`
- `IMG_3032.HEIC` -> `/media/artifacts/garage-dispatch-001-2.jpg`
- `IMG_3039.HEIC` -> `/media/artifacts/garage-dispatch-001-3.jpg`
- `IMG_3046.HEIC` -> `/media/artifacts/garage-dispatch-001-4.jpg`
- `IMG_3040.HEIC` -> `/media/artifacts/garage-dispatch-001-5.jpg`
- `IMG_3043.HEIC` -> `/media/artifacts/garage-dispatch-001-6.jpg`
- `tryptich/IMG_3050.HEIC` -> `/media/artifacts/garage-dispatch-001-7.jpg`
- `tryptich/IMG_3051.HEIC` -> `/media/artifacts/garage-dispatch-001-8.jpg`
- `tryptich/IMG_3053.HEIC` -> `/media/artifacts/garage-dispatch-001-9.jpg`

Unslotted captures:
- `IMG_3033.HEIC`
- `IMG_3036.HEIC`
- `IMG_3041.HEIC`
- `IMG_3042.HEIC`
- `IMG_3044.HEIC`
- `IMG_3047.HEIC`
- `IMG_3048.HEIC`

Questions for review:
- Should the remaining captures extend the current garage dispatch gallery, or become separate artifact drafts?
- Do you want one-to-one parity with the original 14-slot manifest, or a leaner curated gallery built only from verified mappings?
- If this batch moves toward publish, confirm the final `HEIC -> JPG` conversion order before running `scripts/optimize-media-assets.mjs`.
