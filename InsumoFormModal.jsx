import React, { useState, useEffect } from 'react';
import { insumosRepo } from '../db/repositories/insumosRepo';
import { formatMoney } from '../utils/money';
import BurgerMascot from '../components/BurgerMascot';

export default function InsumoFormModal({ insumoEditar, onClose, onGuardado }) {
  const [nombre, setNombre] = useState('');
  const [precioEnvase, setPrecioEnvase] = useState('');
  const [contenidoEnvase, setContenidoEnvase] = useState('');
  const [unidad, setUnidad] = useState('gr');
  const [stockActualEnvases, setStockActualEnvases] = useState('1');

  useEffect(() => {
    if (insumoEditar) {
      setNombre(insumoEditar.nombre || '');
      setPrecioEnvase(insumoEditar.precioEnvase || insumoEditar.costoTotal || '');
      setContenidoEnvase(insumoEditar.contenidoEnvase || insumoEditar.cantidadBase || '');
      setUnidad(insumoEditar.unidad || 'gr');
      setStockActualEnvases(insumoEditar.stockEnvases || '1');
    }
  }, [insumoEditar]);

  const precioNum = parseFloat(precioEnvase) || 0;
  const contenidoNum = parseFloat(contenidoEnvase) || 0;
  const costoUnitarioBase = (precioNum > 0 && contenidoNum > 0) ? (precioNum / contenidoNum) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || precioNum <= 0 || contenidoNum <= 0) return;

    const datosInsumo = {
      nombre: nombre.trim(),
      precioEnvase: precioNum,
      contenidoEnvase: contenidoNum,
      unidad,
      costoUnitario: costoUnitarioBase,
      stockEnvases: parseFloat(stockActualEnvases) || 0,
      stockTotalBase: (parseFloat(stockActualEnvases) || 0) * contenidoNum
    };

    if (insumoEditar?.id) {
      await insumosRepo.actualizar(insumoEditar.id, datosInsumo);
    } else {
      await insumosRepo.crear(datosInsumo);
    }

    onGuardado();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <BurgerMascot size={40} variant="normal" />
            <h2 className="text-lg font-black text-gray-900">
              {insumoEditar ? 'Editar Insumo' : 'Nuevo Insumo'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 font-bold text-xl p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
              Nombre del Insumo
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Azúcar Mascabo, Pan Brioche, Queso Cheddar"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
              Unidad de Medida
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gr', label: 'Gramos (gr)' },
                { id: 'ml', label: 'Mililitros (ml)' },
                { id: 'u', label: 'Unidades (u)' }
              ].map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUnidad(u.id)}
                  className={`py-2 text-xs font-black rounded-xl border ${
                    unidad === u.id
                      ? 'bg-[#10B981] text-white border-emerald-700'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                Contenido por Envase
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Ej: 800 o 1000"
                  value={contenidoEnvase}
                  onChange={e => setContenidoEnvase(e.target.value)}
                  className="w-full text-sm font-semibold px-3 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400 uppercase">
                  {unidad}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                Precio del Envase ($)
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="Ej: 1500"
                value={precioEnvase}
                onChange={e => setPrecioEnvase(e.target.value)}
                className="w-full text-sm font-semibold px-3 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
              />
            </div>
          </div>

          {costoUnitarioBase > 0 && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-amber-900">Costo real calculado:</span>
                <span className="text-sm font-black text-amber-900">
                  {formatMoney(costoUnitarioBase)} <span className="text-xs font-normal">por {unidad}</span>
                </span>
              </div>
              <p className="text-[11px] text-amber-700 mt-0.5">
                (Si usas 100 {unidad} en un plato, costará {formatMoney(costoUnitarioBase * 100)})
              </p>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
              Envases en Stock
            </label>
            <input
              type="number"
              step="any"
              value={stockActualEnvases}
              onChange={e => setStockActualEnvases(e.target.value)}
              className="w-full text-sm font-semibold px-3 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-pos bg-[#10B981] hover:bg-emerald-700 text-white py-3 font-black text-base shadow-lg shadow-emerald-200 mt-2"
          >
            Guardar Insumo ✓
          </button>
        </form>
      </div>
    </div>
  );
}
