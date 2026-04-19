const CACHE_NAME = 'ux-roy-portfolio-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/icons/logo.svg',
  './assets/icons/pwa-icon.svg',
  './assets/icons/design-process-white.svg',
  './assets/icons/design-process-black.svg',
  './assets/icons/mobile-process-white.svg',
  './assets/icons/mobile-process-black.svg',
  './assets/icons/tools-proficiency.svg',
  './assets/icons/design-competency.svg',
  './assets/icons/research-expertise.svg',
  './assets/icons/AI-&-frontend.svg',
  './assets/images/profile-dark.png',
  './assets/images/profile-light.png'
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
