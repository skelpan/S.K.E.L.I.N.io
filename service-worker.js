const CACHE_NAME = 'skelin-system-v2.1.0';
const DYNAMIC_CACHE = 'skelin-dynamic-v2.1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/network-map.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Системный кэш
class SystemCache {
  constructor() {
    this.cacheVersion = CACHE_NAME;
  }

  async precache() {
    try {
      const cache = await caches.open(this.cacheVersion);
      return await cache.addAll(urlsToCache);
    } catch (error) {
      console.log('Ошибка предварительного кэширования:', error);
    }
  }

  async cacheFirst(request) {
    try {
      const cached = await caches.match(request);
      if (cached) return cached;
      
      const response = await fetch(request);
      if (response.status === 200) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return new Response('Система офлайн', { 
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  }

  async networkFirst(request) {
    try {
      const response = await fetch(request);
      if (response.status === 200) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      return cached || new Response('Ошибка сети', { 
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  }
}

const systemCache = new SystemCache();

// Системный Service Worker
self.addEventListener('install', (event) => {
  console.log('⚡ Системное ядро устанавливается...');
  event.waitUntil(systemCache.precache());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('⚡ Системное ядро активировано');
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, DYNAMIC_CACHE].includes(cacheName)) {
              console.log('🧹 Удаление старого кэша:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API запросы - сеть в первую очередь
  if (url.pathname.includes('/api/') || url.href.includes('openweathermap.org')) {
    event.respondWith(systemCache.networkFirst(event.request));
  } 
  // Статические ресурсы - кэш в первую очередь
  else {
    event.respondWith(systemCache.cacheFirst(event.request));
  }
});

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
  if (event.tag === 'system-sync') {
    console.log('🔄 Фоновая синхронизация системы');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Синхронизация системных данных в фоне
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    // Добавить логику фоновой синхронизации здесь
  } catch (error) {
    console.log('Ошибка фоновой синхронизации:', error);
  }
}

// Системные уведомления
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json() || {
    title: 'S.K.E.L.I.N',
    body: 'Доступно обновление системы',
    icon: '/icons/system-192.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: '/icons/system-badge.png',
      tag: 'system-notification',
      data: data.url
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});