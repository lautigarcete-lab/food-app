import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNegocio } from '../negocio/NegocioContext.jsx';
import { totalesDeVentas, resumenDeClientes, listarVentas } from '../db/repositories/ventasRepo.js';
import { totalGastos } from '../db/repositories/gastosRepo.js';
import { listarInsumos, estaBajoStock } from '../db/repositories/insumosRepo.js';
import { formatMoney } from '../utils/money.js';
import { rangoDelPeriodo, esHoy, formatearFechaCorta, formatearHora } from '../utils/fechas.js';
import { IconAlerta, IconInsumos, IconGastos, IconClientes, IconTareas, IconCuenta } from '../components/icons.jsx';

const PERIODOS = [
  { id: 'dia', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
];

const ACCESOS_RAPIDOS = [
  { id: 'insumos', label: 'Insumos', Icon: IconInsumos },
  { id: 'gastos', label: 'Gastos', Icon: IconGastos },
  { id: 'clientes', label: 'Clientes', Icon: IconClientes },
  { id: 'tareas', label: 'Tareas', Icon: IconTareas },
];

function resumenItems(items) {
  if (!items?.length) return 'Venta';
  const [primero, ...resto] = items;
  const texto = `${primero.cantidad}x ${primero.nombre}`;
  return resto.length ? `${texto} y ${resto.length} más` : texto;
}

function fechaCorta(fecha) {
  return esHoy(fecha) ? `Hoy, ${formatearHora(fecha)}` : formatearFechaCorta(fecha);
}

export default function InicioPage({ onIr }) {
  const { usuario } = useAuth();
  const { negocioActivo } = useNegocio();
  const [periodo, setPeriodo] = useState('dia');
  const [ventas, setVentas] = useState({ total: 0, cantidad: 0, cobrado: 0, fiadoPendiente: 0 });
  const [gastos, setGastos] = useState(0);
  const [bajoStock, setBajoStock] = useState([]);
  const [deudaTotal, setDeudaTotal] = useState(0);
  const [ultimasVentas, setUltimasVentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);

    const rango = rangoDelPeriodo(periodo);
    Promise.all([
      totalesDeVentas(rango),
      totalGastos(rango),
      listarInsumos(),
      resumenDeClientes(),
      listarVentas(rango),
    ]).then(([totalesVentas, totalDeGastos, insumos, resumenClientes, listaVentas]) => {
      if (cancelado) return;
      setVentas(totalesVentas);
      setGastos(totalDeGastos);
      setBajoStock(insumos.filter(estaBajoStock));
      setUltimasVentas(listaVentas.slice(0, 4));
      let deuda = 0;
      resumenClientes.forEach((r) => {
        deuda += r.deuda;
      });
      setDeudaTotal(deuda);
      setCargando(false);
    });

    return () => {
      cancelado = true;
    };
  }, [periodo]);

  const ganancia = ventas.total - gastos;
  const nombre = usuario?.displayName?.split(' ')[0] || negocioActivo?.nombre || 'Fudi';
  const inicial = nombre.charAt(0).toUpperCase();

  return (
    <div className="page">
      <header className="inicio-header">
        <div className="inicio-header__saludo">
          <span className="inicio-header__avatar">{inicial}</span>
          <div>
            <small>Hola,</small>
            <strong>{nombre}</strong>
          </div>
        </div>
        <button type="button" className="icon-button" onClick={() => onIr('cuenta')} aria-label="Cuenta">
          <IconCuenta width={20} height={20} />
        </button>
      </header>

      <div className="page__content">
        {cargando ? (
          <p className="ayuda-texto">Cargando…</p>
        ) : (
          <>
            <div className={`tarjeta-hero${ganancia < 0 ? ' es-negativa' : ''}`}>
              <small className="tarjeta-hero__etiqueta">Ganancia neta</small>
              <strong className="tarjeta-hero__monto">{formatMoney(ganancia)}</strong>
              <small className="tarjeta-hero__detalle">
                {ventas.cantidad === 0
                  ? 'Todavía no vendiste nada en este período'
                  : `${ventas.cantidad} ${ventas.cantidad === 1 ? 'venta' : 'ventas'} · ${formatMoney(gastos)} en gastos`}
              </small>

              <div className="tarjeta-hero__acciones">
                <button type="button" className="btn btn--acento" onClick={() => onIr('vender')}>
                  Vender
                </button>
                <button type="button" className="btn btn--fantasma-claro" onClick={() => onIr('vender')}>
                  Cierre de caja
                </button>
              </div>

              <div className="tarjeta-hero__periodos">
                {PERIODOS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={periodo === p.id ? 'is-active' : ''}
                    onClick={() => setPeriodo(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="accesos-rapidos">
              {ACCESOS_RAPIDOS.map(({ id, label, Icon }) => (
                <button key={id} type="button" className="acceso-rapido" onClick={() => onIr(id)}>
                  <span className="acceso-rapido__icono">
                    <Icon width={22} height={22} />
                  </span>
                  {label}
                </button>
              ))}
            </div>

            {ventas.fiadoPendiente > 0 && (
              <div className="tarjeta-resumen tarjeta-resumen--ancha">
                <small>Entró en efectivo/transferencia</small>
                <strong>{formatMoney(ventas.cobrado)}</strong>
              </div>
            )}

            {(bajoStock.length > 0 || deudaTotal > 0) && (
              <>
                <h3 className="titulo-seccion">Para tener en cuenta</h3>
                {bajoStock.length > 0 && (
                  <button type="button" className="aviso-accion" onClick={() => onIr('insumos')}>
                    <IconAlerta width={20} height={20} />
                    <div>
                      <strong>
                        {bajoStock.length} {bajoStock.length === 1 ? 'insumo bajo' : 'insumos bajos'} de stock
                      </strong>
                      <small>{bajoStock.map((i) => i.nombre).join(', ')}</small>
                    </div>
                  </button>
                )}

                {deudaTotal > 0 && (
                  <button type="button" className="aviso-accion" onClick={() => onIr('clientes')}>
                    <span className="aviso-accion__emoji">📒</span>
                    <div>
                      <strong>Te deben {formatMoney(deudaTotal)}</strong>
                      <small>Tocá para ver quién y registrar los pagos</small>
                    </div>
                  </button>
                )}
              </>
            )}

            <h3 className="titulo-seccion">Ventas recientes</h3>
            {ultimasVentas.length === 0 ? (
              <p className="ayuda-texto">Todavía no hay ventas en este período.</p>
            ) : (
              <div className="tarjeta-lista">
                {ultimasVentas.map((v) => (
                  <div key={v.id} className="movimiento-venta">
                    <span className="movimiento-venta__icono">🧾</span>
                    <div className="movimiento-venta__info">
                      <strong>{resumenItems(v.items)}</strong>
                      <small>{fechaCorta(v.fecha)}</small>
                    </div>
                    <strong className="movimiento-venta__monto">{formatMoney(v.total)}</strong>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
