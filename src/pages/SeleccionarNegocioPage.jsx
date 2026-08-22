import { useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import CampoTexto from '../components/CampoTexto.jsx';
import NegocioAvatar from '../components/NegocioAvatar.jsx';
import SelectorColorNegocio from '../components/SelectorColorNegocio.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNegocio } from '../negocio/NegocioContext.jsx';
import { crearNegocio } from '../db/repositories/negociosRepo.js';
import { COLOR_NEGOCIO_POR_DEFECTO } from '../utils/coloresNegocio.js';

export default function SeleccionarNegocioPage() {
  const { usuario, cerrarSesion } = useAuth();
  const { negocios, elegirNegocio, refrescarNegocios } = useNegocio();
  const [creando, setCreando] = useState(false);
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [color, setColor] = useState(COLOR_NEGOCIO_POR_DEFECTO);
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
      const nuevo = await crearNegocio(nombreNegocio, usuario.uid, color);
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
      <div className="min-h-screen bg-fudi-bg font-sans flex items-center justify-center">
        <p className="text-sm font-medium text-fudi-muted">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fudi-bg font-sans flex flex-col">
      <div className="px-6 pt-14 pb-2">
        <div className="bg-gradient-to-br from-fudi-red to-fudi-red-dark rounded-[32px] p-8 text-white relative overflow-hidden shadow-soft">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-fudi-yellow rounded-full opacity-90"></div>
          <div className="absolute right-12 top-10 w-8 h-8 rounded-full border-2 border-white/30"></div>
          <div className="absolute left-6 bottom-6 w-2 h-2 bg-white/50 rounded-full"></div>

          <div className="relative z-10 max-w-[62%]">
            <p className="text-white/80 text-sm font-medium truncate">
              Hola {usuario.displayName || usuario.email}
            </p>
            <h1 className="text-3xl font-black tracking-tight mt-1">
              {creando ? 'Nuevo negocio' : 'Tus negocios'}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 flex-1">
        {!creando ? (
          <>
            {negocios.length > 0 && (
              <div className="bg-white rounded-[32px] p-3 shadow-soft space-y-2 mb-5">
                {negocios.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => elegirNegocio(n.id)}
                    className="w-full flex items-center justify-between p-4 rounded-[24px] active:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <NegocioAvatar negocio={n} size={48} />
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-fudi-text truncate">{n.nombre}</h4>
                        <p className="text-xs font-medium text-fudi-muted mt-0.5">
                          {n.rol === 'dueño' ? 'Control total (dueño)' : 'Con acceso'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-fudi-muted shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {negocios.length === 0 && (
              <p className="text-sm font-medium text-fudi-muted mb-5">
                Todavía no tenés ningún negocio. Creá el primero, o pedile al dueño que te dé acceso
                con tu correo.
              </p>
            )}

            <button
              type="button"
              onClick={() => setCreando(true)}
              className="w-full bg-fudi-yellow text-fudi-text rounded-2xl font-bold min-h-[54px] px-6 shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Plus size={20} strokeWidth={2.6} />
              Crear negocio
            </button>
          </>
        ) : (
          <form className="space-y-5" onSubmit={handleCrear}>
            <CampoTexto
              etiqueta="Nombre del negocio"
              value={nombreNegocio}
              onChange={setNombreNegocio}
              placeholder="Ej: Fudi Food Truck"
              autoFocus
            />

            <SelectorColorNegocio color={color} onElegir={setColor} nombre={nombreNegocio} />

            {error && (
              <p className="text-sm font-semibold text-fudi-red bg-red-50 rounded-2xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCreando(false)}
                className="flex-1 bg-white text-fudi-text rounded-2xl font-bold min-h-[54px] px-6 shadow-soft"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-[2] bg-fudi-yellow text-fudi-text rounded-2xl font-bold min-h-[54px] px-6 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                {guardando ? 'Creando…' : 'Crear'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="px-6 py-8">
        <button
          type="button"
          className="w-full text-sm font-semibold text-fudi-red"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
