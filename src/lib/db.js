// Capa simple de persistencia local (localStorage) para Fudi POS.
// Pensada para funcionar 100% offline dentro de la app empaquetada con Capacitor.

const KEYS = {
  insumos: 'fudipos:insumos',
  platos: 'fudipos:platos',
  ventas: 'fudipos:ventas',
  gastos: 'fudipos:gastos',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Insumos ----------
export function getInsumos() {
  return read(KEYS.insumos);
}

export function saveInsumo(insumo) {
  const insumos = getInsumos();
  const costoUnitario = insumo.contenido > 0 ? insumo.precio / insumo.contenido : 0;
  const nuevo = { ...insumo, costoUnitario, id: insumo.id || uid() };
  const idx = insumos.findIndex((i) => i.id === nuevo.id);
  if (idx >= 0) insumos[idx] = nuevo;
  else insumos.push(nuevo);
  write(KEYS.insumos, insumos);
  return nuevo;
}

export function deleteInsumo(id) {
  write(KEYS.insumos, getInsumos().filter((i) => i.id !== id));
}

// ---------- Platos ----------
export function getPlatos() {
  return read(KEYS.platos);
}

export function savePlato(plato) {
  const platos = getPlatos();
  const nuevo = { ...plato, id: plato.id || uid(), insumos: plato.insumos || [] };
  const idx = platos.findIndex((p) => p.id === nuevo.id);
  if (idx >= 0) platos[idx] = nuevo;
  else platos.push(nuevo);
  write(KEYS.platos, platos);
  return nuevo;
}

export function deletePlato(id) {
  write(KEYS.platos, getPlatos().filter((p) => p.id !== id));
}

// ---------- Ventas ----------
export function getVentas() {
  return read(KEYS.ventas);
}

export function registrarVenta(venta) {
  const ventas = getVentas();
  const nueva = { ...venta, id: uid(), fecha: new Date().toISOString() };
  ventas.push(nueva);
  write(KEYS.ventas, ventas);
  return nueva;
}

// ---------- Gastos ----------
export function getGastos() {
  return read(KEYS.gastos);
}

export function registrarGasto(gasto) {
  const gastos = getGastos();
  const nuevo = { ...gasto, id: uid(), fecha: new Date().toISOString() };
  gastos.push(nuevo);
  write(KEYS.gastos, gastos);
  return nuevo;
}

// ---------- Utilidades ----------
export function esMismoDia(isoFecha, referencia = new Date()) {
  const f = new Date(isoFecha);
  return (
    f.getFullYear() === referencia.getFullYear() &&
    f.getMonth() === referencia.getMonth() &&
    f.getDate() === referencia.getDate()
  );
}

export function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

// Genera y descarga/comparte el archivo de respaldo completo en JSON.
export function generarRespaldo() {
  return {
    version: 1,
    generadoEn: new Date().toISOString(),
    insumos: getInsumos(),
    platos: getPlatos(),
    ventas: getVentas(),
    gastos: getGastos(),
  };
}

export function restaurarRespaldo(data) {
  if (data.insumos) write(KEYS.insumos, data.insumos);
  if (data.platos) write(KEYS.platos, data.platos);
  if (data.ventas) write(KEYS.ventas, data.ventas);
  if (data.gastos) write(KEYS.gastos, data.gastos);
}

// Abre WhatsApp con un mensaje pre-formateado (usa la Web Share API si está
// disponible -para compartir como "compartir" nativo en Android- y si no,
// cae en el link wa.me).
export async function compartirPorWhatsApp(texto, tituloArchivo = 'Compartir') {
  if (navigator.share) {
    try {
      await navigator.share({ title: tituloArchivo, text: texto });
      return true;
    } catch {
      // el usuario canceló el share sheet, no hacemos nada más
      return false;
    }
  }
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
  return true;
}
