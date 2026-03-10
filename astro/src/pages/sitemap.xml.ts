import { getCollection } from 'astro:content';
import { isFollowableEntry, SITE_ORIGIN, toSiteUrl, withTrailingSlash } from '../lib/follow';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildUrl(path: string): string {
  return new URL(withTrailingSlash(path), SITE_ORIGIN).toString();
}

export async function GET() {
  const { getAllEntries } = await import('../lib/archive');
  const entries = (await getAllEntries()).filter(isFollowableEntry);
  const nexusIssues = await getCollection('nexus');
  const publishedNexusIssues = nexusIssues.filter((issue) => issue.data.status === 'published' && issue.data.visibility === 'public');

  const urls = [
    toSiteUrl('/'),
    toSiteUrl('/orientation'),
    toSiteUrl('/nexus'),
    toSiteUrl('/graph'),
    ...entries.map((entry) => buildUrl(`/objects/${entry.data.id}`)),
    ...publishedNexusIssues.map((issue) => buildUrl(`/nexus/${issue.data.id}`)),
  ];

  const uniqueUrls = [...new Set(urls)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniqueUrls
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
