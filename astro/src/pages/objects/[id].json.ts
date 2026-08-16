import { getAllEntries } from '../../lib/archive';
import { applyDeployScopedCacheHeaders } from '../../lib/onDemandCache';
import { getObjectExport, getObjectSlug, matchesObjectParam } from '../../lib/objectInterop';
import { toSiteUrl } from '../../lib/site';

export const prerender = false;

export async function GET({ params }: { params: { id?: string } }) {
  const entries = await getAllEntries();
  const entry = entries.find(
    (candidate) =>
      candidate.data.status === 'published' &&
      (candidate.data.visibility === 'public' || candidate.data.visibility === 'unlisted') &&
      matchesObjectParam(candidate, params.id)
  );
  const schemaUrl = toSiteUrl('/schemas/object/v1.json');

  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  const headers = applyDeployScopedCacheHeaders(new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    Link: `<${schemaUrl}>; rel="describedby"`,
  }));

  return new Response(JSON.stringify({
    $schema: schemaUrl,
    ...getObjectExport(entry),
  }, null, 2), {
    headers,
  });
}
