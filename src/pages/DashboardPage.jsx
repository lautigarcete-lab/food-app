import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Plus, ShoppingBag, PieChart, Box, Target } from 'lucide-react';
import NegocioAvatar from '../components/NegocioAvatar.jsx';
import CierreJornadaModal from './CierreJornadaModal.jsx';
import { useNegocio } from '../negocio/NegocioContext.jsx';
import { totalesDeVentas, listarVentas } from '../db/repositories/ventasRepo.js';
import { totalGastos, listarGastos, etiquetaCategoria } from '../db/repositories/gastosRepo.js';
import { listarTareas } from '../db/repositories/organizacionRepo.js';
import { PERIODOS_META, listarMetas, progresoDeMeta } from '../db/repositories/metasRepo.js';
import { BarraMeta } from './MetasPage.jsx';
import { formatMoney } from '../utils/money.js';
import { rangoDelPeriodo, formatearHora, esHoy, formatearFechaCorta, finDelDia } from '../utils/fechas.js';

const MEDIOS = {
  efectivo: 'Efectivo',
  mercadopago: 'Mercado Pago',
  tarjeta: 'Tarjeta',
};

function resumenItems(items) {
  if (!items?.length) return 'Venta';
  const [primero, ...resto] = items;
  const texto = `${primero.cantidad}x ${primero.nombre}`;
  return resto.length ? `${texto} y ${resto.length} más` : texto;
}

function cuando(fecha) {
  return esHoy(fecha) ? formatearHora(fecha) : formatearFechaCorta(fecha);
}

export default function DashboardPage({ setView }) {
  const { negocioActivo } = useNegocio();
  const [balance, setBalance] = useState(0);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [verCierre, setVerCierre] = useState(false);
  const [recordatorio, setRecordatorio] = useState(null);
  const [metas, setMetas] = useState([]);
  const [periodoMeta, setPeriodoMeta] = useState('mes');

  useEffect(() => {
    let cancelado = false;
    const rango = rangoDelPeriodo('dia');

    Promise.all([totalesDeVentas(rango), totalGastos(rango), listarVentas(rango), listarGastos(rango)])
      .then(([ventas, gastos, listaVentas, listaGastos]) => {
        if (cancelado) return;
        // Balance en caja del turno: lo efectivamente cobrado menos los gastos.
        setBalance(ventas.cobrado - gastos);

        const deVentas = listaVentas.map((v) => ({
          id: v.id,
          title: resumenItems(v.items),
          time: v.tipoPago === 'fiado' ? 'Fiado' : MEDIOS[v.medioPago] || 'Cobrado',
          monto: v.total,
          fecha: v.fecha,
          type: 'in',
        }));
        const deGastos = listaGastos.map((g) => ({
          id: g.id,
          title: g.descripcion?.trim() || etiquetaCategoria(g.categoria).label,
          time: 'Gasto',
          monto: g.monto,
          fecha: g.fecha,
          type: 'out',
        }));

        setMovimientos(
          [...deVentas, ...deGastos]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 4)
        );
        setCargando(false);
      })
      .catch(() => !cancelado && setCargando(false));

    // Recordatorio del día: la tarea pendiente más próxima que vence hoy (o
    // que ya venció). Si no hay ninguna no se muestra nada.
    const limite = finDelDia();
    listarTareas()
      .then((tareas) => {
        if (cancelado) return;
        const pendientes = tareas.filter((t) => !t.hecha && new Date(t.fecha) <= limite);
        setRecordatorio(
          pendientes.length ? { texto: pendientes[0].texto, otras: pendientes.length - 1 } : null
        );
      })
      .catch(() => {});

    // Metas de venta: se muestra el avance de las que estén cargadas.
    listarMetas()
      .then(async (lista) => {
        const avances = await Promise.all(
          lista.map(async (m) => ({ ...(await progresoDeMeta(m.id, m.monto)) }))
        );
        if (!cancelado) setMetas(avances);
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, []);

  // Si solo hay una meta cargada se muestra esa, sin selector.
  const metaVisible = metas.find((m) => m.periodo === periodoMeta) || metas[0] || null;

  const acciones = [
    { name: 'Vender', icon: Plus, color: 'text-fudi-red', bg: 'bg-red-50', action: () => setView('vender') },
    { name: 'Catálogo', icon: ShoppingBag, color: 'text-fudi-yellow', bg: 'bg-amber-50', action: () => setView('catalogo') },
    { name: 'Insumos', icon: Box, color: 'text-fudi-red', bg: 'bg-red-50', action: () => setView('insumos') },
    { name: 'Cierre', icon: PieChart, color: 'text-fudi-yellow', bg: 'bg-amber-50', action: () => setVerCierre(true) },
  ];

  return (
    <div className="min-h-screen bg-fudi-bg pb-32 lg:pb-10 lg:pt-2 font-sans">
      {/* Header */}
      <div className="px-6 pt-12 lg:pt-6 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-4 min-w-0">
          <NegocioAvatar negocio={negocioActivo} size={56} />
          <div className="min-w-0">
            {recordatorio && (
              <p className="text-xs font-medium text-fudi-muted/60 truncate">
                {recordatorio.texto}
                {recordatorio.otras > 0 && ` +${recordatorio.otras}`}
              </p>
            )}
            <h1 className="text-2xl font-extrabold text-fudi-text truncate">
              {negocioActivo?.nombre || 'Fudi'}
            </h1>
          </div>
        </div>
      </div>

      {/* Tarjeta Principal */}
      <div className="px-6 mt-4">
        <div className="bg-gradient-to-br from-fudi-red to-fudi-red-dark rounded-[32px] p-8 text-white relative overflow-hidden shadow-soft">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-fudi-yellow rounded-full opacity-90"></div>
          <div className="absolute right-12 top-10 w-8 h-8 rounded-full border-2 border-white/30"></div>
          <div className="absolute left-6 bottom-6 w-2 h-2 bg-white/50 rounded-full"></div>

          <p className="text-white/80 text-sm font-medium relative z-10">Balance en Caja</p>
          <h2 className="text-4xl font-black mt-2 mb-8 relative z-10 tracking-tight">
            {cargando ? '—' : formatMoney(balance)}
          </h2>

          <div className="flex justify-between items-end relative z-10">
            <p className="text-sm font-medium opacity-90">Turno Actual</p>
            <p className="text-sm font-bold tracking-widest opacity-80">Abierto</p>
          </div>
        </div>
      </div>

      {/* Meta de ventas */}
      <div className="px-6 mt-6">
        {metaVisible ? (
          <button
            type="button"
            onClick={() => setView('metas')}
            className="w-full text-left bg-white rounded-[28px] p-5 shadow-soft"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-base font-bold text-fudi-text">
                {metaVisible.periodo === 'dia' ? 'Meta de hoy' : 'Meta del mes'}
              </h3>
              {metas.length > 1 && (
                <div className="flex gap-1 shrink-0">
                  {PERIODOS_META.map((p) => (
                    <span
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPeriodoMeta(p.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          e.preventDefault();
                          setPeriodoMeta(p.id);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                        periodoMeta === p.id
                          ? 'bg-fudi-red text-white'
                          : 'bg-fudi-red/5 text-fudi-muted'
                      }`}
                    >
                      {p.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <BarraMeta avance={metaVisible} />

            <p className="text-xs font-medium text-fudi-muted mt-3">
              {metaVisible.cumplida ? (
                <>Llevás {formatMoney(metaVisible.cobrado)}. Todo lo que venga es de más.</>
              ) : metaVisible.periodo === 'dia' ? (
                <>Te faltan {formatMoney(metaVisible.falta)} para cerrar el día.</>
              ) : (
                <>
                  Te faltan {formatMoney(metaVisible.falta)} en {metaVisible.diasRestantes}{' '}
                  {metaVisible.diasRestantes === 1 ? 'día' : 'días'}:{' '}
                  {formatMoney(metaVisible.porDia)} por día.
                </>
              )}
            </p>
          </button>
        ) : (
          !cargando && (
            <button
              type="button"
              onClick={() => setView('metas')}
              className="w-full flex items-center gap-3 bg-white rounded-[28px] p-5 shadow-soft text-left"
            >
              <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-fudi-red shrink-0">
                <Target size={22} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-fudi-text">Poné una meta de ventas</p>
                <p className="text-xs font-medium text-fudi-muted mt-0.5">
                  Y mirá acá cuánto te falta para llegar.
                </p>
              </div>
            </button>
          )
        )}
      </div>

      {/* Acciones Rápidas */}
      <div className="px-6 mt-8">
        <h3 className="text-lg font-bold text-fudi-text mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-4 gap-4 max-w-[420px]">
          {acciones.map((action, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer" onClick={action.action}>
              <div className={`w-16 h-16 ${action.bg} rounded-[24px] flex items-center justify-center shadow-sm transition-transform active:scale-95`}>
                <action.icon className={action.color} size={28} strokeWidth={2.5} />
              </div>
              <span className="text-[12px] font-semibold text-fudi-muted">{action.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Últimos Movimientos */}
      <div className="px-6 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-fudi-text">Últimos Movimientos</h3>
        </div>

        <div className="bg-white rounded-[32px] p-3 shadow-soft space-y-2">
          {cargando ? (
            <p className="p-4 text-sm font-medium text-fudi-muted">Cargando…</p>
          ) : movimientos.length === 0 ? (
            <p className="p-4 text-sm font-medium text-fudi-muted">
              Todavía no hubo movimientos hoy.
            </p>
          ) : (
            movimientos.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 p-4 rounded-[24px] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 ${
                      tx.type === 'in' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-fudi-red'
                    }`}
                  >
                    {tx.type === 'in' ? (
                      <ArrowDownRight size={24} strokeWidth={2.5} />
                    ) : (
                      <ArrowUpRight size={24} strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-fudi-text truncate">{tx.title}</h4>
                    <p className="text-xs font-medium text-fudi-muted mt-0.5">
                      {tx.time} · {cuando(tx.fecha)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-base font-black shrink-0 ${
                    tx.type === 'in' ? 'text-green-600' : 'text-fudi-text'
                  }`}
                >
                  {tx.type === 'in' ? '+' : '−'}
                  {formatMoney(tx.monto)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {verCierre && <CierreJornadaModal onClose={() => setVerCierre(false)} />}
    </div>
  );
}
