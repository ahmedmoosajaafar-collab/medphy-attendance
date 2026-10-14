const CACHE_NAME = 'medphy-attendance-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];
const QR_CDN = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
const qrLocal = new URL('./vendor/jsQR.js', self.registration.scope).href;
self.addEventListener('install', event => {
 event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await cache.addAll(SHELL);await self.skipWaiting()})());
});
self.addEventListener('activate', event => {
 event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('medphy-attendance-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim()})());
});
self.addEventListener('fetch', event => {
 const req=event.request, url=new URL(req.url);
 if(url.origin===self.location.origin && url.pathname.endsWith('/vendor/jsQR.js')){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);const cached=await cache.match(qrLocal);if(cached)return cached;
   try{const response=await fetch(QR_CDN,{mode:'cors',cache:'no-cache'});if(!response.ok)throw new Error('CDN unavailable');await cache.put(qrLocal,response.clone());return response}
   catch(e){return new Response('QR decoder unavailable: connect to the internet once, reload, and retry.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
  })());return;
 }
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return r}).catch(()=>caches.match('./index.html')));return;
 }
 if(url.origin===self.location.origin)event.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
