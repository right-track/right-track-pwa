workbox.skipWaiting();
workbox.clientsClaim();

workbox.routing.registerRoute(
    new RegExp('\\.(?:js|css|woff2|png|ico)$'),
    new workbox.strategies.StaleWhileRevalidate()
);
workbox.routing.registerRoute(
    new RegExp('manifest\\.json$'),
    new workbox.strategies.StaleWhileRevalidate()
);

workbox.routing.registerNavigationRoute('/');

workbox.precaching.precacheAndRoute(self.__precacheManifest, {});