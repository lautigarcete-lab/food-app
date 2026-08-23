import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// Lista todo lo que hay en public/ para poder precachearlo (fuentes, íconos,
// manifest). Vite lo copia tal cual al build, así que no aparece en el bundle.
function archivosPublicos(dir, base = dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    return statSync(ruta).isDirectory()
      ? archivosPublicos(ruta, base)
      : ['/' + relative(base, ruta).split('\\').join('/')]
  })
}

/**
 * Genera el service worker con la lista exacta de archivos de esta compilación.
 *
 * Se escribe a mano en vez de sumar una dependencia: son treinta líneas y así
 * queda claro qué se cachea y qué no. Lo importante es que NUNCA intercepta
 * pedidos a otros dominios — Firestore y Auth tienen que ir siempre a la red
 * (y su propio caché offline ya lo maneja el SDK de Firebase).
 */
function serviceWorker() {
  let publicos = []
  return {
    name: 'fudi-service-worker',
    apply: 'build',
    buildStart() {
      try {
        publicos = archivosPublicos('public')
      } catch {
        publicos = []
      }
    },
    generateBundle(_opciones, bundle) {
      const delBundle = Object.keys(bundle).map((n) => '/' + n)
      const precache = ['/', ...delBundle, ...publicos]
      // La versión cambia con el contenido: al desplegar, el navegador ve un
      // service worker distinto, baja lo nuevo y tira el caché viejo.
      const version = delBundle.join('|').replace(/[^a-zA-Z0-9]/g, '').slice(-24)

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `// Generado en cada build. No editar a mano.
const CACHE = 'fudi-${version}';
const PRECACHE = ${JSON.stringify(precache)};

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
`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorker()],
})
