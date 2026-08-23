import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile as updateAuthProfile,
  signOut,
} from 'firebase/auth';
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromCache,
  getDocs,
  getDocsFromCache,
  query,
  where,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { db, firebaseConfig } from '../../firebase/config.js';
import { generarId } from '../../utils/id.js';
import { COLOR_NEGOCIO_POR_DEFECTO, IDS_COLORES_NEGOCIO } from '../../utils/coloresNegocio.js';
import { aCorreoInterno } from '../../utils/usuarios.js';

// Sin conexión, esperar al servidor no tiene sentido: Firestore ya guarda
// localmente lo último que se sincronizó desde este celular, así que ante
// cualquier falla de red se usa esa copia en vez de dejar todo colgado.
async function obtenerDocs(q) {
  try {
    return await getDocs(q);
  } catch {
    return getDocsFromCache(q);
  }
}

async function obtenerDoc(ref) {
  try {
    return await getDoc(ref);
  } catch {
    return getDocFromCache(ref);
  }
}

/**
 * Negocios a los que el usuario tiene acceso (dueño o con acceso), sin los
 * archivados.
 *
 * No se puede resolver con una consulta de grupo de colecciones sobre
 * negocios/*\/miembros filtrando por uid (el enfoque más directo): Firestore
 * evalúa las reglas de "list" contra el resultado *posible* de la consulta,
 * no documento por documento, y no puede demostrar que la condición se
 * cumple para cualquier negocioId posible ya que ese id varía en cada
 * documento del grupo — rechaza la consulta entera aunque cada documento
 * individual sí la cumpliría. Por eso negocios/{id} guarda además un
 * miembrosUids (array de uids con acceso) y se consulta esa colección
 * simple con array-contains, que Firestore sí puede validar para "list".
 */
export async function listarMisNegocios(uid) {
  const q = query(collection(db, 'negocios'), where('miembrosUids', 'array-contains', uid));
  const snap = await obtenerDocs(q);

  const negocios = await Promise.all(
    snap.docs.map(async (negocioDoc) => {
      const negocio = negocioDoc.data();
      if (negocio.archivado) return null;
      const miembroSnap = await obtenerDoc(doc(db, 'negocios', negocioDoc.id, 'miembros', uid));
      if (!miembroSnap.exists()) return null;
      return {
        id: negocioDoc.id,
        nombre: negocio.nombre,
        color: negocio.color || COLOR_NEGOCIO_POR_DEFECTO,
        foto: negocio.foto || null,
        archivado: false,
        rol: miembroSnap.data().rol,
      };
    })
  );

  return negocios.filter(Boolean).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/**
 * Crea un negocio nuevo y de una vez asigna a quien lo crea como dueño.
 *
 * Esto NO puede ir en un solo writeBatch: la regla que permite crear el
 * primer miembro (dueño) hace un get() del documento del negocio para
 * comprobar quién lo creó, y ese get() solo ve datos ya confirmados en la
 * base — dentro del mismo batch el negocio todavía no se guardó, así que
 * ese get() no lo encuentra y Firestore rechaza todo el batch con "Missing
 * or insufficient permissions". Por eso se guarda primero el negocio y,
 * una vez confirmado, se agrega el miembro.
 */
export async function crearNegocio(nombre, uid, color = COLOR_NEGOCIO_POR_DEFECTO) {
  const negocioId = generarId();
  const ahora = new Date().toISOString();
  const colorElegido = IDS_COLORES_NEGOCIO.includes(color) ? color : COLOR_NEGOCIO_POR_DEFECTO;

  await setDoc(doc(db, 'negocios', negocioId), {
    nombre: nombre.trim(),
    color: colorElegido,
    creadoPor: uid,
    creadoEn: ahora,
    archivado: false,
    miembrosUids: [uid],
  });

  await setDoc(doc(db, 'negocios', negocioId, 'miembros', uid), {
    uid,
    rol: 'dueño',
    agregadoPor: uid,
    agregadoEn: ahora,
  });

  return {
    id: negocioId,
    nombre: nombre.trim(),
    color: colorElegido,
    foto: null,
    rol: 'dueño',
    archivado: false,
  };
}

/**
 * Cambia la identidad visual del negocio (color y/o foto del local). Solo el
 * dueño puede: las reglas de Firestore lo exigen igual.
 *
 * La foto se guarda como dataURL dentro del propio documento, igual que las
 * fotos de los platos, para no depender de Storage.
 */
export async function actualizarIdentidadNegocio(negocioId, { color, foto } = {}) {
  const campos = {};
  if (color !== undefined) {
    campos.color = IDS_COLORES_NEGOCIO.includes(color) ? color : COLOR_NEGOCIO_POR_DEFECTO;
  }
  if (foto !== undefined) campos.foto = foto || null;
  if (Object.keys(campos).length === 0) return;
  await updateDoc(doc(db, 'negocios', negocioId), campos);
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
 * nueva para esa persona (con el usuario y contraseña que define el dueño) y
 * lo agrega como miembro con rol "acceso".
 *
 * El "usuario" es del estilo "juan@rollofoodtruck" (nombre de la persona +
 * nombre del negocio); aCorreoInterno lo convierte en algo que Firebase
 * acepte. Nunca se le manda un mail a esa dirección.
 *
 * Usa una instancia secundaria de Firebase Auth (con el mismo proyecto) para
 * no pisar la sesión de quien está creando el acceso: crear un usuario con
 * el SDK de cliente inicia sesión automáticamente como ese usuario nuevo, y
 * acá no queremos que el dueño quede deslogueado de su propia cuenta.
 */
export async function agregarColaborador({ negocioId, nombre, usuario, password, agregadoPor }) {
  const appSecundaria = initializeApp(firebaseConfig, `alta-colaborador-${Date.now()}`);
  const authSecundaria = getAuth(appSecundaria);
  try {
    const cred = await createUserWithEmailAndPassword(authSecundaria, aCorreoInterno(usuario), password);
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
      usuario,
      agregadoPor,
      agregadoEn: new Date().toISOString(),
    });
    // miembrosUids es lo que listarMisNegocios consulta para saber a qué
    // negocios pertenece cada quien (ver el comentario ahí); hay que
    // mantenerlo en sync con la subcolección de miembros a mano.
    await updateDoc(doc(db, 'negocios', negocioId), { miembrosUids: arrayUnion(nuevoUid) });

    return { uid: nuevoUid, nombre: nombre.trim(), usuario, rol: 'acceso' };
  } finally {
    await deleteApp(appSecundaria);
  }
}

export async function quitarColaborador(negocioId, uid) {
  await deleteDoc(doc(db, 'negocios', negocioId, 'miembros', uid));
  await updateDoc(doc(db, 'negocios', negocioId), { miembrosUids: arrayRemove(uid) });
}
