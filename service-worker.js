
const CACHE_NAME = 'pintade-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/c40b3b5e-ab31-4815-a5c0-845fdff4a728.png'
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
