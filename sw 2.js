const CACHE_NAME = 'ux-roy-portfolio-v20';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/style/style.css',
  '/assets/script/script.js',
  '/manifest.json',
  '/assets/image/pwa-icon.png',
  '/assets/icons/logo.svg',
  '/assets/icons/Skill_1.svg',
  '/assets/icons/Skill_2.svg',
  '/assets/icons/Skill_3.svg',
  '/assets/icons/Skill_4.svg',
  '/assets/icons/Card_1.svg',
  '/assets/icons/Card_2.svg',
  '/assets/icons/Card_3.svg',
  '/assets/icons/Social_1.svg',
  '/assets/icons/Social_2.svg',
  '/assets/icons/Social_3.svg',
  '/assets/icons/Social_4.svg',
  '/assets/icons/Social_5.svg',
  '/assets/image/profile.webp'
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
