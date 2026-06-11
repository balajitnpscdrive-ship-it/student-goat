/**
 * Service Worker — PWA GitHub Template
 * Provides offline support and caching for the PWA shell.
 *
 * Strategy: Cache-first for shell assets, network-first for navigations.
 */

const CACHE_NAME    = "pwa-shell-v1";
const OFFLINE_URL   = "/index.html";

// Assets to pre-cache (the app shell)
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/app.js",
  "/pwa.config.js",
  "/manifest.json",
  "/icons/icon-16.png",
  "/icons/icon-32.png",
  "/icons/icon-72.png",
  "/icons/icon-96.png",
  "/icons/icon-128.png",
  "/icons/icon-144.png",
  "/icons/icon-152.png",
  "/icons/icon-180.png",
  "/icons/icon-192.png",
  "/icons/icon-384.png",
  "/icons/icon-512.png",
];

// ── Install ──────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Pre-caching shell assets");
      // Use individual adds so one missing icon doesn't break everything
      return Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url)));
    })
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Navigation requests → network first, fallback to cached index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached || new Response("Offline", { status: 503 }))
      )
    );
    return;
  }

  // Static assets → cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Cache successful GET responses
          if (request.method === "GET" && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // For image requests, return a placeholder
          if (request.destination === "image") {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="#161b22"/></svg>',
              { headers: { "Content-Type": "image/svg+xml" } }
            );
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});

// ── Background Sync (optional) ────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
