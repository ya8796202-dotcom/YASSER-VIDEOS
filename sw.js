self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('yvs-cache-v1').then(cache => cache.addAll([
      './', './index.html', './styles.css', './main.js', './timeline.js', './storage.js', './manifest.json'
    ]))
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
