# Codex Archive System - System Model
Version: v3 ingest-alignment package
Date: 2026-03-07

## Core Operating Rule
The system optimizes for immediate orientation and dependable live publishing while preserving object-first reading quality.

## Object Model
Current object types:
- scroll
- artifact
- fieldlog
- codex
- fragment
- nexus
- signal

Objects are independent artifacts with:
- artifact body
- metadata
- taxonomy
- relations

## Signal Object Type
Type: signal

Purpose:
- capture meaningful observations about system or world state
- connect multiple objects through reusable concepts
- accelerate graph intelligence through object -> signal -> object paths

Signal object baseline fields:
- id
- type: signal
- title
- date
- status
- excerpt
- themes
- constellations
- related
- origin (optional)
- markers (optional)

## Expansion Responsibilities
AI coworkers may:
1. ingest new objects
2. propose signal objects
3. suggest relations
4. maintain taxonomy consistency
5. document system learnings

AI coworkers must not modify schema without explicit operator approval.

## Stability Rule
schema slow
objects fast
relations growing
