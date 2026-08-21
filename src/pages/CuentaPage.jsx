import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import { useAuth, mensajeDeError } from '../auth/AuthContext.jsx';
import { useNegocio } from '../negocio/NegocioContext.jsx';
import {
  listarMiembros,
  agregarColaborador,
  quitarColaborador,
  archivarNegocio,
} from '../db/repositories/negociosRepo.js';

export default function CuentaPage({ onVolver }) {
  const { usuario, cerrarSesion } = useAuth();
  const { negocioActivo, salirDeNegocio, refrescarNegocios } = useNegocio();
  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [agregando, setAgregando] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [emailNuevo, setEmailNuevo] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const esDueño = negocioActivo?.rol === 'dueño';

  async function refrescar() {
    setCargando(true);
    setMiembros(await listarMiembros(negocioActivo.id));
    setCargando(false);
  }

  useEffect(() => {
    refrescar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocioActivo?.id]);

  async function handleAgregar(e) {
    e.preventDefault();
    if (!nombreNuevo.trim() || !emailNuevo.trim() || passwordNuevo.length < 6) {
      setError('Completá nombre, correo y una contraseña de al menos 6 caracteres.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await agregarColaborador({
        negocioId: negocioActivo.id,
        nombre: nombreNuevo,
        email: emailNuevo,
        password: passwordNuevo,
        agregadoPor: usuario.uid,
      });
      setNombreNuevo('');
      setEmailNuevo('');
      setPasswordNuevo('');
      setAgregando(false);
      setMensaje('Acceso creado. Compartile el correo y la contraseña a esa persona.');
      await refrescar();
    } catch (err) {
      setError(err.code ? mensajeDeError(err) : err.message || mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function handleQuitar(uid) {
    if (!window.confirm('¿Quitarle el acceso a esta persona?')) return;
    await quitarColaborador(negocioActivo.id, uid);
    refrescar();
  }

  async function handleArchivar() {
    if (!window.confirm(`¿Archivar "${negocioActivo.nombre}"? Vas a dejar de verlo en tu lista de negocios.`)) return;
    await archivarNegocio(negocioActivo.id);
    await refrescarNegocios();
    salirDeNegocio();
  }

  return (
    <div className="page">
      <Header titulo="Cuenta" onVolver={onVolver} />
      <div className="page__content">
        <div className="tarjeta-resumen" style={{ marginBottom: 16 }}>
          <small>Sesión iniciada como</small>
          <strong>{usuario.displayName || usuario.email}</strong>
          <small>{usuario.email}</small>
        </div>

        <h3 className="titulo-seccion">{negocioActivo.nombre}</h3>
        <p className="ayuda-texto">{esDueño ? 'Control total (dueño)' : 'Con acceso'}</p>

        <button type="button" className="btn btn--secundario" onClick={salirDeNegocio}>
          Cambiar de negocio
        </button>
        <div className="espaciador" />

        {esDueño && (
          <>
            <h3 className="titulo-seccion">Equipo</h3>
            {cargando ? (
              <p className="ayuda-texto">Cargando…</p>
            ) : (
              <ul className="lista-negocios">
                {miembros.map((m) => (
                  <li key={m.uid}>
                    <div className="negocio-row">
                      <div className="negocio-row__info">
                        <strong>{m.nombre || m.uid}</strong>
                        <small>{m.rol === 'dueño' ? 'Control total (dueño)' : 'Con acceso'}</small>
                      </div>
                      {m.rol !== 'dueño' && (
                        <button type="button" className="icon-button" onClick={() => handleQuitar(m.uid)} aria-label="Quitar acceso">
                          ✕
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {mensaje && <p className="mensaje-ok">{mensaje}</p>}

            {!agregando ? (
              <button type="button" className="btn btn--secundario btn--chico" onClick={() => setAgregando(true)}>
                + Crear usuario y dar acceso
              </button>
            ) : (
              <form className="form" onSubmit={handleAgregar}>
                <label className="campo">
                  <span>Nombre</span>
                  <input value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} autoFocus />
                </label>
                <label className="campo">
                  <span>Correo</span>
                  <input type="email" value={emailNuevo} onChange={(e) => setEmailNuevo(e.target.value)} />
                </label>
                <label className="campo">
                  <span>Contraseña (mínimo 6 caracteres)</span>
                  <input type="password" value={passwordNuevo} onChange={(e) => setPasswordNuevo(e.target.value)} />
                </label>
                {error && <p className="mensaje-error">{error}</p>}
                <div className="campo-fila">
                  <button type="button" className="btn btn--fantasma" onClick={() => setAgregando(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn--primario" disabled={guardando}>
                    {guardando ? 'Creando…' : 'Crear acceso'}
                  </button>
                </div>
              </form>
            )}

            <div className="espaciador" />
            <h3 className="titulo-seccion">Zona de riesgo</h3>
            <button type="button" className="btn btn--texto-peligro" onClick={handleArchivar}>
              Archivar negocio
            </button>
          </>
        )}

        <div className="espaciador" />
        <button type="button" className="btn btn--fantasma" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
