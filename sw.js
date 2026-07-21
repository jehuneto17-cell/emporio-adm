const CACHE_NAME = 'emporio-admin-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Estratégia simples: network-first, sem cache agressivo
// (painel administrativo deve sempre buscar dados atualizados)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
