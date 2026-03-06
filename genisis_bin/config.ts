/**
 * CODEX ARCHIVE SYSTEM v2.2
 * Astro Content Collection Schema
 * astro/src/content/config.ts
 *
 * Derived from: docs/field-registry.md
 * Every field here has a corresponding registry entry.
 * Do not add fields to this schema without adding them to the registry first.
 */

import { defineCollection, z } from 'astro:content';

// ─── ENUMS ────────────────────────────────────────────────────────────────────

const ObjectType = z.enum([
  'scroll',
  'artifact',
  'fieldlog',
  'codex',
  'fragment',
  'nexus',
]);

const Status = z.enum([
  'draft',
  'review',
  'published',
  'archived',
]);

const Visibility = z.enum([
  'public',
  'private',
  'internal',
  'unlisted',
]).default('public');

const MediaKind = z.enum([
  'image',
  'video',
  'audio',
]);

const MediaRole = z.enum([
  'hero',
  'gallery',
  'detail',
  'scan',
  'process',
  'audio',
  'reference',
]);

const ReleaseType = z.enum([
  'issue',
  'sequence',
  'cluster',
  'dispatch',
]);

const ChangeType = z.enum([
  'major',
  'minor',
  'patch',
  'initial',
]);

const BodyClass = z.enum([
  'verse',
  'prose',
  'hybrid',
  'list',
]).default('verse');

const LengthClass = z.enum([
  'micro',
  'short',
  'medium',
]);

const Voice = z.enum([
  'observational',
  'aphoristic',
  'somatic',
  'documentary',
  'mythological',
]);

// ─── MEDIA OBJECT ─────────────────────────────────────────────────────────────

const MediaItem = z.object({
  kind: MediaKind,
  src:  z.string(),
  role: MediaRole,
  alt:  z.string().optional(),
  caption: z.string().optional(),
});

// ─── NEXUS INCLUDED OBJECT ────────────────────────────────────────────────────

const NexusIncludedObject = z.object({
  ref:  z.string(), // object id
  role: z.string(), // role label within this nexus
});

// ─── UNIVERSAL BASE FIELDS ────────────────────────────────────────────────────
// Present on every object type. See registry Layer 1.

const universalFields = {
  id:             z.string(),
  type:           ObjectType,
  title:          z.string(),
  date:           z.coerce.date(),
  status:         Status,

  excerpt:        z.string().optional(),
  themes:         z.array(z.string()).default([]),
  constellations: z.array(z.string()).default([]),
  related:        z.array(z.string()).default([]),
  visibility:     Visibility,
  media:          z.array(MediaItem).default([]),
};

// ─── TYPE FIELD SETS ──────────────────────────────────────────────────────────
// See registry Layer 2. Each type extends universalFields with its own fields.

const scrollFields = {
  ...universalFields,
  series:     z.string().optional(),
  cadence:    z.string().optional(),
  tone:       z.string().optional(),
  dedication: z.string().optional(),
  bodyClass:  BodyClass.optional(),
};

const artifactFields = {
  ...universalFields,
  artifactType: z.string().optional(),
  materials:    z.string().optional(),
  year:         z.number().int().optional(),
  dimensions:   z.string().optional(),
  source:       z.string().optional(),
  location:     z.string().optional(),
  condition:    z.string().optional(),
};

const fieldlogFields = {
  ...universalFields,
  project:  z.string().optional(),
  phase:    z.string().optional(),
  context:  z.string().optional(),
  signals:  z.array(z.string()).default([]),
  actions:  z.array(z.string()).default([]),
};

const codexFields = {
  ...universalFields,
  version:      z.string().optional(),
  scope:        z.string().optional(),
  systemArea:   z.string().optional(),
  changeType:   ChangeType.optional(),
  dependencies: z.array(z.string()).default([]),
};

const fragmentFields = {
  ...universalFields,
  lengthClass: LengthClass.optional(), // typically system-derived
  origin:      z.string().optional(),
  voice:       Voice.optional(),
};

const nexusFields = {
  ...universalFields,
  lead:            z.string().optional(),
  featured:        z.array(z.string()).default([]),
  includedObjects: z.array(NexusIncludedObject).default([]),
  themeStatement:  z.string().optional(),
  releaseType:     ReleaseType.optional(),
};

// ─── COLLECTION DEFINITIONS ───────────────────────────────────────────────────

export const collections = {

  scroll: defineCollection({
    type:   'content',
    schema: z.object(scrollFields),
  }),

  artifact: defineCollection({
    type:   'content',
    schema: z.object(artifactFields),
  }),

  fieldlog: defineCollection({
    type:   'content',
    schema: z.object(fieldlogFields),
  }),

  codex: defineCollection({
    type:   'content',
    schema: z.object(codexFields),
  }),

  fragment: defineCollection({
    type:   'content',
    schema: z.object(fragmentFields),
  }),

  nexus: defineCollection({
    type:   'content',
    schema: z.object(nexusFields),
  }),

};

// ─── EXPORTED TYPES ───────────────────────────────────────────────────────────
// Use these in components and layout files.

export type CodexObjectType    = z.infer<typeof ObjectType>;
export type CodexStatus        = z.infer<typeof Status>;
export type CodexVisibility    = z.infer<typeof Visibility>;
export type CodexMediaItem     = z.infer<typeof MediaItem>;
export type CodexMediaKind     = z.infer<typeof MediaKind>;
export type CodexMediaRole     = z.infer<typeof MediaRole>;
export type CodexReleaseType   = z.infer<typeof ReleaseType>;
export type CodexBodyClass     = z.infer<typeof BodyClass>;

export type ScrollData   = z.infer<z.ZodObject<typeof scrollFields>>;
export type ArtifactData = z.infer<z.ZodObject<typeof artifactFields>>;
export type FieldLogData = z.infer<z.ZodObject<typeof fieldlogFields>>;
export type CodexData    = z.infer<z.ZodObject<typeof codexFields>>;
export type FragmentData = z.infer<z.ZodObject<typeof fragmentFields>>;
export type NexusData    = z.infer<z.ZodObject<typeof nexusFields>>;
