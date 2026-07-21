---
id: i-wasn-t-trying-to-build-a-design-system
slug: "i-wasn-t-trying-to-build-a-design-system"
url: "https://ndcodex.com/codex/i-wasn-t-trying-to-build-a-design-system"
type: codex
title: "I Thought I Was Drawing a HUD"
date: "2026-07-20"
postedAt: "2026-07-21T01:44:20.009Z"
tags:
  - "instrumentation"
  - "design systems"
  - "figma"
  - "interface design"
  - "research"
  - "ndcodex"
images:
  - "/media/pigeon/codex/i-wasn-t-trying-to-build-a-design-system-01.png"
state: published
dependencies: []
status: published
visibility: public
summary: "I was drawing interface fragments. Target brackets. Tiny typography. Floating markers. Signal colors. Telemetry. The familiar visual language we've inherited from aircraft, radar scopes, engineering manuals, and decades…"
excerpt: "I was drawing interface fragments. Target brackets. Tiny typography. Floating markers. Signal colors. Telemetry. The familiar visual language we've inherited from aircraft, radar scopes, engineering manuals, and decades…"
scale: micro
depth: structural
focus: system
function: diagnostic
themes: []
author:
  name: "Nathan Davis"
media:
  - kind: image
    src: "/media/pigeon/codex/i-wasn-t-trying-to-build-a-design-system-01.png"
    role: hero
    alt: "r"
    capture:
      width: 1536
      height: 1024
      shape: wide
      format: "png"
      originalFilename: "r.png"
      uploadedAt: "2026-07-21T01:44:19.805Z"
---
# I wasn't trying to build a design system.

I was drawing interface fragments.

Target brackets.

Tiny typography.

Floating markers.

Signal colors.

Telemetry.

The familiar visual language we've inherited from aircraft, radar scopes, engineering manuals, and decades of science fiction.

At first it was simply an aesthetic exploration.

Then something unexpected happened.

The interesting part wasn't any individual graphic.

It was the grammar forming underneath them.

Certain elements always carried identity.

Others implied measurement.

Some communicated certainty.

Others suggested possibility.

Even the negative space stopped feeling empty.

It had become part of the instrument.

That realization quietly changed the project.

I stopped asking,

> *What should this HUD look like?*

and started asking,

> *How do humans build instruments to understand the world?*

That single question widened everything.

---

## Following the thread

Curiosity has a habit of refusing to stay in its lane.

Radar led to AWACS.

AWACS led to civilian maritime systems.

Maritime systems led to vessel identity.

Identity led to provenance.

Provenance led to confidence.

Confidence led to epidemiology.

Each stop added another way of thinking about information, not another way of decorating a screen.

Soon I wasn't collecting interface references.

I was studying how different disciplines represent evidence.

Pilots.

Controllers.

Meteorologists.

Mariners.

Power-grid operators.

Transit coordinators.

Public health researchers.

Different domains.

Remarkably similar questions.

---

## Research should change the primitives

One lesson kept repeating itself.

Research shouldn't decorate a design system.

It should change the primitives the system is built from.

If the vocabulary underneath the interface never evolves, you've probably gathered references instead of learning something.

The library slowly reorganized itself around ideas instead of graphics.

Not "yellow bracket."

Identity.

Not "cyan line."

Measurement.

Not "red label."

Authority.

Not "warning card."

Evidence.

The system eventually settled into a handful of semantic foundations.

- Identity
- Evidence
- State
- Authority
- Integrity
- Measurement
- Navigation
- Environment
- Coordination

Those ideas travel surprisingly well.

An identity field doesn't care whether it's describing a vessel, an aircraft, a laboratory sample, a transit vehicle, or a transformer on a power grid.

The rendering changes.

The responsibility stays the same.

---

## Instruments reveal how much they know

One discovery surprised me more than any other.

Real operational systems rarely present information as absolute truth.

They expose how the information came into existence.

Observed.

Reported.

Correlated.

Inferred.

Those aren't stylistic differences.

They're fundamentally different relationships with reality.

The same became true for integrity.

Valid.

Degraded.

Lost.

And authority.

Recommended.

Instructed.

Acknowledged.

Executing.

Once those distinctions became part of the system, the HUD stopped behaving like a visual theme.

It became a language for reasoning about operational information.

---

## Designing for imperfect conditions

Beautiful interfaces are easy.

Readable instruments are much harder.

The system eventually grew explicit operating modes.

- Normal
- Low Light
- High Glare
- Degraded

These weren't alternate color palettes.

They changed contrast.

Density.

Stroke weight.

Signal hierarchy.

Legibility.

Everything that determines whether an operator can still make good decisions when the environment refuses to cooperate.

That naturally expanded into physical-display research.

Viewing angles.

Visual angle.

Contrast thresholds.

Frame rates.

Moving-edge blur.

Ambient lighting.

Pixel density.

None of it feels glamorous.

All of it matters.

A beautiful instrument that cannot be read under pressure is simply decoration.

---

## The moment that mattered

The biggest lesson arrived after I thought the work was finished.

I created a completely empty Figma file.

Nothing copied.

Nothing rebuilt.

Nothing recreated.

If the system was real, another document should be able to consume it.

At first...

it couldn't.

That failure became the most valuable part of the project.

Publishing.

Library context.

Remote components.

Variables.

Mode collections.

Stable keys.

All of the invisible infrastructure suddenly mattered.

Eventually the pieces clicked into place.

A clean downstream file discovered the published library.

Remote components imported successfully.

Operating-condition variables resolved correctly.

Four independent operating modes rendered exactly as intended.

Nothing had been rebuilt.

Nothing duplicated.

Everything remained connected to the original source.

The proof wasn't that the library existed.

The proof was that it could leave home.

---

## A different definition of "done"

I used to think a design system was finished when the source file felt complete.

I don't believe that anymore.

A design system isn't finished when it's organized.

It isn't finished when it's documented.

It isn't finished when it looks beautiful.

It's finished when another file can consume it without rebuilding it.

That's a much higher bar.

It's also the only one that matters.

---

## What stayed with me

Looking back, this project was never really about HUDs.

It became a study of attention.

Every instrument, regardless of discipline, quietly asks the same questions.

What am I looking at?

Where did this information come from?

How old is it?

How certain is it?

What changed?

What deserves my attention now?

Whether you're flying an aircraft, monitoring a weather system, tracking a vessel, coordinating transit, balancing a power grid, or interpreting public health data...

the graphics change.

The questions don't.

That's the part I wasn't expecting.

I thought I was designing a HUD.

What emerged instead was something closer to an atlas of perception.

A language for making evidence visible.

And I suspect that's a much more interesting place to keep exploring.
