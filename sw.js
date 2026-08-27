const CACHE_NAME = 'math-kids-v2';
const ASSETS = [
  './',
  './index.html',
  './bgNgang1.png',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './screenshot1.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => { })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Strategy: Network-First for HTML / page navigation so Vercel updates load immediately when online
  if (event.request.mode === 'navigate' || event.request.url.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-First for static assets (images, icons, manifest)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    }).catch(() => fetch(event.request))
  );
});
