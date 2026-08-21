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

export async function getAll(store) {
  const snap = await getDocs(coleccion(store));
  return snap.docs.map((d) => d.data());
}

export async function getAllByIndex(store, campo, valor) {
  const snap = await getDocs(query(coleccion(store), where(campo, '==', valor)));
  return snap.docs.map((d) => d.data());
}

export async function getById(store, id) {
  const snap = await getDoc(doc(coleccion(store), id));
  return snap.exists() ? snap.data() : undefined;
}

export async function put(store, valor) {
  await setDoc(doc(coleccion(store), valor.id), valor);
  return valor;
}

export async function remove(store, id) {
  await deleteDoc(doc(coleccion(store), id));
}

export async function clear(store) {
  const snap = await getDocs(coleccion(store));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
