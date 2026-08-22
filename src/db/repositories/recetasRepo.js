import { getAll, getById, put } from '../firestoreDb.js';
import { generarId } from '../../utils/id';
import { crearPlato, actualizarPlato } from './platosRepo.js';
import { crearInsumo, actualizarInsumo, ajustarStock, obtenerInsumo } from './insumosRepo.js';

const STORE = 'recetas';

// Una receta puede ser de dos tipos:
//
//  - 'plato': rinde N porciones de algo que se vende tal cual (ej: "rinde
//    10 hamburguesas"). Sirve para crear el plato ya costeado.
//  - 'preparacion': rinde una cantidad de algo que después se usa como
//    ingrediente de otras recetas (ej: una salsa que rinde 2 litros). Al
//    guardarla se crea/actualiza un insumo con su costo por unidad, así
//    la salsa se puede usar igual que cualquier insumo comprado.
export const TIPOS_RECETA = [
  { id: 'plato', label: 'Plato para vender' },
  { id: 'preparacion', label: 'Preparación (se usa en otras recetas)' },
];

export async function listarRecetas({ soloActivas = true } = {}) {
  const recetas = await getAll(STORE);
  const filtradas = soloActivas ? recetas.filter((r) => r.activa !== false) : recetas;
  return filtradas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export function obtenerReceta(id) {
  return getById(STORE, id);
}

/**
 * Costo de la receta a partir del costo unitario de cada insumo que usa.
 * Devuelve también el detalle por línea para poder mostrarlo desglosado.
 */
export function calcularCostos(receta, insumos) {
  const lineas = (receta.ingredientes || []).map((linea) => {
    const insumo = insumos.find((i) => i.id === linea.insumoId);
    const cantidad = Number(linea.cantidad) || 0;
    const costo = insumo ? cantidad * (Number(insumo.costoUnitario) || 0) : 0;
    return { ...linea, insumo, cantidad, costo };
  });
  const costoTotal = lineas.reduce((acc, l) => acc + l.costo, 0);
  const rinde = Number(receta.rinde) || 0;
  return {
    lineas,
    costoTotal,
    costoPorUnidad: rinde > 0 ? costoTotal / rinde : 0,
    // Alguna línea apunta a un insumo sin costo cargado: el total queda corto.
    incompleta: lineas.some((l) => !l.insumo || !(Number(l.insumo.costoUnitario) > 0)),
  };
}

export async function crearReceta({ nombre, tipo, ingredientes, rinde, unidadRinde, notas }) {
  const ahora = new Date().toISOString();
  const receta = {
    id: generarId(),
    nombre: nombre.trim(),
    tipo: tipo === 'preparacion' ? 'preparacion' : 'plato',
    // Las cantidades van en la unidad base de cada insumo (gr / ml / u).
    ingredientes: normalizarIngredientes(ingredientes),
    rinde: Number(rinde) || 0,
    unidadRinde: unidadRinde || 'u',
    notas: (notas || '').trim(),
    activa: true,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
  return put(STORE, receta);
}

export async function actualizarReceta(id, cambios) {
  const actual = await obtenerReceta(id);
  if (!actual) throw new Error('Receta no encontrada.');
  const combinado = { ...actual, ...cambios };
  if (cambios.ingredientes) combinado.ingredientes = normalizarIngredientes(cambios.ingredientes);
  return put(STORE, { ...combinado, actualizadoEn: new Date().toISOString() });
}

export async function eliminarReceta(id) {
  return actualizarReceta(id, { activa: false });
}

function normalizarIngredientes(ingredientes) {
  return (ingredientes || [])
    .filter((l) => l.insumoId && Number(l.cantidad) > 0)
    .map((l) => ({ insumoId: l.insumoId, cantidad: Number(l.cantidad) }));
}

/**
 * Crea (o actualiza) el plato que sale de una receta de tipo 'plato'.
 *
 * La receta guarda las cantidades para el lote entero ("rinde 10"), pero el
 * plato guarda las de UNA porción, que es lo que descuenta el stock al
 * vender. Por eso cada cantidad se divide por el rinde.
 */
export async function crearPlatoDesdeReceta(receta, { precio, categoria = '', foto = null } = {}) {
  const rinde = Number(receta.rinde) || 0;
  if (rinde <= 0) throw new Error('Indicá cuántas unidades rinde la receta.');

  const recetaPorUnidad = (receta.ingredientes || []).map((l) => ({
    insumoId: l.insumoId,
    cantidad: Number(l.cantidad) / rinde,
  }));

  const datos = {
    nombre: receta.nombre,
    precio: Number(precio) || 0,
    categoria,
    foto,
    receta: recetaPorUnidad,
  };

  const plato = receta.platoId
    ? await actualizarPlato(receta.platoId, datos)
    : await crearPlato(datos);

  await actualizarReceta(receta.id, { platoId: plato.id });
  return plato;
}

/**
 * Para una receta de tipo 'preparacion': crea o actualiza el insumo que la
 * representa, con su costo por unidad ya calculado. A partir de ahí esa
 * preparación se usa en otras recetas igual que un insumo comprado.
 */
export async function sincronizarInsumoDePreparacion(receta, insumos) {
  const { costoPorUnidad } = calcularCostos(receta, insumos);

  if (receta.insumoId && (await obtenerInsumo(receta.insumoId))) {
    await actualizarInsumo(receta.insumoId, {
      nombre: receta.nombre,
      unidad: receta.unidadRinde,
      costoUnitario: costoPorUnidad,
    });
    return receta.insumoId;
  }

  const insumo = await crearInsumo({
    nombre: receta.nombre,
    unidad: receta.unidadRinde,
    stock: 0,
    stockMinimo: 0,
    costoUnitario: costoPorUnidad,
    modoCompra: 'total',
    esPreparacion: true,
    recetaId: receta.id,
  });
  await actualizarReceta(receta.id, { insumoId: insumo.id });
  return insumo.id;
}

/**
 * Registra que se preparó la receta: descuenta del stock los insumos que
 * se usaron y suma al stock de la preparación lo que rindió.
 */
export async function registrarProduccion(receta, lotes = 1) {
  const cantidadLotes = Number(lotes) || 0;
  if (cantidadLotes <= 0) throw new Error('Indicá cuántas veces preparaste la receta.');
  if (!receta.insumoId) throw new Error('Esta receta todavía no tiene su preparación creada.');

  for (const linea of receta.ingredientes || []) {
    await ajustarStock(linea.insumoId, -Number(linea.cantidad) * cantidadLotes, {
      tipo: 'ajuste',
      motivo: `Preparación: ${receta.nombre}`,
    });
  }

  await ajustarStock(receta.insumoId, Number(receta.rinde) * cantidadLotes, {
    tipo: 'compra',
    motivo: `Preparación: ${receta.nombre}`,
  });
}
