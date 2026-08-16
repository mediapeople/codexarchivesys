# Carrier Pigeon Protocol

Status: active

Last updated: 2026-04-17

Scope: capture, ingest, media, sidecars, auth, routing, and additive next-step protocol design

## Purpose

Carrier Pigeon is the phone-first ingest protocol for ndcodex.com.

Uploaded images are normalized before publication. The endpoint creates browser-safe JPEG or WebP derivatives, caps delivery images at 2400px and 2 MiB, and strips public EXIF/GPS while retaining useful capture facts in archive metadata. Raw HEIC/HEIF captures are never written into the public media tree.

The hosted phone app also compresses each selected set toward a 3.6 MiB total request budget before transmission so multipart image uploads remain below the Netlify Function transport limit.

It exists to let perception become object with minimal friction.

Primary rule:

`capture remains immediate`

Secondary rule:

`refinement can happen later without loss`

Carrier Pigeon is not a CMS.
It is a lightweight intake surface that writes durable archive source files.

## Protocol Posture

Carrier Pigeon must preserve:

- speed of capture
- low friction
- minimal required input
- backward compatibility with existing archive objects
- compatibility with Astro content collections

Carrier Pigeon must avoid:

- forced type selection
- interruptive prompts
- required refinement during capture
- media processing as a blocking step

## End-to-End Flow

Canonical flow:

`phone -> /pigeon -> POST /api/pigeon -> astro/src/content/<object_type>/<slug>.md -> optional sidecars/media -> Astro build -> archive page`

Local fallback flow:

`phone -> local Safari -> node scripts/pigeon-local-server.mjs -> POST /api/pigeon -> local content write -> local refresh`

## Runtime Modes

Carrier Pigeon operates in two persistence modes.

### 1. Local mode

Used when the endpoint can write directly to the local filesystem.

Writes:

- `astro/src/content/<object_type>/<slug>.md`
- `astro/public/media/pigeon/<object_type>/<slug>-NN.<ext>` for uploaded images
- optional sidecars adjacent to the markdown file
- refreshed `astro/public/graph.json`

Response `mode`:

- `local`

### 2. Hosted GitHub mode

Used when the endpoint is deployed and configured to commit back into GitHub.

Required environment variables:

- `PIGEON_SHARED_SECRET`
- `PIGEON_GITHUB_TOKEN`
- `PIGEON_GITHUB_REPO`

Optional environment variables:

- `PIGEON_GITHUB_BRANCH`
- `PIGEON_GITHUB_CONTENT_ROOT`
- `PIGEON_OPENAI_API_KEY`
- `PIGEON_VISION_MODEL`
- `OPENAI_API_KEY`

Writes:

- content markdown into the configured content root
- uploaded images into `astro/public/media/pigeon/...`
- optional sidecars adjacent to the markdown file

Response `mode`:

- `github`

## Authentication

If `PIGEON_SHARED_SECRET` is set, every request must include one of:

- `Authorization: Bearer <key>`
- `X-Pigeon-Key: <key>`

If `PIGEON_SHARED_SECRET` is not set, local development can proceed without auth.

Failure response:

- `401 Unauthorized`

## Live Entry Surfaces

### `/pigeon`

Public phone upload app.

Behavior:

- stores the publishing key in browser storage on that device
- submits to `POST /api/pigeon`
- surfaces returned object and HUD URLs

### `node scripts/pigeon-local-server.mjs`

Local phone testing server.

Exposes:

- `GET /`
- `GET /health`
- `POST /api/pigeon`

### `POST /api/pigeon`

Canonical ingest endpoint.

Accepted request modes:

1. raw markdown body
2. standard JSON
3. multipart form-data
4. Field HUD JSON

## Object Routing

Live object types:

- `scroll`
- `loremap`
- `artifact`
- `fieldlog`
- `codex`
- `fragment`
- `nexus`
- `signal`

Routing target:

`astro/src/content/<object_type>/<slug>.md`

Published URL returned by the endpoint:

- codex: `/codex/<slug>`
- all others: `/objects/<slug>`

## Slug Rules

Slug source:

- requested slug for Field HUD payloads, if supplied
- otherwise title

Slug generation:

- lowercased
- non-alphanumeric collapsed into `-`
- trimmed and normalized

Slug conflict behavior:

- Carrier Pigeon checks for existing slugs across all object types
- if the base slug is taken, it derives the next available suffix
- example: `note`, `note-2`, `note-3`

## Live Request Modes

### 1. Raw markdown note

This is the simplest and most flexible mode.

Content type:

- anything that is not `application/json`

Example:

```md
---
title: Carrier Pigeon Test
object_type: codex
date: 2026-04-17
tags:
  - test
  - codex
version: "1.0"
scope: "protocol draft"
state: draft
---

Protocol body text.
```

Behavior:

- parses frontmatter server-side
- preserves supported passthrough frontmatter
- writes normalized archive compatibility fields

### 2. Standard JSON

Best for external clients that want a fixed contract.

Content type:

- `application/json`

Example:

```json
{
  "object_type": "codex",
  "title": "Carrier Pigeon Test",
  "date": "2026-04-17",
  "tags": ["test", "codex"],
  "themes": ["publishing"],
  "body": "Protocol body text.",
  "status": "draft",
  "visibility": "public"
}
```

### 3. Multipart form-data

Best for phone uploads with images.

Fields:

- `note`: optional markdown note
- `images`: repeated image file fields
- `object_type`: optional fallback type hint

Behavior:

- image-only submission is supported
- note plus images is supported
- body image references are rewritten to stored public image paths

### 4. Field HUD JSON

Specialized mode for sidecar-rich publishing.

Recognized when the payload contains any of:

- `frontmatter`
- `collection`
- `packet`
- `respawn_summary`
- `mythmech`
- `plate_prompt`

Example:

```json
{
  "collection": "codex",
  "title": "Mythmech System",
  "body": "# Mythmech System\n\nInspection lens attached.",
  "frontmatter": {
    "title": "Mythmech System",
    "object_type": "codex",
    "date": "2026-04-17",
    "status": "published",
    "visibility": "public"
  },
  "packet": {
    "version": 1,
    "signal": {}
  },
  "plate_prompt": "vintage engineering diagram, exploded modular system"
}
```

## Live Standard Payload Contract

### Core JSON keys

Accepted directly by standard JSON mode:

- `object_type`
- `objectType`
- `type`
- `title`
- `date`
- `body`
- `caption`
- `tags`
- `themes`
- `images`
- `summary`
- `excerpt`
- `status`
- `state`
- `visibility`
- `dependencies`
- `scale`
- `depth`
- `focus`
- `function`

Codex compatibility note:

- `tags`
- `images`
- `state`
- `dependencies`

are emitted as codex-specific frontmatter when `object_type` is `codex`

Archive-wide note:

- `themes`
- `media`
- `status`
- `visibility`

are the cross-type archive fields

### Defaults

Standard note default object type:

- `codex`

Image-only default object type:

- `artifact`

Default status:

- `published`

Default visibility:

- `public`

### Status enum

- `draft`
- `review`
- `published`
- `archived`

### Visibility enum

- `public`
- `private`
- `internal`
- `unlisted`

### Axis enum values

`scale`

- `micro`
- `meso`
- `macro`

`depth`

- `surface`
- `structural`
- `recursive`

`focus`

- `moment`
- `character`
- `system`
- `witness`

`function`

- `diagnostic`
- `therapeutic`
- `revelatory`
- `comparative`

If axes are omitted, Carrier Pigeon infers them from object type, title, and body.

## Markdown Frontmatter Contract

Raw markdown note mode supports the base keys above plus preserved passthrough frontmatter.

### Universal passthrough keys

- `constellations`
- `related`
- `connections`
- `source`
- `location`
- `geo`
- `terrain`
- `author`
- `contributors`

### Type-specific passthrough keys

`scroll`

- `series`
- `cadence`
- `tone`
- `dedication`
- `bodyClass`

`loremap`

- `classification`
- `atlas`
- `bodyClass`

`artifact`

- `artifactType`
- `materials`
- `year`
- `dimensions`
- `condition`

`fieldlog`

- `project`
- `phase`
- `context`
- `specs`
- `signals`
- `actions`

`codex`

- `version`
- `scope`
- `systemArea`
- `changeType`

`fragment`

- `lengthClass`
- `origin`
- `voice`

`nexus`

- `lead`
- `featured`
- `includedObjects`
- `themeStatement`
- `releaseType`

`signal`

- `origin`
- `markers`

Note:

- passthrough preservation is strongest in raw markdown note mode and Field HUD mode
- standard JSON mode is intentionally narrower
- if you need cross-type authored structure beyond the base JSON contract, prefer raw markdown note mode

## Image and Media Protocol

### Uploaded image rules

- only image files are accepted
- multipart field name must be `images`
- images are stored under `/media/pigeon/<object_type>/`

### Body image rewrite

Carrier Pigeon rewrites these forms when the target matches an uploaded file:

- `![[photo.jpg]]`
- `![alt](photo.jpg)`

### Media normalization

Uploaded and referenced images are normalized into:

- `images`
- `media`

Live emitted media item shape:

```yaml
media:
  - kind: image
    src: "/media/pigeon/artifact/example-01.jpg"
    role: hero
    alt: "example 01"
    caption: "optional"
    capture:
      width: 1333
      height: 2000
      shape: tall
      format: jpg
      originalFilename: "IMG_5228.jpeg"
      uploadedAt: "2026-04-17T16:25:56.685Z"
```

Roles currently emitted automatically:

- first image: `hero`
- subsequent images: `gallery`

### Capture metadata extraction

When available, Carrier Pigeon extracts:

- width
- height
- shape
- format
- original filename
- uploaded time
- EXIF capture time
- camera label
- GPS coordinates

## Vision Sidecar

If uploaded images are present and `PIGEON_OPENAI_API_KEY` or `OPENAI_API_KEY` is configured, Carrier Pigeon may generate a provisional `.vision.json` sidecar.

Current behavior:

- model defaults to `gpt-4.1-mini`
- can be overridden with `PIGEON_VISION_MODEL`
- prefers `PIGEON_OPENAI_API_KEY`, falling back to `OPENAI_API_KEY`
- ignores non-OpenAI-looking tokens before calling the API
- suggestion is non-blocking
- failure does not block publish

Vision suggestions may include:

- one-sentence summary
- artifact type
- location
- tags
- axis suggestions
- factual alt/caption suggestions for supplied images

This is advisory metadata only, not canonical truth.

## Field HUD Sidecars

Field HUD mode may emit any of:

- `<slug>.packet.json`
- `<slug>.respawn.txt`
- `<slug>.mythmech.sidecar`
- `<slug>.plate-prompt.txt`

Standard image uploads may also emit:

- `<slug>.vision.json`

## Live Persistence Rules

Carrier Pigeon always writes source files first.

It does not publish around the repo.
It writes into the repo shape the site already understands.

### Local mode response

Success status:

- `201`

Response fields:

- `ok`
- `mode`
- `slug`
- `objectType`
- `path`
- `paths.markdown`
- `paths.packet`
- `paths.respawn`
- `paths.mythmech`
- `paths.plate_prompt`
- `paths.vision`
- `images`
- `axes`
- `url`
- `object_url`
- `hud_url`
- `note`

### GitHub mode response

Adds:

- `commitSha`
- `commitUrl`

### HUD URL behavior

Currently returned only when:

- object type is `scroll`
- status is `published`

## Failure Conditions

Carrier Pigeon returns explicit errors for:

- missing title when title cannot be derived
- invalid date
- empty request body
- invalid JSON
- invalid multipart image fields
- unauthorized publish attempts
- hosted mode without GitHub write configuration
- invalid enum values for axis fields

Carrier Pigeon should never fail because refinement was omitted.

## Full Live Examples

### Minimal raw markdown

```md
---
title: Justice Begins as a Ripple
date: 2026-04-17
object_type: signal
themes:
  - archive
  - justice
---

Justice begins as a ripple.
```

### Minimal JSON

```json
{
  "object_type": "signal",
  "title": "Justice Begins as a Ripple",
  "date": "2026-04-17",
  "themes": ["archive", "justice"],
  "body": "Justice begins as a ripple."
}
```

### Multipart curl

```bash
curl -X POST http://localhost:8787/api/pigeon \
  -H "X-Pigeon-Key: $PIGEON_SHARED_SECRET" \
  -F 'note=---
title: Bone Memory Event
date: 2026-04-17
object_type: artifact
tags:
  - collage
  - compression
---

Artifact description with ![[IMG_5228.jpeg]].' \
  -F "images=@/absolute/path/IMG_5228.jpeg"
```

### Field HUD JSON

```json
{
  "collection": "codex",
  "title": "Mythmech System",
  "body": "# Mythmech System\n\nInspection lens attached.",
  "frontmatter": {
    "title": "Mythmech System",
    "object_type": "codex",
    "date": "2026-04-17",
    "status": "published",
    "visibility": "public",
    "themes": ["systems", "inspection"]
  },
  "packet": {
    "version": 1,
    "signal": {
      "track": "Example Track"
    }
  },
  "plate_prompt": "vintage engineering diagram, exploded modular system"
}
```

## Protocol Extension: Object Forms + Orientation

Status: additive, non-breaking, live in `/api/pigeon`, `/pigeon`, feed cards, object pages, JSON export, `/orientation`, and `/graph`

This protocol layer is now active across capture, machine-readable export, and the main reading surfaces.

### Purpose

Carrier Pigeon should support:

- Bubble
- Coordinate
- Creature

without turning capture into a form.

### Position

Carrier Pigeon is:

`the primary interface where perception becomes object`

The extension therefore belongs at the capture layer, but lightly.

### Additive requirements

The extension must:

- preserve current payloads unchanged
- keep all new fields optional
- allow full dismissal of suggestions
- defer refinement to staging when needed

### Live protocol additions

These fields are now canonical additive fields for capture-aware clients:

```json
{
  "protocol_version": "pigeon-1.1",
  "capture_mode": "default",
  "object_form_suggestion": "coordinate",
  "object_form_lock": "coordinate",
  "orientation": {
    "prompt_set": "coordinate",
    "responses": {
      "holds_under_isolation": "yes",
      "field_break": "impact line at left edge"
    }
  },
  "trace": {
    "pull": "compression field",
    "expanded": {
      "pressure": "impact memory",
      "selection_note": "keep raw seam visible"
    }
  },
  "media_intent": [
    {
      "src": "/media/pigeon/artifact/example-01.jpg",
      "source": true,
      "potential_coordinate": true,
      "isolate_later": true
    }
  ]
}
```

### Live input states

#### 1. Default

- freeform input
- system infers later

#### 2. Light type suggestion

Examples:

- `This looks like a Bubble`
- `This could be a Coordinate`

Rules:

- optional
- dismissible
- non-blocking

#### 3. Optional type lock

Operator may select:

- Bubble
- Coordinate
- Creature

Rules:

- never required
- never blocks publish

### Live orientation prompts

These should remain inline, subtle, and ignorable.

`Coordinate`

- Would this hold without its surroundings?
- What broke the field?

`Bubble`

- Does this survive alone?

`Creature`

- What pressure is being solved?

### Live trace capture

Trace should be:

- optional
- collapsed by default
- fast to skip

Minimum quick-capture trace:

- `pull`

Expanded trace can be deferred.

### Live media staging behavior

When image is uploaded:

- store as source
- allow designation as potential coordinate
- optionally mark `isolate later`

No forced editing during capture.

### Live staging rule

`capture -> store -> optional refine -> publish`

Key rule:

- refinement is deferred
- capture remains immediate

### Live surfaces

Human-visible surfaces:

- `/pigeon` can suggest or lock Bubble / Coordinate / Creature, capture trace, and stage media intent
- feed cards render an object-form chip and a short supporting note
- object pages and codex pages render a form chip with supporting context in the header
- `/orientation` explains the object-form layer as part of the archive contract
- `/graph` carries object form into node rendering and inspector chips

Machine-visible surfaces:

- `/api/pigeon` accepts capture metadata in raw markdown frontmatter, JSON, multipart, and Field HUD modes
- adjacent `.capture.json` sidecars are written next to captured objects
- object JSON export includes `object_form` and `capture`
- `feed.json` includes `object_form` and `capture`
- `graph.json` includes `object_form` per node after regeneration

### Proposed type resolution timing

Type assignment must remain valid at three moments:

- at capture
- in staging
- post-publish

## Success Condition

Carrier Pigeon succeeds when an operator can:

- capture in seconds
- publish without friction
- add images without ceremony
- keep existing archive compatibility intact
- optionally deepen type, trace, and orientation later

The system should become more precise over time without becoming bureaucratic at the moment of noticing.
