# Codex Archive System - Ingestion Pipeline
Version: v2.6 support package
Date: 2026-03-07

## Ingestion Flow
/inbox
  -> parser reads frontmatter
  -> object type determines destination
  -> registry indexes object
  -> viewer renders canonical page
  -> graph relations update

AI coworkers may assist with:
- metadata completion
- signal extraction
- relation suggestions

## Signal Extraction Rule
Derive a signal when:
- the concept appears in multiple objects
- the concept meaningfully links system themes
- the concept improves graph navigation

Signal quality constraints:
- stable
- reusable
- concept-level

Avoid overly narrow signals.

## Relationship Pattern
Preferred graph expansion:
object -> signal -> object

Example:
- apparatus-ledger
  -> signal.citizen-agency
  -> signal-harvest
