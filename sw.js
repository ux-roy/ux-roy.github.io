const CACHE_NAME = 'ux-roy-portfolio-v45';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './assets/style/style.css?v=47',
  './assets/script/script.js?v=34',
  './manifest.json',
  './assets/image/pwa-icon.png',
  './assets/image/pwa-icon.png?v=2',
  './assets/icons/logo.svg',
  './assets/icons/logo.svg?v=2',
  './assets/icons/process.svg',
  './assets/icons/QR Code.svg',
  './assets/icons/Social_1.svg',
  './assets/icons/Social_2.svg',
  './assets/icons/Social_3.svg',
  './assets/icons/Social_4.svg',
  './assets/icons/Social_5.svg',
  './assets/image/profile.webp'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching Core Assets');
      return cache.addAll(
        ASSETS_TO_CACHE.map((url) => new Request(url, { cache: 'reload' }))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network-first with cache fallback and offline navigation support)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('./');
          }
        });
      })
  );
});
