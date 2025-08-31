// sw.js - Service Worker with Push Notifications
const VERSION = '2025-08-31-01';
const STATIC_CACHE = `static-${VERSION}`;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  let notificationData = {
    title: 'Nova notificação',
    body: 'Você tem uma nova notificação',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {},
    actions: [],
    tag: 'default',
    requireInteraction: false,
    silent: false
  };

  try {
    const data = event.data.json();
    notificationData = { ...notificationData, ...data };
    console.log('Parsed notification data:', notificationData);
  } catch (error) {
    console.error('Error parsing push data:', error);
    notificationData.body = event.data.text() || notificationData.body;
  }

  // Ensure we have default actions
  if (!notificationData.actions || notificationData.actions.length === 0) {
    notificationData.actions = [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ];
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    actions: notificationData.actions,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    silent: notificationData.silent,
    timestamp: Date.now(),
    vibrate: [200, 100, 200] // Vibration pattern for mobile
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  // Handle action button clicks
  if (event.action) {
    console.log('Action clicked:', event.action);
    
    switch (event.action) {
      case 'view':
        const url = event.notification.data?.url || '/';
        event.waitUntil(
          clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
              // Check if app is already open
              for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                  console.log('Focusing existing window');
                  return client.focus();
                }
              }
              
              // Open new window if app is not open
              console.log('Opening new window:', url);
              if (clients.openWindow) {
                return clients.openWindow(url);
              }
            })
        );
        break;
      case 'dismiss':
        // Just close the notification (already done above)
        console.log('Notification dismissed');
        break;
      default:
        console.log('Unknown action:', event.action);
    }
  } else {
    // Default click behavior - open the app
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there is already a window/tab open with the target URL
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              console.log('Focusing existing window');
              return client.focus();
            }
          }
          
          // If not, then open the target URL in a new window/tab
          console.log('Opening new window:', url);
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Optional: Send analytics about notification dismissal
  // You could send this data to your analytics service
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) só GET
  if (req.method !== 'GET') return;

  // 2) não intercepta fora do próprio domínio (ex.: supabase.co)
  if (url.origin !== self.location.origin) return;

  // 3) não intercepta admin nem API
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return;

  // 4) cache-first só para estáticos versionados
  const isStatic =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/fonts') ||
    url.pathname === '/manifest.json';

  if (isStatic) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // 5) navegações: rede primeiro, sem mexer em credenciais
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    return;
  }
});