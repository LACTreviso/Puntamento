/* Goal Recorder - service worker: l'app si installa come app vera e si apre anche con rete scarsa.
   Pagina: prima la rete (cosi' gli aggiornamenti arrivano subito), se manca la rete la copia salvata.
   Non tocca nient'altro (collegamento tra telefoni, video, download). */
const VER = 'goalrecorder-v8';
const FILE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './favicon.png', './peerjs.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VER).then(c => c.addAll(FILE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VER).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate' || r.url.endsWith('.html') || r.url.endsWith('/')) {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VER).then(x => x.put(r, c)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r)));
});
