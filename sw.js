/* ==========================================================================
   VOZX AI - Progressive Web App Service Worker (Offline Resilience)
   Network-First for HTML/CSS/JS ensuring instant updates on Mobile & Tablet
   ========================================================================== */

const CACHE_NAME = 'vozx-ai-v24';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './styles.css?v=24.0',
  './app.js',
  './app.js?v=24.0',
  './supabaseClient.js',
  './supabaseClient.js?v=24.0',
  './assets/vozx-brand-intro-clean.png',
  './assets/vozx-logo-icon.png',
  './assets/offline-robot.png',
  './assets/offline-planet.png',
  './assets/exact_void_bg.png',
  './assets/orb.png',
  './assets/button_area.png',
  './assets/icons_strip.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache notice:', err);
      });
    })
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

  // 1. NETWORK FIRST for HTML navigation (guarantees mobile & tab users get newest HTML immediately)
  if (e.request.mode === 'navigate' || e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match('./index.html') || caches.match('./'))
    );
    return;
  }

  // 2. NETWORK FIRST for CSS and JS
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 3. CACHE FIRST for static image assets
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return networkResponse;
      });
    })
  );
});
