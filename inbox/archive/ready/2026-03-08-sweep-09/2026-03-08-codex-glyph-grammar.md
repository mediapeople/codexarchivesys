---
id: codex-glyph-grammar
type: codex
title: "Codex Glyph Grammar: Symbol Generation Rules"
date: 2026-03-08
status: draft
visibility: public

excerpt: "Object metadata becomes visual structure."

themes:
  - systems
  - architecture
  - methodology
  - structure
  - signal

related:
  - codex-glyph-system-first-emergence
  - codex-archive-system-v3-plus-notes
  - the-bones-hold-content-architecture
  - steel-elbow-flinchian

media: []

version: "0.1.0"
scope: "glyph generation rules, metadata mapping, and deterministic symbol output"
systemArea: "identity"
changeType: initial
dependencies:
  - codex-glyph-system-first-emergence
---

This document defines the symbolic grammar used to generate Codex glyphs.

## Principle

Objects generate symbols.

front matter -> parameters -> glyph

## Base Geometry by Object Type

signal -> burst / rays / spark geometry
scroll -> spiral / unfolding paths
artifact -> shards / planes
fragment -> seed / broken loop
fieldlog -> measured marks
codex -> grid / frame / reference spine
nexus -> clustered orbit / relational ring

## Theme Modifiers

Themes modify base geometry.

fire -> angular sparks
water -> curved flows
signal -> node clusters
recursion -> spiral emphasis
city -> rectilinear grid bias
forest -> branching organic bias
grief -> interrupted lines

## Status Modifiers

draft -> partial closure
review -> balanced tension
published -> stabilized geometry
archived -> dimmed enclosure

## Deterministic Seed

Glyph variation derives from a deterministic seed.

seed = hash(object id)

This ensures the same object always produces the same glyph.

## Output

Current flow produces:

- hero glyph SVG

The same seed can later drive icon and monochrome variants without changing the object's mark.

## Application in Flow

1. Draft the object in `inbox/ready/`.
2. Generate the glyph from the draft metadata:

   `node scripts/generate-codex-glyph.mjs --source inbox/ready/<file>.md`

3. Add the emitted `/media/...svg` path to the object's `media` block when the glyph should ship with the post.
4. After review and explicit approval, publish through the normal hand-off:

   `node scripts/finalize-approved-ready.mjs --source inbox/ready/<file>.md --note "<approval reason>"`

The Codex becomes a system where each object bears a symbolic mark.

---

## INTAKE NOTES

**Suggested type:** codex  
**Confidence:** high

**Excerpt source:** drawn from body  
**Excerpt note:** The line already states the governing rule in the document's own register and functions as both excerpt and design thesis.

**Theme notes:** `methodology` and `architecture` fit the rule-set character of the document; `systems`, `structure`, and `signal` cover the metadata-to-form logic and the archive-linking purpose.

**Constellation notes:** No active constellation applies. This is a build specification, not a pressure sequence or artifact lineage.

**Suggested new fields flagged:** no

**Media notes:**
- Primary source text: `inbox/drop/codex_glyph_system_inbox_bundle/codex-glyph-grammar.md`
- Supporting source text: `inbox/drop/codex_glyph_system_inbox_bundle/codex-glyph-system-origin.md`
- No source media shipped in the inbox bundle; the generated glyph asset is attached to the paired emergence post instead of this specification.

**Ambiguities for human review:**
  - The raw source used non-active object naming (`loremap`, `field-log`, `active`, `wip`, `inbox`). This draft normalizes the grammar to the current archive schema so it can operate as a live system document.
  - The raw source included theme modifiers (`fire`, `water`, `recursion`, `city`, `forest`, `grief`) outside the active content-theme registry; they are retained here as glyph-generation parameters, not published object themes.
  - Confirm whether `review` and `archived` should remain explicit glyph states if the visual system later distinguishes only live render surfaces.

**Suggested related objects (by description, not id):**
  - The paired emergence post that announces the archive becoming a symbolic system.
  - The codex document that treats field mapping as a structural contract.
  - The codex build notes governing the current archive runtime.
  - The scroll whose Flinch Combustion Grid currently acts as the first visible glyph reference.
