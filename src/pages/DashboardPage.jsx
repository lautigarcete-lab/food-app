import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Plus, ShoppingBag, PieChart, Box } from 'lucide-react';
import NegocioAvatar from '../components/NegocioAvatar.jsx';
import CierreJornadaModal from './CierreJornadaModal.jsx';
import { useNegocio } from '../negocio/NegocioContext.jsx';
import { totalesDeVentas, listarVentas } from '../db/repositories/ventasRepo.js';
import { totalGastos, listarGastos, etiquetaCategoria } from '../db/repositories/gastosRepo.js';
import { listarTareas } from '../db/repositories/organizacionRepo.js';
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

    return () => {
      cancelado = true;
    };
  }, []);

  const acciones = [
    { name: 'Vender', icon: Plus, color: 'text-fudi-red', bg: 'bg-red-50', action: () => setView('vender') },
    { name: 'Catálogo', icon: ShoppingBag, color: 'text-fudi-yellow', bg: 'bg-amber-50', action: () => setView('catalogo') },
    { name: 'Insumos', icon: Box, color: 'text-fudi-red', bg: 'bg-red-50', action: () => setView('insumos') },
    { name: 'Cierre', icon: PieChart, color: 'text-fudi-yellow', bg: 'bg-amber-50', action: () => setVerCierre(true) },
  ];

  return (
    <div className="min-h-screen bg-fudi-bg pb-32 font-sans">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center">
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

      {/* Acciones Rápidas */}
      <div className="px-6 mt-8">
        <h3 className="text-lg font-bold text-fudi-text mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-4 gap-4">
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
