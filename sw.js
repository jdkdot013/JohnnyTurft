const cacheName = 'site-static-v4';
const assets = [
    'index.html',
    'style.css',
    'script.js',
    'icons/add-icon.png',
    'icons/close-icon.png',
    'icons/more-icon.png',
    'images/tally-0.png',
    'images/tally-1.png',
    'images/tally-2.png',
    'images/tally-3.png',
    'images/tally-4.png',
    'images/tally-5.png',
    'images/background.jpg',
    'images/txt.png',
    'images/complete-image.jpg',
    'images/header-image.png',
    'images/header-image-white.png'
    
];

self.addEventListener('install', evt => {
    evt.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            await cache.addAll(assets);
            await self.skipWaiting();
        })()
    );
});

self.addEventListener('fetch', evt => {
    if (evt.request.method !== 'GET') return;

    const url = new URL(evt.request.url);
    if (url.origin !== self.location.origin) return;

    const isNavigation = evt.request.mode === 'navigate';
    const isCoreAsset =
        url.pathname.endsWith('/index.html') ||
        url.pathname.endsWith('/style.css') ||
        url.pathname.endsWith('/script.js');

    const networkFirst = async () => {
        try {
            const fresh = await fetch(evt.request);
            const cache = await caches.open(cacheName);
            cache.put(evt.request, fresh.clone());
            return fresh;
        } catch (_) {
            const cached = await caches.match(evt.request);
            if (cached) return cached;
            if (isNavigation) return caches.match('index.html');
            throw _;
        }
    };

    const cacheFirst = async () => {
        const cached = await caches.match(evt.request);
        if (cached) return cached;
        const fresh = await fetch(evt.request);
        const cache = await caches.open(cacheName);
        cache.put(evt.request, fresh.clone());
        return fresh;
    };

    evt.respondWith(isNavigation || isCoreAsset ? networkFirst() : cacheFirst());
});

self.addEventListener('activate', evt => {
    evt.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.filter(key => key !== cacheName).map(key => caches.delete(key)));
            await self.clients.claim();
        })()
    );
});
