import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'SanctuaryBase Volunteer Portal',
        short_name: 'SanctuaryBase',
        description: 'Saint Francis Rescue volunteer & staff operations app for sanctuary management',
        theme_color: '#863bff',
        background_color: '#0f1115',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/?source=pwa',
        scope: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          { src: '/favicon.svg', sizes: '540x720', form_factor: 'narrow' },
          { src: '/favicon.svg', sizes: '1280x800', form_factor: 'wide' },
        ],
      },
      workbox: {
        // App shell (JS/CSS/HTML/images) is precached so the app itself
        // loads offline. Firestore's own SDK already has its own offline
        // persistence for reads/writes — this only needs to keep the app
        // bootable without a network connection.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        // Without these, a newly installed SW sits in "waiting" forever
        // while the old one keeps every open tab pinned to its stale
        // precache — a hard refresh alone never picks up a new deploy.
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Weather/API calls some pages hit directly — best-effort cache,
            // never block the UI waiting on a flaky connection.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5176,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
