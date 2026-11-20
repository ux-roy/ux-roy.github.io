const CACHE_NAME = 'ux-roy-portfolio-v24';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/style/style.css?v=27',
  '/assets/script/script.js?v=23',
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
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network-first with cache refresh for same-origin GET requests)
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
      .catch(() => caches.match(event.request))
  );
});
