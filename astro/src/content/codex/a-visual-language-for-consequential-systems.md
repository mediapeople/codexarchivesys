---
id: a-visual-language-for-consequential-systems
slug: "a-visual-language-for-consequential-systems"
url: "https://ndcodex.com/codex/a-visual-language-for-consequential-systems"
type: codex
title: "A Visual Language for Consequential Systems"
date: "2026-07-21"
status: published
visibility: public

summary: "Previewing HUD Canonical Source RC1.0—an instrument library for evidence, authority, uncertainty, failure, and verified action."
excerpt: "HUD Canonical Source began as a visual study and became a publication-tested Figma instrument system for operating complex physical and civic infrastructure."

tags:
  - design systems
  - figma
  - instrumentation
  - critical interfaces
  - infrastructure
  - codex
images:
  - "/media/codex/a-visual-language-for-consequential-systems.png"
state: published

scale: macro
depth: structural
focus: system
function: revelatory
themes:
  - design systems
  - instrumentation
  - infrastructure
  - critical interfaces
  - human-machine systems

media:
  - kind: image
    src: "/media/codex/a-visual-language-for-consequential-systems.png"
    role: hero
    alt: "An operational instrumentation atlas combining terrain, radar, infrastructure topology, tracked movement, sensor correlation, and temporal signals."
    capture:
      width: 1672
      height: 941
      shape: wide
      format: "png"
      originalFilename: "exec-b2a795e0-0480-43f8-8fe1-d68f75a16641.png"

author:
  name: "Nathan Davis"
dependencies: []
---

# A Visual Language for Consequential Systems

Most HUDs are designed as images of intelligence: glowing reticles, targeting marks, telemetry, and technical type arranged to make a screen feel advanced.

HUD Canonical Source began in that territory. The alpha was sparse, precise, and atmospheric. It had axes, targeting frames, signal colors, floating readouts, and the beginnings of a visual grammar.

But the project kept asking a more difficult question:

> What must an interface preserve when someone is trying to understand and operate a consequential system?

That question changed the work completely.

The result is HUD Canonical Source RC1.0: a research-driven, publication-tested Figma library for displaying not only values, but evidence, identity, time, uncertainty, authority, action, failure, and physical verification.

It is less a collection of science-fiction graphics than a visual operating language for the hidden systems beneath ordinary life.

## The HUD escaped the cockpit

The project’s clearest ancestor is the aircraft flight deck.

Flight instrumentation must keep several forms of truth separate at the same time:

- what the aircraft is doing;
- what the pilot selected;
- what automation commanded;
- what the system predicts;
- what safety limits restrict;
- what physically occurred.

Collapse those states and the display becomes dangerous.

The same problem appears far beyond aviation. It exists in electrical grids, water systems, ports, hospitals, transit networks, weather operations, process control, emergency coordination, and public-health surveillance.

These systems are physical—pumps, bodies, turbines, valves, vessels, tracks, weather, and moving water—but their operational surface is increasingly digital. Sensors translate reality into signals. Software correlates those signals into conclusions. Interfaces determine what becomes visible, urgent, trusted, or actionable.

The HUD has become the perceptual layer through which civilization watches itself remain operational.

## From graphic vocabulary to instrument canon

The early library developed through cartography, terrain, waterways, elevation, ground and flight modes, radar, AWACS, sonar, maritime navigation, weather, transit, power, epidemiology, and industrial process control.

Each domain changed the primitives.

Radar introduced acquisition, history, correlation, and track quality. Sonar made environmental context and uncertain returns unavoidable. Maritime systems required vessel identity, source age, current vectors, navigation constraints, and civilian authority. Weather made observation time and forecast horizon central. Power and process control exposed topology, interlocks, reserve margin, alarms, and cascading failure. Epidemiology demonstrated how dangerous a value becomes when separated from its denominator, reporting window, or provisional status.

Across the domains, the same operational questions kept returning:

```text
What is this?
Where did the information come from?
How old is it?
Can it be trusted?
What is happening now?
What is intended?
What limit is approaching?
Who may act?
What action was issued?
Did the physical system respond?
What remains possible after failure?
```

Those questions became the real component architecture.

## An interface should reveal how it knows

One of the project’s central ideas is that operational interfaces need an epistemology.

An observation is not the same as a report. A report is not the same as a correlation. A correlation is not the same as an inference. Agreement among sources has to be earned, and disagreement should remain visible.

The library therefore treats provenance and confidence as interface material:

- observed;
- reported;
- correlated;
- inferred;
- conflicting;
- provisional;
- verified.

This led to instruments for source integrity, multi-source correlation, confidence, degraded capability, and command verification. Instead of reducing uncertainty to decorative opacity, the system explains what supports a conclusion and where that conclusion can fail.

Every mark is evidence. Every color communicates state.

## Null is not zero

The sensor-validity work captures the project in miniature.

A missing value can mean several radically different things:

| State | Operational meaning |
|---|---|
| Valid | The value may be used |
| Null | No value exists; the condition is unknown |
| Fault | The sensor reports an error |
| Stale | A previous value exists but is too old |
| Substituted | Another declared source is being used |

These states cannot share one generic “data unavailable” treatment.

`NULL` must never silently become zero. A faulty sensor must not appear merely old. A substituted measurement must preserve its provenance. Each condition leads to a different decision: use, qualify, restrict, substitute, or block.

The library makes those consequences visible.

## The operator is inside the system

Instrumentation usually treats the operator as an invisible constant. This project does not.

The operator-state family introduces workload, fatigue risk, interruption queues, handoff continuity, mode awareness, and decision readiness. It does not pretend to diagnose a person. It exposes the human conditions surrounding a consequential decision.

An otherwise healthy system may still require a cross-check when attention is fragmented, workload is elevated, or authority transfer is incomplete.

Operability is not only a property of machinery. It is a relationship between machinery, information, automation, and people.

## Designed to fail honestly

After the component architecture stabilized, the project stopped testing only ideal specimens.

RC0.7 introduced failure injection and conformance testing:

- absent and stale signals;
- contradictory evidence;
- long identifiers;
- narrow displays;
- dense operating states;
- competing authority;
- blocked recovery;
- missing verification.

The purpose was straightforward: determine whether the interface stays truthful when the data becomes hostile.

The system should not become quieter precisely when its assumptions are breaking. It should expose what is missing, what is degraded, what is substituted, and what decision is no longer safe.

## Time, cascades, and recovery

Later releases expanded the library in two directions.

The temporal family distinguishes capture time, transmission delay, processing latency, display latency, event order, state duration, forecast horizon, and forensic replay. It establishes a simple law:

> Every value has an age. Every event has an order. Every forecast has a horizon.

The dependency family then moves from individual instruments to systems of systems. It shows what depends on what, how a local failure propagates, what reserve remains, where a cascade can be contained, and what must return first.

A pump failure may become a pressure problem, then a hospital constraint. A network fault may disable the very coordination needed to recover another service. Local state is incomplete without dependency.

This is where the HUD becomes infrastructure instrumentation: not a dashboard reporting isolated metrics, but a field for negotiating propagation, consequence, containment, and restoration.

## RC1.0: the universal instrument contract

RC1.0 consolidates the research into five canonical contracts.

### Identity

Every instrument declares what object, system, location, function, owner, or jurisdiction it concerns.

### Measurement

Every value remains attached to its unit, source, capture time, age, quality, validity, confidence, and reference datum.

### State, intent, and limit

Observed, selected, commanded, predicted, and restricted states remain visually separate.

### Authority, action, and verification

Permission, command, acknowledgement, execution, and physical verification are distinct stages—not one glowing success state.

### Degradation

Every failure declares what was lost, what substitute is active, what capability remains, and what operating restriction now applies.

Together they form the standard behind the library:

> Every instrument declares what it represents, what it knows, how it knows it, who may act, what action occurred, whether reality responded, and how capability changes under failure.

## A Figma library that had to prove it could travel

The project’s completion criterion was never “the source file looks finished.”

Every promoted release moved through a publication pipeline:

```text
Research
→ specimen
→ canonical component
→ publish
→ remote import
→ downstream composition
→ visual verification
```

A separate Figma file consumes the published system by component key. No replicas are allowed. That downstream file verifies that instances remain remote, overrides survive, spatial fields retain geometry, semantic auto layout remains resilient, and published updates propagate without detachment.

The canonical library currently includes semantic instruments built with nested auto layout and hybrid instruments that preserve true coordinate fields for maps, trajectories, plots, tapes, topology, and forecast space.

The rule is concise:

> Structure is semantic until position becomes data.

## What Codex contributed

This system emerged through a long collaboration rather than a single generation event.

The human direction was often compact: study radar; add waterways; consider AWACS; make it civilian; preserve vessel identity; explore epidemiology; maximize operability; distinguish faulty sensors from null values.

Codex helped maintain continuity across research, system design, Figma construction, auto-layout migration, publication, key resolution, downstream import, and visual QA.

The valuable capability was not simply producing more interface graphics. It was carrying an evolving argument through hundreds of connected design decisions and repeatedly testing whether the argument remained true in the built system.

## Previewing what comes next

RC1.0 is a foundation, not a conclusion.

The next phase is about applying the universal contract to complete operational environments: infrastructure control rooms, transport coordination, environmental monitoring, public health, and other settings where evidence, authority, time, and degradation need to remain visible together.

The longer ambition is a shared instrument language for systems that currently inherit fragmented conventions from separate industries.

Not one universal dashboard. Not a visual skin applied everywhere.

A reusable grammar for asking better operational questions.

## Explore the system

- [HUD Canonical Source — start here](https://www.figma.com/design/Tyy2gByZYOtNGDhsyRPfow/Hud-Study?node-id=149-896)
