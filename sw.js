// ═══════════════════════════════════════════════
// KD Campus — Service Worker (PWA)
// Offline support + Caching
// ═══════════════════════════════════════════════

const CACHE_NAME    = 'kdcampus-v1';
const OFFLINE_PAGE  = '/index.html';

// Cache karne wali files
const CACHE_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
];

// ── Install ──
self.addEventListener('install', event => {
  console.log('[SW] Installing KD Campus Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files...');
        return cache.addAll(CACHE_FILES.map(url => new Request(url, { mode: 'no-cors' })));
      })
      .then(() => self.skipWaiting())
      .catch(err => console.log('[SW] Cache error:', err))
  );
});

// ── Activate ──
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch (Network first, then cache) ──
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API calls (backend se seedha lo)
  if (event.request.url.includes('localhost:3000') ||
      event.request.url.includes('anthropic.com') ||
      event.request.url.includes('razorpay.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Valid response? Cache mein save karo
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network nahi hai? Cache se do
        return caches.match(event.request)
          .then(cached => {
            if (cached) return cached;
            // Koi bhi nahi? Offline page do
            return caches.match(OFFLINE_PAGE);
          });
      })
  );
});

// ── Push Notifications ──
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title   = data.title   || 'KD Campus';
  const body    = data.body    || 'Aapke liye ek notification hai!';
  const icon    = data.icon    || '/icon-192.png';
  const badge   = data.badge   || '/icon-192.png';

  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon, badge,
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    })
  );
});

// ── Notification Click ──
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});