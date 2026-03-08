# Codex Archive System - Ingestion Pipeline
Version: v3 ingest-alignment package
Date: 2026-03-07

## Ingestion Flow
/inbox
  -> parser reads frontmatter
  -> object type determines destination
  -> registry indexes object
  -> viewer renders canonical page
  -> graph relations update

## Activation Path
Named operator loop:
- Talk = review drafts and discuss decisions
- Confirm = operator gives explicit approval
- Hand-off = system runs the post-confirmation finalize path
- Ping-back = system returns on completion or blocker

1. Detect raw source in `inbox/drop/`.
2. Draft/revise a review file in `inbox/ready/`.
3. Talk through the draft with the operator and get explicit approval.
4. Finalize approved drafts with:
   - `node scripts/finalize-approved-ready.mjs --source <ready-draft> --note "<approval reason>"`
5. The system then:
   - promotes to canonical objects + Astro content
   - reconciles `inbox/ready`
   - archives matching drop payloads
   - validates objects
   - builds Astro

State meaning:
- `inbox/drop` = raw source, unresolved
- `inbox/ready` = drafted, awaiting human decision
- `objects` + `astro/src/content` = canonical publish state
- conversation + confirmation = explicit operator authorization
- `finalize-approved-ready` = post-confirmation system handoff
- `logs/promotion-log.ndjson` = durable approval record

Operator shorthand:
- `keeping the beast fed :) and not chewing cud`

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
