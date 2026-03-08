# Codex Archive System - Current State
Version: 3.1
Date: 2026-03-07

## Focus
published ingest continuity, recent-first retrieval, runtime polish, and inbox hygiene

## Key Changes in v3+
- v3+ codex release note published as canonical object
- WIP/revision intake guidance now requires links to newest relevant updates
- WIP artifact relation graph tightened with reciprocal links to current release notes
- promotion path now includes media normalization for camera-native source formats
- object pages now emit type-aware share metadata with fallback social image
- object images are now clickable and expandable for fullscreen inspection
- feed stack now enforces recent-first ordering with optional single pinned feature (`?pin=<id>`)
- release docs advanced to v3+ orientation chain

## Schema State
No schema expansion occurred in v3+.
Object model remains stable while operations and presentation layers advance.

## Primary Surfaces
- /feed -> exploration
- /objects -> canonical reading
- /graph -> relationship discovery
- /nexus -> thematic clustering

## Session Close Updates (March 7, 2026)
- feed hero shifted to full-bleed/global background behavior; local container gradient removed
- large linework motif now sits behind the page flow and is no longer clipped by hero bounds
- `Archive Pulse` panel received a restrained glass treatment for readability and emphasis
- graph page supporting labels/metadata contrast was increased for legibility
- object footer metadata was reduced; expanded operator bio + links now live on `/orientation`
- processed source payloads were swept from `inbox/drop` into `inbox/archive/drop/2026-03-07-sweep-01`
- daily logs refreshed: `logs/codex-log-2026-03-07.md` and `logs/design-evolution-2026-03-07.md`
