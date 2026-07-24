import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        wall: path.resolve(__dirname, 'wall/index.html'),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      /* 'prompt' au lieu de 'autoUpdate' : le SW installe la nouvelle version
         en tâche de fond mais n'active pas tant que le client n'appelle pas
         updateServiceWorker(). Ça nous laisse afficher un toast "Mettre à
         jour" non-bloquant (voir client/hooks/usePwaUpdate.js). */
      registerType: 'prompt',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'],

      /* ── Web App Manifest ── */
      manifest: {
        name: 'myKado — Créateur de Vœux',
        short_name: 'myKado',
        description: 'Créez des vœux animés, personnalisés et mémorables pour vos proches.',
        theme_color: '#c9a84c',
        background_color: '#0e0f11',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/ewish-admin/ewish',
        lang: 'fr',
        categories: ['productivity', 'lifestyle'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      /* ── Workbox (Service Worker) ── */
      workbox: {
        // Précache tous les assets de l'app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Limite par asset précaché — bumpée à 5 Mo pour laisser passer
        // les textures de fond (ex: client/Backgrounds/Paper.png ~2.3 Mo).
        // Sans ça, le build casse dès qu'un asset dépasse les 2 Mo par défaut.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // Stratégie réseau : Network First pour l'API, Cache First pour les assets statiques
        runtimeCaching: [
          {
            // API calls — toujours réseau d'abord
            urlPattern: /^https?:\/\/.*\/api\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, // 5 min
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Images uploadées (Cloudinary / uploads)
            urlPattern: /\/uploads\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'uploads-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7j
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // Ne pas mettre en cache les pages de navigation (SPA routing géré par React Router)
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/site/, /^\/s\//],
      },

      devOptions: {
        enabled: true, // Activer en dev pour tester
        type: 'module',
      },
    }),
  ],

  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
      '/site': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
      '/backgrounds': 'http://localhost:5000',
      '/s': 'http://localhost:5000',
    },
  },
});