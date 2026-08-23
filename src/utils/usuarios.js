// Accesos para el equipo: en vez de pedirle un correo real a cada persona
// (que muchas veces no tiene, o no se acuerda), el dueño le arma un usuario
// con la forma "nombre@negocio". Ej: juan@rollofoodtruck.
//
// Firebase Auth solo acepta correos con dominio y punto, así que por debajo
// se le agrega un sufijo interno. Nunca se manda un mail a esa dirección:
// es solo el identificador con el que esa persona entra.
const DOMINIO_INTERNO = 'fudi.app';

/** Deja solo letras y números, sin tildes ni espacios. */
export function aSlug(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** El usuario que se le muestra a la persona: "juan@rollofoodtruck". */
export function usuarioDeAcceso(nombre, nombreNegocio) {
  const persona = aSlug(nombre);
  const negocio = aSlug(nombreNegocio);
  if (!persona || !negocio) return '';
  return `${persona}@${negocio}`;
}

/**
 * Lo que se le pasa a Firebase. Si ya es un correo de verdad (tiene punto
 * en el dominio) se deja tal cual, así el dueño sigue entrando con el suyo.
 */
export function aCorreoInterno(valor) {
  const limpio = String(valor || '').trim().toLowerCase();
  const corte = limpio.lastIndexOf('@');
  if (corte <= 0) return limpio;
  const dominio = limpio.slice(corte + 1);
  if (!dominio || dominio.includes('.')) return limpio;
  return `${limpio}.${DOMINIO_INTERNO}`;
}

/** Al revés: saca el sufijo interno para mostrarlo. */
export function mostrarUsuario(correo) {
  const limpio = String(correo || '');
  const sufijo = `.${DOMINIO_INTERNO}`;
  return limpio.endsWith(sufijo) ? limpio.slice(0, -sufijo.length) : limpio;
}
