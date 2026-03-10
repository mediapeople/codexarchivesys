const SITE_ORIGIN = 'https://ndcodex.com';

export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
