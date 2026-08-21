// Negocio activo en memoria: todos los repositorios leen de acá para saber
// bajo qué negocio (negocios/{negocioId}/...) operar, en vez de tener que
// recibir el negocioId como parámetro en cada llamada. Esto permite migrar
// los repositorios de IndexedDB a Firestore sin tocar las páginas que ya
// los usan. NegocioContext es quien lo actualiza cuando cambia el negocio
// activo.
let negocioId = null;

export function setNegocioActivo(id) {
  negocioId = id;
}

export function getNegocioActivo() {
  if (!negocioId) {
    throw new Error('No hay un negocio activo seleccionado.');
  }
  return negocioId;
}
