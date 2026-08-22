// Unidades de medida.
//
// La app guarda todo internamente en una unidad base por familia (gramos,
// mililitros o unidades) pero deja cargar en la unidad que sea más cómoda
// (kg, g, l, ml, u). Así "2 kg" y "2000 g" son exactamente el mismo dato, y
// las cuentas de costo y de stock no dependen de cómo se escribió.

export const UNIDADES_BASE = {
  gr: { etiqueta: 'g', nombre: 'Peso' },
  ml: { etiqueta: 'ml', nombre: 'Volumen' },
  u: { etiqueta: 'u', nombre: 'Unidades' },
};

export const UNIDADES_COMPRA = [
  { id: 'kg', label: 'kg', nombre: 'Kilos', base: 'gr', factor: 1000 },
  { id: 'gr', label: 'g', nombre: 'Gramos', base: 'gr', factor: 1 },
  { id: 'l', label: 'l', nombre: 'Litros', base: 'ml', factor: 1000 },
  { id: 'ml', label: 'ml', nombre: 'Mililitros', base: 'ml', factor: 1 },
  { id: 'u', label: 'u', nombre: 'Unidades', base: 'u', factor: 1 },
];

export function unidadCompra(id) {
  return UNIDADES_COMPRA.find((u) => u.id === id) || UNIDADES_COMPRA[1];
}

/** Unidad base ('gr' | 'ml' | 'u') a la que pertenece una unidad de carga. */
export function baseDe(id) {
  return unidadCompra(id).base;
}

/** Pasa una cantidad escrita en kg/g/l/ml/u a la unidad base. */
export function aBase(cantidad, id) {
  return (Number(cantidad) || 0) * unidadCompra(id).factor;
}

/** Pasa una cantidad en unidad base a la unidad de carga elegida. */
export function desdeBase(cantidadBase, id) {
  return (Number(cantidadBase) || 0) / unidadCompra(id).factor;
}

/** Las unidades de carga que corresponden a una base (kg y g, o l y ml). */
export function opcionesDe(base) {
  return UNIDADES_COMPRA.filter((u) => u.base === base);
}

export function etiquetaBase(base) {
  return UNIDADES_BASE[base]?.etiqueta || '';
}

function formatNum(n) {
  return (Number(n) || 0).toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

/**
 * Muestra una cantidad en la unidad más legible: 2500 gramos se ve como
 * "2,5 kg" y 300 como "300 g", en vez de mostrar siempre gramos.
 */
export function formatearCantidad(cantidadBase, base) {
  const v = Number(cantidadBase) || 0;
  if (base === 'gr' && Math.abs(v) >= 1000) return `${formatNum(v / 1000)} kg`;
  if (base === 'ml' && Math.abs(v) >= 1000) return `${formatNum(v / 1000)} l`;
  return `${formatNum(v)} ${etiquetaBase(base)}`.trim();
}

/**
 * Cómo mostrar el costo: por gramo o mililitro los números quedan con
 * muchos decimales, así que se expresa por kilo o por litro, que es como
 * uno piensa el precio.
 */
export function unidadDeCosto(base) {
  if (base === 'gr') return { factor: 1000, etiqueta: 'kg' };
  if (base === 'ml') return { factor: 1000, etiqueta: 'l' };
  return { factor: 1, etiqueta: 'u' };
}
