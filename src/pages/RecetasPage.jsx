import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RecetaFormModal from './RecetaFormModal.jsx';
import { listarRecetas, calcularCostos, obtenerReceta } from '../db/repositories/recetasRepo.js';
import { listarInsumos } from '../db/repositories/insumosRepo.js';
import { formatMoney } from '../utils/money.js';
import { formatearCantidad } from '../utils/unidades.js';
import { IconMas2 } from '../components/icons.jsx';

export default function RecetasPage({ onVolver }) {
  const [recetas, setRecetas] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null); // receta | 'nueva' | null

  async function recargar() {
    setCargando(true);
    const [listaRecetas, listaInsumos] = await Promise.all([listarRecetas(), listarInsumos()]);
    setRecetas(listaRecetas);
    setInsumos(listaInsumos);
    setCargando(false);
  }

  useEffect(() => {
    recargar();
  }, []);

  async function handleGuardado(opciones = {}) {
    await recargar();
    if (opciones.mantenerAbierto && editando && editando !== 'nueva') {
      setEditando(await obtenerReceta(editando.id));
      return;
    }
    setEditando(null);
  }

  return (
    <div className="page">
      <Header titulo="Recetas"
        subtitulo="Cuánto cuesta y cuánto rinde" onVolver={onVolver} />
      <div className="page__content">
        <p className="ayuda-texto">
          Cargá los insumos que lleva cada receta y cuánto rinde: Fudi calcula lo que sale cada
          unidad y desde ahí podés crear el plato con su precio.
        </p>

        {cargando ? (
          <p className="ayuda-texto">Cargando…</p>
        ) : recetas.length === 0 ? (
          <EmptyState
            titulo="Todavía no cargaste recetas"
            descripcion="Una receta te dice cuánto te cuesta hacer cada plato y a cuánto conviene venderlo."
          />
        ) : (
          <ul className="lista-insumos">
            {recetas.map((receta) => {
              const { costoPorUnidad, incompleta } = calcularCostos(receta, insumos);
              return (
                <li key={receta.id}>
                  <button type="button" className="insumo-row" onClick={() => setEditando(receta)}>
                    <div className="negocio-row__info">
                      <strong>{receta.nombre}</strong>
                      <small>
                        {receta.tipo === 'plato'
                          ? `Rinde ${receta.rinde} ${receta.rinde === 1 ? 'porción' : 'porciones'}`
                          : `Preparación · rinde ${formatearCantidad(receta.rinde, receta.unidadRinde)}`}
                        {receta.platoId ? ' · plato creado' : ''}
                      </small>
                    </div>
                    <span className="insumo-row__stock">
                      {costoPorUnidad > 0 ? `${formatMoney(costoPorUnidad)} c/u` : '—'}
                      {incompleta ? ' *' : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button type="button" className="fab" onClick={() => setEditando('nueva')} aria-label="Nueva receta">
        <IconMas2 width={26} height={26} />
      </button>

      {editando && (
        <RecetaFormModal
          receta={editando === 'nueva' ? null : editando}
          onClose={() => setEditando(null)}
          onGuardado={handleGuardado}
          onEliminado={() => {
            setEditando(null);
            recargar();
          }}
        />
      )}
    </div>
  );
}
