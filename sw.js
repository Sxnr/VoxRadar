/* Service worker: guarda la app para que funcione sin conexión (PWA). */
const CACHE = 'voxradar-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './src/main.js',
  './src/app/store.js',
  './src/app/persistence.js',
  './src/app/clock.js',
  './src/app/router.js',
  './src/core/meeting-script.js',
  './src/core/simulation.js',
  './src/core/history.js',
  './src/core/speakers.js',
  './src/core/geometry.js',
  './src/core/settings.js',
  './src/core/params.js',
  './src/ui/dom.js',
  './src/ui/icons.js',
  './src/ui/components/header.js',
  './src/ui/components/radar-view.js',
  './src/ui/components/turn-indicator.js',
  './src/ui/components/captions.js',
  './src/ui/screens/home.js',
  './src/ui/screens/radar.js',
  './src/ui/screens/rename.js',
  './src/ui/screens/missed.js',
  './src/ui/screens/detail.js',
  './src/ui/screens/settings.js',
  './src/ui/screens/pause-alert.js',
  './src/styles/tokens.css',
  './src/styles/base.css',
  './src/styles/components.css',
  './src/styles/screens.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match('./index.html'))),
  );
});
