export const SITE_ORIGIN = 'https://ndcodex.com';
export const SITE_TITLE = 'Codex Archive';
export const SITE_DESCRIPTION = 'An object archive for human creative work.';

export function withTrailingSlash(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    const url = new URL(path);
    url.pathname = withTrailingSlash(url.pathname);
    return url.toString();
  }

  if (path === '/' || /\.[a-z0-9]+$/i.test(path) || path.endsWith('/')) {
    return path;
  }

  return `${path}/`;
}

export function toSiteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return withTrailingSlash(path);
  }

  return new URL(withTrailingSlash(path), SITE_ORIGIN).toString();
}
