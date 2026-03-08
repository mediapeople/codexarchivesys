# Creative AI Object Meta Brief

This document is for the operator side of creative work with other AIs.

Its job is to make the current Codex field mapping logic visible in plain language, so you can steer another AI toward better metadata before the draft ever lands in `inbox/ready/`.

## The Core Rule

**Bound the object before the AI touches the metadata.**

If you already know it is one scroll, say that directly.
If it is one artifact with support images, say that directly.
If an intake note or image plate is support material, name it as support material.

Most metadata failure starts one step earlier than people think:
the AI is not failing at tags, it is failing at object boundaries.

## The Mapping Logic In Plain English

The Codex does not treat metadata as decoration.
It treats metadata as routing logic.

The flow is:

```text
raw source
-> operator names the object boundary
-> AI drafts frontmatter
-> human reviews and tightens
-> system derives previews, backlinks, graph edges, and canonical URLs
```

That means every frontmatter choice has a downstream effect.

## Three Kinds Of Fields

### 1. Author / intake fields

These come from the source package plus your judgment:

- `type`
- `title`
- `date`
- `excerpt`
- `themes`
- `related`
- `visibility`
- `media`
- type-specific fields such as `bodyClass`, `project`, or `artifactType`

### 2. Editor-owned fields

These should not be casually assigned by an outside AI:

- `constellations`
- featured or lead choices inside `nexus`
- release ordering decisions

### 3. System-derived fields

These are created from the metadata contract later:

- `slug` from `id`
- `readingTime` from body length
- `previewPayload` from `type + excerpt + media`
- `backlinks` from other objects' `related`
- `graphEdges` from themes, constellations, and relations
- `canonicalURL` from visibility, type, and slug

This is why metadata quality matters:
it changes feed cards, object pages, graph structure, social metadata, and retrieval.

## The Operator Field Map

Use this as the bridge between creative source material and metadata decisions.

| Field | What the operator is really deciding | Best source evidence | Who owns it | What it affects |
|---|---|---|---|---|
| `type` | What kind of object this is | body behavior, not file extension | operator/author | schema, route behavior, preview logic |
| `title` | The public name of the object | source title or strongest durable phrasing | operator/author | recognition, URL seed, feed legibility |
| `date` | When the work happened | creation date, observation date, release date | operator/author | sort order, timeline, cards |
| `status` | Whether this is only a draft or public | workflow state, not artistic state | operator/editor | build inclusion |
| `excerpt` | The signal sentence | strongest line from body | operator/author, AI may draft | feed card, share metadata, preview |
| `themes` | Which conceptual threads are structurally present | body logic, materials, method, setting | operator/author, AI may suggest | filters, relation engine, graph |
| `constellations` | Whether it belongs to a named cluster | strong editorial fit only | editor | cluster pages, graph weighting |
| `related` | Which real objects it should touch explicitly | direct resonance with existing ids | operator/author, AI may suggest | backlinks, related module, graph |
| `visibility` | Where it should appear | distribution intent | operator/editor | indexing and linking |
| `media` | What supporting assets exist and what role they play | actual files in the bundle | operator/author, AI may suggest | hero, gallery, detail, process surfaces |

## The Operator Translation Layer

When you hand a creative bundle to another AI, do not just send files.
Translate the bundle into field-relevant facts.

### Source fact

"This is one bounded scroll."

### Metadata effect

- `type: scroll`
- support files stay in `media` or intake notes
- no second object is invented

### Source fact

"This line is the cleanest signal in the piece."

### Metadata effect

- candidate `excerpt`

### Source fact

"These are the concepts actually doing structural work."

### Metadata effect

- `themes`

### Source fact

"These existing archive objects are real neighbors."

### Metadata effect

- `related`

### Source fact

"This image is the hero plate; these two are process evidence."

### Metadata effect

- `media` roles

This is the bridge:
you are not feeding the AI files only, you are feeding it field logic.

## What The AI Should Not Decide Alone

Do not leave these to free inference if you already know them:

- whether the bundle is one object or many
- whether the object is definitely a scroll, artifact, or fieldlog
- whether a support file is canonical body text
- whether a constellation is actually earned
- whether a raw media filename is also the public publish filename
- whether the draft should be published

## The Most Important Downstream Effects

If you want the operator to feel the field map, this is the shortest version:

- stronger `excerpt` -> stronger feed card and share surface
- stronger `themes` -> stronger graph edges and discovery
- stronger `related` -> less isolation and better backlinks
- stronger `media` -> clearer object presentation
- stronger `type` -> correct schema and preview behavior
- correct `status` -> no accidental publish

## Scroll Mapping In Practice

For a bounded scroll, the operator should usually settle these first:

- `type`
  - Is the body sustained prose, poetry, essay, or lyric document?
- `title`
  - Is there already a public-facing title in the source?
- `excerpt`
  - What single line could carry the object on a card?
- `bodyClass`
  - `verse` for line-broken work, `prose` for paragraph-led work
- `themes`
  - Which active registry concepts are actually present in the writing?
- `related`
  - Which existing object ids would deepen orientation?
- `media`
  - Are there visual plates, scans, or support diagrams that belong with the same object?

## A Good Operator Prompt Is A Field Map

This is the minimum useful structure to give another AI:

```md
We are preparing one bounded object for Codex Archive intake.

Object boundary:
- This is one bounded [type] object.
- Supporting files belong to the same object.
- Do not split this into multiple objects.

Source of truth:
- Main body file: [path]
- Supporting files: [path], [path]

Known decisions:
- Type: [type]
- Voice must be preserved
- Status must remain draft

Field goals:
- Find the strongest excerpt from the body
- Use only active registry themes
- Suggest related ids only if they are real and strong
- Treat constellations as editor suggestions only
- Keep media provenance visible in intake notes

What not to do:
- Do not publish
- Do not invent schema
- Do not normalize the body into generic prose
```

## Fast Review Checklist

Before you accept a metadata draft, ask:

- Did the AI keep the object boundary intact?
- Did it choose the right type from behavior, not from vibes?
- Does the excerpt feel like the object's own signal?
- Are the themes from the active registry?
- Are the related ids real and relevant?
- Are media roles grounded in actual files?
- Are constellations left open unless clearly earned?
- Is the draft still `status: draft`?

## Common Failure Modes

- intake note mistaken for a separate canonical object
- body rewritten when only metadata needed tightening
- descriptive excerpt used instead of signal excerpt
- new themes invented instead of flagged
- `related` padded with loose similarities
- constellation forced to make the draft look finished
- publish state assigned during intake

## Active Theme Registry

```text
signal
memory
pressure
maintenance
survival
structure
crystallization
transmission
observation
place
morning
systems
architecture
methodology
collage
comics
```

## Active Constellation Registry

```text
Cascade Psalms
Maintenance Psalms
Archaeological Objects
```

## Bottom Line

If you want stronger metadata from another AI, do not ask it to "figure out what this is."

Tell it:

- what the bounded object is
- what files are body vs support
- what fields matter most
- what decisions are already settled
- what it must leave for editorial review

That is how the current field map becomes usable at operator speed.
