import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { execSync } from 'node:child_process';

/*
 * THE BUILD STAMP.
 *
 * Every build carries the commit it came from and the minute it was made,
 * and Settings > Diagnostics prints them back. This exists because a
 * finished feature sat invisible for a whole conversation behind a server
 * still serving an older build: the code was right, the browser had never
 * seen it, and there was no way to tell by looking. Now there is.
 */
const buildId = (() => {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); }
  catch { return 'nogit'; }
})();
const buildTime = new Date().toISOString().slice(0, 16).replace('T', ' ');

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon-32.png', 'apple-touch-icon.png'],
        manifest: {
          // This is the name a patient sees under the icon once they install
          // the site to a home screen. It was 'Clinic OS' — the name of the
          // template this was built from, not of the practice.
          id: '/',
          name: 'Osteopathy & Wellbeing @CT6',
          short_name: 'Osteo @CT6',
          description:
            'Osteopathy, acupuncture, sports massage and rehabilitation in Herne Bay, Kent.',
          lang: 'en-GB',
          start_url: '/',
          scope: '/',
          theme_color: '#0f172a',
          background_color: '#020617',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              // Android crops the icon to whatever shape the launcher uses, so
              // this one carries padding around the mark. Without a maskable
              // entry the ring gets sliced off at the edges.
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          /*
           * Without these, a returning visitor can keep being served the
           * previous deploy's files out of the service worker cache, which is
           * the state that makes pages fail to load on a link click. Old
           * caches are dropped on activate, and the new worker takes over the
           * page immediately rather than waiting for every tab to close.
           */
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          /*
           * THE PAGE ITSELF IS NEVER SERVED FROM CACHE.
           *
           * index.html is the only file that names the current versions of
           * everything else. Serving it from the service worker cache pins a
           * returning visitor to an old build permanently - they were still
           * being handed an entry file from two deploys earlier, and because
           * that old code predates the recovery guard, it could not even
           * rescue itself. It looked exactly like the crash this was all
           * supposed to fix.
           *
           * So HTML is left out of the precache entirely and no navigation
           * fallback is registered: page loads always go to the network,
           * which is what makes a new deploy take effect straight away. The
           * hashed files under /assets are still precached, which is safe
           * precisely because their names change whenever their contents do.
           */
          /*
           * Code, styles, fonts and icons only - the things needed to get a
           * page on screen. Deliberately not the gallery artwork or the intro
           * films: including those took the install from 36 files to 119 and
           * 8.5MB, which every returning visitor would pay for up front to
           * cache pictures most of them never open.
           */
          globPatterns: ['**/*.{js,css,woff2,ico,svg}'],
          navigateFallback: undefined,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'unsplash-images',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            }
          ]
        }
      })
    ],
    define: {
      __BUILD_ID__: JSON.stringify(buildId),
      __BUILD_TIME__: JSON.stringify(buildTime),
      /*
       * GEMINI_API_KEY IS DELIBERATELY NOT DEFINED HERE.
       *
       * `define` performs a literal text substitution into the CLIENT bundle,
       * so this line would publish the key to every visitor the moment a real
       * one existed in .env — and .env.example invites exactly that. No code
       * under src/ reads it (checked), so the line was pure risk for no gain.
       * If the browser ever needs AI, it must go through a server route that
       * holds the key, never through the bundle.
       */
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
