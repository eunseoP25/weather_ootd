const CACHE_NAME = 'ootd-app-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install service worker and cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all static shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate service worker and clear old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept fetch requests and serve from cache if offline
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Do not cache KMA API requests (always live)
  if (
    req.url.includes('/api/kma') ||
    req.url.includes('apis.data.go.kr')
  ) {
    e.respondWith(fetch(req));
    return;
  }
  
  //1: 페이지 이동은 무조건 최신
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req));
    return;
  }

  e.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(req).then((networkResponse) => {
        //Cache newly requested local resources on the fly
        if (
          networkResponse.status === 200 &&
          req.url.startsWith(self.location.origin) &&
          !req.url.includes('hot_updates')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        if (req.mode === 'navigate') {
          return fetch(req);
        }
      });
    })
  );
});
