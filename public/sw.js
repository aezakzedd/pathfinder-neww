/**
 * Service Worker for HapiHub PWA
 * Enables offline support and caching for Raspberry Pi performance
 */

const CACHE_NAME = 'hapihub-v1.0.0';
const RUNTIME_CACHE = 'hapihub-runtime';

// Critical assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/media-manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external API calls (MapTiler, OSRM, etc.)
  if (url.origin !== self.location.origin) {
    // Only cache map tiles from MapTiler
    if (url.hostname.includes('maptiler.com') && url.pathname.includes('/tiles/')) {
      event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE));
    }
    return;
  }
  
  // Handle different asset types
  if (url.pathname.includes('/assets/')) {
    // Static assets (JS, CSS, fonts) - Cache first
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
  } else if (url.pathname.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) {
    // Images - Cache first with runtime cache
    event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE));
  } else if (url.pathname.match(/\.(geojson|json)$/i)) {
    // GeoJSON data - Network first with cache fallback
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  } else {
    // HTML and other files - Network first
    event.respondWith(networkFirstStrategy(request, CACHE_NAME));
  }
});

/**
 * Cache First Strategy
 * Try cache first, fallback to network, then cache the result
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache first strategy failed:', error);
    return new Response('Offline - resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Network First Strategy
 * Try network first, fallback to cache on failure
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    return new Response('Offline - resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }
});
