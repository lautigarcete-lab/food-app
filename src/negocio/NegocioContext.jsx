import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { listarMisNegocios } from '../db/repositories/negociosRepo.js';
import { setNegocioActivo as setNegocioActivoEnRepos } from '../db/negocioActual.js';

const CLAVE_NEGOCIO_ACTIVO = 'fudipos:negocioActivo';
const NegocioContext = createContext(null);

export function NegocioProvider({ uid, children }) {
  const [negocios, setNegocios] = useState(undefined); // undefined = cargando
  const [negocioActivoId, setNegocioActivoId] = useState(() => localStorage.getItem(CLAVE_NEGOCIO_ACTIVO));

  const refrescar = useCallback(async () => {
    const lista = await listarMisNegocios(uid);
    setNegocios(lista);
    return lista;
  }, [uid]);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

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

  const value = { negocios, negocioActivo, elegirNegocio, salirDeNegocio, refrescarNegocios: refrescar };
  return <NegocioContext.Provider value={value}>{children}</NegocioContext.Provider>;
}

export function useNegocio() {
  return useContext(NegocioContext);
}
