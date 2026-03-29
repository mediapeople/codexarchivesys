import { getFeedItem, getFollowEntries } from '../lib/follow';
import { SITE_DESCRIPTION, SITE_ORIGIN, SITE_TITLE, toSiteUrl } from '../lib/site';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapCdata(value: string): string {
  return `<![CDATA[${value.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

export async function GET() {
  const entries = await getFollowEntries();
  const items = entries.map(getFeedItem);
  const lastBuildDate = items[0]?.datePublished.toUTCString() || new Date().toUTCString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n<channel>\n  <title>${escapeXml(SITE_TITLE)}</title>\n  <link>${escapeXml(`${SITE_ORIGIN}/`)}</link>\n  <description>${escapeXml(SITE_DESCRIPTION)}</description>\n  <language>en-us</language>\n  <atom:link href="${escapeXml(toSiteUrl('/rss.xml'))}" rel="self" type="application/rss+xml" />\n  <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>\n${items
    .map((item) => {
      const enclosure = item.attachments[0]
        ? `    <enclosure url="${escapeXml(item.attachments[0].url)}" type="${escapeXml(item.attachments[0].mimeType)}" />\n`
        : '';
      const contentEncoded = item.contentHtml
        ? `    <content:encoded>${wrapCdata(item.contentHtml)}</content:encoded>\n`
        : '';

      return `  <item>\n    <title>${escapeXml(item.title)}</title>\n    <link>${escapeXml(item.url)}</link>\n    <guid isPermaLink="false">${escapeXml(item.id)}</guid>\n    <pubDate>${escapeXml(item.datePublished.toUTCString())}</pubDate>\n    <description>${escapeXml(item.summary)}</description>\n${contentEncoded}${enclosure}${item.tags
        .map((tag) => `    <category>${escapeXml(tag)}</category>`)
        .join('\n')}\n  </item>`;
    })
    .join('\n')}\n</channel>\n</rss>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
