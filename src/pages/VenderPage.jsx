import React, { useMemo, useState } from 'react';
import { Plus, Minus, ShoppingCart, Trash2, Zap, Banknote, CreditCard, Smartphone } from 'lucide-react';
import { getPlatos, formatoMoneda } from '../lib/db';
import CerrarVentaModal from './CerrarVentaModal';

const MEDIOS_PAGO = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
  { id: 'mercadopago', label: 'MP / Transf.', icon: Smartphone },
  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
];

export default function VenderPage() {
  const platos = useMemo(() => getPlatos(), []);
  const [carrito, setCarrito] = useState({}); // { platoId: cantidad }
  const [medioPago, setMedioPago] = useState(null);
  const [mostrarCierre, setMostrarCierre] = useState(false);
  const [cobroRapido, setCobroRapido] = useState(false);

  function agregar(plato) {
    setCarrito((c) => ({ ...c, [plato.id]: (c[plato.id] || 0) + 1 }));
  }

  function quitar(plato) {
    setCarrito((c) => {
      const cant = (c[plato.id] || 0) - 1;
      const copia = { ...c };
      if (cant <= 0) delete copia[plato.id];
      else copia[plato.id] = cant;
      return copia;
    });
  }

  function vaciarCarrito() {
    setCarrito({});
    setMedioPago(null);
  }

  const items = Object.entries(carrito)
    .map(([id, cantidad]) => {
      const plato = platos.find((p) => p.id === id);
      return plato ? { plato, cantidad } : null;
    })
    .filter(Boolean);

  const total = items.reduce((acc, it) => acc + it.plato.precio * it.cantidad, 0);
  const cantidadTotal = items.reduce((acc, it) => acc + it.cantidad, 0);

  if (platos.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Todavía no cargaste platos. Andá a la pestaña <strong>Platos</strong> para crear el primero.
      </div>
    );
  }

  return (
    <div className="p-4 pb-28">
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-4">Vender</h1>

      <div className="grid grid-cols-2 gap-3">
        {platos.map((plato) => {
          const cantidad = carrito[plato.id] || 0;
          return (
            <button
              key={plato.id}
              onClick={() => agregar(plato)}
              className={`relative text-left rounded-3xl p-4 border-2 transition-all active:scale-95 ${
                cantidad > 0 ? 'border-mint bg-mint/10' : 'border-transparent bg-white'
              } shadow-sm`}
            >
              {cantidad > 0 && (
                <span className="absolute -top-2 -right-2 bg-mint text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cantidad}
                </span>
              )}
              <p className="font-semibold text-gray-800 leading-tight">{plato.nombre}</p>
              <p className="text-coral font-bold mt-1">{formatoMoneda(plato.precio)}</p>
            </button>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4">
          <div className="max-h-32 overflow-y-auto mb-3 space-y-2">
            {items.map(({ plato, cantidad }) => (
              <div key={plato.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{plato.nombre}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => quitar(plato)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center font-medium">{cantidad}</span>
                  <button onClick={() => agregar(plato)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-2">
            <button onClick={vaciarCarrito} className="flex items-center gap-1 text-gray-400 text-sm">
              <Trash2 size={16} /> Vaciar
            </button>
            <span className="font-bouncy text-lg font-bold text-gray-800">{formatoMoneda(total)}</span>
          </div>

          <p className="text-xs font-medium text-gray-500 mb-1.5">Medio de pago</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {MEDIOS_PAGO.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMedioPago(id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-2xl border-2 transition-colors ${
                  medioPago === id ? 'border-mint bg-mint/10' : 'border-gray-200 bg-white'
                }`}
              >
                <Icon size={18} className={medioPago === id ? 'text-mint' : 'text-gray-500'} />
                <span className="text-[11px] font-medium text-gray-700 text-center">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMostrarCierre(true)}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <ShoppingCart size={18} /> Cobrar ({cantidadTotal})
            </button>
            <button
              onClick={() => {
                if (!medioPago) return;
                setCobroRapido(true);
                setMostrarCierre(true);
              }}
              disabled={!medioPago}
              className="flex-1 bg-cheddar disabled:bg-gray-300 text-gray-900 font-bold py-3 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Zap size={18} /> Cobro rápido
            </button>
          </div>
        </div>
      )}

      {mostrarCierre && (
        <CerrarVentaModal
          items={items}
          total={total}
          medioPagoInicial={medioPago}
          autoConfirmar={cobroRapido}
          onClose={() => {
            setMostrarCierre(false);
            setCobroRapido(false);
          }}
          onVentaConfirmada={() => {
            vaciarCarrito();
            setCobroRapido(false);
          }}
        />
      )}
    </div>
  );
}
