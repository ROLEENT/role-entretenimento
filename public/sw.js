// Service Worker simples e compatível
const CACHE_NAME = 'role-admin-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Fetch event - estratégia básica de rede primeiro
self.addEventListener('fetch', (event) => {
  // Apenas para requisições GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(error => {
        console.log('[SW] Fetch failed:', error);
        return new Response('Offline', { status: 503 });
      })
  );
});

// Push notification event
self.addEventListener('push', function(event) {
  console.log('[SW] Push received:', event);
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  
  const options = {
    body: data.message || 'Nova notificação',
    icon: '/role-logo.png',
    badge: '/role-logo.png',
    data: data.data || {},
    requireInteraction: false,
    tag: data.tag || 'default'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ROLÊ', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(clientList) {
      // Try to focus existing window
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});