# Codex Archive System - Root Spine
Version: v3 ingest-alignment package
Date: 2026-03-07

## Purpose
Provide deterministic orientation for a new or restarted AI coworker.

Fast path for bounded work:
- `/codex/dispatch.md` for `ingest`, `publishing`, or `dev`
- use the full load order below when the task crosses modes or needs system context

## Load Order
1. /codex/root.md
2. /codex/system.md
3. /codex/pipeline.md
4. /codex/current.md
5. /codex/respawn.md

Stop loading when the respawn complete condition is met.

## Respawn Complete Condition
The coworker must understand:
- objects are the primary reading surface
- objects enter through the inbox ingestion pipeline
- object pages are the canonical presentation layer
- relationships create the knowledge graph
- current system version and priorities

## Core Principle
tight spine
bounded lattice

- spine = stable architecture
- lattice = expanding object relationships
