// sw.js
const VERSION = '2025-08-30-01';
const STATIC_CACHE = `static-${VERSION}`;

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
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