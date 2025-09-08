const CACHE_NAME = 'role-app-v2';
const STATIC_CACHE_NAME = 'role-static-v2';
const DYNAMIC_CACHE_NAME = 'role-dynamic-v2';
const IMAGE_CACHE_NAME = 'role-images-v2';

// Assets to cache immediately - optimized for performance
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico.png',
  '/banner-home.png',
  '/role-logo.png'
];

// Install event - cache crítico primeiro para reduzir TTFB
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      // Cache assets críticos primeiro
      const criticalAssets = STATIC_ASSETS.filter(asset => 
        asset === '/' || asset.includes('.png') || asset.includes('manifest')
      );
      
      return cache.addAll(criticalAssets).then(() => {
        // Cache resto em background
        const remainingAssets = STATIC_ASSETS.filter(asset => !criticalAssets.includes(asset));
        return Promise.allSettled(
          remainingAssets.map(asset => cache.add(asset).catch(() => {}))
        );
      });
    }).then(() => self.skipWaiting())
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

// Fetch event - estratégias otimizadas para TTFB e LCP
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // API requests - Cache first para dados menos críticos
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/api/')) {
    // Dados que mudam pouco: cache first
    if (url.pathname.includes('site_metrics') || 
        url.pathname.includes('highlights') ||
        url.pathname.includes('categories')) {
      event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE_NAME));
    } else {
      // Dados dinâmicos: network first com timeout
      event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE_NAME));
    }
    return;
  }

  // Images - Cache First com preload agressivo
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE_NAME));
    return;
  }

  // Static assets - Cache First para reduzir TTFB
  if (url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/i)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
    return;
  }

  // HTML pages - Cache first para reduzir TTFB inicial
  if (request.destination === 'document') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME)
      .catch(() => networkFirstStrategy(request, DYNAMIC_CACHE_NAME)));
    return;
  }

  // Everything else - Network First
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE_NAME));
});

// Network First strategy otimizada para TTFB
async function networkFirstStrategy(request, cacheName) {
  // Timeout para reduzir TTFB em conexões lentas
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Network timeout')), 2500)
  );
  
  try {
    const networkResponse = await Promise.race([fetch(request), timeout]);
    
    // Cache em background para não bloquear resposta
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone()).catch(() => {});
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed ou timeout, fallback para cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Offline fallback mínimo
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

// Cache First strategy otimizada para LCP
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Verificar se cache não está muito antigo (apenas para APIs)
    if (cacheName === DYNAMIC_CACHE_NAME) {
      const cacheDate = cachedResponse.headers.get('date');
      const isStale = cacheDate && (Date.now() - new Date(cacheDate).getTime()) > 30 * 60 * 1000; // 30min
      
      // Update em background se stale
      if (isStale) {
        fetch(request).then(response => {
          if (response.ok) {
            caches.open(cacheName).then(cache => cache.put(request, response));
          }
        }).catch(() => {});
      }
    }
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // Cache imediatamente para próximas requisições
      cache.put(request, networkResponse.clone()).catch(() => {});
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached mesmo se stale
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Placeholder mínimo para imagens
    if (request.destination === 'image') {
      return new Response(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="#f3f4f6"/>
          <text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Offline</text>
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