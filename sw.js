/* ============================================================
   ELEXSIYA 26 — SERVICE WORKER
   Strategy:
   - HTML  → Network-first  (always fresh, never stale error pages)
   - JS/CSS/Images → Cache-first + background revalidation (fast)
   - Bump CACHE_VERSION to force all clients to clear old cache
   ============================================================ */

const CACHE_VERSION = 'v4'; // ← Bump this when you deploy changes
const CACHE_NAME    = `elexsiya-${CACHE_VERSION}`;

// Static assets to pre-cache on install (critical path)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
];

// ── INSTALL: pre-cache key assets, take over immediately ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .catch(() => {}) // non-fatal if precache fails
  );
  self.skipWaiting(); // Activate immediately
});

// ── ACTIVATE: delete ALL old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME) // keep only current version
          .map(key => caches.delete(key))   // delete everything else
      )
    ).then(() => self.clients.claim()) // take control of all open tabs
  );
});

// ── FETCH: smart routing ──
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET and cross-origin requests (Firebase, fonts, CDN)
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  const isHTML = request.headers.get('Accept')?.includes('text/html')
              || url.pathname.endsWith('.html')
              || url.pathname === '/'
              || !url.pathname.includes('.');

  if (isHTML) {
    // HTML: Network-first → ensures users always get fresh pages
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          // Clone and cache the fresh response for offline fallback
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request)) // offline fallback
    );
  } else {
    // Static assets (JS/CSS/images): Cache-first + background revalidate
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request, { cache: 'no-cache' }).then(response => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }).catch(() => null);

        return cached || fetchPromise; // serve cache instantly, update in background
      })
    );
  }
});

// ── MESSAGE: force-refresh on demand ──
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
  }
});
