---
id: codex-glyph-grammar
type: scroll
title: "Codex Glyph Grammar — Symbol Generation Rules"
date: 2026-03-08
status: draft
visibility: internal

excerpt: "Rules for generating Codex glyphs from object metadata."

themes:
  - codex-architecture
  - symbolic-language
  - glyph-system

related:
  - codex-glyph-system-origin
  - codex-glyph-generator-expansion

media: []
bodyClass: prose
---

# ✦ CODEX GLYPH GRAMMAR ✦

This document defines the symbolic grammar used to generate Codex glyphs.

## Principle

Objects generate symbols.

front matter → parameters → glyph

## Base Geometry by Object Type

signal   → burst / rays / spark geometry
scroll   → spiral / unfolding paths
loremap  → grid / enclosure structures
artifact → shards / planes
fragment → seed / broken loop
field-log → measured marks

## Theme Modifiers

Themes modify base geometry.

fire       → angular sparks
water      → curved flows
signal     → node clusters
recursion  → spiral emphasis
city       → rectilinear grid bias
forest     → branching organic bias
grief      → interrupted lines

## Status Modifiers

inbox  → open form
draft  → partial closure
active → balanced form
wip    → asymmetry / incomplete edge
published → stabilized geometry

## Deterministic Seed

Glyph variation derives from a deterministic seed.

seed = hash(object id)

This ensures the same object always produces the same glyph.

## Output

Glyph generator produces:

hero glyph SVG
icon glyph SVG
monochrome variant

The Codex becomes a system where each object bears a symbolic mark.
