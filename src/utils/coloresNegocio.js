// Colores que se pueden elegir para un negocio. Es una lista cerrada a
// propósito: así el color siempre combina con la paleta de la app (no queda
// un fucsia flúor al lado del bordó) y las reglas de Firestore pueden
// validar el valor guardado contra estos mismos ids.
export const COLORES_NEGOCIO = [
  { id: 'bordo', label: 'Bordó', hex: '#9B1B30' },
  { id: 'ambar', label: 'Ámbar', hex: '#F59E0B' },
  { id: 'verde', label: 'Verde', hex: '#15803D' },
  { id: 'oliva', label: 'Oliva', hex: '#65A30D' },
  { id: 'petroleo', label: 'Petróleo', hex: '#0F766E' },
  { id: 'azul', label: 'Azul', hex: '#1D4ED8' },
  { id: 'violeta', label: 'Violeta', hex: '#6D28D9' },
  { id: 'naranja', label: 'Naranja', hex: '#EA580C' },
  { id: 'rosa', label: 'Rosa', hex: '#DB2777' },
  { id: 'carbon', label: 'Carbón', hex: '#374151' },
];

export const COLOR_NEGOCIO_POR_DEFECTO = 'bordo';

export function colorDeNegocio(id) {
  return COLORES_NEGOCIO.find((c) => c.id === id) || COLORES_NEGOCIO[0];
}

/** Ids válidos, en el formato que espera la regla de Firestore. */
export const IDS_COLORES_NEGOCIO = COLORES_NEGOCIO.map((c) => c.id);
