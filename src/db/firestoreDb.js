// Capa de acceso a Firestore con la misma forma que tenía db.js (IndexedDB):
// getAll / getAllByIndex / getById / put / remove / clear. Cada "store" es
// ahora una subcolección de negocios/{negocioId}/, y el filtrado/orden se
// sigue haciendo en JS igual que antes (los volúmenes de datos de un solo
// negocio son chicos, así que no hace falta la complejidad de índices
// compuestos de Firestore para esto).
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { getNegocioActivo } from './negocioActual.js';

export const NOMBRES_STORES = [
  'insumos',
  'movimientosInsumo',
  'platos',
  'recetas',
  'combos',
  'ventas',
  'clientes',
  'pagosCliente',
  'gastos',
  'tareas',
  'publicaciones',
];

function coleccion(store) {
  return collection(db, 'negocios', getNegocioActivo(), store);
}

// En Firestore el id ya es el nombre del documento, así que guardarlo
// además como un campo adentro es redundante — y las reglas de seguridad
// rechazan cualquier campo que no esté en su lista blanca, así que un "id"
// adentro hacía fallar TODA escritura con "Missing or insufficient
// permissions". Se saca al guardar y se vuelve a poner al leer, de modo
// que el resto de la app sigue viendo objetos con .id como siempre.
function conId(docSnap) {
  return { ...docSnap.data(), id: docSnap.id };
}

export async function getAll(store) {
  const snap = await getDocs(coleccion(store));
  return snap.docs.map(conId);
}

export async function getAllByIndex(store, campo, valor) {
  const snap = await getDocs(query(coleccion(store), where(campo, '==', valor)));
  return snap.docs.map(conId);
}

export async function getById(store, id) {
  const snap = await getDoc(doc(coleccion(store), id));
  return snap.exists() ? conId(snap) : undefined;
}

export async function put(store, valor) {
  const { id, ...campos } = valor;
  await setDoc(doc(coleccion(store), id), campos);
  return valor;
}

export async function remove(store, id) {
  await deleteDoc(doc(coleccion(store), id));
}

export async function clear(store) {
  const snap = await getDocs(coleccion(store));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
