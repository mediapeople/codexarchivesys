const BROWSER_REVALIDATE = 'public, max-age=0, must-revalidate';
const NETLIFY_DEPLOY_CACHE = 'public, durable, s-maxage=31536000, must-revalidate';

/**
 * Cache immutable-for-a-deploy responses at Netlify's edge while making browsers
 * revalidate. Netlify invalidates the cached response when a new deploy goes live.
 */
export function applyDeployScopedCacheHeaders(headers: Headers): Headers {
  headers.set('Cache-Control', BROWSER_REVALIDATE);
  headers.set('Netlify-CDN-Cache-Control', NETLIFY_DEPLOY_CACHE);
  return headers;
}
