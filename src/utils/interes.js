// Recargo por cobrar con tarjeta o transferencia: lo que le cobra la
// procesadora al negocio y que muchos locales trasladan al precio.
//
// Se guarda el monto en pesos (no el porcentaje) para que el total de la
// venta sea siempre exacto y no dependa de volver a hacer la cuenta.
export const PORCENTAJES_INTERES = [0, 5, 10, 15];

/** Medios de pago que tienen costo de procesamiento. */
export const MEDIOS_CON_INTERES = new Set(['mercadopago', 'tarjeta']);

export function tieneInteres(medioPago) {
  return MEDIOS_CON_INTERES.has(medioPago);
}

/** Redondeado al peso: es lo que se cobra de verdad. */
export function calcularRecargo(total, porcentaje) {
  const pct = Number(porcentaje) || 0;
  if (pct <= 0) return 0;
  return Math.round((Number(total) || 0) * (pct / 100));
}
