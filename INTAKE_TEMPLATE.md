# Intake Template

Use this template for machine-assisted or manual intake drafts that will land in `inbox/ready/`.

Source of truth:
- `docs/llm-intake-prompt.md`
- `docs/fragment-optimal-ingest-form.md`
- `astro/src/content/config.ts`
- `docs/field-registry.md`

Rules:
- Intake outputs are drafts, not published objects.
- Use only active themes from the registry.
- Suggest constellations only when clearly warranted; do not force them.
- For expansion, evolution, variant, or follow-on items, include explicit `related` links to predecessor objects when those ids are already known from the workspace.
- Include only the type-specific fields that apply.
- Omit `postedAt` until promotion/publish.
- Filename format: `inbox/ready/YYYY-MM-DD-<id>.md`

## Base Template

```yaml
---
id: kebab-case-id
type: scroll # scroll | artifact | fieldlog | codex | fragment | nexus | signal
title: "Exact Display Title"
date: 2026-03-08
status: draft
visibility: public

excerpt: "One-sentence signal."

themes:
  - signal
  - observation

# EDITOR: suggestion only
# constellations:
#   - Cascade Psalms

related: []

connections: []

media: []
---
```

## Type-Specific Fields

### Scroll

```yaml
bodyClass: verse # verse | prose | hybrid | list
```

### Artifact

```yaml
artifactType: ""
materials: ""
year: 2026
dimensions: ""
location: ""
condition: ""
```

### Field Log

```yaml
project: ""
phase: ""
context: ""
signals: []
actions: []
```

### Codex

```yaml
version: "1.0.0"
scope: ""
systemArea: ""
changeType: initial # initial | patch | minor | major
dependencies: []
```

### Fragment

```yaml
lengthClass: short # micro | short | medium
origin: ""
voice: aphoristic # observational | aphoristic | somatic | documentary | mythological
```

Fragment guidance:
- preserve meaningful line breaks
- use full-body excerpt when the fragment is extremely short
- use explicit `Operator:` / `System:` tags for prompt/return exchanges
- prefer compact, complete language over explanatory setup

### Nexus

```yaml
lead: ""
featured: []
includedObjects: []
themeStatement: ""
releaseType: issue # issue | sequence | cluster | dispatch
```

`includedObjects` shape:

```yaml
includedObjects:
  - ref: object-id
    role: lead
```

### Signal

```yaml
origin: derived
markers: []
```

`connections` shape:

```yaml
connections:
  - ref: object-id
    role: previous version
    display: feature # inline | feature
```

Connection guidance:
- use `connections` when the relationship itself has a named role: previous version, next update, WIP source, companion implementation, mastered variant
- keep `related` for broader conceptual adjacency
- use `display: feature` for the one or two ties that should float ahead of the generic related stack

## Recommended Full Intake Draft Shape

```md
---
id: kebab-case-id
type: scroll
title: "Exact Display Title"
date: 2026-03-08
status: draft
visibility: public

excerpt: "One-sentence signal."

themes:
  - signal
  - observation

# EDITOR: suggestion only
# constellations:
#   - Cascade Psalms

related: []

connections: []

media: []

bodyClass: verse
---

[Body content here.]

---

## INTAKE NOTES

**Suggested type:** scroll
**Confidence:** high

**Excerpt source:** drawn from body
**Excerpt note:** [Why this excerpt was chosen.]

**Theme notes:** [How theme choices were made.]

**Constellation notes:** [Why assigned, omitted, or left as suggestion.]

**Suggested new fields flagged:** no

**Ambiguities for human review:**
  - [Any classification or structure concerns.]

**Suggested related objects (by description, not id):**
  - [Related object idea.]
```

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
