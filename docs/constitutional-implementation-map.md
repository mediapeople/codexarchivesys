# ✦ Constitutional Implementation Map ✦

## Twelve Notes → Actual Files

### Codex Archive System v2.5 — March 2026

---

> This document maps each constitutional note to its implementation status.
>
> Three states are possible:
>
> **IMPLEMENTED** — the principle is active in a specific file at a specific location  
> **PARTIAL** — the principle is partially implemented; the gap is named  
> **CONSTITUTIONAL ONLY** — the principle exists as doctrine; no file enforces it yet

---

## I — The Archive Exists to Preserve Work

**Pattern:** Durability-first system design

| Status | PARTIAL |
|---|---|
| **Enforced by** | `field-registry.md` — Markdown as substrate, open format, system-independent |
| **Enforced by** | `config.ts` — schema validation prevents malformed objects from entering |
| **Enforced by** | `codex-archive.html` — prototype demonstrates object persistence across session |
| **Gap** | No actual persistence layer exists yet. The prototype uses in-memory state. Objects are not written to disk. The archive does not yet archive anything. |
| **What closes the gap** | Astro static build: the `objects/` directory becomes the durable store. Until that exists, preservation remains a stated value without an enforcement mechanism. |

---

## II — Objects Are the Primary Unit

**Pattern:** Object-centered architecture / atomic content model

| Status | IMPLEMENTED |
|---|---|
| **Enforced by** | `field-registry.md` — Layer 1 defines the universal object structure. Every object has `id`, `type`, `title`, `date`, `status`. These fields are sufficient to describe an object without surrounding context. |
| **Enforced by** | `config.ts` — six independent collection schemas. Each type is defined as a self-describing unit. No type depends on another to be valid. |
| **Enforced by** | `codex-archive.html` — the `ARCHIVE` array is a flat list of objects. Relationships are computed additively at render time, not embedded structurally. |
| **Gap** | None architecturally. Objects are properly atomic. The remaining gap is practical: no real objects exist in the canonical store yet, only prototype seeds. |

---

## III — Structure Serves the Work

**Pattern:** User-value-first architecture / anti-overengineering

| Status | PARTIAL |
|---|---|
| **Enforced by** | `field-registry.md` — Governance Rule 1 requires every new field to answer "what is it for" and "where does it render." Fields without rendering or relational purpose are blocked. |
| **Enforced by** | `field-registry.md` — Governance Rule 2 caps type-specific fields at ~12. |
| **Enforced by** | `config.ts` — every field in the schema has a corresponding registry entry. No orphan fields. |
| **Gap** | The principle is architecturally honored but not yet stress-tested. The real test happens when the first real inbox item arrives and the schema either absorbs it cleanly or fights it. That test has not happened. |
| **What closes the gap** | First real intake run. The intake prompt is ready. |

---

## IV — The Spine Must Remain Tight

**Pattern:** Stable core / minimal kernel architecture

| Status | IMPLEMENTED |
|---|---|
| **Enforced by** | `field-registry.md` — five required fields: `id`, `type`, `title`, `date`, `status`. Everything else is optional. The spine is explicitly bounded and named. |
| **Enforced by** | `config.ts` — the five required fields are enforced as required schema fields. No `.optional()`. The schema rejects an object missing any of them. |
| **Enforced by** | `codex-status-v2.5.md` — the doctrine appears explicitly: *the spine changes rarely. If the spine remains stable, the system remains understandable.* |
| **Gap** | The spine is defined and schema-enforced, but it has no change-control mechanism. There is no rule yet stating that spine changes require a version increment and documented rationale. That governance remains constitutional only. |
| **What closes the gap** | A short "Spine Change Protocol" section in `field-registry.md`. |

---

## V — The Lattice Must Remain Bounded

**Pattern:** Controlled complexity / bounded relational topology

| Status | IMPLEMENTED |
|---|---|
| **Enforced by** | `field-registry.md` — Appendix A: Active Theme Registry, 16 themes, 50-theme limit, remaining capacity tracked |
| **Enforced by** | `field-registry.md` — Appendix B: Active Constellation Registry, 3 constellations, 100-constellation limit, remaining capacity tracked |
| **Enforced by** | `field-registry.md` — object type count: 6, limit 10. Media role count: 7, limit 10 |
| **Enforced by** | `llm-intake-prompt.md` — the intake prompt instructs the LLM to draw only from active theme and constellation lists, and to flag rather than silently add new entries |
| **Gap** | The limits are stated and tracked on paper but not enforced at build time. Nothing currently prevents a 51st theme from being committed to `field-registry.md`. Enforcement is currently human-trust-based. |
| **What closes the gap** | A build-time validation script that counts active themes and constellations and fails the build if limits are exceeded. Low priority until object count makes this a real risk. |

---

## VI — Growth Should Not Require Reorganization

**Pattern:** Scalability without schema churn

| Status | PARTIAL |
|---|---|
| **Enforced by** | `config.ts` — the schema uses `.default([])` for array fields and `.optional()` for non-required fields. New objects with partial metadata remain valid. |
| **Enforced by** | `field-registry.md` — the field ownership model separates author fields from system-derived fields. Adding a new object does not require manually computing backlinks, slugs, or graph edges. |
| **Gap** | The principle is honored in schema design but untested in practice. The real test is whether the tenth object can be added with the same friction as the first. That test requires a working Astro build. |
| **Gap** | The `related` field requires valid target ids. At seven objects this is trivial; at scale it becomes a real coordination burden unless the system assists. |
| **What closes the gap** | Astro build with validation, a working `inbox/` system, and a pipeline that absorbs the friction so the author does not feel it. |

---

## VII — The Archive Observes Itself

**Pattern:** Observability / telemetry / reflective systems

| Status | CONSTITUTIONAL ONLY |
|---|---|
| **Enforced by** | `codex-status-v2.5.md` — the status document is a manual instance of self-observation. Object counts, type counts, constraint counts, and gaps are recorded. But this is human-authored, not system-generated. |
| **Defined in** | `v2.2 Master Specification` Section XXXII — the Codex Log System. Defined as `logs/codex-log-YYYY-MM-DD.md`. Specifies object counts, type counts, theme counts, constellation counts, graph edge counts, schema warnings, and suggested cleanups. |
| **Gap** | No log has ever been generated. The log system is architecture without implementation. The `logs/` directory does not exist. No script produces log files. |
| **What closes the gap** | A single build script: walk `objects/`, count by type, theme, and constellation, count graph edges, check for schema warnings, and write `logs/codex-log-YYYY-MM-DD.md`. |
| **Priority** | Medium-high. The system cannot honestly claim self-observation until at least one log exists. |

---

## VIII — Machines May Assist but Not Govern

**Pattern:** Human-in-the-loop governance

| Status | IMPLEMENTED |
|---|---|
| **Enforced by** | `llm-intake-prompt.md` — the intake prompt is explicit: the LLM may suggest but not assign editor fields; it drafts but does not publish; `draft` is the only valid output status; it flags rather than silently adds themes or constellations; every output is marked for human review. |
| **Enforced by** | `field-registry.md` — the field ownership model names four owner classes. `llm-suggested` is a distinct class: proposed by the system, never canonical until approved. |
| **Enforced by** | `v2.2 Master Specification` Section XXX — "Nothing becomes canonical until reviewed." |
| **Gap** | The governance model exists as written instruction and field ownership classification. It is not yet technically enforced; no system currently blocks an LLM-suggested field from being committed directly to `objects/` without review. Enforcement is human-discipline-based. |
| **What closes the gap** | The `inbox/ready` → `objects/` transition is the practical enforcement point. As long as that transition requires a deliberate human move, machine governance is functionally blocked. Technical enforcement beyond that would be unnecessary bureaucracy. |

---

## IX — Simplicity Is a Structural Value

**Pattern:** Complexity minimization / anti-fragile restraint

| Status | IMPLEMENTED |
|---|---|
| **Enforced by** | `field-registry.md` — Governance Rule 1 requires justification for every field. Governance Rule 2 caps type fields at 12. Governance Rule 3 bans semantically unstable field names. Governance Rule 5: "A field does not exist until it exists here." |
| **Enforced by** | `config.ts` — the schema is compact across all six types and enums. The universal base is 10 fields. Type extensions remain narrow. |
| **Enforced by** | `codex-archive.html` — the prototype runs without external dependencies. One file. 36KB. |
| **Gap** | Simplicity is a value that degrades under accumulation pressure. The governance rules protect it structurally, but the real protection is editorial willingness to say no when pressure arrives. That is a human decision, not a technical one. |
| **What closes the gap** | Nothing technical. The governance rules already exist. The protection is using them. |

---

## X — The Archive Is a Long Instrument

**Pattern:** Long-horizon systems design

| Status | PARTIAL |
|---|---|
| **Enforced by** | `field-registry.md` — `id` is the stable permanent identifier: once set, never changed. Titles may change; ids do not. |
| **Enforced by** | `field-registry.md` — `archived` status preserves objects without indexing them. Objects are not deleted; they are archived. |
| **Enforced by** | `v2.2 Master Specification` Section XI — "Markdown remains canonical." Plain text outlives every platform. |
| **Gap** | The archive has been designed for long duration but not yet tested by time. No objects have been archived. No ids have yet survived title revision. No hosting transition has occurred. |
| **Gap** | No backup or export strategy is documented. The `objects/` directory is the right canonical source, but no protocol ensures it is backed up, versioned, or portable to a new host. |
| **What closes the gap** | First Astro build deployed to static hosting. A documented backup strategy. The first id surviving a title change without breaking continuity. |

---

## XI — The Archive Should Remain Legible

**Pattern:** Graceful degradation / format independence / portability

| Status | IMPLEMENTED |
|---|---|
| **Enforced by** | `v2.2 Master Specification` — Markdown is canonical. YAML frontmatter is the metadata substrate. Both are human-readable without tooling. |
| **Enforced by** | `field-registry.md` — every field is documented in plain language. A reader with no system knowledge could inspect a file and understand its structure. |
| **Enforced by** | `config.ts` — the schema uses Zod, but the schema is not the source of truth; the registry is. The model could be re-expressed in another language if needed. |
| **Enforced by** | `codex-archive.html` — the prototype uses no external dependencies and renders in any modern browser. |
| **Gap** | None structural. The main ongoing risk is frontmatter creep: technically legible, practically opaque. Governance Rule 2 protects against that. |

---

## XII — The Doctrine

**Pattern:** Constitutional compression / governing invariant

| Status | IMPLEMENTED |
|---|---|
| **Stated in** | `v2.2 Master Specification` Section XXXV — *"The spine stays tight. The lattice remains bounded. The archive grows without collapsing into disorder."* |
| **Stated in** | `codex-status-v2.5.md` — the status document closes with the doctrine statement. |
| **Tested against** | `field-registry.md` — every new field is governed by Rule 1: what is it for, where does it render, who owns it, is it required, does it duplicate an existing field. This is the doctrine operating as a practical test. |
| **Gap** | The doctrine is stated but not applied retroactively across all current artifacts. No document had yet asked, file by file: does this loosen the spine unnecessarily? Does this unbound the lattice unnecessarily? |
| **What closes the gap** | This document. The implementation map is the doctrine operating as checksum. |

---

## Summary Table

| Note | Principle | Status |
|---|---|---|
| I | Preserve Work | PARTIAL — no durable store yet |
| II | Objects Are Primary | IMPLEMENTED |
| III | Structure Serves Work | PARTIAL — untested under real intake |
| IV | Tight Spine | IMPLEMENTED |
| V | Bounded Lattice | IMPLEMENTED — limits stated, not build-enforced |
| VI | Growth Without Reorganization | PARTIAL — schema ready, pipeline not built |
| VII | Archive Observes Itself | CONSTITUTIONAL ONLY |
| VIII | Machines Assist, Don't Govern | IMPLEMENTED |
| IX | Simplicity | IMPLEMENTED |
| X | Long Instrument | PARTIAL — designed for duration, not yet tested by it |
| XI | Remain Legible | IMPLEMENTED |
| XII | The Doctrine | IMPLEMENTED |

---

## Gap Priority Stack

Ordered by how much the gap undermines the constitutional claim.

### 1. Note VII — Self-Observation

**The system claims to observe itself and does not.**

One build script closes this: `logs/codex-log-YYYY-MM-DD.md` with object counts, type counts, theme counts, graph counts, and schema warnings.

### 2. Note I — Preservation

**The archive claims to preserve work and does not yet store it durably.**

This closes with the Astro build and canonical `objects/` store.

### 3. Note VI — Growth Without Reorganization

**The claim that growth is low-friction cannot be tested without a working intake pipeline.**

This closes with Astro build + `inbox/` system + first real intake run.

### 4. Note IV — Spine Change Protocol

**The spine is schema-enforced but has no documented change control.**

One short protocol section in `field-registry.md` closes it.

### 5. Note X — Long Instrument

**The archive is designed to outlive platforms but has no documented survival procedure.**

A short backup strategy is sufficient. Git as canonical versioned source is enough if explicitly named.

---

## What Is Already Sound

Four notes are fully implemented without meaningful gap:

- **Note II** — every object is atomic, self-describing, and independent
- **Note VIII** — machine authority is bounded in both the intake prompt and the registry
- **Note IX** — simplicity is enforced by governance rules and honored in every artifact
- **Note XI** — Markdown and YAML guarantee legibility independent of platform

One additional note is effectively implemented with minor closure needed:

- **Note IV** — the spine is tight and schema-enforced; spine change protocol is one paragraph away

---

## Honest Summary

The system is constitutionally coherent and architecturally sound.

Five of twelve notes are fully implemented in specific files at specific locations.

Four notes are partially implemented: the schema and governance are correct, but the pipeline that exercises them does not yet exist.

One note remains constitutional only: self-observation is the clearest gap between what the system says it is and what it currently does.

The doctrine holds across all twelve notes:

- nothing in the current artifacts loosens the spine unnecessarily
- nothing in the current artifacts unbounds the lattice unnecessarily

The system is ready to build.

---

*Constitutional Implementation Map — Codex Archive System v2.5*  
*Date: 2026-03-07*  
*Triggered by: v2.5 Respawn Alignment Pass*
