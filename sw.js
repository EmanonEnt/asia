const CACHE_NAME = 'livegigs-v2';  // 增加版本号强制更新
const EXTERNAL_IMAGE_CACHE = 'external-images-v2';  // 增加版本号

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
            // 删除所有旧缓存
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== EXTERNAL_IMAGE_CACHE)
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

    // 关键修复：跳过所有非 GET 请求
    if (request.method !== 'GET') {
        return;
    }

    if (request.destination === 'image') {
        event.respondWith(
            caches.open(EXTERNAL_IMAGE_CACHE).then(cache => {
                return cache.match(request).then(response => {
                    if (response) {
                        const dateHeader = response.headers.get('date');
                        if (dateHeader) {
                            const age = Date.now() - new Date(dateHeader).getTime();
                            if (age > CACHE_LIMITS[EXTERNAL_IMAGE_CACHE].maxAge) {
                                cache.delete(request);
                                return fetchAndCache(request, cache);
                            }
                        }
                        return response;
                    }
                    return fetchAndCache(request, cache);
                });
            })
        );
    } else {
        event.respondWith(
            caches.match(request).then(response => {
                return response || fetch(request);
            })
        );
    }
});

function fetchAndCache(request, cache) {
    return fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
            cleanupCache();
        }
        return response;
    }).catch(() => {
        return new Response('Offline', { status: 503 });
    });
}

function cleanupCache() {
    caches.open(EXTERNAL_IMAGE_CACHE).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > CACHE_LIMITS[EXTERNAL_IMAGE_CACHE].maxEntries) {
                const toDelete = keys.slice(0, keys.length - CACHE_LIMITS[EXTERNAL_IMAGE_CACHE].maxEntries);
                toDelete.forEach(key => cache.delete(key));
            }
        });
    });
}
