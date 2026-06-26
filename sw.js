// PresençaFácil — Service Worker v1
const CACHE = 'presencafacil-v2';

// Arquivos essenciais para funcionar offline
const PRECACHE = [
  '/presen-afacil/',
  '/presen-afacil/index.html'
];

// Instala e faz cache dos arquivos essenciais
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Estratégia: Network first, fallback para cache
// CDNs (face-api, supabase, jspdf) sempre buscam da rede
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // CDNs externos — sempre da rede, sem cache
  if (url.hostname.includes('cdn.jsdelivr.net') ||
      url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('supabase.co') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    return; // deixa o browser tratar normalmente
  }

  // App shell — network first, cache como fallback
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
