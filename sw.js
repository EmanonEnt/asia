const CACHE_NAME = 'livegigs-v4';  // 更新版本号强制刷新
const EXTERNAL_IMAGE_CACHE = 'external-images-v4';

const CACHE_LIMITS = {
    [EXTERNAL_IMAGE_CACHE]: {
        maxEntries: 150,
        maxAge: 60 * 24 * 60 * 60 * 1000
    }
};

const PRECACHE_URLS = [
    './index.html',
    './events.html',
    './cn.html',
    './partners.html',
    './image/asia-bannerbg.webp',
    './image/asia-asiaad.jpg'
];

// 安装事件
self.addEventListener('install', event => {
    console.log('[SW] Installing v4...');

    // 立即激活，不等待
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Pre-caching');
                return cache.addAll(PRECACHE_URLS).catch(() => {});
            })
    );
});

// 激活事件 - 关键修复：添加 clients.claim()
self.addEventListener('activate', event => {
    console.log('[SW] Activating v4...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    // 删除所有旧版本缓存（包括 v3 及更早）
                    if (name !== CACHE_NAME && name !== EXTERNAL_IMAGE_CACHE) {
                        console.log('[SW] Deleting old:', name);
                        return caches.delete(name);
                    }
                })
            );
        })
        .then(() => {
            // 关键：立即接管所有客户端
            return self.clients.claim();
        })
        .then(() => {
            console.log('[SW] Activated and claimed all clients');
        })
    );
});

// 拦截请求 - 关键修复：网络优先策略
self.addEventListener('fetch', event => {
    const { request } = event;

    // 只处理 GET 请求
    if (request.method !== 'GET') return;

    // 跳过非 http/https 请求
    if (!request.url.startsWith('http')) return;

    // 判断请求类型
    const isExternalImage = request.url.includes('eplus.jp') || 
                           request.url.includes('bandmaid.tokyo') || 
                           request.url.includes('summersonic.com') ||
                           request.url.includes('brg-radio.com');

    const isHtml = request.destination === 'document' || 
                   request.url.endsWith('.html');

    // HTML 和外部图片使用网络优先策略
    if (isHtml || isExternalImage) {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    // 网络成功，更新缓存
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        const cacheName = isExternalImage ? EXTERNAL_IMAGE_CACHE : CACHE_NAME;
                        caches.open(cacheName).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // 网络失败，回退缓存
                    return caches.match(request).then(cachedResponse => {
                        return cachedResponse || new Response('Offline', { status: 503 });
                    });
                })
        );
    } else {
        // 其他资源使用缓存优先
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                });
            })
        );
    }
});

// 监听消息
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
