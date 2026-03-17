# Codex Archive System - Current State
Version: 3.12
Date: 2026-03-17

## Focus
axis-aware object publishing, object-local marginalia, and archive-safe continuity without social sprawl

## Key Changes in v3.12
- canonical v3.12 release note published as `codex-archive-system-v3-12-marginalia-notes`
- marginalia now exists as a real archive layer using `fragment` plus `origin: marginalia`
- object pages now render a dedicated marginalia stack below the main body
- codex reading pages now render the same marginalia surface
- inline operator publishing now reuses the stored Carrier Pigeon key and `/api/pigeon`
- home/follow/related surfaces now exclude marginalia so the layer stays attached to the object instead of becoming a second feed

## Schema State
No new object type was introduced in v3.12.
Object model remains stable. Marginalia is implemented as a fragment convention plus connection semantics, not as a taxonomy fork.

## Primary Surfaces
- /feed -> exploration
- /objects -> canonical reading + marginalia
- /codex -> codex-native reading + marginalia
- /graph -> relationship discovery
- /nexus -> thematic clustering
- /pigeon -> phone ingest and shared-key bootstrap

## Session Close Updates (March 17, 2026)
- marginalia helper logic now defines what counts as a margin note and where it may surface
- object pages and codex pages now mount the same marginalia panel and operator composer
- inline publish reuses the Carrier Pigeon shared-key flow instead of introducing account logic
- marginalia remains fragment-backed so the archive retains one object model
- primary feed/follow/related surfaces now explicitly filter marginalia out
- release chain advanced through v3.12 with status + respawn + current-state alignment
