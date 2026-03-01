// LiveGigs Service Worker - 修复版
const CACHE_NAME = 'livegigs-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/cn.html',
  '/partners.html',
  '/events.html',
  '/image/asia-bannerbg.webp',
  '/image/asia-asiaad.jpg',
  '/image/logo.png',
  '/image/cnlogo.png',
  '/image/webtop.png'
];

// 安装事件 - 立即激活
self.addEventListener('install', event => {
  console.log('[SW] Installing...');

  // 立即激活，不等待
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => {
        console.error('[SW] Cache failed:', err);
      })
  );
});

// 激活事件 - 清理旧缓存并立即接管
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');

  event.waitUntil(
    // 清理旧缓存
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => {
      // 立即接管所有客户端
      return self.clients.claim();
    })
    .then(() => {
      console.log('[SW] Activated and claimed all clients');
    })
  );
});

// 拦截请求 - 网络优先策略（确保最新内容）
self.addEventListener('fetch', event => {
  const { request } = event;

  // 只处理 GET 请求
  if (request.method !== 'GET') return;

  // 跳过 chrome-extension 和其他非 http/https 请求
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    // 先尝试网络
    fetch(request)
      .then(networkResponse => {
        // 网络成功，更新缓存
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 网络失败，回退到缓存
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url);
            return cachedResponse;
          }
          // 缓存也没有，返回离线页面或错误
          console.log('[SW] Not in cache:', request.url);
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// 监听消息（用于强制更新）
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
