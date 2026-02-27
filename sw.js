const CACHE_NAME = 'livegigs-v3';
const EXTERNAL_IMAGE_CACHE = 'external-images-v3';

const CACHE_LIMITS = {
    [EXTERNAL_IMAGE_CACHE]: {
        maxEntries: 150,
        maxAge: 60 * 24 * 60 * 60 * 1000
    }
};

const PRECACHE_URLS = [
    './index.html',
    './events.html',
    './partners.html'
];

self.addEventListener('install', event => {
    console.log('[SW] Installing v3...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Pre-caching');
                return cache.addAll(PRECACHE_URLS).catch(() => {});
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] Activating v3...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME && name !== EXTERNAL_IMAGE_CACHE) {
                        console.log('[SW] Deleting old:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    
    if (request.method !== 'GET') return;
    
    const url = new URL(request.url);
    if (!url.protocol.startsWith('http')) return;

    if (request.destination === 'image') {
        event.respondWith(handleImage(request));
    } else {
        event.respondWith(handleDefault(request));
    }
});

async function handleImage(request) {
    const cache = await caches.open(EXTERNAL_IMAGE_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
        const date = cached.headers.get('date');
        if (date) {
            const age = Date.now() - new Date(date).getTime();
            if (age > CACHE_LIMITS[EXTERNAL_IMAGE_CACHE].maxAge) {
                cache.delete(request);
                return fetchImage(request, cache);
            }
        }
        fetchImage(request, cache).catch(() => {});
        return cached;
    }
    
    return fetchImage(request, cache);
}

async function fetchImage(request, cache) {
    try {
        const response = await fetch(request, { mode: 'cors', credentials: 'omit' });
        if (response.ok) {
            await cache.put(request, response.clone());
            cleanupCache();
        }
        return response;
    } catch (err) {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw err;
    }
}

async function handleDefault(request) {
    try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw err;
    }
}

function cleanupCache() {
    caches.open(EXTERNAL_IMAGE_CACHE).then(cache => {
        cache.keys().then(keys => {
            const limit = CACHE_LIMITS[EXTERNAL_IMAGE_CACHE].maxEntries;
            if (keys.length > limit) {
                keys.slice(0, keys.length - limit).forEach(key => cache.delete(key));
            }
        });
    });
}
