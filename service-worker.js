var cacheName = 'comparaPrecios-v0.1.01';

var filesToCache = [
  './',
  './index.html',
  './js/main.js',
  './css/estilos.css',
  './font/FiraSansOT-Regular.otf',
  './img/icon.png',
  './img/icon-48x48.png',
  './img/icon-96x96.png',
  './img/icon-128x128.png',
  './img/icon-144x144.png',
  './img/icon-192x192.png',  
  './img/icon-512x512.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install_');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate_');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key.startsWith('comparaPrecios-')){
          if (key !== cacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});