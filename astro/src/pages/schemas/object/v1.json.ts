import { toSiteUrl } from '../../../lib/site';

export function GET() {
  const schemaUrl = toSiteUrl('/schemas/object/v1.json');

  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: schemaUrl,
    title: 'Codex Object Export v1',
    description: 'Structured export contract for a single public Codex object.',
    type: 'object',
    additionalProperties: false,
    required: [
      'id',
      'archive_id',
      'slug',
      'url',
      'type',
      'title',
      'summary',
      'content_text',
      'content_markdown',
      'author',
      'contributors',
      'date_published',
      'date_modified',
      'status',
      'visibility',
      'language',
      'axes',
      'themes',
      'constellations',
      'tags',
      'keywords',
      'relations',
      'media',
    ],
    properties: {
      $schema: {
        type: 'string',
        format: 'uri',
      },
      id: {
        type: 'string',
        pattern: '^codex://object/.+',
      },
      archive_id: {
        type: 'string',
        minLength: 1,
      },
      slug: {
        type: 'string',
        minLength: 1,
      },
      url: {
        type: 'string',
        format: 'uri',
      },
      type: {
        type: 'string',
        minLength: 1,
      },
      title: {
        type: 'string',
        minLength: 1,
      },
      summary: {
        type: 'string',
      },
      content_text: {
        type: 'string',
      },
      content_markdown: {
        type: 'string',
      },
      author: {
        $ref: '#/$defs/person',
      },
      contributors: {
        type: 'array',
        items: {
          $ref: '#/$defs/person',
        },
      },
      date_published: {
        type: 'string',
        format: 'date-time',
      },
      date_modified: {
        type: 'string',
        format: 'date-time',
      },
      status: {
        type: 'string',
      },
      visibility: {
        type: 'string',
      },
      language: {
        type: 'string',
      },
      axes: {
        type: 'object',
        additionalProperties: false,
        required: ['scale', 'depth', 'focus', 'function'],
        properties: {
          scale: { type: ['string', 'null'] },
          depth: { type: ['string', 'null'] },
          focus: { type: ['string', 'null'] },
          function: { type: ['string', 'null'] },
        },
      },
      themes: {
        type: 'array',
        items: { type: 'string' },
      },
      constellations: {
        type: 'array',
        items: { type: 'string' },
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
      keywords: {
        type: 'array',
        items: { type: 'string' },
      },
      relations: {
        type: 'array',
        items: {
          $ref: '#/$defs/relation',
        },
      },
      media: {
        type: 'array',
        items: {
          $ref: '#/$defs/media',
        },
      },
    },
    $defs: {
      person: {
        type: 'object',
        additionalProperties: false,
        required: ['name'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          designation: { type: 'string' },
          role: { type: 'string' },
          handle: { type: 'string' },
          avatar: { type: 'string' },
          bio: { type: 'string' },
        },
      },
      relation: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'target', 'slug', 'url'],
        properties: {
          kind: { type: 'string' },
          target: {
            type: 'string',
            pattern: '^codex://object/.+',
          },
          slug: { type: 'string' },
          url: {
            type: 'string',
            format: 'uri',
          },
          role: { type: 'string' },
          display: { type: 'string' },
        },
      },
      media: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'src', 'role'],
        properties: {
          kind: { type: 'string' },
          src: { type: 'string' },
          role: { type: 'string' },
          alt: { type: 'string' },
          caption: { type: 'string' },
          capture: {
            type: 'object',
            additionalProperties: false,
            properties: {
              width: { type: 'integer' },
              height: { type: 'integer' },
              shape: { type: 'string' },
              format: { type: 'string' },
              originalFilename: { type: 'string' },
              uploadedAt: { type: 'string', format: 'date-time' },
              capturedAt: { type: 'string', format: 'date-time' },
              camera: { type: 'string' },
              geo: {
                type: 'object',
                additionalProperties: false,
                required: ['latitude', 'longitude'],
                properties: {
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  altitude: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  };

  return new Response(JSON.stringify(schema, null, 2), {
    headers: {
      'Content-Type': 'application/schema+json; charset=utf-8',
    },
  });
}
