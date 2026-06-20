const CACHE_NAME = 'medscan-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/medscan.png',
  '/icon-192.png',
  '/icon-512.png'
];

// Install Event - Pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline page shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Serve cached assets or fetch from network and cache
self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS requests (avoid chrome-extension://, firebase, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip POST requests and analytics/auth API requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignore background fetch failures
          });
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Cache new responses
          if (networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is index.html or root, return cached root
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
