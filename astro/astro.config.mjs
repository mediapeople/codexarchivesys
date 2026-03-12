// @ts-check
import { defineConfig } from 'astro/config';

const localNoStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

// https://astro.build/config
export default defineConfig({
  site: 'https://ndcodex.com',
  vite: {
    server: {
      headers: localNoStoreHeaders,
    },
    preview: {
      headers: localNoStoreHeaders,
    },
  },
});
