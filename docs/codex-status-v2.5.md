# CODEX ARCHIVE SYSTEM
## Project Status Document
### v2.5 — March 7, 2026

Superseded by: `docs/codex-status-v2.6.md`

---

## CURRENT VERSION

**v2.5**

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
INTAKE PROMPT   complete        docs/llm-intake-prompt.md (iterating with real inputs)
PROTOTYPE       complete        single-file HTML, browser-safe (legacy baseline)
ASTRO BUILD     complete        feed, object pages, nexus, graph
OBJECT ARCHIVE  active          19 objects in canonical store
INBOX SYSTEM    active          drop/processing/needs-info/ready
RELATION ENGINE complete        astro/src/lib/relations.ts + build graph pipeline
DEPLOYMENT      pending         first public preview target
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

## WHAT v2.5 ADDS

v2.5 is an implementation, design, and operations release.
It keeps the spine stable while improving object presentation and system legibility.

**Added in v2.5:**

1. Feed, nexus, and graph are all live in Astro with object detail routes and cross-object relation surfacing.
2. Dedicated nexus listing + reader pages are active and connected to archive objects.
3. Card grammar shifted to object-first readability with reduced redundant copy and stronger media framing.
4. Shared design tokens now govern gutter rhythm and letterspacing to reduce drift across views.
5. Build-time graph export runs automatically before `npm run build`.
6. System logs and design-evolution ingest scripts are active for reflective maintenance.
7. Object detail layout now allows metadata/taxonomy to render after primary content when that preserves object-first reading flow.

**Expanded learnings from implementation:**

1. Object-first systems fail quietly when spacing hierarchy is inconsistent; rhythm is part of information architecture.
2. Strong cards need one narrative center. Duplicate lead/excerpt patterns weaken meaning.
3. Relation quality matters more than relation count. High-signal links outperform dense low-signal meshes.
4. Theme discipline is an editorial operation, not just a schema constraint.
5. Nexus works best as sequence craft, not automatic aggregation.
6. Typography and border logic must be field-governed like data fields; visual drift is structural drift.
7. The archive becomes trustworthy when logs, validation, and graph generation run as routine, not ceremony.
8. Respawn quality depends on a small canonical file chain, not total documentation volume.
9. Metadata order is a presentation decision. For text-led works, supporting metadata can be subsequent to the object body without changing the field contract.

---

## IMMEDIATE NEXT MOVES

In order of operational impact.

### 1. Curate the current draft corpus

Review all draft objects for excerpt quality, theme precision, and relation integrity.
Promote only coherent entries.

### 2. Run three real inbox intake passes

Use `inbox/drop/` source material and process through `processing` → `ready` / `needs-info`.
Document failure modes and update `docs/llm-intake-prompt.md`.

### 3. Operationalize codex log cadence

Run daily or per-merge log generation:

```bash
node scripts/generate-codex-log.mjs objects YYYY-MM-DD
node scripts/ingest-design-evolution.mjs objects YYYY-MM-DD
node scripts/generate-graph-json.mjs objects astro/public/graph.json
```

### 4. Publish first deploy preview

Push repo and run first hosted preview smoke test across feed, object detail, nexus, and graph routes.

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

*Codex Archive System — Status Document v2.5*
*Date: 2026-03-07*
*Previous version: v2.2 Master Specification*
*Next review trigger: first hosted preview + three real inbox intake runs complete*
