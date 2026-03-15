// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://e-kinderauto.de',
  output: 'server',
  adapter: cloudflare(),
  integrations: [react(), tailwind()],
  vite: {
    resolve: {
      // React SSR auf Edge-Version umstellen (Cloudflare Workers haben kein MessageChannel)
      alias:
        process.env.NODE_ENV === 'production'
          ? { 'react-dom/server': 'react-dom/server.edge' }
          : {},
    },
  },
});
