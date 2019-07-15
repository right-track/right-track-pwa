workbox.skipWaiting();
workbox.clientsClaim();

workbox.routing.registerRoute(
    new RegExp('\\.(?:js|css|png|ico|json)$'),
    new workbox.strategies.StaleWhileRevalidate()
);
workbox.routing.registerRoute(
  new RegExp('\\.(?:woff2)$'),
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

workbox.routing.registerNavigationRoute('/');

workbox.precaching.precacheAndRoute(self.__precacheManifest, {});