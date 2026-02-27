const CACHE_NAME = 'livegigs-v1';
const EXTERNAL_IMAGE_CACHE = 'external-images';

const CACHE_LIMITS = {
    [EXTERNAL_IMAGE_CACHE]: {
        maxEntries: 150,
        maxAge: 60 * 24 * 60 * 60 * 1000
    }
};

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                './index.html',
                './events.html',
                './partners.html'
            ]).catch(() => {});
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => !name.startsWith('livegigs-'))
                        .map(name => caches.delete(name))
                );
            }),
            cleanupCache()
        ])
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const { request } = event;
    
    if (request.destination === 'image') {
        event.respondWith(imageStrategy(request));
        return;
    }
    
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(pageStrategy(request));
        return;
    }
    
    event.respondWith(networkFirst(request));
});

async function imageStrategy(request) {
    const cache = await caches.open(EXTERNAL_IMAGE_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
        const dateHeader = cached.headers.get('sw-cached-date');
        const maxAge = CACHE_LIMITS[EXTERNAL_IMAGE_CACHE]?.maxAge;
        
        if (dateHeader && maxAge && (Date.now() - parseInt(dateHeader)) > maxAge) {
            await cache.delete(request);
        } else {
            fetch(request).then(response => {
                if (response.ok) {
                    cache.put(request, addTimestamp(response.clone()));
                }
            }).catch(() => {});
            return cached;
        }
    }
    
    try {
        const response = await fetch(request);
        if (!response.ok) return response;
        
        await enforceCacheLimit(cache);
        cache.put(request, addTimestamp(response.clone()));
        return response;
    } catch (error) {
        return new Response(
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            { headers: { 'Content-Type': 'image/gif' } }
        );
    }
}

function addTimestamp(response) {
    const headers = new Headers(response.headers);
    headers.set('sw-cached-date', Date.now().toString());
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    });
}

async function enforceCacheLimit(cache) {
    const limit = CACHE_LIMITS[EXTERNAL_IMAGE_CACHE]?.maxEntries;
    if (!limit) return;
    
    const keys = await cache.keys();
    if (keys.length >= limit) {
        const toDelete = keys.slice(0, Math.floor(limit * 0.2));
        await Promise.all(toDelete.map(req => cache.delete(req)));
    }
}

async function cleanupCache() {
    const cache = await caches.open(EXTERNAL_IMAGE_CACHE);
    const keys = await cache.keys();
    const maxAge = CACHE_LIMITS[EXTERNAL_IMAGE_CACHE]?.maxAge;
    
    if (!maxAge) return;
    
    const now = Date.now();
    const expired = [];
    
    for (const request of keys) {
        const response = await cache.match(request);
        const dateHeader = response?.headers.get('sw-cached-date');
        
        if (dateHeader && (now - parseInt(dateHeader)) > maxAge) {
            expired.push(request);
        }
    }
    
    await Promise.all(expired.map(req => cache.delete(req)));
}

async function pageStrategy(request) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        const networkResponse = await fetch(request);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;
        return new Response('Offline', { status: 503 });
    }
}

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return await cache.match(request) || Promise.reject(error);
    }
}
