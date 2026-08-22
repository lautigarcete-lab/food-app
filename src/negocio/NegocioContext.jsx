import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { listarMisNegocios } from '../db/repositories/negociosRepo.js';
import { setNegocioActivo as setNegocioActivoEnRepos } from '../db/negocioActual.js';

const CLAVE_NEGOCIO_ACTIVO = 'fudipos:negocioActivo';
const NegocioContext = createContext(null);

export function NegocioProvider({ uid, children }) {
  const [negocios, setNegocios] = useState(undefined); // undefined = cargando
  const [errorNegocios, setErrorNegocios] = useState(null);
  const [negocioActivoId, setNegocioActivoId] = useState(() => localStorage.getItem(CLAVE_NEGOCIO_ACTIVO));

  const refrescar = useCallback(async () => {
    try {
      const lista = await listarMisNegocios(uid);
      setNegocios(lista);
      setErrorNegocios(null);
      return lista;
    } catch (err) {
      // Antes esto quedaba como una promesa rechazada sin manejar: si
      // fallaba (típicamente por falta de conexión), la pantalla de carga
      // se quedaba así para siempre, sin error y sin forma de reintentar.
      setErrorNegocios(err);
      throw err;
    }
  }, [uid]);

  useEffect(() => {
    refrescar().catch(() => {});
  }, [refrescar]);

  // Si se cortó la señal justo mientras cargaba, reintenta solo apenas
  // vuelve la conexión, sin que la persona tenga que hacer nada.
  useEffect(() => {
    function alVolverConexion() {
      if (negocios === undefined) refrescar().catch(() => {});
    }
    window.addEventListener('online', alVolverConexion);
    return () => window.removeEventListener('online', alVolverConexion);
  }, [negocios, refrescar]);

  // Si el negocio recordado ya no existe o no somos más miembros, se
  // deselecciona automáticamente para no dejar la app en un estado roto.
  useEffect(() => {
    if (negocios && negocioActivoId && !negocios.some((n) => n.id === negocioActivoId)) {
      localStorage.removeItem(CLAVE_NEGOCIO_ACTIVO);
      setNegocioActivoId(null);
    }
  }, [negocios, negocioActivoId]);

  function elegirNegocio(id) {
    localStorage.setItem(CLAVE_NEGOCIO_ACTIVO, id);
    setNegocioActivoId(id);
  }

  function salirDeNegocio() {
    localStorage.removeItem(CLAVE_NEGOCIO_ACTIVO);
    setNegocioActivoId(null);
  }

  const negocioActivo = (negocios || []).find((n) => n.id === negocioActivoId) || null;

  useEffect(() => {
    setNegocioActivoEnRepos(negocioActivo?.id || null);
  }, [negocioActivo?.id]);

  const value = {
    negocios,
    negocioActivo,
    errorNegocios,
    elegirNegocio,
    salirDeNegocio,
    refrescarNegocios: refrescar,
  };
  return <NegocioContext.Provider value={value}>{children}</NegocioContext.Provider>;
}

export function useNegocio() {
  return useContext(NegocioContext);
}
