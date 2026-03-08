# Codex Archive System - Current State
Version: 3.3
Date: 2026-03-08

## Focus
fragment-first feed communication, object-aware card-image staging, and publish-safe runtime continuity

## Key Changes in v3.3
- canonical v3.3 release note published as `codex-archive-system-v3-3-modest-table-notes`
- image-backed feed and related cards now present objects on a contained modest-table stage instead of hard crops
- the table/image surface now has its own inspection path while the rest of the card remains the canonical post link
- a lightweight card-image lightbox now includes a direct `Open attached post` handoff
- mobile lightbox controls now resolve as a cleaner touch tray
- mobile table staging now gives raw camera-native objects more top/bottom breathing room

## Schema State
No schema expansion occurred in v3.3.
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
- image-backed cards now treat the object like a specimen on a modest table rather than a cropped teaser slice
- image inspection now splits from card navigation: table click enlarges the image, card click still opens the object
- mobile lightbox chrome was tightened into a more deliberate touch tray with clearer CTA behavior
