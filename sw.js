const CACHE_NAME = 'dreamforge-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Cache static assets during installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// Network-first strategy for API requests, Cache-first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // API requests - Network first, fallback to offline message
  if (url.origin === 'https://image.pollinations.ai' || url.origin === 'https://text.pollinations.ai') {
    event.respondWith(
      fetch(event.request)
        .catch(() => new Response(JSON.stringify({
          error: 'You are currently offline. Please check your connection.'
        }), {
          headers: { 'Content-Type': 'application/json' }
        }))
    );
    return;
  }

  // Static assets - Cache first, network fallback
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});