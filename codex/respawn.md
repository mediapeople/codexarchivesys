# Codex Archive System - Respawn Operations
Version: v2.7 go-live package
Date: 2026-03-07

## Respawn Sequence
1. Load files in /codex load order from /codex/root.md.
2. Confirm respawn complete condition from /codex/root.md.
3. Run operational checks.

## Operational Commands
From workspace root:

```bash
node scripts/validate-objects.mjs objects
node scripts/generate-codex-log.mjs objects $(date +%F)
node scripts/ingest-design-evolution.mjs objects $(date +%F)
node scripts/generate-graph-json.mjs objects astro/public/graph.json
cd astro && npm run build
```

## Done Condition
Respawn is complete when:
- orientation chain is understood
- ingestion pipeline is understood
- object model is understood
- signal object purpose is understood
- validation and build pass
