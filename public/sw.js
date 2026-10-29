/*
 * GeoArena service worker.
 *
 * Strategy:
 *   - App shell (HTML, JS, CSS, icons): stale-while-revalidate, so a repeat
 *     visit paints instantly and the new build is picked up in the background.
 *   - Map tiles and the CARTO style JSON: cache-first, they never change.
 *   - Navigations: network first with a cached fallback, so the app still
 *     opens offline.
 *
 * Bump CACHE_VERSION to invalidate everything on the next deploy.
 */

const CACHE_VERSION = 'v2';
const SHELL_CACHE = `geoarena-shell-${CACHE_VERSION}`;
const TILE_CACHE = `geoarena-tiles-${CACHE_VERSION}`;

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/brand-icon.svg',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/og-image.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // addAll fails the whole install if one file is missing, so add them
      // one by one and tolerate individual failures.
      .then((cache) =>
        Promise.all(
          SHELL_URLS.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== TILE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isTileRequest(url) {
  return (
    url.hostname.endsWith('basemaps.cartocdn.com') ||
    url.hostname.endsWith('cartocdn.com') ||
    url.pathname.endsWith('.pbf') ||
    url.pathname.endsWith('.mvt')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Map tiles and vector tiles: cache first, they are immutable.
  if (isTileRequest(url)) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok || response.type === 'opaque') {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          return new Response('', { status: 504, statusText: 'Tile unavailable offline' });
        }
      })
    );
    return;
  }

  // Never cache the ad script or the ad iframes - they must always be fresh.
  if (url.pathname.includes('googlesyndication') || url.pathname.includes('doubleclick')) {
    return;
  }

  // Navigations: try the network, fall back to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() =>
          caches
            .match('/index.html')
            .then((cached) => cached || caches.match('/'))
            .then((cached) => cached || new Response('Offline', { status: 503 }))
        )
    );
    return;
  }

  // Everything else on our own origin: stale-while-revalidate.
  if (sameOrigin) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
