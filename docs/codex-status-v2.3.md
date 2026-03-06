# CODEX ARCHIVE SYSTEM
## Project Status Document
### v2.3 — March 5, 2026

---

## CURRENT VERSION

**v2.3**

This document supersedes the v2.2 Master Specification.

The spine is stable.
The lattice is bounded.
The first implementation artifacts exist.

---

## STATUS SUMMARY

```
SPEC            complete        v2.2 Master Specification
FIELD REGISTRY  complete        docs/field-registry.md
SCHEMA          complete        astro/src/content/config.ts
INTAKE PROMPT   complete        docs/llm-intake-prompt.md
PROTOTYPE       complete        single-file HTML, browser-safe
ASTRO BUILD     not started
OBJECT ARCHIVE  seed only       7 demo objects in prototype
INBOX SYSTEM    not started
DEPLOYMENT      not started
```

---

## WHAT HAS BEEN BUILT

### The Specification (v2.2)

A 35-section master document covering:

- Core philosophy and transformation model
- The Spine: objects, field contract, types, time ordering, media roles
- The Lattice: themes, constellations, cross-links, graph relationships
- All six object types with full field sets
- Field ownership model (author / editor / llm-suggested / system-derived)
- Field governance rules and naming conventions
- Normalized enums for all bounded value sets
- Media system with kind and role separation
- Mobile scrubber interaction model
- Five navigation modes (feed, explore, constellations, nexus, graph)
- Astro implementation layer with stack specification
- Repository structure
- Content collection model direction
- Layout and component contracts
- Feed, constellation, nexus, and graph contracts
- Inbox system and LLM curation model
- Validation rules
- Codex log system
- Build pipeline (12-stage)

**Doctrine:** A tight spine and a reasonably bounded lattice.

---

### The Field Registry (v2.2)

`docs/field-registry.md`

The ground truth for all fields in the system. No field exists without a record here.

**Coverage:**

- Layer 1: 10 universal fields — id, type, title, date, status, excerpt, themes, constellations, related, visibility, media
- Layer 2: 25 type-specific fields across all six object types
- Layer 3: 5 system-derived fields — slug, readingTime, previewPayload, backlinks, graphEdges, canonicalURL

**Type field sets:**

| Type | Fields |
|---|---|
| scroll | series, cadence, tone, dedication, bodyClass |
| artifact | artifactType, materials, year, dimensions, source, location, condition |
| fieldlog | project, phase, context, signals, actions |
| codex | version, scope, systemArea, changeType, dependencies |
| fragment | lengthClass, origin, voice |
| nexus | lead, featured, includedObjects, themeStatement, releaseType |

**Appendices:** Active theme registry (16/50), active constellation registry (3/100), LLM intake direction, validation checklist, governance rules.

---

### The Astro Schema

`astro/src/content/config.ts`

TypeScript content collection definitions derived directly from the field registry.

- All six object types defined as typed collections
- All enums exact and bounded
- Universal base fields composed into each type schema
- Exported TypeScript types for use in components and layouts
- Ready to drop into an Astro project

---

### The LLM Intake Prompt

`docs/llm-intake-prompt.md`

The operational prompt given to an LLM when processing raw inbox material.

Covers:

- Type decision guide with disambiguation rules
- Active theme list (drawn from registry)
- Active constellation list with scope descriptions
- Excerpt rules — what the excerpt is, what it is not, good vs. bad examples
- Field ownership rules — what the LLM may assign vs. what it must flag
- Output format with frontmatter template
- Intake notes section format
- Hard list of what the LLM does not do

---

### The Browser Prototype

Single-file HTML. No external dependencies. Runs in any browser.

Four panels:

- **Archive** — full object feed with type filtering, sortable, object detail view with related works scoring
- **Nexus** — curated transmission view with guided reading sequence
- **Graph** — live force-directed node graph, hover tooltips, click to open
- **Compose** — real-time shorthand parser, adds objects to live archive

Seven seed objects across all types. Real relationship engine. Real graph edges. Shorthand parser that ingests `::scroll`, `@th`, `@cx`, `@x` syntax and produces structured previews.

**File size:** 36KB. No network requests.

---

## ACTIVE CONSTRAINTS

### Active theme registry

```
signal, memory, pressure, maintenance, survival, structure,
crystallization, transmission, observation, place, morning,
systems, architecture, methodology, collage, comics
```

**Count:** 16 / 50 limit

---

### Active constellation registry

```
Cascade Psalms          — compression, pressure, what survives weight
Maintenance Psalms      — continuing, Tuesdays, the practice of keeping on
Archaeological Objects  — physical artifacts, constructed works, recovered material
```

**Count:** 3 / 100 limit

---

### Object type count

```
scroll, artifact, fieldlog, codex, fragment, nexus
```

**Count:** 6 / 10 limit

---

## WHAT v2.3 ADDS

v2.3 is a status and clarification release. No structural changes to the spec.

**Clarifications carried forward:**

1. The `media` object for artifacts should include an `alt` field (accessibility) and optional `caption` field. Both are present in the schema as `.optional()`. The registry entry for `media` should reflect this in the next registry revision.

2. The `nexus.includedObjects` role field is free text in the schema (`z.string()`). A soft enum should be documented in the registry when enough real nexus objects exist to identify the natural role vocabulary. Do not enumerate prematurely.

3. `bodyClass` defaults to `verse` in the schema. This is the right default for scrolls. Prose or hybrid works need explicit declaration.

4. `lengthClass` for fragment is marked `system-derived` in the registry but `optional()` in the schema, allowing manual override. This is intentional — an author may want to classify a long fragment as `micro` by deliberate compression.

5. The intake prompt should be tested against at least three real inbox items before being considered stable. It is a first draft.

---

## IMMEDIATE NEXT MOVES

In order of dependency.

### 1. Initialize the Astro project

```bash
npm create astro@latest codex
cd codex/astro
npm install
```

Drop `config.ts` into `src/content/`.
Create the six collection directories under `src/content/`.
Verify schema validation runs clean.

**Dependency:** Nothing. This can happen now.

---

### 2. Port the seven seed objects

Move the prototype's seven demo objects into actual Markdown files in `objects/`.

```
objects/scroll/signal-harvest.md
objects/scroll/the-bones-hold.md
objects/artifact/under-load.md
objects/fieldlog/north-georgia-march-2026.md
objects/fragment/on-object-oriented-archives.md
objects/codex/codex-archive-system-v2-2.md
objects/nexus/signal-descent-001.md
```

This gives the schema real objects to validate against and immediately surfaces any field gaps.

**Dependency:** Astro project initialized.

---

### 3. Build BaseLayout and the feed

`BaseLayout.astro` — shell, nav, footer, global styles.
`FeedStream.astro` — reverse chronological object stream.
`ObjectCard.astro` — card grammar per the spec: type badge, date, title, preview payload, constellation chips.

At this point the archive is readable. That is the minimum viable site.

**Dependency:** Seed objects ported.

---

### 4. Build type layouts

One layout per object type. Start with scroll (most content, most nuanced) then artifact (media-first).

```
ScrollLayout.astro
ArtifactLayout.astro
FieldLogLayout.astro
CodexLayout.astro
FragmentLayout.astro
NexusLayout.astro
```

**Dependency:** BaseLayout complete.

---

### 5. Build the relationship engine

A lib function that computes related objects from shared themes, shared constellations, explicit `related` links, and nexus inclusion. Weighted scoring. Top 3 returned.

```
astro/src/lib/relations.ts
```

This is already prototyped in the browser build — it is a clean port.

**Dependency:** Seed objects ported. Type layouts complete.

---

### 6. Build the graph data generator

A build-time script that walks `objects/` and produces `graph.json` — nodes and edges per the spec's graph contract.

```
astro/src/lib/graph.ts
```

**Dependency:** Relationship engine complete.

---

### 7. Test the intake prompt

Run three real inbox items through the LLM intake prompt. Document what worked, what didn't, what was ambiguous. Revise the prompt. This is the only way to know if the intake system is real.

**Dependency:** None. This can happen in parallel with anything.

---

### 8. Initialize the inbox

```
inbox/
  drop/
  processing/
  needs-info/
  ready/
```

Drop the first real piece of raw material into `inbox/drop/`.
Run it through the intake prompt.
Review the output.
Move to `inbox/ready/`.
Port to `objects/` after human approval.

**Dependency:** Intake prompt tested.

---

## WHAT THIS SYSTEM IS NOT YET

- Not an Astro site
- Not deployed
- Not publicly accessible
- Not connected to a real inbox
- Not running real LLM intake
- Not generating real graph data
- Not validating real objects at build time

---

## WHAT THIS SYSTEM IS

- Fully specified
- Fully schematized
- Field-governed
- Intake-ready
- Prototyped and interactive
- Ordered for build

The contributor can experience freedom.
The archive is ready to maintain order.

---

## OPEN QUESTIONS

**1. Astro hosting target**

Static hosting is assumed. Where does it deploy — Netlify, Vercel, Cloudflare Pages? This affects whether server-side features are worth enabling later.

**2. Mobile scrubber interaction**

The spec describes the mobile-native front door as a chronological scrub model. This needs a design pass before the feed component is finalized. Is this a swipe gesture? A scroll with snap points? A dedicated mobile route?

**3. Graph view technology**

The prototype uses a canvas-based force-directed simulation. For the real site, options include: D3 (full control, more JS), Cytoscape.js (graph-specific, feature-rich), or the prototype's canvas approach ported to a component. Decision needed before `NodeGraph.astro` is built.

**4. Nexus release cadence**

The spec defines nexus as the curated issue format. How often? Triggered by what — object count, thematic completion, calendar? This is an editorial decision, not a technical one. But the cadence affects how the nexus section of the feed reads.

**5. Field Registry revision trigger**

The registry ends with: *next review when object count exceeds 50 or a new type is proposed.* This is the right trigger. But the registry should also be reviewed whenever a new constellation is proposed, since constellations may reveal field needs the current set doesn't cover.

---

## DOCUMENTS PRODUCED

```
docs/field-registry.md          — canonical field contract
docs/llm-intake-prompt.md       — LLM intake operational prompt
astro/src/content/config.ts     — Astro content collection schema
prototype/codex-archive.html    — single-file interactive prototype
```

---

## THE DOCTRINE HOLDS

```
raw material enters freely
↓
field structure absorbs it
↓
type determines rendering
↓
relations determine discovery
↓
Astro publishes the archive
```

The spine is tight.
The lattice is bounded.
The archive grows without collapsing into disorder.

---

*Codex Archive System — Status Document v2.3*
*Date: 2026-03-05*
*Previous version: v2.2 Master Specification*
*Next review trigger: Astro build initialized, first real objects ported*
