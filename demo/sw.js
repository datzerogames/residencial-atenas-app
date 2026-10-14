const CACHE = 'atenas-1792003437091';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== 'atenas-arquivos').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Fotos, áudios e vídeos do servidor: guardados no aparelho depois de baixados (o nome do arquivo nunca muda).
  if (e.request.method === 'GET' && url.pathname.includes('/storage/v1/object/public/') && !e.request.headers.has('range')) {
    e.respondWith(caches.open('atenas-arquivos').then((k) => k.match(e.request).then((achou) => achou || fetch(new Request(e.request.url, { mode: 'cors', credentials: 'omit' })).then((r) => { if (r.status === 200) k.put(e.request, r.clone()); return r; }).catch(() => fetch(e.request)))));
    return;
  }
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Páginas: tenta a internet primeiro; sem internet abre o app guardado.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(CACHE).then((k) => k.put('/residencial-atenas-app/demo/', c)); return r; }).catch(() => caches.match('/residencial-atenas-app/demo/')));
    return;
  }
  e.respondWith(caches.match(e.request).then((achou) => achou || fetch(e.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then((k) => k.put(e.request, c)); } return r; })));
});
