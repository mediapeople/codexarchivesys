# Fragment Optimal Ingest Form

Date: 2026-03-08

## Purpose

Define the strongest ingest shape for `fragment` objects now that fragments render as direct feed communication instead of generic teaser cards.

Use this with:
- `docs/llm-intake-prompt.md`
- `docs/field-registry.md`
- `INTAKE_TEMPLATE.md`

## Core Rule

A fragment should enter the system as a complete unit of language.

It is not a summary of a larger work.
It is not a placeholder for later expansion.
It may become a seed for a later scroll, but it must already stand on its own.

## Choose `fragment` When

Use `fragment` if the source is:
- a single aphorism
- a compressed observation
- a short image-text
- a micro-essay that lands in under roughly 150 words
- a dialogue pair that resolves as a compact exchange
- a line or short cluster that already feels finished

Do not use `fragment` if:
- the text needs explanation to work
- the source is concept-level and should become a reusable `signal`
- the text is unfolding, sequential, or breathes like a `scroll`

## Optimal Body Shape

Fragments now publish directly in the feed, so body shape matters more than before.

Preferred forms:

1. Single-line signal

```md
Crystal does not rush.
```

2. Two-line or three-line compression

```md
I work with machines
to write scripture.
```

3. Short micro-essay with decisive line breaks

```md
Pages are not the fundamental unit.

Objects are.
```

4. Prompt/return exchange

```md
Operator: lean mean governance machine

System: tight spine, live runtime, rapid patch loop.
```

## Prompt/Return Fragments

Prompt/return fragments are now a first-class preview mode in the feed.

For these:
- keep the exchange to one initiating line and one return when possible
- prefer explicit speaker tags: `Operator:` and `System:`
- keep each turn concise
- let the return carry the stronger line
- use a blank line between turns

Good:

```md
Operator: what holds under pressure

System: the spine that survives repetition.
```

Avoid:

```md
Operator: [long paragraph]
System: [long paragraph]
```

If the exchange expands beyond a compact call-and-response, it is probably a `scroll` or `codex`, not a `fragment`.

## Excerpt Strategy

For fragments, the excerpt should usually be:
- the full body if very short, or
- the strongest line already present in the body

Do not write a descriptive excerpt for a fragment if the fragment already contains its own signal sentence.

## Metadata Defaults

Use these fragment-specific fields when drafting:

```yaml
lengthClass: micro # micro | short | medium
origin: ""
voice: aphoristic # observational | aphoristic | somatic | documentary | mythological
```

Guidance:
- `lengthClass: micro` for one- to two-line units
- `lengthClass: short` for compact paragraph or multi-line units
- `origin` should identify provenance, not interpretation
- `voice` should describe register, not topic

## Relation Strategy

Fragments often seed later objects, so relations matter.

Prefer related links to:
- the scroll the fragment may later expand into
- the codex or fieldlog context it emerged from
- nearby fragments carrying the same pressure/theme
- the newest relevant release note when the fragment reflects a current system move

For prompt/return fragments, relate both to:
- operational codex notes
- system-method fragments
- any scroll or fieldlog the exchange informs

## Anti-Patterns

Avoid ingesting a fragment in these forms:

1. Overexplained

```md
This fragment is about how systems need discipline.
```

2. Too neutral

```md
Notes on governance and maintenance.
```

3. Too long without movement

If it reads like compressed prose but needs multiple claims to land, it likely wants to be a `scroll`.

4. Dialogue without role clarity

```md
Question...
Answer...
```

Use explicit speaker labels when the exchange structure matters.

## Recommended Intake Draft Shape

```md
---
id: lean-mean-governance-machine
type: fragment
title: "Lean Mean Governance Machine"
date: 2026-03-08
status: draft
visibility: public

excerpt: "Tight spine, live runtime, rapid patch loop."

themes:
  - systems
  - methodology
  - maintenance

related: []

media: []

lengthClass: short
origin: "operator console exchange"
voice: aphoristic
---

Operator: lean mean governance machine

System: tight spine, live runtime, rapid patch loop.
```

## Practical Intake Rule

If the fragment will look stronger when read directly in the feed than when summarized in metadata, it is probably in the right form.
