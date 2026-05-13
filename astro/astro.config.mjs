// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

const localNoStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

// https://astro.build/config
export default defineConfig({
  site: 'https://ndcodex.com',
  adapter: netlify({
    excludeFiles: ['./public/media/**'],
  }),
  vite: {
    server: {
      headers: localNoStoreHeaders,
    },
    preview: {
      headers: localNoStoreHeaders,
    },
  },
});
