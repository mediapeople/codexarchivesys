import { getAllEntries } from '../../lib/archive';
import { applyDeployScopedCacheHeaders } from '../../lib/onDemandCache';
import { matchesObjectParam, serializeObjectMarkdown } from '../../lib/objectInterop';

export const prerender = false;

export async function GET({ params }: { params: { id?: string } }) {
  const entries = await getAllEntries();
  const entry = entries.find(
    (candidate) =>
      candidate.data.status === 'published' &&
      (candidate.data.visibility === 'public' || candidate.data.visibility === 'unlisted') &&
      matchesObjectParam(candidate, params.id)
  );

  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  const headers = applyDeployScopedCacheHeaders(new Headers({
    'Content-Type': 'text/markdown; charset=utf-8',
  }));

  return new Response(serializeObjectMarkdown(entry), {
    headers,
  });
}
