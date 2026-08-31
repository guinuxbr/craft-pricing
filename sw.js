/**
 * @fileoverview Craft Pricing - Progressive Web App Service Worker
 * =================================================================
 * Provides offline caching and network routing strategies for Craft Pricing:
 *
 * Caching Strategies:
 * -------------------
 * 1. Static Shell Assets (HTML, CSS, JS, Favicons, Fonts, CDN Icons, jsPDF):
 *    Cache-First with background cache revalidation. If found in cache, return
 *    cached copy immediately and re-fetch from network in background to keep cache fresh.
 *
 * 2. Fallback:
 *    If offline and requested asset is not cached, gracefully falls back to cached root.
 *
 * @author Guilherme Marques (https://guinuxbr.com)
 * @license MIT
 */

/**
 * Identifier for the current service worker cache version.
 * Increment this string (e.g., 'craft-pricing-v2') when updating cached assets.
 * @constant {string}
 */
const CACHE_NAME = "craft-pricing-v1";

/**
 * List of static shell assets to pre-cache upon service worker installation.
 * @constant {string[]}
 */
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/script.js",
  "./favicon.ico",
  "./manifest.json",
  "./images/logo.png",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
  "https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js"
];

/**
 * Service Worker 'install' event.
 * Pre-caches all core shell assets and immediately forces activation.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

/**
 * Service Worker 'activate' event.
 * Purges obsolete cache versions from prior releases and claims control of all open client tabs.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Service Worker 'fetch' event.
 * Implements Cache-First with Stale-While-Revalidate network strategy.
 */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Re-fetch in background to update cache (Stale-While-Revalidate)
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
