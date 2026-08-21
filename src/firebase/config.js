import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

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
export const auth = getAuth(app);

// La base de datos se creó con el nombre "fudipos" (no "(default)"), y con
// persistencia local: la app sigue funcionando sin conexión y Firestore
// sincroniza solo apenas vuelve la señal.
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  },
  'fudipos'
);
