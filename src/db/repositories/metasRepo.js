import { getAll, put, remove } from '../firestoreDb.js';
import { totalesDeVentas } from './ventasRepo.js';
import { rangoDelPeriodo, finDelDia, finDeMes } from '../../utils/fechas.js';

const STORE = 'metas';

// Hay una meta por período como mucho, así que el id del documento ES el
// período. Sin listas ni búsquedas: se lee y se pisa directo.
export const PERIODOS_META = [
  { id: 'dia', label: 'Hoy', largo: 'Meta del día' },
  { id: 'mes', label: 'Este mes', largo: 'Meta del mes' },
];

export async function listarMetas() {
  const metas = await getAll(STORE);
  return metas.filter((m) => PERIODOS_META.some((p) => p.id === m.id));
}

export async function guardarMeta(periodo, monto) {
  const valor = Number(monto) || 0;
  if (valor <= 0) return quitarMeta(periodo);
  return put(STORE, {
    id: periodo,
    monto: valor,
    actualizadoEn: new Date().toISOString(),
  });
}

export function quitarMeta(periodo) {
  return remove(STORE, periodo);
}

/** Días que faltan para que termine el período, contando el de hoy. */
function diasRestantes(periodo, hoy = new Date()) {
  if (periodo === 'dia') return 1;
  const fin = finDeMes(hoy);
  const unDia = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((finDelDia(fin) - finDelDia(hoy)) / unDia) + 1);
}

/**
 * Cómo viene la meta: cuánto se cobró en el período, cuánto falta y a qué
 * ritmo hay que ir para llegar.
 *
 * Mide lo COBRADO, no lo facturado: un fiado todavía no entró a la caja, así
 * que sumarlo daría una meta cumplida con plata que no está.
 */
export async function progresoDeMeta(periodo, monto, hoy = new Date()) {
  const { cobrado } = await totalesDeVentas(rangoDelPeriodo(periodo, hoy));
  const objetivo = Number(monto) || 0;
  const falta = Math.max(0, objetivo - cobrado);
  const dias = diasRestantes(periodo, hoy);

  return {
    periodo,
    objetivo,
    cobrado,
    falta,
    diasRestantes: dias,
    // Lo que habría que vender por día que queda para llegar justo.
    porDia: falta > 0 ? Math.ceil(falta / dias) : 0,
    porcentaje: objetivo > 0 ? Math.min(100, Math.round((cobrado / objetivo) * 100)) : 0,
    cumplida: objetivo > 0 && cobrado >= objetivo,
  };
}
