import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
} from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

// Credenciales del proyecto Firebase de Fudi POS (fudi-app-5013f). La apiKey
// de una app web de Firebase no es secreta: el acceso a los datos se protege
// con las reglas de seguridad (firestore.rules), no ocultando esta config.
const firebaseConfig = {
  projectId: 'fudi-app-5013f',
  appId: '1:643632033370:web:0a32fb21b0cb52f05ab263',
  storageBucket: 'fudi-app-5013f.firebasestorage.app',
  apiKey: 'AIzaSyC-M9kOl9Lko80xv7BlACEn2Z1waeTYAMk',
  authDomain: 'fudi-app-5013f.firebaseapp.com',
  messagingSenderId: '643632033370',
  measurementId: 'G-4FSGM3BDNC',
};

export { firebaseConfig };
export const app = initializeApp(firebaseConfig);

// getAuth() intenta detectar solo, en segundo plano, qué mecanismo de
// persistencia usar — esa detección automática puede quedarse colgada
// dentro del WebView de Android de Capacitor (no es un navegador
// estándar), y toda la app queda esperando para siempre en "Cargando…".
// initializeAuth con una lista explícita de persistencias evita esa
// detección: prueba cada una en orden y, si ninguna funciona, sigue
// igual con inMemoryPersistence en vez de trabarse.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
});

// La base de datos se creó con el nombre "fudipos" (no "(default)"), y con
// persistencia local: la app sigue funcionando sin conexión y Firestore
// sincroniza solo apenas vuelve la señal. Se usa el administrador de
// pestañas por defecto (una sola pestaña): el multi-tab depende de
// BroadcastChannel entre pestañas de navegador, algo que no aplica a un
// WebView embebido y que también podía colgar la inicialización.
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache(),
  },
  'fudipos'
);
