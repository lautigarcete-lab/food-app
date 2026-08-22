import { getAll, getAllByIndex, getById, put } from '../firestoreDb.js';
import { generarId } from '../../utils/id';

const STORE = 'insumos';
const STORE_MOVIMIENTOS = 'movimientosInsumo';

// El stock y las recetas se guardan siempre en la unidad base (gramos,
// mililitros o unidades). Lo que se elige al cargar (kg, g, l, ml, u) es
// solo la forma cómoda de escribirlo; ver src/utils/unidades.js.
export const UNIDADES = [
  { id: 'gr', label: 'Peso (kg/g)' },
  { id: 'ml', label: 'Volumen (l/ml)' },
  { id: 'u', label: 'Unidades (u)' },
];

export async function listarInsumos({ soloActivos = true } = {}) {
  const insumos = await getAll(STORE);
  const filtrados = soloActivos ? insumos.filter((i) => i.activo !== false) : insumos;
  return filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export function obtenerInsumo(id) {
  return getById(STORE, id);
}

// El costo unitario se deriva de lo que se pagó y de cuánto se compró, en
// vez de pedirlo directamente: así el $/gr, $/ml o $/u sale automático y no
// depende de que alguien haga la división a mano.
export function calcularCostoUnitario(precioTotal, cantidadBase) {
  const precio = Number(precioTotal) || 0;
  const cantidad = Number(cantidadBase) || 0;
  if (precio <= 0 || cantidad <= 0) return 0;
  return precio / cantidad;
}

export async function crearInsumo({
  nombre,
  unidad,
  stock,
  stockMinimo,
  precioEnvase,
  contenidoEnvase,
  costoUnitario,
  modoCompra,
  esPreparacion,
  recetaId,
}) {
  const ahora = new Date().toISOString();
  const insumo = {
    id: generarId(),
    nombre: nombre.trim(),
    unidad: unidad || 'u',
    // stock y stockMinimo van siempre en la unidad base del insumo.
    stock: Number(stock) || 0,
    stockMinimo: Number(stockMinimo) || 0,
    precioEnvase: Number(precioEnvase) || 0,
    contenidoEnvase: Number(contenidoEnvase) || 0,
    costoUnitario: Number(costoUnitario) || 0,
    modoCompra: modoCompra === 'envase' ? 'envase' : 'total',
    esPreparacion: Boolean(esPreparacion),
    activo: true,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
  if (recetaId) insumo.recetaId = recetaId;
  return put(STORE, insumo);
}

export async function actualizarInsumo(id, cambios) {
  const actual = await obtenerInsumo(id);
  if (!actual) throw new Error('Insumo no encontrado.');
  const combinado = { ...actual, ...cambios };
  const actualizado = { ...combinado, actualizadoEn: new Date().toISOString() };
  return put(STORE, actualizado);
}

export async function eliminarInsumo(id) {
  return actualizarInsumo(id, { activo: false });
}

export function estaBajoStock(insumo) {
  return Number(insumo.stock) <= Number(insumo.stockMinimo);
}

// Suma (o resta, con delta negativo) una cantidad al stock del insumo y
// deja registrado el movimiento (compra, merma o ajuste manual) con motivo.
export async function ajustarStock(insumoId, delta, { tipo = 'ajuste', motivo = '' } = {}) {
  const insumo = await obtenerInsumo(insumoId);
  if (!insumo) throw new Error('Insumo no encontrado.');

  const nuevoStock = Math.max(0, Number(insumo.stock) + Number(delta));
  await actualizarInsumo(insumoId, { stock: nuevoStock });

  const movimiento = {
    id: generarId(),
    insumoId,
    tipo, // 'compra' | 'merma' | 'ajuste' | 'venta'
    delta: Number(delta),
    motivo: motivo.trim(),
    fecha: new Date().toISOString(),
  };
  await put(STORE_MOVIMIENTOS, movimiento);
  return { insumo: await obtenerInsumo(insumoId), movimiento };
}

export async function listarMovimientos(insumoId, { limite = 5 } = {}) {
  const movimientos = await getAllByIndex(STORE_MOVIMIENTOS, 'insumoId', insumoId);
  return movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, limite);
}
