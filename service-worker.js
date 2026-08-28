// Uygulamayı yükleyip cihaza kurduğunda (PWA) çevrimdışı da açılabilmesi için basit önbellekleme.
// Yeni bir sürüm yayınladığında CACHE_NAME değerini değiştir (ör. v2, v3...) — böylece
// eski önbellek temizlenip yeni dosyalar indirilir.
const CACHE_NAME = 'gunluk-gorevler-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if(req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if(res && res.status === 200 && res.type === 'basic'){
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || network;
    })
  );
});
