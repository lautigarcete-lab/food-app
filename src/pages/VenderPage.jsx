import React, { useMemo, useState } from 'react';
import { Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { getPlatos, formatoMoneda } from '../lib/db';
import CerrarVentaModal from './CerrarVentaModal';

export default function VenderPage() {
  const platos = useMemo(() => getPlatos(), []);
  const [carrito, setCarrito] = useState({}); // { platoId: cantidad }
  const [mostrarCierre, setMostrarCierre] = useState(false);

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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Vender</h1>

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
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4">
          <div className="max-h-40 overflow-y-auto mb-3 space-y-2">
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
          <div className="flex items-center justify-between mb-3">
            <button onClick={vaciarCarrito} className="flex items-center gap-1 text-gray-400 text-sm">
              <Trash2 size={16} /> Vaciar
            </button>
            <span className="text-lg font-bold text-gray-800">{formatoMoneda(total)}</span>
          </div>
          <button
            onClick={() => setMostrarCierre(true)}
            className="w-full bg-mint text-white font-bold py-3 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <ShoppingCart size={18} /> Cobrar ({cantidadTotal})
          </button>
        </div>
      )}

      {mostrarCierre && (
        <CerrarVentaModal
          items={items}
          total={total}
          onClose={() => setMostrarCierre(false)}
          onVentaConfirmada={() => {
            vaciarCarrito();
          }}
        />
      )}
    </div>
  );
}
