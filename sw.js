// PresençaFácil — Service Worker v4 (força atualização)
const CACHE = 'presencafacil-v4';

const PRECACHE = [
  '/presen-afacil/',
  '/presen-afacil/index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('cdn.jsdelivr.net') ||
      url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('supabase.co') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
