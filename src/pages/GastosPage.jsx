import React, { useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { getGastos, registrarGasto, esMismoDia, formatoMoneda } from '../lib/db';
import CierreJornadaModal from '../components/CierreJornadaModal';

export default function GastosPage() {
  const [gastos, setGastos] = useState(getGastos());
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [mostrarCierre, setMostrarCierre] = useState(false);

  const gastosHoy = gastos
    .filter((g) => esMismoDia(g.fecha))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  function agregarGasto(e) {
    e.preventDefault();
    const montoNum = parseFloat(monto) || 0;
    if (!descripcion.trim() || montoNum <= 0) return;
    registrarGasto({ descripcion: descripcion.trim(), monto: montoNum });
    setGastos(getGastos());
    setDescripcion('');
    setMonto('');
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-bold text-gray-800">Gastos</h1>
        <button
          onClick={() => setMostrarCierre(true)}
          className="flex items-center gap-1.5 bg-mint/10 text-mint font-medium text-sm px-3 py-2 rounded-3xl"
        >
          <ClipboardList size={16} /> Cierre del día
        </button>
      </div>

      <form onSubmit={agregarGasto} className="bg-white rounded-3xl p-4 mb-4 space-y-3">
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción del gasto"
          className="w-full px-4 py-3 rounded-3xl border border-gray-200 focus:outline-none focus:border-mint"
        />
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Monto"
            className="flex-1 px-4 py-3 rounded-3xl border border-gray-200 focus:outline-none focus:border-mint"
          />
          <button type="submit" className="bg-mint text-white rounded-3xl w-12 flex items-center justify-center active:scale-95 transition-transform">
            <Plus size={20} />
          </button>
        </div>
      </form>

      <p className="text-sm font-medium text-gray-500 mb-2">Gastos de hoy</p>
      {gastosHoy.length === 0 ? (
        <p className="text-gray-400 text-center mt-6">Todavía no registraste gastos hoy.</p>
      ) : (
        <div className="space-y-2">
          {gastosHoy.map((g) => (
            <div key={g.id} className="bg-white rounded-3xl p-4 flex items-center justify-between">
              <span className="text-gray-700">{g.descripcion}</span>
              <span className="font-semibold text-coral">-{formatoMoneda(g.monto)}</span>
            </div>
          ))}
        </div>
      )}

      {mostrarCierre && <CierreJornadaModal onClose={() => setMostrarCierre(false)} />}
    </div>
  );
}
