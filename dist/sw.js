const CACHE_NAME = 'remoteteam-v1';
const STATIC_ASSETS = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never intercept non-GET requests (POST login/register go straight to network)
  if (e.request.method !== 'GET') return;
  // Never cache API calls — always hit the network
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Network failed — try to serve /index.html from cache as offline fallback.
          // Guard against caches.match returning undefined (empty cache on first load)
          // to avoid "Failed to convert value to 'Response'" TypeError.
          const fallback = await caches.match('/index.html');
          return fallback || new Response(
            '<html><body><h2>You are offline</h2><p>Please check your connection.</p></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html' } }
          );
        });
    })
  );
});
