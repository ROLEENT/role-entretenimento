const CACHE_NAME = 'role-app-v2';
const STATIC_CACHE_NAME = 'role-static-v2';
const DYNAMIC_CACHE_NAME = 'role-dynamic-v2';
const IMAGE_CACHE_NAME = 'role-images-v2';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico.png',
  // Add critical assets here
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME && 
              cacheName !== IMAGE_CACHE_NAME
            )
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/favicon.png',
    badge: data.badge || '/favicon.png',
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/favicon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there is already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not, then open the target URL in a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // API requests - Network First strategy
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE_NAME));
    return;
  }

  // Images - Cache First strategy
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE_NAME));
    return;
  }

  // Static assets - Cache First strategy
  if (url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/i)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
    return;
  }

  // HTML pages - Network First strategy
  if (request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE_NAME));
    return;
  }

  // Everything else - Network First
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE_NAME));
});

// Network First strategy (with fallback to cache)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's an HTML request and we have no cache, return offline page
    if (request.destination === 'document') {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>ROLÊ - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
            h1 { color: #c77dff; }
          </style>
        </head>
        <body>
          <h1>ROLÊ</h1>
          <p>Você está offline. Verifique sua conexão e tente novamente.</p>
        </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    throw error;
  }
}

// Cache First strategy (with network fallback)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // For images, return a placeholder
    if (request.destination === 'image') {
      return new Response(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="#f3f4f6"/>
          <text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Imagem indisponível</text>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Background sync for failed requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered');
}