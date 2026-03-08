---
id: codex-glyph-grammar
type: codex
title: "Codex Glyph Grammar: Symbol Generation Rules"
date: 2026-03-08
postedAt: 2026-03-08T23:35:21.209Z
status: published
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
