import { getObjectPath, getObjectUpdatedAt } from '../lib/objectInterop';
import { getPublicObjectEntries } from '../lib/follow';
import { SITE_ORIGIN, toSiteUrl, withTrailingSlash } from '../lib/site';
import { getPublicTaxonomyRecords, getTaxonomyTermPath } from '../lib/taxonomy';

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
  const entries = await getPublicObjectEntries();
  const themeRecords = await getPublicTaxonomyRecords('theme');
  const constellationRecords = await getPublicTaxonomyRecords('constellation');
  const latestLastMod = entries.reduce((latest, entry) => {
    const timestamp = getObjectUpdatedAt(entry).valueOf();
    return timestamp > latest ? timestamp : latest;
  }, 0);
  const defaultLastMod = new Date(latestLastMod || Date.now()).toISOString();

  const urls = [
    { url: toSiteUrl('/'), lastmod: defaultLastMod },
    { url: toSiteUrl('/orientation'), lastmod: defaultLastMod },
    { url: toSiteUrl('/nexus'), lastmod: defaultLastMod },
    { url: toSiteUrl('/graph'), lastmod: defaultLastMod },
    { url: toSiteUrl('/themes'), lastmod: defaultLastMod },
    { url: toSiteUrl('/constellations'), lastmod: defaultLastMod },
    ...entries.map((entry) => ({
      url: buildUrl(getObjectPath(entry)),
      lastmod: getObjectUpdatedAt(entry).toISOString(),
    })),
    ...themeRecords.map((record) => ({
      url: toSiteUrl(getTaxonomyTermPath('theme', record.term)),
      lastmod: record.updatedAt.toISOString(),
    })),
    ...constellationRecords.map((record) => ({
      url: toSiteUrl(getTaxonomyTermPath('constellation', record.term)),
      lastmod: record.updatedAt.toISOString(),
    })),
  ];

  const uniqueUrls = [...new Map(urls.map((item) => [item.url, item])).values()];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniqueUrls
    .map((item) => `  <url><loc>${escapeXml(item.url)}</loc><lastmod>${escapeXml(item.lastmod)}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
