const CACHE_NAME = 'ux-roy-portfolio-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/style/style.css',
  '/assets/script/script.js',
  '/manifest.json',
  '/assets/image/pwa-icon.png',
  '/assets/icon/logo.svg',
  '/assets/icon/design-process-white.svg',
  '/assets/icon/design-process-black.svg',
  '/assets/icon/mobile-process-white.svg',
  '/assets/icon/mobile-process-black.svg',
  '/assets/icon/proficiency.svg',
  '/assets/icon/competency.svg',
  '/assets/icon/research.svg',
  '/assets/icon/frontend.svg',
  '/assets/image/profile-dark.png',
  '/assets/image/profile-light.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching Files');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
