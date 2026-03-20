import { getAllEntries } from '../../lib/archive';
import { getObjectSlug, matchesObjectParam, serializeObjectMarkdown } from '../../lib/objectInterop';

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

  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(serializeObjectMarkdown(entry), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
