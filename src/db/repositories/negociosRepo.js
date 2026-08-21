import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile as updateAuthProfile,
  signOut,
} from 'firebase/auth';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { db, firebaseConfig } from '../../firebase/config.js';
import { generarId } from '../../utils/id.js';

/** Negocios a los que el usuario tiene acceso (dueño o con acceso), sin los archivados. */
export async function listarMisNegocios(uid) {
  const q = query(collectionGroup(db, 'miembros'), where('uid', '==', uid));
  const snap = await getDocs(q);

  const negocios = await Promise.all(
    snap.docs.map(async (miembroDoc) => {
      const negocioRef = miembroDoc.ref.parent.parent;
      const negocioSnap = await getDoc(negocioRef);
      if (!negocioSnap.exists()) return null;
      const negocio = negocioSnap.data();
      return {
        id: negocioRef.id,
        nombre: negocio.nombre,
        archivado: Boolean(negocio.archivado),
        rol: miembroDoc.data().rol,
      };
    })
  );

  return negocios.filter((n) => n && !n.archivado).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** Crea un negocio nuevo y de una vez asigna a quien lo crea como dueño. */
export async function crearNegocio(nombre, uid) {
  const negocioId = generarId();
  const ahora = new Date().toISOString();
  const batch = writeBatch(db);

  batch.set(doc(db, 'negocios', negocioId), {
    nombre: nombre.trim(),
    creadoPor: uid,
    creadoEn: ahora,
    archivado: false,
  });
  batch.set(doc(db, 'negocios', negocioId, 'miembros', uid), {
    uid,
    rol: 'dueño',
    agregadoPor: uid,
    agregadoEn: ahora,
  });

  await batch.commit();
  return { id: negocioId, nombre: nombre.trim(), rol: 'dueño', archivado: false };
}

/** Solo el dueño puede archivar (las reglas de Firestore lo exigen igual). */
export async function archivarNegocio(negocioId) {
  await updateDoc(doc(db, 'negocios', negocioId), { archivado: true });
}

export async function listarMiembros(negocioId) {
  const snap = await getDocs(collection(db, 'negocios', negocioId, 'miembros'));
  return snap.docs.map((d) => d.data());
}

/**
 * Da de alta a un colaborador con acceso: crea una cuenta de Firebase Auth
 * nueva para esa persona (con el correo y contraseña que define el dueño) y
 * lo agrega como miembro con rol "acceso".
 *
 * Usa una instancia secundaria de Firebase Auth (con el mismo proyecto) para
 * no pisar la sesión de quien está creando el acceso: crear un usuario con
 * el SDK de cliente inicia sesión automáticamente como ese usuario nuevo, y
 * acá no queremos que el dueño quede deslogueado de su propia cuenta.
 */
export async function agregarColaborador({ negocioId, nombre, email, password, agregadoPor }) {
  const appSecundaria = initializeApp(firebaseConfig, `alta-colaborador-${Date.now()}`);
  const authSecundaria = getAuth(appSecundaria);
  try {
    const cred = await createUserWithEmailAndPassword(authSecundaria, email.trim(), password);
    await updateAuthProfile(cred.user, { displayName: nombre.trim() });

    const nuevoUid = cred.user.uid;
    await signOut(authSecundaria);

    // El perfil (usuarios/{uid}) del colaborador lo va a terminar de crear
    // su propia sesión la primera vez que use la app (las reglas exigen
    // que solo el dueño de esa cuenta pueda escribir su propio perfil).
    await setDoc(doc(db, 'negocios', negocioId, 'miembros', nuevoUid), {
      uid: nuevoUid,
      rol: 'acceso',
      nombre: nombre.trim(),
      agregadoPor,
      agregadoEn: new Date().toISOString(),
    });

    return { uid: nuevoUid, nombre: nombre.trim(), rol: 'acceso' };
  } finally {
    await deleteApp(appSecundaria);
  }
}

export async function quitarColaborador(negocioId, uid) {
  await deleteDoc(doc(db, 'negocios', negocioId, 'miembros', uid));
}
