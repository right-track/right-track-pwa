workbox.skipWaiting();
workbox.clientsClaim();

workbox.routing.registerRoute(
    new RegExp('sql-wasm\\.(?:wasm|js)$'),
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
workbox.routing.registerRoute(
    new RegExp('\\/'),
    new workbox.strategies.StaleWhileRevalidate()
);

workbox.routing.registerNavigationRoute('/');

workbox.precaching.precacheAndRoute(self.__precacheManifest, {});