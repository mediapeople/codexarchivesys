import { getFeedItem, getFollowEntries, SITE_DESCRIPTION, SITE_ORIGIN, SITE_TITLE, toSiteUrl } from '../lib/follow';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET() {
  const entries = await getFollowEntries();
  const items = entries.map(getFeedItem);
  const lastBuildDate = items[0]?.datePublished.toUTCString() || new Date().toUTCString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n  <title>${escapeXml(SITE_TITLE)}</title>\n  <link>${escapeXml(`${SITE_ORIGIN}/`)}</link>\n  <description>${escapeXml(SITE_DESCRIPTION)}</description>\n  <language>en-us</language>\n  <atom:link href="${escapeXml(toSiteUrl('/rss.xml'))}" rel="self" type="application/rss+xml" />\n  <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>\n${items
    .map((item) => `  <item>\n    <title>${escapeXml(item.title)}</title>\n    <link>${escapeXml(item.url)}</link>\n    <guid isPermaLink="true">${escapeXml(item.url)}</guid>\n    <pubDate>${escapeXml(item.datePublished.toUTCString())}</pubDate>\n    <description>${escapeXml(item.summary)}</description>\n${item.tags
      .map((tag) => `    <category>${escapeXml(tag)}</category>`)
      .join('\n')}\n  </item>`)
    .join('\n')}\n</channel>\n</rss>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
