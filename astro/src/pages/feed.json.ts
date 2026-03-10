import { getFeedItem, getFollowEntries, SITE_DESCRIPTION, SITE_TITLE, toSiteUrl } from '../lib/follow';

export async function GET() {
  const entries = await getFollowEntries();
  const items = entries.map((entry) => {
    const item = getFeedItem(entry);

    return {
      id: item.url,
      url: item.url,
      title: item.title,
      summary: item.summary,
      date_published: item.datePublished.toISOString(),
      authors: [{ name: item.authorName }],
      tags: item.tags,
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
