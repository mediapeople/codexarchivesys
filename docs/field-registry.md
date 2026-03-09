# CODEX FIELD REGISTRY
## docs/field-registry.md
### Codex Archive System v2.2

> This document is the field discipline contract for the Codex Archive System.
> No field enters the system without a record here.
> No field is removed without updating this document.
> This document is the ground truth for schema definitions, LLM intake prompts, and layout contracts.

---

## HOW TO READ THIS REGISTRY

Each field entry records:

| Property | Meaning |
|---|---|
| **Name** | Canonical field name as it appears in frontmatter |
| **Owner** | author / editor / llm-suggested / system-derived |
| **Type** | Data type |
| **Required** | Whether required for publication |
| **Applies To** | Which object types carry this field |
| **Renders In** | Where the field appears in the rendered site |
| **Allowed Values** | Enum constraints where applicable |
| **Description** | What the field means and how it is used |

**Owner definitions:**

- `author` — written directly by the contributor, canonical on creation
- `editor` — assigned through curatorial judgment, never authored by LLM
- `llm-suggested` — proposed by the system, not canonical until human-approved
- `system-derived` — computed during ingest or build, never manually maintained

---

## LAYER 1: UNIVERSAL FIELDS

Fields present on every object type.

---

### id

| Property | Value |
|---|---|
| **Owner** | system-derived (validated by author) |
| **Type** | string |
| **Required** | yes |
| **Applies To** | all |
| **Renders In** | URL slug, backlinks, graph nodes, relation targets |
| **Allowed Values** | kebab-case, alphanumeric and hyphens only, unique across archive |

The permanent identifier for the object. Stable across title changes. Derived from the filename by convention. Once set, never changed.

```yaml
id: the-bones-hold
```

---

### type

| Property | Value |
|---|---|
| **Owner** | llm-suggested (author-confirmed) |
| **Type** | enum |
| **Required** | yes |
| **Applies To** | all |
| **Renders In** | type badge, layout selection, feed card, graph node shape |
| **Allowed Values** | `scroll` `artifact` `fieldlog` `codex` `fragment` `nexus` `signal` |

Determines layout, card rendering, and relational behavior. Type proliferation must be avoided. Fewer than 10 total types is the hard limit.

```yaml
type: scroll
```

---

### title

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | yes |
| **Applies To** | all |
| **Renders In** | page title, feed card, graph label, constellation list, nexus sequence |

The canonical display title. May contain glyphs and formatting. The `id` is derived from this on creation and then decoupled — the title may change, the id does not.

```yaml
title: "✦ THE BONES HOLD ✦"
```

---

### date

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | date (ISO 8601) |
| **Required** | yes |
| **Applies To** | all |
| **Renders In** | feed card, object meta, sort order, archive timeline |
| **Allowed Values** | YYYY-MM-DD |

The canonical date of the work. Not necessarily the date of publication. For scrolls and artifacts, this is the date of creation. For field logs, this is the date of observation. For nexus objects, this is the release date.

```yaml
date: 2026-03-04
```

---

### status

| Property | Value |
|---|---|
| **Owner** | author / editor |
| **Type** | enum |
| **Required** | yes |
| **Applies To** | all |
| **Renders In** | controls build inclusion, visible in internal views |
| **Allowed Values** | `draft` `review` `published` `archived` |

Lifecycle state. Only `published` objects appear on the public site. `archived` objects remain in the system but are not indexed or linked. `review` objects are visible in internal/preview builds.

```yaml
status: published
```

---

### excerpt

| Property | Value |
|---|---|
| **Owner** | author (llm-suggested draft acceptable) |
| **Type** | string |
| **Required** | no (strongly recommended for all published objects) |
| **Applies To** | all |
| **Renders In** | feed card preview payload, constellation list, nexus sequence, social metadata |

A single compact statement that functions as the object's signal. Not a summary. Not a description. The sentence the object would choose to represent itself. LLM may draft; author must confirm.

```yaml
excerpt: "Crystal does not rush."
```

---

### themes

| Property | Value |
|---|---|
| **Owner** | author (llm-suggested) |
| **Type** | array of strings |
| **Required** | no |
| **Applies To** | all |
| **Renders In** | theme cloud, feed filter, relationship engine, graph edges |
| **Allowed Values** | lowercase, hyphenated, drawn from active theme list (< 50 active) |

Conceptual tags. Themes drive the relationship engine and the theme cloud. Must remain bounded. New themes require deliberate addition to the active theme registry. LLM may suggest; author approves.

```yaml
themes:
  - signal
  - pressure
  - maintenance
```

---

### constellations

| Property | Value |
|---|---|
| **Owner** | editor |
| **Type** | array of strings |
| **Required** | no |
| **Applies To** | all |
| **Renders In** | constellation chips on card, constellation page membership, relationship engine |
| **Allowed Values** | title-case names drawn from active constellation list (< 100 active) |

Named thematic or narrative clusters. Editor-assigned. Not author self-selected. Constellations are bounded structures, not freeform tags. Objects may belong to multiple constellations.

```yaml
constellations:
  - Cascade Psalms
  - Maintenance Psalms
```

---

### related

| Property | Value |
|---|---|
| **Owner** | author (llm-suggested) |
| **Type** | array of strings (object ids) |
| **Required** | no |
| **Applies To** | all |
| **Renders In** | related works module, graph edges, backlinks |
| **Allowed Values** | valid object ids that exist in the archive |

Explicit cross-references. Validated at build time — relation targets must exist. Generates backlinks on the target object. Supplements the automatic relationship engine.

```yaml
related:
  - signal-harvest
  - under-load
```

---

### connections

| Property | Value |
|---|---|
| **Owner** | author / editor (llm-suggested) |
| **Type** | array of connection objects |
| **Required** | no |
| **Applies To** | all |
| **Renders In** | inline connection module, graph edges, curated object-page previews |
| **Allowed Values** | `ref` must target a valid object id; `display` is `inline` or `feature` |

Explicit authored adjacency with a named role. Use this when the tie itself carries meaning: previous version, next update, WIP source, implementation companion, mastered variant, and similar lineage/expansion links. `related` remains the looser resonance layer; `connections` is for directed, named, page-facing associations.

```yaml
connections:
  - ref: codex-archive-system-v3-5-control-surface-notes
    role: previous version
    display: feature
  - ref: codex-archive-system-v3-6-reading-surface-notes
    role: next update
```

Connection object shape:

| Property | Type | Required | Description |
|---|---|---|---|
| `ref` | string | yes | target object id |
| `role` | string | yes | human-readable relationship label |
| `display` | enum | no | render hint: `inline` or `feature` |

---

### visibility

| Property | Value |
|---|---|
| **Owner** | author / editor |
| **Type** | enum |
| **Required** | no |
| **Applies To** | all |
| **Renders In** | controls indexing and linking behavior |
| **Allowed Values** | `public` `private` `internal` `unlisted` |
| **Default** | `public` |

Controls where the object appears. `public` objects are fully indexed. `unlisted` objects are accessible by direct URL but not indexed or linked from feeds. `internal` objects appear in preview builds only. `private` objects are excluded from all builds.

```yaml
visibility: public
```

---

### media

| Property | Value |
|---|---|
| **Owner** | author (llm-suggested roles) |
| **Type** | array of media objects |
| **Required** | no |
| **Applies To** | all (primary for artifact) |
| **Renders In** | hero block, gallery, detail panels, process documentation |

Media is first-class and modeled by role. Each entry contains `kind`, `src`, and `role`. Roles determine layout behavior. LLM may suggest role assignments; author confirms.

```yaml
media:
  - kind: image
    src: /media/scans/card043/front.jpg
    role: hero
  - kind: image
    src: /media/scans/card043/detail.jpg
    role: detail
  - kind: video
    src: /media/process/card043/assembly.mp4
    role: process
```

**Media kind enum:** `image` `video` `audio`

**Media role enum:** `hero` `gallery` `detail` `scan` `process` `audio` `reference`

---

## LAYER 2: TYPE FIELDS

Fields specific to individual object types. These extend the universal structure. Not present on types where they do not apply.

---

### TYPE: scroll

A scroll is a text-primary object. Poetry, prose, essay, lyric document. The canonical creative unit.

---

#### series

| Property | Value |
|---|---|
| **Owner** | author / editor |
| **Type** | string |
| **Required** | no |
| **Applies To** | scroll |
| **Renders In** | scroll header, series navigation |

Named sequence the scroll belongs to within a broader body of work. Distinct from constellation — series implies sequential or structural relationship, not just thematic.

```yaml
series: "Cascade Psalms, Vol. II"
```

---

#### cadence

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string (free) |
| **Required** | no |
| **Applies To** | scroll |
| **Renders In** | object meta (subtle display) |

Rhythmic or formal character of the work. Loose descriptor, not an enum. Helps the LLM understand rendering tone.

```yaml
cadence: sparse
# other examples: compressed, expansive, litanic, fragmented
```

---

#### tone

| Property | Value |
|---|---|
| **Owner** | llm-suggested (author-confirmed) |
| **Type** | string (free) |
| **Required** | no |
| **Applies To** | scroll |
| **Renders In** | not directly rendered; informs LLM intake and relationship suggestions |

Emotional register. Used during intake and relationship mapping. Not displayed on the public site.

```yaml
tone: somatic
# other examples: elegiac, civic, mythological, documentary
```

---

#### dedication

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | scroll |
| **Renders In** | scroll header, below title |

Dedication line. Rendered quietly below the title.

```yaml
dedication: "for Renee"
```

---

#### bodyClass

| Property | Value |
|---|---|
| **Owner** | author / editor |
| **Type** | string |
| **Required** | no |
| **Applies To** | scroll |
| **Renders In** | CSS class applied to scroll body container |
| **Allowed Values** | `verse` `prose` `hybrid` `list` |

Controls body rendering mode. `verse` preserves line breaks. `prose` flows text. `hybrid` supports both. Defaults to `verse` if not specified.

```yaml
bodyClass: verse
```

---

### TYPE: artifact

An artifact is a media-primary object. Physical objects, collages, prints, scans, constructed works. The body may document materials, process, or context.

---

#### artifactType

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string (free or light enum) |
| **Required** | no |
| **Applies To** | artifact |
| **Renders In** | artifact header, object meta |

The kind of physical or constructed object. Not strictly enumerated — the field should describe what it actually is.

```yaml
artifactType: collage
# other examples: print, scan, deck, scroll-object, zine, photograph
```

---

#### materials

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | artifact |
| **Renders In** | artifact detail panel |

Materials list. Free text. The physical substrate and media of the work.

```yaml
materials: "Comic panels, archival adhesive, polyurethane, skateboard deck"
```

---

#### year

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | integer |
| **Required** | no |
| **Applies To** | artifact |
| **Renders In** | artifact detail panel |

Year of physical creation. May differ from `date` (the date the object was archived in the system).

```yaml
year: 2026
```

---

#### dimensions

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | artifact |
| **Renders In** | artifact detail panel |

Physical dimensions. Free text.

```yaml
dimensions: '8.25" × 32"'
```

---

#### source

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | artifact |
| **Renders In** | artifact detail panel |

Origin or provenance of source materials.

```yaml
source: "Comic books, 1987–2004"
```

---

#### location

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | artifact |
| **Renders In** | artifact detail panel |

Physical location of the object.

```yaml
location: "Studio, Gainesville GA"
```

---

#### condition

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | artifact |
| **Renders In** | artifact detail panel |

Physical condition note. Relevant for archival objects.

```yaml
condition: good
# examples: excellent, good, worn, damaged, archival-scan-only
```

---

### TYPE: fieldlog

A field log is a time-stamped observation document. Walk notes, studio notes, process observations, field evidence. Chronological and concrete.

---

#### project

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | fieldlog |
| **Renders In** | field log header |

The project or body of work this observation relates to.

```yaml
project: "Cascade Psalms"
```

---

#### phase

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | fieldlog |
| **Renders In** | field log meta |

Stage of work at time of observation.

```yaml
phase: "early assembly"
```

---

#### context

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | fieldlog |
| **Renders In** | field log header |

Brief situational context. Where, when, under what conditions.

```yaml
context: "Morning walk, North Georgia, fog"
```

---

#### signals

| Property | Value |
|---|---|
| **Owner** | author (llm-suggested) |
| **Type** | array of strings |
| **Required** | no |
| **Applies To** | fieldlog |
| **Renders In** | field log detail, relationship engine |

Observations that carry relational weight toward other objects. LLM may extract during intake.

```yaml
signals:
  - ridge-line-not-visible
  - hip-at-5-of-10
  - practice-of-continuing
```

---

#### actions

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | array of strings |
| **Required** | no |
| **Applies To** | fieldlog |
| **Renders In** | field log detail |

Concrete decisions or actions recorded.

```yaml
actions:
  - "Turned back at the lightning oak"
  - "Begin"
```

---

### TYPE: codex

A codex is a structured long-form document. Specifications, frameworks, methodologies, architectural documents. May have versions.

---

#### version

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | codex |
| **Renders In** | codex header |

Document version. Semantic versioning recommended.

```yaml
version: "2.2"
```

---

#### scope

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | codex |
| **Renders In** | codex meta |

The domain or system this codex governs.

```yaml
scope: "archive architecture"
```

---

#### systemArea

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | codex |
| **Renders In** | codex meta |

Which system component this codex addresses.

```yaml
systemArea: "field contract"
```

---

#### changeType

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | enum |
| **Required** | no |
| **Applies To** | codex |
| **Renders In** | codex meta, version history |
| **Allowed Values** | `major` `minor` `patch` `initial` |

Nature of change from previous version.

```yaml
changeType: major
```

---

#### dependencies

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | array of strings (object ids) |
| **Required** | no |
| **Applies To** | codex |
| **Renders In** | codex detail |

Other codex documents this one depends on or supersedes.

```yaml
dependencies:
  - field-registry
  - codex-archive-system-v2-1
```

---

### TYPE: fragment

A fragment is a small autonomous unit. Aphorism, image-text, compressed observation, micro-essay. Fragments do not require development — they are complete as found.

---

#### lengthClass

| Property | Value |
|---|---|
| **Owner** | system-derived |
| **Type** | enum |
| **Required** | no |
| **Applies To** | fragment |
| **Renders In** | layout sizing, feed card behavior |
| **Allowed Values** | `micro` `short` `medium` |

Computed from word count. `micro` < 50 words. `short` < 150 words. `medium` everything above.

```yaml
lengthClass: micro
```

---

#### origin

| Property | Value |
|---|---|
| **Owner** | author |
| **Type** | string |
| **Required** | no |
| **Applies To** | fragment |
| **Renders In** | fragment footer |

Where the fragment came from if not composed directly.

```yaml
origin: "margin note, February 2026"
```

---

#### voice

| Property | Value |
|---|---|
| **Owner** | llm-suggested (author-confirmed) |
| **Type** | string |
| **Required** | no |
| **Applies To** | fragment |
| **Renders In** | not rendered; informs relationship engine |
| **Allowed Values** | `observational` `aphoristic` `somatic` `documentary` `mythological` |

The register or mode of the fragment. Used for relationship scoring, not display.

```yaml
voice: aphoristic
```

---

### TYPE: nexus

A nexus is a release-level container. It curates existing objects into a guided reading or structured issue.

---

#### lead

| Property | Value |
|---|---|
| **Owner** | editor |
| **Type** | string (object id) |
| **Required** | no |
| **Applies To** | nexus |
| **Renders In** | nexus header, featured position |

The primary object this nexus is built around.

```yaml
lead: the-bones-hold
```

---

#### featured

| Property | Value |
|---|---|
| **Owner** | editor |
| **Type** | array of strings (object ids) |
| **Required** | no |
| **Applies To** | nexus |
| **Renders In** | nexus featured section |

Objects given elevated presentation within the nexus.

```yaml
featured:
  - signal-harvest
  - under-load
```

---

#### includedObjects

| Property | Value |
|---|---|
| **Owner** | editor |
| **Type** | array of objects |
| **Required** | no |
| **Applies To** | nexus |
| **Renders In** | nexus sequence, nexus reading order |

Ordered list of objects included in the nexus, with their roles.

```yaml
includedObjects:
  - ref: signal-harvest
    role: opening-transmission
  - ref: under-load
    role: visual-document
  - ref: morning-walk-log
    role: field-evidence
  - ref: the-bones-hold
    role: closing-affirmation
```

---

#### themeStatement

| Property | Value |
|---|---|
| **Owner** | editor |
| **Type** | string |
| **Required** | no |
| **Applies To** | nexus |
| **Renders In** | nexus introduction |

The editorial framing sentence for this issue. What question does it circle?

```yaml
themeStatement: "What survives compression?"
```

---

#### releaseType

| Property | Value |
|---|---|
| **Owner** | editor |
| **Type** | enum |
| **Required** | no |
| **Applies To** | nexus |
| **Renders In** | nexus meta, feed badge |
| **Allowed Values** | `issue` `sequence` `cluster` `dispatch` |

The structural nature of the release.

```yaml
releaseType: issue
```

---

### TYPE: signal

A signal is a concept-level object. It captures a reusable observation that can connect multiple objects through shared meaning.

---

#### origin

| Property | Value |
|---|---|
| **Owner** | llm-suggested (author-confirmed) |
| **Type** | string |
| **Required** | no |
| **Applies To** | signal |
| **Renders In** | object detail, graph context |

Where this signal came from (for example: derived, observed, inferred).

```yaml
origin: derived
```

---

#### markers

| Property | Value |
|---|---|
| **Owner** | llm-suggested (author-confirmed) |
| **Type** | array of strings |
| **Required** | no |
| **Applies To** | signal |
| **Renders In** | signal preview, relation reasoning |

Compact marker vocabulary used to keep the signal stable and reusable.

```yaml
markers:
  - recognition-language
  - naming-structures
  - refusal-behavior
```

---

## LAYER 3: SYSTEM-DERIVED FIELDS

Computed during ingest or build. Never manually maintained. Listed here for completeness and schema awareness.

---

### slug

Derived from `id`. Used in URL construction.

```text
Owner: system-derived
Computed from: id
Used in: URL, internal links
```

---

### readingTime

Estimated reading time computed from word count.

```text
Owner: system-derived
Computed from: body word count
Used in: object meta (optional display)
```

---

### previewPayload

The content used in feed card previews. Type-dependent.

```text
Owner: system-derived
Computed from: type + excerpt + media
Used in: feed card, constellation list
```

| Type | Preview source |
|---|---|
| scroll | excerpt |
| artifact | hero thumbnail |
| fieldlog | first timestamped entry |
| codex | excerpt or abstract |
| fragment | full body (short) |
| nexus | themeStatement or excerpt |
| signal | excerpt or marker summary |

---

### backlinks

List of objects that reference this object via `related`.

```text
Owner: system-derived
Computed from: related fields across all objects
Used in: object detail page, related works module
```

---

### graphEdges

Edge list derived from shared themes, constellations, explicit relations, nexus inclusion, and signal linkage.

```text
Owner: system-derived
Computed from: themes, constellations, related, nexus.includedObjects, signal objects
Used in: graph view
Weighted by: edge kind (explicit relation > shared constellation > shared theme)
```

---

### canonicalURL

Full public URL for the object.

```text
Owner: system-derived
Computed from: visibility + type + slug
Used in: social metadata, sitemaps, internal links
```

---

## APPENDIX A: ACTIVE THEME REGISTRY

Themes currently in use. New themes require deliberate addition here.

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

**Count:** 16 active  
**Limit:** 50 active  
**Remaining capacity:** 34

---

## APPENDIX B: ACTIVE CONSTELLATION REGISTRY

Constellations currently active. Each maps to a constellation page.

```text
Cascade Psalms
Maintenance Psalms
Archaeological Objects
```

**Count:** 3 active  
**Limit:** 100 active  
**Remaining capacity:** 97

---

## APPENDIX C: LLM INTAKE PROMPT DIRECTION

When processing an inbox item, the LLM should:

1. Read the raw content in full before making any assignments
2. Identify the most likely `type` from the content character
3. Extract or draft an `excerpt` — the sentence the object would choose to represent itself
4. Suggest `themes` drawn from the active theme registry
5. Flag any new themes that appear necessary and cannot be covered by existing ones
6. Suggest `constellations` if the content clearly belongs to an active one
7. Identify `related` candidates by content resonance — do not guess ids, name them descriptively
8. Suggest `media` roles if media files are present in the inbox drop
9. Produce a draft frontmatter block in valid YAML
10. Do not publish. Move to `inbox/ready` for human review.

The LLM never assigns `editor` fields. It may suggest them. The difference matters.

---

## APPENDIX D: VALIDATION CHECKLIST

Before an object moves from `inbox/ready` to `objects/`:

- [ ] `id` is unique across the archive
- [ ] `id` is stable and does not need to change when title changes
- [ ] `type` is one of the six valid types
- [ ] `title` is present
- [ ] `date` is valid ISO 8601
- [ ] `status` is valid
- [ ] `visibility` is valid or defaulting to `public`
- [ ] `themes` are all drawn from the active theme registry (or new themes documented above)
- [ ] `related` targets all exist in the archive
- [ ] `media.role` values are all valid
- [ ] `media.kind` values are all valid
- [ ] Required type fields are complete for the assigned type
- [ ] No duplicate fields
- [ ] No fields outside the registry without documented rationale

Failed objects return to `inbox/needs-info`.

---

## APPENDIX E: FIELD GOVERNANCE RULES

These rules govern all future field additions.

**Rule 1 — Justification required.**
No new field enters the system without answering:
- What is it for?
- Where does it render?
- Who owns it?
- Is it required?
- Does it duplicate an existing field?

**Rule 2 — Type field limit.**
No type should exceed 12 meaningful custom fields without review.

**Rule 3 — Stable naming.**
Prefer semantically stable field names. Avoid `misc`, `specialMode`, `displayOption2`, `altThing`.

**Rule 4 — Prefer enums.**
Wherever values are bounded, use an enum. Document allowed values in this registry.

**Rule 5 — Registry first.**
A field does not exist until it exists here.

---

## APPENDIX F: SPINE CHANGE PROTOCOL (DESIGN EVOLUTION)

Structure changes must be deliberate and evidence-backed.

Use this protocol to ingest design-evolution signals before proposing any schema or lattice change.

1. Run the daily ingest reports:
   - `node scripts/generate-codex-log.mjs objects YYYY-MM-DD`
   - `node scripts/ingest-design-evolution.mjs objects YYYY-MM-DD`
2. Review the five standing registers:
   - `theme_register`
   - `constellation_register`
   - `media_mix_register`
   - `relation_density_register`
   - `field_override_register`
3. Treat these thresholds as structural pressure:
   - dominant theme appears in `>= 45%` of objects, or any theme appears outside the active theme registry
   - objects without constellations are `>= 60%` once object count is at least `10`
  - isolated objects are `>= 40%` once object count is at least `10`, or any non-`nexus` object reaches relation degree `>= 8`
   - unregistered frontmatter keys are present in any object
   - at least `3` objects carry multi-kind media sets, or unknown media kinds appear
4. If any threshold is crossed, open a dated review note:
   - `docs/spine-change-review-YYYY-MM-DD.md`
   - include register evidence, affected objects, and one explicit structural question
5. Apply change control in strict order:
   - update `docs/field-registry.md` first
   - update schema and validators (`astro/src/content/config.ts`, `scripts/object-utils.mjs`)
   - re-run validation/build checks
   - record decision in the next codex log
6. Constraints:
   - no automatic structure changes
   - no publication-state escalation by automation
   - no id rewrites to satisfy layout or naming preference
   - if no threshold is crossed, result is explicit: `no spine change`

---

*Field Registry — Codex Archive System v2.2*  
*Last updated: 2026-03-07*  
*Next review: when object count exceeds 50 or signal schema requires expansion*
