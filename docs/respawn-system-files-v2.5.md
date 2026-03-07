# Codex Respawn System Files (v2.5)

Date: 2026-03-07

Superseded by: `docs/respawn-system-files-v2.6.md`

## Purpose

Provide a stable, minimal file chain for restarting work without re-discovering doctrine, schema rules, and operating cadence.

## Workspace Root Policy

- Canonical root: `/Users/nathandavis/Projects/codex-archive-mega-site`
- Deprecated root: `/Users/nathandavis/Library/Mobile Documents/com~apple~CloudDocs/Projects/codex archive (mega site)`
- `astro` npm scripts now hard-fail when executed from iCloud paths.

## Canonical Load Order

1. `docs/codex-status-v2.5.md`
2. `docs/field-registry.md`
3. `docs/constitutional-implementation-map.md`
4. `docs/codex_addendum_structural_metering.md`
5. `docs/llm-intake-prompt.md`
6. `docs/phase-1-orientation.md`

## What Each File Governs

- `codex-status-v2.5.md`: current state, active constraints, immediate priorities, expanded learnings.
- `field-registry.md`: canonical field contract, ownership model, bounded enums, governance rules.
- `constitutional-implementation-map.md`: doctrine-to-file enforcement map and gap priority stack.
- `codex_addendum_structural_metering.md`: structural pressure model (signals, registers, thresholds).
- `llm-intake-prompt.md`: human-governed machine intake behavior and output rules.
- `phase-1-orientation.md`: project shape, runtime commands, and execution context.

## Respawn Validation Commands

```bash
node scripts/validate-objects.mjs objects
node scripts/generate-codex-log.mjs objects $(date +%F)
node scripts/ingest-design-evolution.mjs objects $(date +%F)
cd astro && npm run build
```

## Respawn Done Condition

- Version references align on `v2.5`.
- Validation and build pass.
- Graph JSON regenerated.
- Active work order and next execution step are explicit in docs.
