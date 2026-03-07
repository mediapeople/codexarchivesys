# Codex Respawn Quickstart

Use this when a long chat thread stalls, hangs, or loses context.

## 1) Start from the only valid root

```bash
cd /Users/nathandavis/Projects/codex-archive-mega-site
```

Do not run from iCloud paths.

## 2) Rebuild operational state

```bash
node scripts/validate-objects.mjs objects
node scripts/generate-codex-log.mjs objects $(date +%F)
node scripts/ingest-design-evolution.mjs objects $(date +%F)
cd astro && npm run build
```

## 3) Bring local preview online

```bash
cd /Users/nathandavis/Projects/codex-archive-mega-site/astro
npm run preview -- --host 127.0.0.1 --port 4321
```

Open: http://127.0.0.1:4321/

## 4) Load only these context files into a fresh chat

Primary coworker chain:

1. `codex/root.md`
2. `codex/system.md`
3. `codex/pipeline.md`
4. `codex/current.md`
5. `codex/respawn.md`

Extended governance chain:

1. `docs/respawn-system-files-v2.7.md`
2. `docs/codex-status-v2.7.md`
3. `docs/field-registry.md`
4. `docs/constitutional-implementation-map.md`
5. `docs/codex_addendum_structural_metering.md`
6. `docs/llm-intake-prompt.md`
7. `docs/phase-1-orientation.md`

## 5) Paste this prompt in a new chat

```
New thread. Use /Users/nathandavis/Projects/codex-archive-mega-site as canonical root.
Ignore deprecated iCloud root. Re-orient from docs/respawn-system-files-v2.7.md and docs/respawn-quickstart.md, then continue implementation from current git state without reverting unrelated changes.
```
