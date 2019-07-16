workbox.skipWaiting();
workbox.clientsClaim();

workbox.routing.registerRoute(
    new RegExp('worker\\.sql\\.js$'),
    new workbox.strategies.CacheFirst()
);
workbox.routing.registerRoute(
    new RegExp('\\.(?:woff2)$'),
    new workbox.strategies.CacheFirst()
);
workbox.routing.registerRoute(
    new RegExp('\\.(?:js|css|png|ico|json)$'),
    new workbox.strategies.StaleWhileRevalidate()
);

workbox.routing.registerNavigationRoute('/');

workbox.precaching.precacheAndRoute(self.__precacheManifest, {});