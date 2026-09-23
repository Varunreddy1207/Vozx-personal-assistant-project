/* ==========================================================================
   VOZX AI - Progressive Web App Service Worker (Offline Resilience)
   ========================================================================== */

const CACHE_NAME = 'vozx-ai-v7';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './styles.css?v=6.0',
  './app.js',
  './supabaseClient.js',
  './assets/offline-robot.png',
  './assets/offline-planet.png',
  './assets/exact_void_bg.png',
  './assets/orb.png',
  './assets/button_area.png',
  './assets/icons_strip.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache notice:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests for app shell & static assets
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Skip external APIs, CDN scripts, and live ping checks from cache
  if (url.hostname.includes('dns.google') ||
      url.hostname.includes('httpbin.org') ||
      url.hostname.includes('google.com') ||
      url.hostname.includes('cloudflare.com') ||
      url.pathname.includes('/rest/v1/') ||
      url.pathname.includes('/auth/v1/')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate in background if online
        fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(e.request).catch(() => {
        // Fallback to cached index.html for navigation requests when offline
        if (e.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html') || caches.match('./');
        }
      });
    })
  );
});

