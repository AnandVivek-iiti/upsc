import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Include all public assets in SW precache
      includeAssets: [
        "logo-upsc.png",
        "logo-192.png",
        "logo-512.png",
        "offline.html",
        "assets/*.png",
        "Motivation.png",
      ],
      manifest: {
        name: "UPSC Mentor — AI-Powered Preparation",
        short_name: "UPSC Mentor",
        description:
          "AI-powered UPSC CSE preparation — syllabus tracker, PYQs, Mains evaluator and Prelims grind.",
        theme_color: "#F59E0B",
        background_color: "#09110F",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        // ── Icons ──────────────────────────────────────────────────────────
        // Two separate entries: one for home-screen (any) and one maskable
        // (Android adaptive icon). Both point to the correctly-sized PNGs
        // that live in /public and are copied to /dist at build time.
        icons: [
          {
            src: "/logo-192.png",   // 192×192 square crop of logo-upsc.png
            sizes: "192x192",
            type: "image/png",
            purpose: "any",         // standard home-screen icon
          },
          {
            src: "/logo-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",    // Android adaptive icon (safe-zone)
          },
          {
            src: "/logo-512.png",   // 512×512 — used for splash screen & stores
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/logo-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Dashboard",
            url: "/?view=dashboard",
            icons: [{ src: "/logo-192.png", sizes: "96x96" }],
          },
          {
            name: "Prelims Grind",
            short_name: "Prelims",
            url: "/?view=pre",
            icons: [{ src: "/logo-192.png", sizes: "96x96" }],
          },
          {
            name: "Mains Drill",
            short_name: "Mains",
            url: "/?view=mains",
            icons: [{ src: "/logo-192.png", sizes: "96x96" }],
          },
        ],
        categories: ["education", "productivity"],
      },
      workbox: {
        // Raise limit to 5 MB so large PNGs don't block the build.
        // footer1.png (2.4 MB), Motivation.png (776 KB), slider.png (1.5 MB)
        // are excluded from precache via globIgnores and handled by runtime cache.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB

        // Precache only JS/CSS/HTML/fonts/small icons — NOT the heavy image assets
        globPatterns: ["**/*.{js,css,html,ico,woff2,woff}", "logo-192.png", "logo-512.png", "logo-upsc.png"],

        // Offline fallback — when both network and cache miss, serve offline.html
        navigateFallback: "/offline.html",
        navigateFallbackDenylist: [/^\/api/], // never fallback for API routes
        runtimeCaching: [
          {
            // Large local images (footer1, slider, Motivation, mt1, mt2)
            // cached on first visit, served from cache on repeat visits
            urlPattern: /\/assets\/.+\.(png|jpg|jpeg|webp|svg)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "local-images-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // API — network first, 10s timeout, then cached response
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // set true temporarily to test SW in dev
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});