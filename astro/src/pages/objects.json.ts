import { getPublicObjectEntries } from '../lib/follow';
import { getObjectExport } from '../lib/objectInterop';
import { SITE_DESCRIPTION, SITE_TITLE, toSiteUrl } from '../lib/site';

export async function GET() {
  const entries = await getPublicObjectEntries();
  const items = entries.map((entry) => getObjectExport(entry));
  const schemaUrl = toSiteUrl('/schemas/object-feed/v1.json');
  const itemSchemaUrl = toSiteUrl('/schemas/object/v1.json');

  const body = JSON.stringify(
    {
      $schema: schemaUrl,
      version: schemaUrl,
      item_schema: itemSchemaUrl,
      title: `${SITE_TITLE} Objects`,
      home_page_url: toSiteUrl('/'),
      feed_url: toSiteUrl('/objects.json'),
      description: SITE_DESCRIPTION,
      item_count: items.length,
      items,
    },
    null,
    2
  );

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Link: `<${schemaUrl}>; rel="describedby"`,
    },
  });
}
