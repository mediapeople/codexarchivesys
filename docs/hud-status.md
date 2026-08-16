# HUD Product Status

## Current State

The HUD is an active research surface. It is not retired, but it is not yet part of the public reading contract for ndcodex.

The underlying instrument remains valuable: it can expose structure, consequence, lineage, field state, and object-specific sidecar data. Its public purpose and interaction model still need refinement before the surface will make dependable sense to a general reader.

## Public Contract

- The normal object or Codex page is the canonical public reading surface.
- Ordinary public pages do not advertise or link to the HUD.
- HUD pages are `noindex, nofollow` and stay out of the sitemap.
- Direct access remains available to an operator or collaborator who intentionally opens `/objects/{slug}/hud`.
- The HUD must not become a required step for reading, understanding, or sharing an archive object.

## Route Contract

- Canonical experimental route: `/objects/{slug}/hud`
- Legacy alias: `/codex/{slug}/hud`
- Legacy alias: `/codex/{slug}/plate`

The two Codex aliases redirect to the canonical experimental route. They are retained for compatibility, not generated as separate copies of the HUD.

## What Remains Valuable

- the `FieldSurface` instrument and its consequence-first layout
- source-first operation when no sidecar data exists
- packet, mythmech, respawn, plate-prompt, and marginalia inputs
- direct operator access for evaluation and refinement
- the possibility of a future inspect mode that earns a clear public role

## Reactivation Criteria

Public links should return only after an explicit review confirms that:

1. A reader can understand why the HUD exists before opening it.
2. The HUD adds meaning that the normal reading page cannot provide more clearly.
3. Empty or source-first states are intentional and legible, not merely technically available.
4. Mobile behavior, accessibility, terminology, and exit paths are coherent.
5. The feature has a stable name and is no longer relying on internal product language to explain itself.

Until then, preserve the instrument, keep it directly testable, and keep the public archive centered on the reading surface.
