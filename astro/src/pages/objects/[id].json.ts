import { getAllEntries } from '../../lib/archive';
import { getObjectExport, getObjectSlug, matchesObjectParam } from '../../lib/objectInterop';
import { toSiteUrl } from '../../lib/site';

export async function getStaticPaths() {
  const entries = (await getAllEntries()).filter(
    (entry) =>
      entry.data.status === 'published' &&
      (entry.data.visibility === 'public' || entry.data.visibility === 'unlisted')
  );

  return entries.map((entry) => ({
    params: { id: getObjectSlug(entry) },
  }));
}

export async function GET({ params }: { params: { id?: string } }) {
  const entries = await getAllEntries();
  const entry = entries.find((candidate) => matchesObjectParam(candidate, params.id));
  const schemaUrl = toSiteUrl('/schemas/object/v1.json');

  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(JSON.stringify({
    $schema: schemaUrl,
    ...getObjectExport(entry),
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Link: `<${schemaUrl}>; rel="describedby"`,
    },
  });
}
