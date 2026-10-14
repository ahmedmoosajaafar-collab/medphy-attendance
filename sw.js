const CACHE_NAME = 'medphy-attendance-v3-local-jsqr';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './vendor/jsQR.js'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('medphy-attendance-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(r => { const copy=r.clone(); caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy)); return r; }).catch(async () => (await caches.match('./index.html')) || Response.error()));
    return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
