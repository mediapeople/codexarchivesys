import { getFeedItem, getFollowEntries } from '../lib/follow';
import { SITE_DESCRIPTION, SITE_TITLE, toSiteUrl } from '../lib/site';

export async function GET() {
  const entries = await getFollowEntries();
  const items = entries.map((entry) => {
    const item = getFeedItem(entry);

    return {
      id: item.id,
      url: item.url,
      title: item.title,
      summary: item.summary,
      content_html: item.contentHtml,
      content_text: item.contentText,
      date_published: item.datePublished.toISOString(),
      authors: [{ name: item.authorName }],
      tags: item.tags,
      type: item.type,
      attachments:
        item.attachments.length > 0
          ? item.attachments.map((attachment) => ({
              url: attachment.url,
              mime_type: attachment.mimeType,
              title: attachment.title,
            }))
          : undefined,
    };
  });

  const body = JSON.stringify(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title: SITE_TITLE,
      home_page_url: toSiteUrl('/'),
      feed_url: toSiteUrl('/feed.json'),
      description: SITE_DESCRIPTION,
      language: 'en-US',
      items,
    },
    null,
    2
  );

  return new Response(body, {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
    },
  });
}
