// Generado en cada build. No editar a mano.
const CACHE = 'fudi-0GjsassetsindexDJDknBcss';
const PRECACHE = ["/","/assets/index-B1Q7WK0G.js","/assets/index-DJD-k_nB.css","/favicon.svg","/fonts/Outfit-Variable.woff2","/icons/apple-touch-icon.png","/icons/fudi-192.png","/icons/fudi-512.png","/icons/fudi-maskable-512.png","/manifest.webmanifest"];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Solo lo nuestro: los pedidos a Firebase (y a cualquier otro dominio)
  // pasan de largo, sin tocarlos.
  if (url.origin !== self.location.origin) return;

  // Al navegar se devuelve la app guardada y en paralelo se busca la nueva,
  // así abre al instante incluso sin señal.
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('/').then((guardada) => {
        const red = fetch(req)
          .then((resp) => {
            caches.open(CACHE).then((c) => c.put('/', resp.clone()));
            return resp;
          })
          .catch(() => guardada);
        return guardada || red;
      })
    );
    return;
  }

  // El resto (JS, CSS, fuentes, íconos) lleva hash en el nombre: si está
  // guardado, sirve el guardado.
  e.respondWith(
    caches.match(req).then(
      (guardada) =>
        guardada ||
        fetch(req).then((resp) => {
          if (resp.ok && resp.type === 'basic') {
            const copia = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return resp;
        })
    )
  );
});
