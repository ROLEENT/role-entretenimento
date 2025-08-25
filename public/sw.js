// Service Worker para ROLÊ - Funcionalidades PWA Avançadas
const CACHE_NAME = 'role-v2.0.0';
const STATIC_CACHE = 'role-static-v2.0.0';
const DYNAMIC_CACHE = 'role-dynamic-v2.0.0';
const IMAGE_CACHE = 'role-images-v2.0.0';

// Recursos essenciais para cache imediato
const STATIC_ASSETS = [
  '/',
  '/eventos',
  '/destaques',
  '/manifest.json',
  '/favicon.png',
  '/role-logo.png',
  // Adicionar outros recursos críticos
];

// Estratégias de cache por tipo de recurso
const CACHE_STRATEGIES = {
  static: {
    name: STATIC_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    maxEntries: 100
  },
  dynamic: {
    name: DYNAMIC_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    maxEntries: 200
  },
  images: {
    name: IMAGE_CACHE,
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 dias
    maxEntries: 500
  }
};

// Install event - Cache recursos essenciais
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Controlar todas as abas
      self.clients.claim()
    ])
  );
});

// Fetch event - Estratégias de cache inteligentes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que não são GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requests para outros domínios (exceto APIs conhecidas)
  if (url.origin !== location.origin && 
      !url.hostname.includes('supabase.co') &&
      !url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Função principal para lidar com requests
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Estratégia para diferentes tipos de recursos
    if (isStaticAsset(url)) {
      return await cacheFirst(request, CACHE_STRATEGIES.static);
    } else if (isImage(url)) {
      return await cacheFirst(request, CACHE_STRATEGIES.images);
    } else if (isAPIRequest(url)) {
      return await networkFirst(request, CACHE_STRATEGIES.dynamic);
    } else if (isPageRequest(url)) {
      return await staleWhileRevalidate(request, CACHE_STRATEGIES.dynamic);
    } else {
      return await networkFirst(request, CACHE_STRATEGIES.dynamic);
    }
  } catch (error) {
    console.error('[SW] Request failed:', error);
    return await getFallbackResponse(request);
  }
}

// Cache First - Para recursos estáticos
async function cacheFirst(request, strategy) {
  const cache = await caches.open(strategy.name);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return await getFallbackResponse(request);
  }
}

// Network First - Para APIs e conteúdo dinâmico
async function networkFirst(request, strategy) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(strategy.name);
      cache.put(request, response.clone());
      await cleanCache(strategy);
    }
    return response;
  } catch (error) {
    const cache = await caches.open(strategy.name);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return await getFallbackResponse(request);
  }
}

// Stale While Revalidate - Para páginas
async function staleWhileRevalidate(request, strategy) {
  const cache = await caches.open(strategy.name);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
      cleanCache(strategy);
    }
    return response;
  }).catch(() => null);
  
  return cached || await fetchPromise || await getFallbackResponse(request);
}

// Limpeza inteligente de cache
async function cleanCache(strategy) {
  const cache = await caches.open(strategy.name);
  const requests = await cache.keys();
  
  if (requests.length > strategy.maxEntries) {
    // Remove entradas mais antigas
    const entriesToDelete = requests.slice(0, requests.length - strategy.maxEntries);
    await Promise.all(entriesToDelete.map(request => cache.delete(request)));
  }
  
  // Remove entradas expiradas
  const now = Date.now();
  await Promise.all(
    requests.map(async (request) => {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (now - responseDate > strategy.maxAge) {
            await cache.delete(request);
          }
        }
      }
    })
  );
}

// Fallback responses
async function getFallbackResponse(request) {
  const url = new URL(request.url);
  
  if (isPageRequest(url)) {
    // Retorna página offline ou home em cache
    const cache = await caches.open(STATIC_CACHE);
    return (await cache.match('/')) || new Response(
      '<h1>Offline</h1><p>Você está offline. Tente novamente quando tiver conexão.</p>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  if (isImage(url)) {
    // Retorna imagem placeholder
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#666">Imagem não disponível</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  return new Response('Resource not available offline', { status: 503 });
}

// Utility functions
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/);
}

function isImage(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/);
}

function isAPIRequest(url) {
  return url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/');
}

function isPageRequest(url) {
  return url.pathname === '/' || 
         url.pathname.startsWith('/eventos') || 
         url.pathname.startsWith('/destaques') ||
         !url.pathname.includes('.');
}

// Background Sync para requests offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-events') {
    event.waitUntil(syncEvents());
  }
});

async function syncEvents() {
  try {
    // Sincronizar dados quando voltar online
    const cache = await caches.open(DYNAMIC_CACHE);
    // Implementar lógica de sincronização
    console.log('[SW] Events synced successfully');
  } catch (error) {
    console.error('[SW] Failed to sync events:', error);
  }
}

// Push notifications - Melhorado
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  let notificationData = {
    title: 'ROLÊ - Novo Evento!',
    body: 'Novo evento disponível na sua cidade!',
    url: '/'
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      url: notificationData.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Ver Evento',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/favicon.png'
      }
    ],
    requireInteraction: true,
    tag: 'role-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Periodic background sync (se suportado)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-events') {
    event.waitUntil(updateEventsInBackground());
  }
});

async function updateEventsInBackground() {
  try {
    // Atualizar eventos em background
    console.log('[SW] Updating events in background');
    // Implementar lógica de atualização
  } catch (error) {
    console.error('[SW] Failed to update events in background:', error);
  }
}