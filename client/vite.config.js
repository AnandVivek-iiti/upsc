import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      // ── Precache assets from /public ──────────────────────────────────────
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "favicon-48x48.png",
        "favicon-96x96.png",
        "apple-touch-icon.png",
        "logo-192.png",
        "logo-maskable-192.png",
        "logo-512.png",
        "logo-maskable-512.png",
        "logo-upsc.png",
        "index.html",
        "Motivation.png",
      ],

      // ── Manifest - replaces manual manifest.webmanifest / manifest.json ──
      manifest: {
        name: "UPSC Mentor - AI-Powered Preparation",
        short_name: "UPSC Mentor",
        description:
          "AI-powered UPSC CSE preparation - syllabus tracker, PYQs, Mains evaluator and Prelims grind.",
        theme_color: "#F59E0B",
        background_color: "#09110F",
        id: "UPSC_MENTOR_APP",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",

        icons: [
          {
            src: "/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon-48x48.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "any",
          },

          {
            src: "/favicon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any",
          },

          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any",
          },

          {
            src: "/logo-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/logo-maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },

          {
            src: "/logo-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/logo-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],

        shortcuts: [
          {
            name: "Dashboard",
            url: "/?view=dashboard",
            icons: [{ src: "/favicon-96x96.png", sizes: "96x96" }],
          },
          {
            name: "Prelims Grind",
            short_name: "Prelims",
            url: "/?view=pre",
            icons: [{ src: "/favicon-96x96.png", sizes: "96x96" }],
          },
          {
            name: "Mains Drill",
            short_name: "Mains",
            url: "/?view=mains",
            icons: [{ src: "/favicon-96x96.png", sizes: "96x96" }],
          },
        ],
        categories: ["education", "productivity"],
      },

      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB

        globPatterns: [
          "**/*.{js,css,html,ico,woff2,woff}",
          "favicon-16x16.png",
          "favicon-32x32.png",
          "favicon-96x96.png",
          "logo-192.png",
          "logo-maskable-192.png",
          "logo-512.png",
        ],

        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],

        runtimeCaching: [
          {
            urlPattern: /\/assets\/.+\.(png|jpg|jpeg|webp|svg)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "upsc-images-cache",
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
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "upsc-api-cache",
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
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
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
