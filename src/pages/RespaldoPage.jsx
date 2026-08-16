import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header.jsx';
import {
  ETIQUETAS_STORE,
  generarRespaldo,
  nombreDeArchivo,
  contarRegistros,
  parsearRespaldo,
  restaurarRespaldo,
} from '../db/repositories/respaldoRepo.js';
import { formatearFechaLarga } from '../utils/fechas.js';

export default function RespaldoPage({ onVolver }) {
  const [respaldo, setRespaldo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [textoPegado, setTextoPegado] = useState('');
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const inputArchivo = useRef(null);

  async function recargar() {
    setCargando(true);
    setRespaldo(await generarRespaldo());
    setCargando(false);
  }

  useEffect(() => {
    recargar();
  }, []);

  const { conteo, total } = respaldo ? contarRegistros(respaldo) : { conteo: {}, total: 0 };
  const textoJson = respaldo ? JSON.stringify(respaldo) : '';

  function limpiarAvisos() {
    setMensaje('');
    setError('');
  }

  function handleDescargar() {
    limpiarAvisos();
    try {
      const blob = new Blob([textoJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = nombreDeArchivo();
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMensaje(`Se descargó ${nombreDeArchivo()}. Guardalo en Drive o mandátelo por WhatsApp.`);
    } catch {
      setError('No se pudo descargar. Probá con "Copiar todo el respaldo".');
    }
  }

  async function handleCopiar() {
    limpiarAvisos();
    try {
      await navigator.clipboard.writeText(textoJson);
      setMensaje('Respaldo copiado. Pegalo en una nota o mandátelo por WhatsApp.');
    } catch {
      setMostrarTexto(true);
      setError('No se pudo copiar solo. Te lo muestro abajo para que lo copies a mano.');
    }
  }

  async function aplicarRestauracion(texto) {
    limpiarAvisos();
    let datos;
    try {
      datos = parsearRespaldo(texto);
    } catch (err) {
      setError(err.message);
      return;
    }

    const resumen = contarRegistros(datos);
    const confirmado = window.confirm(
      `El respaldo es del ${formatearFechaLarga(datos.exportadoEn)} y tiene ${resumen.total} registros.\n\n` +
        'Se van a agregar a lo que ya tenés (si algo coincide, se actualiza). ¿Seguir?'
    );
    if (!confirmado) return;

    setRestaurando(true);
    try {
      const restaurados = await restaurarRespaldo(datos, { modo: 'combinar' });
      setMensaje(`Listo: se restauraron ${restaurados} registros.`);
      setTextoPegado('');
      await recargar();
    } catch (err) {
      setError(err.message || 'No se pudo restaurar el respaldo.');
    } finally {
      setRestaurando(false);
    }
  }

  function handleArchivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const lector = new FileReader();
    lector.onload = () => aplicarRestauracion(String(lector.result));
    lector.onerror = () => setError('No se pudo leer el archivo.');
    lector.readAsText(file);
    e.target.value = ''; // permite volver a elegir el mismo archivo
  }

  return (
    <div className="page">
      <Header titulo="Respaldo" onVolver={onVolver} />
      <div className="page__content">
        <p className="ayuda-texto">
          Tus datos se guardan solo en este celular. Si desinstalás la app, borrás sus datos o cambiás
          de teléfono, se pierden. Bajá un respaldo cada tanto y guardalo donde no se te pierda.
        </p>

        <div className="tarjeta-respaldo">
          <small>Datos guardados ahora</small>
          <strong>{cargando ? '…' : `${total} registros`}</strong>
          {!cargando && total > 0 && (
            <ul className="lista-conteo">
              {Object.entries(conteo)
                .filter(([, cantidad]) => cantidad > 0)
                .map(([store, cantidad]) => (
                  <li key={store}>
                    <span>{ETIQUETAS_STORE[store] || store}</span>
                    <strong>{cantidad}</strong>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <h3 className="titulo-seccion">Guardar una copia</h3>
        <button type="button" className="btn btn--primario" onClick={handleDescargar} disabled={cargando}>
          Descargar respaldo
        </button>
        <div className="espaciador" />
        <button type="button" className="btn btn--secundario" onClick={handleCopiar} disabled={cargando}>
          Copiar todo el respaldo
        </button>

        {mostrarTexto && (
          <textarea className="area-json" readOnly value={textoJson} onFocus={(e) => e.target.select()} />
        )}

        <h3 className="titulo-seccion">Restaurar</h3>
        <p className="ayuda-texto">
          Los datos del respaldo se suman a los que ya tenés. Si un registro ya existe, se actualiza
          con la versión del respaldo. No se borra nada.
        </p>

        <button
          type="button"
          className="btn btn--secundario"
          onClick={() => inputArchivo.current?.click()}
          disabled={restaurando}
        >
          {restaurando ? 'Restaurando…' : 'Elegir archivo de respaldo'}
        </button>
        <input
          ref={inputArchivo}
          type="file"
          accept="application/json,.json"
          onChange={handleArchivo}
          hidden
        />

        <div className="espaciador" />
        <details className="detalle-pegar">
          <summary>O pegar el texto del respaldo</summary>
          <textarea
            className="area-json"
            value={textoPegado}
            onChange={(e) => setTextoPegado(e.target.value)}
            placeholder="Pegá acá el texto que copiaste…"
          />
          <button
            type="button"
            className="btn btn--secundario"
            onClick={() => aplicarRestauracion(textoPegado)}
            disabled={!textoPegado.trim() || restaurando}
          >
            Restaurar desde el texto
          </button>
        </details>

        {mensaje && <p className="mensaje-ok">{mensaje}</p>}
        {error && <p className="mensaje-error">{error}</p>}
      </div>
    </div>
  );
}
