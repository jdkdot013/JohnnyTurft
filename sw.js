const cacheName = 'site-static-v2';
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
        caches.open(cacheName).then(cache => {
            cache.addAll(assets);
        })
    );
});

self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request);
        })
    );
});

self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== cacheName).map(key => caches.delete(key))
            );
        })
    );
});
