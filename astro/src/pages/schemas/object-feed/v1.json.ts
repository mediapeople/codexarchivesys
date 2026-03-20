import { toSiteUrl } from '../../../lib/site';

export function GET() {
  const schemaUrl = toSiteUrl('/schemas/object-feed/v1.json');
  const objectSchemaUrl = toSiteUrl('/schemas/object/v1.json');

  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: schemaUrl,
    title: 'Codex Object Feed v1',
    description: 'Feed contract for batch ingest of public Codex objects.',
    type: 'object',
    additionalProperties: false,
    required: [
      '$schema',
      'version',
      'item_schema',
      'title',
      'home_page_url',
      'feed_url',
      'description',
      'item_count',
      'items',
    ],
    properties: {
      $schema: {
        type: 'string',
        format: 'uri',
        const: schemaUrl,
      },
      version: {
        type: 'string',
        format: 'uri',
        const: schemaUrl,
      },
      item_schema: {
        type: 'string',
        format: 'uri',
        const: objectSchemaUrl,
      },
      title: {
        type: 'string',
      },
      home_page_url: {
        type: 'string',
        format: 'uri',
      },
      feed_url: {
        type: 'string',
        format: 'uri',
      },
      description: {
        type: 'string',
      },
      item_count: {
        type: 'integer',
        minimum: 0,
      },
      items: {
        type: 'array',
        items: {
          $ref: objectSchemaUrl,
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
