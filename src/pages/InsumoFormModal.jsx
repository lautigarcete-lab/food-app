import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import {
  UNIDADES,
  crearInsumo,
  actualizarInsumo,
  eliminarInsumo,
  ajustarStock,
  listarMovimientos,
  calcularCostoUnitario,
} from '../db/repositories/insumosRepo.js';
import { formatMoney, toNumber } from '../utils/money.js';
import {
  aBase,
  desdeBase,
  formatearCantidad,
  opcionesDe,
  unidadDeCosto,
} from '../utils/unidades.js';

const ETIQUETA_MOVIMIENTO = {
  compra: 'Ingreso de stock',
  merma: 'Merma',
  ajuste: 'Ajuste manual',
  venta: 'Descuento por venta',
};

// Al editar, muestra la cantidad guardada en la unidad más cómoda: 2000
// gramos se ven como "2 kg" y no como "2000 g".
function unidadPreferida(cantidadBase, base) {
  if (base === 'gr') return Math.abs(cantidadBase) >= 1000 ? 'kg' : 'gr';
  if (base === 'ml') return Math.abs(cantidadBase) >= 1000 ? 'l' : 'ml';
  return 'u';
}

export default function InsumoFormModal({ insumo, onClose, onGuardado, onEliminado }) {
  const esEdicion = Boolean(insumo);
  const baseInicial = insumo?.unidad || 'gr';

  const [nombre, setNombre] = useState(insumo?.nombre || '');
  const [base, setBase] = useState(baseInicial);
  const [modo, setModo] = useState(insumo?.modoCompra === 'envase' ? 'envase' : 'total');

  // Modo "cantidad + precio total"
  const [cantidadComprada, setCantidadComprada] = useState(
    insumo ? String(desdeBase(insumo.contenidoEnvase, unidadPreferida(insumo.contenidoEnvase, baseInicial))) : ''
  );
  const [unidadCantidad, setUnidadCantidad] = useState(
    insumo ? unidadPreferida(insumo.contenidoEnvase, baseInicial) : 'gr'
  );
  const [precioTotal, setPrecioTotal] = useState(insumo ? String(insumo.precioEnvase || '') : '');

  // Modo "por envase"
  const [cantEnvases, setCantEnvases] = useState('1');
  const [contenidoEnvase, setContenidoEnvase] = useState(
    insumo ? String(desdeBase(insumo.contenidoEnvase, unidadPreferida(insumo.contenidoEnvase, baseInicial))) : ''
  );
  const [unidadEnvase, setUnidadEnvase] = useState(
    insumo ? unidadPreferida(insumo.contenidoEnvase, baseInicial) : 'gr'
  );
  const [precioEnvase, setPrecioEnvase] = useState(insumo ? String(insumo.precioEnvase || '') : '');

  const [stockMinimo, setStockMinimo] = useState(
    insumo ? String(desdeBase(insumo.stockMinimo, unidadPreferida(insumo.stockMinimo, baseInicial))) : '0'
  );
  const [unidadMinimo, setUnidadMinimo] = useState(
    insumo ? unidadPreferida(insumo.stockMinimo, baseInicial) : 'gr'
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const [movimientos, setMovimientos] = useState([]);
  const [tipoAjuste, setTipoAjuste] = useState(null); // 'compra' | 'merma' | null
  const [cantidadAjuste, setCantidadAjuste] = useState('');
  const [unidadAjuste, setUnidadAjuste] = useState(baseInicial === 'u' ? 'u' : baseInicial);
  const [motivoAjuste, setMotivoAjuste] = useState('');
  const [ajustando, setAjustando] = useState(false);

  const opciones = opcionesDe(base);

  useEffect(() => {
    if (esEdicion) listarMovimientos(insumo.id).then(setMovimientos).catch(() => {});
  }, [esEdicion, insumo]);

  // Al cambiar de familia de unidad hay que reencauzar los selectores: no
  // tiene sentido quedar en "kg" si el insumo pasó a medirse en litros.
  function cambiarBase(nuevaBase) {
    setBase(nuevaBase);
    const primera = opcionesDe(nuevaBase)[0].id;
    setUnidadCantidad(primera);
    setUnidadEnvase(primera);
    setUnidadMinimo(primera);
    setUnidadAjuste(primera);
  }

  // Todo lo que se escribe se pasa a la unidad base antes de calcular.
  const calculo = useMemo(() => {
    if (modo === 'envase') {
      const contenidoBase = aBase(toNumber(contenidoEnvase), unidadEnvase);
      const envases = toNumber(cantEnvases) || 0;
      return {
        cantidadBase: contenidoBase * envases,
        precioGuardado: toNumber(precioEnvase),
        contenidoGuardado: contenidoBase,
        costoUnitario: calcularCostoUnitario(toNumber(precioEnvase), contenidoBase),
        gastoTotal: toNumber(precioEnvase) * envases,
      };
    }
    const cantidadBase = aBase(toNumber(cantidadComprada), unidadCantidad);
    return {
      cantidadBase,
      precioGuardado: toNumber(precioTotal),
      contenidoGuardado: cantidadBase,
      costoUnitario: calcularCostoUnitario(toNumber(precioTotal), cantidadBase),
      gastoTotal: toNumber(precioTotal),
    };
  }, [modo, cantidadComprada, unidadCantidad, precioTotal, cantEnvases, contenidoEnvase, unidadEnvase, precioEnvase]);

  const costoMostrado = unidadDeCosto(base);

  async function handleGuardar(e) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Ingresá un nombre.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const comunes = {
        nombre,
        unidad: base,
        stockMinimo: aBase(toNumber(stockMinimo), unidadMinimo),
        precioEnvase: calculo.precioGuardado,
        contenidoEnvase: calculo.contenidoGuardado,
        costoUnitario: calculo.costoUnitario,
        modoCompra: modo,
      };
      if (esEdicion) {
        // Editar los datos de compra actualiza el costo, no el stock: el
        // stock se mueve solo desde "Ajustar stock", que deja movimiento.
        await actualizarInsumo(insumo.id, comunes);
      } else {
        await crearInsumo({ ...comunes, stock: calculo.cantidadBase });
      }
      onGuardado();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el insumo.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar "${insumo.nombre}"? Los platos que lo usan en su receta van a quedar sin ese insumo.`)) return;
    await eliminarInsumo(insumo.id);
    onEliminado();
  }

  async function handleConfirmarAjuste() {
    const cantidad = aBase(toNumber(cantidadAjuste), unidadAjuste);
    if (cantidad <= 0) {
      setError('Ingresá una cantidad mayor a cero.');
      return;
    }
    if (tipoAjuste === 'merma' && !motivoAjuste.trim()) {
      setError('Indicá el motivo de la merma (dañado, vencido, etc.).');
      return;
    }
    setAjustando(true);
    setError('');
    try {
      const delta = tipoAjuste === 'merma' ? -cantidad : cantidad;
      const { movimiento } = await ajustarStock(insumo.id, delta, { tipo: tipoAjuste, motivo: motivoAjuste });
      setMovimientos((prev) => [movimiento, ...prev].slice(0, 5));
      setTipoAjuste(null);
      setCantidadAjuste('');
      setMotivoAjuste('');
      onGuardado({ mantenerAbierto: true });
    } catch (err) {
      setError(err.message || 'No se pudo registrar el ajuste.');
    } finally {
      setAjustando(false);
    }
  }

  const selectorUnidad = (valor, onChange) => (
    <select value={valor} onChange={(e) => onChange(e.target.value)} aria-label="Unidad">
      {opciones.map((u) => (
        <option key={u.id} value={u.id}>{u.label}</option>
      ))}
    </select>
  );

  return (
    <Modal titulo={esEdicion ? 'Editar insumo' : 'Nuevo insumo'} onClose={onClose}>
      <form className="form" onSubmit={handleGuardar}>
        <label className="campo">
          <span>Nombre del insumo</span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Carne picada, Aceite, Pan brioche"
            autoFocus
          />
        </label>

        <div>
          <span className="etiqueta-grupo">¿Cómo se mide?</span>
          <div className="opciones-pago">
            {UNIDADES.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`opcion-pago${base === u.id ? ' is-active' : ''}`}
                onClick={() => cambiarBase(u.id)}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="etiqueta-grupo">¿Cómo lo comprás?</span>
          <div className="segmentado">
            <button type="button" className={modo === 'total' ? 'is-active' : ''} onClick={() => setModo('total')}>
              Cantidad y precio
            </button>
            <button type="button" className={modo === 'envase' ? 'is-active' : ''} onClick={() => setModo('envase')}>
              Por envase
            </button>
          </div>
        </div>

        {modo === 'total' ? (
          <>
            <div className="campo-fila">
              <label className="campo">
                <span>¿Cuánto compraste?</span>
                <div className="campo-con-unidad">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={cantidadComprada}
                    onChange={(e) => setCantidadComprada(e.target.value)}
                    placeholder="0"
                  />
                  {selectorUnidad(unidadCantidad, setUnidadCantidad)}
                </div>
              </label>
            </div>
            <label className="campo">
              <span>¿Cuánto pagaste en total? ($)</span>
              <input
                type="number"
                inputMode="decimal"
                value={precioTotal}
                onChange={(e) => setPrecioTotal(e.target.value)}
                placeholder="$ 0"
              />
            </label>
          </>
        ) : (
          <>
            <div className="campo-fila">
              <label className="campo">
                <span>¿Cuántos envases?</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={cantEnvases}
                  onChange={(e) => setCantEnvases(e.target.value)}
                  placeholder="1"
                />
              </label>
              <label className="campo">
                <span>Precio de cada envase ($)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={precioEnvase}
                  onChange={(e) => setPrecioEnvase(e.target.value)}
                  placeholder="$ 0"
                />
              </label>
            </div>
            <label className="campo">
              <span>¿Cuánto trae cada envase?</span>
              <div className="campo-con-unidad">
                <input
                  type="number"
                  inputMode="decimal"
                  value={contenidoEnvase}
                  onChange={(e) => setContenidoEnvase(e.target.value)}
                  placeholder="0"
                />
                {selectorUnidad(unidadEnvase, setUnidadEnvase)}
              </div>
            </label>
          </>
        )}

        <div className="costo-calculado">
          <small>Costo</small>
          <strong>
            {calculo.costoUnitario > 0
              ? `${formatMoney(calculo.costoUnitario * costoMostrado.factor)} por ${costoMostrado.etiqueta}`
              : '— completá cantidad y precio —'}
          </strong>
          {calculo.cantidadBase > 0 && !esEdicion && (
            <small>
              Entra al stock: {formatearCantidad(calculo.cantidadBase, base)} · gastaste{' '}
              {formatMoney(calculo.gastoTotal)}
            </small>
          )}
        </div>

        <label className="campo">
          <span>Avisarme cuando queden menos de</span>
          <div className="campo-con-unidad">
            <input
              type="number"
              inputMode="decimal"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
            />
            {selectorUnidad(unidadMinimo, setUnidadMinimo)}
          </div>
        </label>

        {esEdicion && (
          <div className="stock-actual">
            Stock actual: <strong>{formatearCantidad(insumo.stock, insumo.unidad)}</strong>
          </div>
        )}

        {error && <p className="mensaje-error">{error}</p>}

        <button type="submit" className="btn btn--primario" disabled={guardando}>
          {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear insumo'}
        </button>
      </form>

      {esEdicion && (
        <div className="seccion-ajuste">
          <h3>Ajustar stock</h3>
          {!tipoAjuste ? (
            <div className="campo-fila">
              <button type="button" className="btn btn--secundario" onClick={() => setTipoAjuste('compra')}>
                + Agregar stock
              </button>
              <button type="button" className="btn btn--peligro-suave" onClick={() => setTipoAjuste('merma')}>
                − Registrar merma
              </button>
            </div>
          ) : (
            <div className="form">
              <label className="campo">
                <span>Cantidad</span>
                <div className="campo-con-unidad">
                  <input
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    value={cantidadAjuste}
                    onChange={(e) => setCantidadAjuste(e.target.value)}
                  />
                  {selectorUnidad(unidadAjuste, setUnidadAjuste)}
                </div>
              </label>
              <label className="campo">
                <span>Motivo {tipoAjuste === 'merma' ? '(obligatorio)' : '(opcional)'}</span>
                <input
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  placeholder={tipoAjuste === 'merma' ? 'Ej: se venció, se cayó' : 'Ej: compra proveedor'}
                />
              </label>
              <div className="campo-fila">
                <button type="button" className="btn btn--fantasma" onClick={() => setTipoAjuste(null)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn--primario" onClick={handleConfirmarAjuste} disabled={ajustando}>
                  {ajustando ? 'Guardando…' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}

          {movimientos.length > 0 && (
            <div className="lista-movimientos">
              <h4>Últimos movimientos</h4>
              {movimientos.map((m) => (
                <div key={m.id} className="movimiento-item">
                  <span>{ETIQUETA_MOVIMIENTO[m.tipo] || m.tipo}</span>
                  <span className={m.delta < 0 ? 'texto-negativo' : 'texto-positivo'}>
                    {m.delta > 0 ? '+' : '−'}
                    {formatearCantidad(Math.abs(m.delta), insumo.unidad)}
                  </span>
                  {m.motivo && <small>{m.motivo}</small>}
                </div>
              ))}
            </div>
          )}

          <button type="button" className="btn btn--texto-peligro" onClick={handleEliminar}>
            Eliminar insumo
          </button>
        </div>
      )}
    </Modal>
  );
}
