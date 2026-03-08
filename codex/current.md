# Codex Archive System - Current State
Version: 3.2
Date: 2026-03-08

## Focus
fragment-first feed communication, object-specific presentation logic, and publish-safe runtime continuity

## Key Changes in v3.2
- canonical v3.2 release note published as `codex-archive-system-v3-2-fragment-feed-notes`
- fragments now render as direct feed communication instead of generic teaser cards
- feed fragments use a dedicated interlude path with natural content height and quiet footer labeling
- fragment object pages remain canonical while feed presentation is now type-aware and interpretive
- operator/system style fragments can preview as `Prompt` and `Return`
- conversational fragment spacing now preserves intentional pauses and turn changes
- fragment preview measure was widened so return lines do not collapse into narrow vertical stacks

## Schema State
No schema expansion occurred in v3.2.
Object model remains stable while the presentation layer becomes more type-specific.

## Primary Surfaces
- /feed -> exploration
- /objects -> canonical reading
- /graph -> relationship discovery
- /nexus -> thematic clustering

## Session Close Updates (March 8, 2026)
- fragment feed handling was split out from the generic object-card path
- feed fragments now float as quote/interlude surfaces rather than media-placeholder cards
- fragment header chrome was reduced so the line itself carries the communication
- fragment identifiers moved to a quiet footer treatment for archival context without title-weight competition
- prompt/return previews were added for operator/system style fragments
- feed fragment layout no longer inherits the generic preview aspect ratio or reserved card height
