---
id: nd-codex-object-classification
type: codex
title: "ND Codex Object Classification"
date: "2026-03-15"
postedAt: "2026-03-15T04:51:09.923Z"
status: published
visibility: public
tags:
  - "[taxonomy"
  - "archive"
  - "structure"
  - "methodology]"
images:
  - "[]"
state: published
dependencies: []
excerpt: "ND Codex Object Classification The ND Codex archive organizes all entries into eight object classes. Each class describes the role an object plays in the archive , not the topic…"
themes:
  - "[taxonomy"
  - "archive"
  - "structure"
  - "methodology]"
media:
  - kind: image
    src: "[]"
    role: gallery
---
# ND Codex Object Classification

The ND Codex archive organizes all entries into eight object classes.  
Each class describes the **role an object plays in the archive**, not the topic it discusses.

Objects may share themes or subject matter, but each object belongs to **exactly one class**.

This classification keeps the archive readable, navigable, and structurally stable.

---

# The Eight Object Classes

## Signal

Short, high-clarity statements intended for immediate interpretation and use.

Signals act as **compressed transmissions**.  
They are designed to communicate meaning quickly and clearly without requiring extended context.

Typical characteristics:

- concise
- direct
- immediately interpretable
- high signal-to-noise ratio

Signals often function as **entry points into larger structures**.

---

## Fragment

Small units of meaning meant to remain useful alone while remaining expandable later.

Fragments preserve ideas before they fully develop into larger structures such as scrolls or codex entries.

Typical characteristics:

- incomplete but self-contained
- conceptually dense
- expandable
- portable

Fragments frequently become seeds for future work.

---

## Field Log

Dated records describing system condition, constraints, and directional adjustments.

Field logs document **what is happening in the system over time**.

Typical characteristics:

- timestamped
- observational
- operational
- situational

Field logs provide **context for how the archive evolves**.

---

## Artifact

Physical or digital outputs that document what was made and how it holds up.

Artifacts are **evidence objects**.

Typical characteristics:

- visual or material focus
- documentation of process
- demonstration of construction
- observable results

Artifacts answer:

- what exists
- how it was made
- what condition it holds

---

## Scroll

Extended writing that carries context, sequence, and sustained argument.

Scrolls represent **narrative or conceptual movement**.

Typical characteristics:

- structured progression
- extended reasoning or storytelling
- thematic continuity
- longform composition

A scroll should feel like **a path the reader follows**.

---

## Codex

Core references that define stable standards for structure, classification, or publishing.

Codex entries act as **structural anchors for the archive**.

Typical characteristics:

- definitional
- stable
- procedural
- architectural

Codex entries change rarely and provide **shared reference points** for the system.

---

## Loremap

Place-anchored field definitions mapping terrain, symbolic layers, and recurring signals.

Loremaps organize knowledge spatially rather than narratively.

Typical characteristics:

- geographic anchoring
- symbolic geography
- layered interpretation
- long-term observation

Loremaps help readers understand **how place shapes signal**.

---

## Nexus

Curated reading chains that connect multiple objects into coherent narrative movement.

A nexus functions as a **navigation structure**.

Typical characteristics:

- linking
- sequencing
- contextualizing
- guiding interpretation

Nexus entries do not introduce new objects;  
they **reveal relationships between existing ones**.

---

# Structural Principle

Every object belongs to exactly one class.

Object classes describe **role**, not topic.

For example:

- a collage may be an **artifact**
- a reflection about that collage may be a **field log**
- an extended essay about the process may be a **scroll**

Each class contributes a different function within the archive.

---

# Archive Layers

The eight classes naturally organize into four operational layers.

## Transmission

signal  
fragment  

Immediate meaning units.

---

## Documentation

artifact  
field-log  

Records of evidence and process.

---

## Structure

scroll  
codex  

Extended or stable frameworks.

---

## Navigation

loremap  
nexus  

Ways to traverse the archive.

---

# Implementation

Carrier Pigeon ingest reads the `object_type` field and routes the object to the appropriate collection.

Example routing:

scroll → src/content/scrolls/  
loremap → src/content/loremaps/  
artifact → src/content/artifacts/  
field-log → src/content/field-logs/  
codex → src/content/codex/  
fragment → src/content/fragments/  
nexus → src/content/nexus/  
signal → src/content/signals/

This routing allows the archive to grow while maintaining clear structural boundaries.

---

# Summary

The ND Codex classification system supports four forms of knowledge:

- transmission
- evidence
- structure
- navigation

Together these allow the archive to function not merely as a repository, but as a **living knowledge system**.