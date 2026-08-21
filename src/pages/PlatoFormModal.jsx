import React, { useState } from 'react';
import { X, Info, Plus, Minus } from 'lucide-react';
import { savePlato, getInsumos, formatoMoneda } from '../lib/db';

export default function PlatoFormModal({ platoExistente, onClose, onGuardado }) {
  const insumosDisponibles = getInsumos();
  const [nombre, setNombre] = useState(platoExistente?.nombre || '');
  const [precio, setPrecio] = useState(platoExistente?.precio ?? '');
  const [mostrarInsumos, setMostrarInsumos] = useState(
    Boolean(platoExistente?.insumos?.length)
  );
  const [insumosSeleccionados, setInsumosSeleccionados] = useState(
    platoExistente?.insumos || [] // [{ insumoId, cantidad }]
  );

  function cantidadDe(insumoId) {
    return insumosSeleccionados.find((i) => i.insumoId === insumoId)?.cantidad || 0;
  }

  function cambiarCantidad(insumoId, delta) {
    setInsumosSeleccionados((prev) => {
      const actual = cantidadDe(insumoId);
      const nueva = Math.max(0, actual + delta);
      const sinEste = prev.filter((i) => i.insumoId !== insumoId);
      return nueva > 0 ? [...sinEste, { insumoId, cantidad: nueva }] : sinEste;
    });
  }

  const costoEstimado = insumosSeleccionados.reduce((acc, sel) => {
    const insumo = insumosDisponibles.find((i) => i.id === sel.insumoId);
    return acc + (insumo ? insumo.costoUnitario * sel.cantidad : 0);
  }, 0);

  function guardar(e) {
    e.preventDefault();
    const precioNum = parseFloat(precio) || 0;
    if (!nombre.trim() || precioNum <= 0) return;
    const nuevo = savePlato({
      id: platoExistente?.id,
      nombre: nombre.trim(),
      precio: precioNum,
      insumos: insumosSeleccionados,
    });
    onGuardado?.(nuevo);
    onClose?.();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 overflow-y-auto">
      <form onSubmit={guardar} className="bg-cream rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 relative my-6">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400">
          <X size={22} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          {platoExistente ? 'Editar plato' : 'Nuevo plato'}
        </h2>

        <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Cheeseburger clásica"
          className="w-full mb-4 px-4 py-3 rounded-3xl border border-gray-200 bg-white focus:outline-none focus:border-mint"
        />

        <label className="block text-sm font-medium text-gray-600 mb-1">Precio de venta</label>
        <input
          type="number"
          inputMode="decimal"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="$"
          className="w-full mb-5 px-4 py-3 rounded-3xl border border-gray-200 bg-white focus:outline-none focus:border-mint"
        />

        {!mostrarInsumos ? (
          <button
            type="button"
            onClick={() => setMostrarInsumos(true)}
            className="w-full flex items-start gap-2 bg-cheddar/20 border border-cheddar/40 rounded-3xl p-3 text-left mb-2"
          >
            <Info size={18} className="text-cheddar shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">
              <strong>Opcional:</strong> podés asociar insumos para calcular el costo del plato,
              pero no es necesario para guardarlo. Recomendado si querés controlar tu margen.
            </span>
          </button>
        ) : (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Insumos (opcional)</p>
              {insumosDisponibles.length === 0 && (
                <span className="text-xs text-gray-400">No cargaste insumos todavía</span>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-2">
              {insumosDisponibles.map((insumo) => {
                const cantidad = cantidadDe(insumo.id);
                return (
                  <div key={insumo.id} className="flex items-center justify-between bg-white rounded-3xl px-4 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{insumo.nombre}</p>
                      <p className="text-xs text-gray-400">
                        {formatoMoneda(insumo.costoUnitario)} / {insumo.unidad}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => cambiarCantidad(insumo.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{cantidad}</span>
                      <button type="button" onClick={() => cambiarCantidad(insumo.id, 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {insumosSeleccionados.length > 0 && (
              <p className="text-sm text-gray-600 mb-2">
                Costo estimado del plato: <strong>{formatoMoneda(costoEstimado)}</strong>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-mint text-white font-bold py-3 rounded-3xl mt-3 active:scale-95 transition-transform"
        >
          Guardar plato
        </button>
      </form>
    </div>
  );
}
