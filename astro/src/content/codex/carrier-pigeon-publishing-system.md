---
id: carrier-pigeon-publishing-system
slug: "carrier-pigeon-publishing-system"
url: "https://ndcodex.com/objects/carrier-pigeon-publishing-system/"
type: codex
title: "Carrier Pigeon Publishing System"
date: "2026-03-15"
postedAt: "2026-03-15T14:08:00.096Z"
status: published
visibility: public
tags:
  - "publishing"
  - "infrastructure"
  - "carrier-pigeon"
  - "ingest"
state: published
dependencies: []
summary: "Carrier Pigeon Publishing System Carrier Pigeon is the remote publishing system used by the ND Codex archive. It enables objects to be written, transmitted, and published directly…"
excerpt: "Carrier Pigeon Publishing System Carrier Pigeon is the remote publishing system used by the ND Codex archive. It enables objects to be written, transmitted, and published directly…"
themes:
  - "publishing"
  - "infrastructure"
  - "carrier-pigeon"
  - "ingest"
media: []
---
![21C688D7 5087 43B5 BBDB EEAF2283812D](/media/pigeon/codex/carrier-pigeon-publishing-system-01.png)
# Carrier Pigeon Publishing System

Carrier Pigeon is the remote publishing system used by the ND Codex archive.

It enables objects to be written, transmitted, and published directly from a phone without requiring a traditional CMS interface.

Carrier Pigeon converts markdown into archive objects and inserts them directly into the repository structure used by the site.

The system exists to support **field publishing**.

---

# Purpose

Carrier Pigeon exists to remove friction between thought and publication.

The system allows an operator to:

- write an object on a phone
- transmit it to the archive
- generate a public object on ndcodex.com

This allows the archive to grow continuously from real-world observation and writing rather than requiring scheduled publishing sessions at a desktop computer.

---

# Operational Model

Carrier Pigeon acts as a lightweight ingest layer between mobile authoring and the site archive.

Publishing flow:

```
Phone
→ Carrier Pigeon interface
→ /api/pigeon ingest endpoint
→ markdown file written into repository
→ Astro content collection
→ site rebuild
→ published archive object
```

The system accepts markdown input and converts it into ND Codex objects.

---

# Object Routing

Carrier Pigeon reads the `object_type` field in the frontmatter of the submitted markdown.

This field determines which archive collection receives the object.

Valid object types:

```
scroll
loremap
artifact
field-log
codex
fragment
nexus
signal
```

Each object type routes to its corresponding content collection.

Example mapping:

```
scroll → src/content/scrolls/
artifact → src/content/artifacts/
codex → src/content/codex/
signal → src/content/signals/
```

Routing ensures that the archive maintains structural consistency.

---

# Input Format

Carrier Pigeon accepts markdown with frontmatter.

Minimal required fields:

```
title
date
object_type
state
```

Optional fields include:

```
tags
summary
images
```

Example submission:

```
---
title: Justice Begins as a Ripple
date: 2026-03-14
object_type: signal
state: published
tags: [archive, justice]
summary: Initial signal marking the launch of the Carrier Pigeon publishing loop.
images: []
---

Justice begins as a ripple.
```

---

# Image Handling

Carrier Pigeon supports image attachment during submission.

Image references may appear as:

```
![image](photo.jpg)
```

or

```
![[photo.jpg]]
```

During ingest the system rewrites local image references into public paths used by the site.

Images are normalized to prevent empty or invalid entries.

---

# Security Model

Carrier Pigeon uses a publishing key to authenticate submissions.

The key is stored locally in the browser session on the publishing device.

The key is required for all submissions to the ingest endpoint.

This prevents unauthorized content from entering the archive.

---

# System Characteristics

Carrier Pigeon intentionally avoids the complexity of a traditional CMS.

Key design properties:

- markdown native
- repository driven
- schema structured
- phone compatible
- minimal interface
- direct archive insertion

This allows the archive to remain transparent and durable.

Objects exist as files rather than database records.

---

# Field Publishing

Carrier Pigeon supports what the archive calls **field publishing**.

Field publishing means:

objects can be written and transmitted from the environments in which they are observed.

Examples:

- documenting an artifact at a work table
- recording a field log during system development
- writing a signal while traveling
- capturing fragments during conversation

Carrier Pigeon enables these observations to enter the archive immediately.

---

# Relationship to the Archive

Carrier Pigeon does not replace the archive structure.

It simply provides a way to insert objects into the archive from outside the repository.

The ND Codex archive remains organized according to the object classification system defined in the Codex.

Carrier Pigeon is therefore a **transport mechanism**, not a content system.

---

# System Milestone

The first successful Carrier Pigeon transmission established the complete publishing loop from phone to archive.

This marked the transition of the ND Codex archive into a **mobile-capable publishing system**.

Future development will expand Carrier Pigeon while preserving its minimal architecture.

The goal is to maintain a system that is simple, durable, and usable anywhere.