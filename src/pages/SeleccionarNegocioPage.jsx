import { useState } from 'react';
import BurgerMascot from '../components/BurgerMascot.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNegocio } from '../negocio/NegocioContext.jsx';
import { crearNegocio } from '../db/repositories/negociosRepo.js';

export default function SeleccionarNegocioPage() {
  const { usuario, cerrarSesion } = useAuth();
  const { negocios, elegirNegocio, refrescarNegocios } = useNegocio();
  const [creando, setCreando] = useState(false);
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function handleCrear(e) {
    e.preventDefault();
    if (!nombreNegocio.trim()) {
      setError('Ingresá el nombre del negocio.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const nuevo = await crearNegocio(nombreNegocio, usuario.uid);
      await refrescarNegocios();
      elegirNegocio(nuevo.id);
    } catch (err) {
      setError(err.message || 'No se pudo crear el negocio.');
    } finally {
      setGuardando(false);
    }
  }

  if (negocios === undefined) {
    return (
      <div className="pantalla-centrada">
        <p className="ayuda-texto">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="pantalla-centrada">
      <div className="pantalla-centrada__marca">
        <BurgerMascot size={80} variant="normal" />
        <h1>Fudi POS</h1>
        <p>Hola {usuario.displayName || usuario.email}</p>
      </div>

      {negocios.length > 0 && !creando && (
        <ul className="lista-negocios">
          {negocios.map((n) => (
            <li key={n.id}>
              <button type="button" className="negocio-row" onClick={() => elegirNegocio(n.id)}>
                <div className="negocio-row__info">
                  <strong>{n.nombre}</strong>
                  <small>{n.rol === 'dueño' ? 'Control total (dueño)' : 'Con acceso'}</small>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!creando ? (
        <button type="button" className="btn btn--secundario" onClick={() => setCreando(true)}>
          + Crear negocio
        </button>
      ) : (
        <form className="form" onSubmit={handleCrear}>
          <label className="campo">
            <span>Nombre del negocio</span>
            <input
              value={nombreNegocio}
              onChange={(e) => setNombreNegocio(e.target.value)}
              placeholder="Ej: Fudi Food Truck"
              autoFocus
            />
          </label>
          {error && <p className="mensaje-error">{error}</p>}
          <div className="campo-fila">
            <button type="button" className="btn btn--fantasma" onClick={() => setCreando(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primario" disabled={guardando}>
              {guardando ? 'Creando…' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      {negocios.length === 0 && !creando && (
        <p className="ayuda-texto">
          Todavía no tenés ningún negocio. Creá el primero, o pedile al dueño que te dé acceso con tu correo.
        </p>
      )}

      <button type="button" className="enlace-alterno" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </div>
  );
}
