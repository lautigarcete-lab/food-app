import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import { listarInsumos } from '../db/repositories/insumosRepo.js';
import { listarCategorias } from '../db/repositories/platosRepo.js';
import {
  TIPOS_RECETA,
  calcularCostos,
  crearReceta,
  actualizarReceta,
  eliminarReceta,
  crearPlatoDesdeReceta,
  sincronizarInsumoDePreparacion,
  registrarProduccion,
} from '../db/repositories/recetasRepo.js';
import { formatMoney, toNumber } from '../utils/money.js';
import { aBase, desdeBase, etiquetaBase, formatearCantidad, opcionesDe } from '../utils/unidades.js';
import { IconCerrar } from '../components/icons.jsx';

const MARGENES = [50, 70, 100, 150];

function unidadPreferida(cantidadBase, base) {
  if (base === 'gr') return Math.abs(cantidadBase) >= 1000 ? 'kg' : 'gr';
  if (base === 'ml') return Math.abs(cantidadBase) >= 1000 ? 'l' : 'ml';
  return 'u';
}

export default function RecetaFormModal({ receta, onClose, onGuardado, onEliminado }) {
  const esEdicion = Boolean(receta);

  const [nombre, setNombre] = useState(receta?.nombre || '');
  const [tipo, setTipo] = useState(receta?.tipo || 'plato');
  const [rinde, setRinde] = useState(receta ? String(receta.rinde) : '');
  const [unidadRinde, setUnidadRinde] = useState(receta?.unidadRinde || 'u');
  // Cada línea guarda la cantidad tal como se escribe más su unidad; al
  // guardar se convierte a la unidad base del insumo.
  const [lineas, setLineas] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [margen, setMargen] = useState(70);
  const [precio, setPrecio] = useState('');
  const [precioTocado, setPrecioTocado] = useState(false);
  const [categoria, setCategoria] = useState('');

  const [lotes, setLotes] = useState('1');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    listarInsumos().then((lista) => {
      setInsumos(lista);
      if (receta) {
        setLineas(
          (receta.ingredientes || []).map((l) => {
            const insumo = lista.find((i) => i.id === l.insumoId);
            const base = insumo?.unidad || 'gr';
            const u = unidadPreferida(l.cantidad, base);
            return { insumoId: l.insumoId, cantidad: String(desdeBase(l.cantidad, u)), unidad: u };
          })
        );
      }
    });
    listarCategorias().then(setCategorias).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Para calcular hace falta la receta con las cantidades ya en unidad base.
  const recetaNormalizada = useMemo(
    () => ({
      ingredientes: lineas
        .filter((l) => l.insumoId && toNumber(l.cantidad) > 0)
        .map((l) => ({ insumoId: l.insumoId, cantidad: aBase(toNumber(l.cantidad), l.unidad) })),
      rinde: toNumber(rinde),
    }),
    [lineas, rinde]
  );

  const costos = useMemo(() => calcularCostos(recetaNormalizada, insumos), [recetaNormalizada, insumos]);

  const precioSugerido = Math.round(costos.costoPorUnidad * (1 + margen / 100));
  const precioFinal = precioTocado ? toNumber(precio) : precioSugerido;
  const ganancia = precioFinal - costos.costoPorUnidad;

  function agregarLinea() {
    if (insumos.length === 0) return;
    const primero = insumos[0];
    setLineas((prev) => [
      ...prev,
      { insumoId: primero.id, cantidad: '', unidad: opcionesDe(primero.unidad)[0].id },
    ]);
  }

  function actualizarLinea(index, cambios) {
    setLineas((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const combinado = { ...l, ...cambios };
        // Si cambió el insumo, la unidad anterior puede no aplicar (pasar de
        // un insumo en gramos a uno en litros).
        if (cambios.insumoId) {
          const insumo = insumos.find((x) => x.id === cambios.insumoId);
          combinado.unidad = opcionesDe(insumo?.unidad || 'gr')[0].id;
        }
        return combinado;
      })
    );
  }

  function quitarLinea(index) {
    setLineas((prev) => prev.filter((_, i) => i !== index));
  }

  function validar() {
    if (!nombre.trim()) return 'Ponele un nombre a la receta.';
    if (recetaNormalizada.ingredientes.length === 0) return 'Agregá al menos un insumo.';
    if (toNumber(rinde) <= 0) return 'Indicá cuánto rinde la receta.';
    return '';
  }

  async function guardarReceta() {
    const datos = {
      nombre,
      tipo,
      ingredientes: recetaNormalizada.ingredientes,
      rinde: toNumber(rinde),
      unidadRinde: tipo === 'plato' ? 'u' : unidadRinde,
    };
    if (esEdicion) return actualizarReceta(receta.id, datos);
    return crearReceta(datos);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const guardada = await guardarReceta();
      // Una preparación solo sirve si además existe como insumo, para poder
      // usarla dentro de otras recetas.
      if (guardada.tipo === 'preparacion') {
        await sincronizarInsumoDePreparacion(guardada, insumos);
      }
      onGuardado();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la receta.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleCrearPlato() {
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }
    if (precioFinal <= 0) {
      setError('Poné un precio de venta.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const guardada = await guardarReceta();
      await crearPlatoDesdeReceta(guardada, { precio: precioFinal, categoria });
      onGuardado();
    } catch (err) {
      setError(err.message || 'No se pudo crear el plato.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleProducir() {
    setGuardando(true);
    setError('');
    setMensaje('');
    try {
      await registrarProduccion(receta, toNumber(lotes));
      setMensaje('Listo: se descontaron los insumos y se sumó la preparación al stock.');
      onGuardado({ mantenerAbierto: true });
    } catch (err) {
      setError(err.message || 'No se pudo registrar la preparación.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={esEdicion ? 'Editar receta' : 'Nueva receta'} onClose={onClose}>
      <form className="form" onSubmit={handleGuardar}>
        <label className="campo">
          <span>Nombre de la receta</span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Hamburguesa completa, Salsa criolla"
            autoFocus
          />
        </label>

        <div>
          <span className="etiqueta-grupo">¿Qué es?</span>
          <div className="opciones-plataforma">
            {TIPOS_RECETA.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`opcion-pago${tipo === t.id ? ' is-active' : ''}`}
                onClick={() => setTipo(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="seccion-receta">
          <h3>Insumos que lleva</h3>
          {insumos.length === 0 ? (
            <p className="ayuda-texto">Primero cargá insumos para poder armar la receta.</p>
          ) : (
            <>
              {lineas.map((linea, index) => {
                const insumo = insumos.find((i) => i.id === linea.insumoId);
                return (
                  <div className="linea-receta" key={index}>
                    <select
                      value={linea.insumoId}
                      onChange={(e) => actualizarLinea(index, { insumoId: e.target.value })}
                    >
                      {insumos.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nombre}
                          {i.esPreparacion ? ' (prep.)' : ''}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={linea.cantidad}
                      onChange={(e) => actualizarLinea(index, { cantidad: e.target.value })}
                      placeholder="0"
                    />
                    <select
                      value={linea.unidad}
                      onChange={(e) => actualizarLinea(index, { unidad: e.target.value })}
                      aria-label="Unidad"
                    >
                      {opcionesDe(insumo?.unidad || 'gr').map((u) => (
                        <option key={u.id} value={u.id}>{u.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => quitarLinea(index)}
                      aria-label="Quitar insumo"
                    >
                      <IconCerrar width={16} height={16} />
                    </button>
                  </div>
                );
              })}
              <button type="button" className="btn btn--secundario btn--chico" onClick={agregarLinea}>
                + Agregar insumo
              </button>
            </>
          )}
        </div>

        <div className="campo-fila">
          <label className="campo">
            <span>{tipo === 'plato' ? '¿Cuántas unidades rinde?' : '¿Cuánto rinde?'}</span>
            <div className="campo-con-unidad">
              <input
                type="number"
                inputMode="decimal"
                value={rinde}
                onChange={(e) => setRinde(e.target.value)}
                placeholder={tipo === 'plato' ? 'Ej: 10' : 'Ej: 2'}
              />
              {tipo === 'preparacion' ? (
                <select value={unidadRinde} onChange={(e) => setUnidadRinde(e.target.value)} aria-label="Unidad">
                  <option value="gr">g</option>
                  <option value="ml">ml</option>
                  <option value="u">u</option>
                </select>
              ) : (
                <span className="unidad-fija">porciones</span>
              )}
            </div>
          </label>
        </div>

        <div className="costo-calculado">
          <small>Costo de toda la receta</small>
          <strong>{formatMoney(costos.costoTotal)}</strong>
          {toNumber(rinde) > 0 && (
            <small>
              Cada {tipo === 'plato' ? 'unidad' : etiquetaBase(unidadRinde)} sale{' '}
              <strong>{formatMoney(costos.costoPorUnidad)}</strong>
            </small>
          )}
          {costos.incompleta && (
            <small className="texto-negativo">Ojo: hay insumos sin precio cargado, el costo real es mayor.</small>
          )}
        </div>

        {error && <p className="mensaje-error">{error}</p>}
        {mensaje && <p className="mensaje-ok">{mensaje}</p>}

        {tipo === 'plato' && (
          <div className="bloque-precio">
            <h3>Precio de venta</h3>
            <div className="chips">
              {MARGENES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={!precioTocado && margen === m ? 'is-active' : ''}
                  onClick={() => {
                    setMargen(m);
                    setPrecioTocado(false);
                  }}
                >
                  +{m}%
                </button>
              ))}
            </div>
            <label className="campo">
              <span>Precio sugerido (podés cambiarlo)</span>
              <input
                type="number"
                inputMode="decimal"
                value={precioTocado ? precio : precioSugerido || ''}
                onChange={(e) => {
                  setPrecio(e.target.value);
                  setPrecioTocado(true);
                }}
              />
            </label>
            {precioFinal > 0 && (
              <p className="ayuda-texto">
                Ganás <strong>{formatMoney(ganancia)}</strong> por unidad
                {costos.costoPorUnidad > 0 && ` (${Math.round((ganancia / costos.costoPorUnidad) * 100)}% sobre el costo)`}
              </p>
            )}
            <label className="campo">
              <span>Categoría (opcional)</span>
              <input
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                list="categorias-receta"
                placeholder="Ej: Burgers"
              />
              <datalist id="categorias-receta">
                {categorias.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
          </div>
        )}

        <div className="campo-fila">
          <button type="submit" className="btn btn--secundario" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar receta'}
          </button>
          {tipo === 'plato' && (
            <button type="button" className="btn btn--primario" onClick={handleCrearPlato} disabled={guardando}>
              {receta?.platoId ? 'Actualizar plato' : 'Crear plato'}
            </button>
          )}
        </div>
      </form>

      {esEdicion && receta.tipo === 'preparacion' && receta.insumoId && (
        <div className="seccion-ajuste">
          <h3>Registrar preparación</h3>
          <p className="ayuda-texto">
            Descuenta del stock los insumos que usaste y suma{' '}
            {formatearCantidad(receta.rinde * (toNumber(lotes) || 0), receta.unidadRinde)} de{' '}
            {receta.nombre}.
          </p>
          <div className="campo-fila">
            <label className="campo">
              <span>¿Cuántas veces la preparaste?</span>
              <input type="number" inputMode="decimal" value={lotes} onChange={(e) => setLotes(e.target.value)} />
            </label>
          </div>
          <button type="button" className="btn btn--secundario" onClick={handleProducir} disabled={guardando}>
            Registrar
          </button>
        </div>
      )}

      {esEdicion && (
        <div className="seccion-ajuste">
          <button
            type="button"
            className="btn btn--texto-peligro"
            onClick={async () => {
              if (!window.confirm(`¿Eliminar la receta "${receta.nombre}"?`)) return;
              await eliminarReceta(receta.id);
              onEliminado();
            }}
          >
            Eliminar receta
          </button>
        </div>
      )}
    </Modal>
  );
}
