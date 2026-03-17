# Codex Archive System - Current State
Version: 3.12.1
Date: 2026-03-17

## Focus
axis-aware object publishing, object-local marginalia, and live-safe markdown ingest for operator notes

## Key Changes in v3.12.1
- canonical v3.12.1 patch note published as `codex-archive-system-v3-12-marginalia-live-publish-notes`
- Carrier Pigeon raw markdown ingest now unwraps quoted scalar frontmatter before validation
- live marginalia submit now accepts the inline composer's generated ISO `date` instead of rejecting it as invalid frontmatter
- operator marginalia publishing keeps the same browser-key flow and `/api/pigeon` path
- v3.12 remains the feature release for marginalia; v3.12.1 records the production hardening pass

## Schema State
No new object type was introduced in v3.12.1.
Object model remains stable. Marginalia is still implemented as a fragment convention plus connection semantics, not as a taxonomy fork.

## Primary Surfaces
- /feed -> exploration
- /objects -> canonical reading + marginalia
- /codex -> codex-native reading + marginalia
- /graph -> relationship discovery
- /nexus -> thematic clustering
- /pigeon -> phone ingest and shared-key bootstrap

## Session Close Updates (March 17, 2026)
- live marginalia submit exposed a quoted-frontmatter scalar gap inside `/api/pigeon`
- Carrier Pigeon now unwraps quoted `title`, `date`, and related scalar fields before validation
- marginalia publish remains on the same inline surface and shared-key flow; the fix lives at ingest, not in a second UI path
- release chain advanced through v3.12.1 with status + respawn + current-state alignment
