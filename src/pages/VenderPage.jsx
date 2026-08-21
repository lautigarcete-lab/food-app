import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import CerrarVentaModal from './CerrarVentaModal.jsx';
import CierreJornadaModal from './CierreJornadaModal.jsx';
import BurgerMascot from '../components/BurgerMascot.jsx';
import { listarPlatos } from '../db/repositories/platosRepo.js';
import { listarCombos } from '../db/repositories/combosRepo.js';
import { formatMoney } from '../utils/money.js';
import { IconCerrar, IconCierre } from '../components/icons.jsx';

const claveDe = (tipo, refId) => `${tipo}:${refId}`;

const MEDIOS_PAGO_RAPIDO = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'mercadopago', label: 'MP / Transf.' },
  { id: 'tarjeta', label: 'Tarjeta' },
];

export default function VenderPage() {
  const [platos, setPlatos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoria, setCategoria] = useState('todos');
  const [carrito, setCarrito] = useState([]);
  const [verCarrito, setVerCarrito] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [cobroRapido, setCobroRapido] = useState(false);
  const [medioPagoRapido, setMedioPagoRapido] = useState('efectivo');
  const [verCierre, setVerCierre] = useState(false);

  useEffect(() => {
    Promise.all([listarPlatos(), listarCombos()])
      .then(([p, c]) => {
        setPlatos(p);
        setCombos(c);
      })
      .finally(() => setCargando(false));
  }, []);

  const categorias = useMemo(() => {
    const set = new Set(platos.map((p) => p.categoria).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [platos]);

  // Lo que se muestra en el grid: platos filtrados por categoría, o combos.
  const tarjetas = useMemo(() => {
    if (categoria === 'combos') {
      return combos.map((c) => ({ tipo: 'combo', id: c.id, nombre: c.nombre, precio: c.precioEspecial, foto: null }));
    }
    return platos
      .filter((p) => categoria === 'todos' || p.categoria === categoria)
      .map((p) => ({ tipo: 'plato', id: p.id, nombre: p.nombre, precio: p.precio, foto: p.foto }));
  }, [categoria, platos, combos]);

  const total = carrito.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0);
  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  function agregar(tarjeta) {
    setCarrito((prev) => {
      const clave = claveDe(tarjeta.tipo, tarjeta.id);
      const existente = prev.find((i) => claveDe(i.tipo, i.refId) === clave);
      if (existente) {
        return prev.map((i) =>
          claveDe(i.tipo, i.refId) === clave ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [
        ...prev,
        { tipo: tarjeta.tipo, refId: tarjeta.id, nombre: tarjeta.nombre, precioUnitario: tarjeta.precio, cantidad: 1 },
      ];
    });
  }

  function cambiarCantidad(clave, delta) {
    setCarrito((prev) =>
      prev
        .map((i) => (claveDe(i.tipo, i.refId) === clave ? { ...i, cantidad: i.cantidad + delta } : i))
        .filter((i) => i.cantidad > 0)
    );
  }

  function quitar(clave) {
    setCarrito((prev) => prev.filter((i) => claveDe(i.tipo, i.refId) !== clave));
  }

  function cantidadEnCarrito(tarjeta) {
    const item = carrito.find((i) => claveDe(i.tipo, i.refId) === claveDe(tarjeta.tipo, tarjeta.id));
    return item?.cantidad || 0;
  }

  function handleVentaCerrada() {
    setCarrito([]);
    setCobrando(false);
    setCobroRapido(false);
    setVerCarrito(false);
  }

  function iniciarCobroRapido() {
    setCobroRapido(true);
    setCobrando(true);
  }

  const sinCatalogo = !cargando && platos.length === 0 && combos.length === 0;

  return (
    <div className="page">
      <Header
        titulo="Vender"
        accion={
          <div className="header-acciones">
            <button
              type="button"
              className="icon-button"
              onClick={() => setVerCierre(true)}
              aria-label="Cierre de jornada"
            >
              <IconCierre width={20} height={20} />
            </button>
            <BurgerMascot size={48} variant="normal" />
          </div>
        }
      />
      <div className="page__content page__content--venta">
        {cargando ? (
          <p className="ayuda-texto">Cargando…</p>
        ) : sinCatalogo ? (
          <EmptyState
            emoji="🍽️"
            titulo="Primero cargá tu menú"
            descripcion="Andá a Catálogo y creá tus platos. Después vas a poder venderlos de un toque desde acá."
          />
        ) : (
          <>
            <div className="chips">
              <button
                type="button"
                className={categoria === 'todos' ? 'is-active' : ''}
                onClick={() => setCategoria('todos')}
              >
                Todos
              </button>
              {categorias.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={categoria === c ? 'is-active' : ''}
                  onClick={() => setCategoria(c)}
                >
                  {c}
                </button>
              ))}
              {combos.length > 0 && (
                <button
                  type="button"
                  className={categoria === 'combos' ? 'is-active' : ''}
                  onClick={() => setCategoria('combos')}
                >
                  Combos
                </button>
              )}
            </div>

            {tarjetas.length === 0 ? (
              <EmptyState emoji="🔍" titulo="No hay nada en esta categoría" />
            ) : (
              <div className="grid-venta">
                {tarjetas.map((tarjeta) => {
                  const enCarrito = cantidadEnCarrito(tarjeta);
                  return (
                    <button
                      key={claveDe(tarjeta.tipo, tarjeta.id)}
                      type="button"
                      className={`venta-card${enCarrito ? ' is-en-carrito' : ''}`}
                      onClick={() => agregar(tarjeta)}
                    >
                      {enCarrito > 0 && <span className="venta-card__badge">{enCarrito}</span>}
                      <span className="venta-card__nombre">{tarjeta.nombre}</span>
                      <span className="venta-card__precio">{formatMoney(tarjeta.precio)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {carrito.length > 0 && (
        <div className="barra-cobro-rapido">
          <div className="barra-cobro-rapido__fila">
            {MEDIOS_PAGO_RAPIDO.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`opcion-pago opcion-pago--chica${medioPagoRapido === m.id ? ' is-active' : ''}`}
                onClick={() => setMedioPagoRapido(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="barra-cobro-rapido__fila">
            <button type="button" className="barra-cobro-rapido__resumen" onClick={() => setVerCarrito(true)}>
              <strong>{formatMoney(total)}</strong>
              <small>{cantidadTotal} {cantidadTotal === 1 ? 'ítem' : 'ítems'} · ver detalle</small>
            </button>
            <button
              type="button"
              className="btn btn--acento barra-cobro-rapido__rapido"
              onClick={iniciarCobroRapido}
            >
              ⚡ Cobro rápido
            </button>
          </div>
        </div>
      )}

      {verCarrito && (
        <Modal
          titulo="Venta actual"
          onClose={() => setVerCarrito(false)}
          footer={
            <button
              type="button"
              className="btn btn--primario"
              onClick={() => { setVerCarrito(false); setCobrando(true); }}
            >
              Cobrar {formatMoney(total)}
            </button>
          }
        >
          <ul className="lista-carrito">
            {carrito.map((item) => {
              const clave = claveDe(item.tipo, item.refId);
              return (
                <li key={clave} className="carrito-item">
                  <div className="carrito-item__info">
                    <strong>{item.nombre}</strong>
                    <small>{formatMoney(item.precioUnitario)} c/u</small>
                  </div>
                  <div className="carrito-item__acciones">
                    <button type="button" onClick={() => cambiarCantidad(clave, -1)} aria-label="Restar uno">−</button>
                    <span>{item.cantidad}</span>
                    <button type="button" onClick={() => cambiarCantidad(clave, 1)} aria-label="Sumar uno">+</button>
                  </div>
                  <strong className="carrito-item__subtotal">{formatMoney(item.precioUnitario * item.cantidad)}</strong>
                  <button type="button" className="icon-button" onClick={() => quitar(clave)} aria-label="Quitar">
                    <IconCerrar width={16} height={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}

      {cobrando && (
        <CerrarVentaModal
          items={carrito}
          total={total}
          platos={platos}
          combos={combos}
          medioPagoInicial={cobroRapido ? medioPagoRapido : null}
          autoConfirmar={cobroRapido}
          onCancelar={() => {
            setCobrando(false);
            setCobroRapido(false);
          }}
          onVentaCerrada={handleVentaCerrada}
        />
      )}

      {verCierre && <CierreJornadaModal onClose={() => setVerCierre(false)} />}
    </div>
  );
}
