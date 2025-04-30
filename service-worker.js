const CACHE_NAME = 'plumb-stock-home-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Ne traite que la navigation vers la racine
  if (event.request.mode === 'navigate' && event.request.url.endsWith('/')) {
    event.respondWith(
      caches.match('/').then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
