import { getAll, put, clear, NOMBRES_STORES } from '../db';
import { inputDesdeFecha } from '../../utils/fechas';

// Marca del archivo, para no dejar que alguien importe un JSON cualquiera
// y termine con la base llena de basura.
const FORMATO = 'foodtruck-pos-respaldo';
const VERSION_FORMATO = 1;

export const ETIQUETAS_STORE = {
  insumos: 'Insumos',
  movimientosInsumo: 'Movimientos de stock',
  platos: 'Platos',
  combos: 'Combos',
  ventas: 'Ventas',
  clientes: 'Clientes',
  pagosCliente: 'Pagos de clientes',
  gastos: 'Gastos',
  tareas: 'Tareas',
  publicaciones: 'Publicaciones',
};

/** Junta todas las tablas en un solo objeto listo para guardar como JSON. */
export async function generarRespaldo() {
  const datos = {};
  for (const store of NOMBRES_STORES) {
    datos[store] = await getAll(store);
  }
  return {
    formato: FORMATO,
    version: VERSION_FORMATO,
    exportadoEn: new Date().toISOString(),
    datos,
  };
}

export function nombreDeArchivo(fecha = new Date()) {
  return `respaldo-foodtruck-${inputDesdeFecha(fecha)}.json`;
}

/** Cantidad de registros por tabla, para mostrar un resumen entendible. */
export function contarRegistros(respaldo) {
  const conteo = {};
  let total = 0;
  for (const store of NOMBRES_STORES) {
    const cantidad = (respaldo?.datos?.[store] || []).length;
    conteo[store] = cantidad;
    total += cantidad;
  }
  return { conteo, total };
}

/** Valida el archivo antes de tocar nada. Lanza un error con un mensaje
 *  entendible si no sirve, en vez de romper a mitad de la restauración. */
export function validarRespaldo(objeto) {
  if (!objeto || typeof objeto !== 'object') {
    throw new Error('El archivo no tiene el formato esperado.');
  }
  if (objeto.formato !== FORMATO) {
    throw new Error('Este archivo no es un respaldo de esta app.');
  }
  if (Number(objeto.version) > VERSION_FORMATO) {
    throw new Error('El respaldo fue hecho con una versión más nueva de la app. Actualizá la app antes de restaurarlo.');
  }
  if (!objeto.datos || typeof objeto.datos !== 'object') {
    throw new Error('El respaldo no contiene datos.');
  }
  const tieneAlgo = NOMBRES_STORES.some((store) => Array.isArray(objeto.datos[store]));
  if (!tieneAlgo) {
    throw new Error('El respaldo está vacío o corrupto.');
  }
  return true;
}

export function parsearRespaldo(texto) {
  let objeto;
  try {
    objeto = JSON.parse(texto);
  } catch {
    throw new Error('El archivo no es un JSON válido. ¿Seguro que es el respaldo?');
  }
  validarRespaldo(objeto);
  return objeto;
}

/**
 * Restaura un respaldo.
 *  - modo 'combinar': agrega lo que falta y pisa lo que coincide por id.
 *    Es el seguro: no borra nada que no esté en el respaldo.
 *  - modo 'reemplazar': vacía cada tabla antes de escribir, dejando la app
 *    exactamente como estaba cuando se hizo el respaldo.
 */
export async function restaurarRespaldo(respaldo, { modo = 'combinar' } = {}) {
  validarRespaldo(respaldo);

  let restaurados = 0;
  for (const store of NOMBRES_STORES) {
    const registros = respaldo.datos[store];
    if (!Array.isArray(registros)) continue;

    if (modo === 'reemplazar') {
      await clear(store);
    }
    for (const registro of registros) {
      if (!registro || !registro.id) continue;
      await put(store, registro);
      restaurados += 1;
    }
  }
  return restaurados;
}
