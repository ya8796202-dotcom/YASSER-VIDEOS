self.addEventListener('install', e => {
  e.waitUntil(caches.open('yvs-v1').then(c => c.addAll(['/','/styles.css','/main.js'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
