import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getInsumos, deleteInsumo, formatoMoneda } from '../lib/db';
import InsumoFormModal from './InsumoFormModal';

export default function InsumosPage() {
  const [insumos, setInsumos] = useState(getInsumos());
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  function refrescar() {
    setInsumos(getInsumos());
  }

  function eliminar(id) {
    deleteInsumo(id);
    refrescar();
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-bold text-gray-800">Insumos</h1>
        <button
          onClick={() => {
            setEditando(null);
            setMostrarForm(true);
          }}
          className="bg-mint text-white rounded-full w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {insumos.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Todavía no cargaste ningún insumo.</p>
      ) : (
        <div className="space-y-2">
          {insumos.map((insumo) => (
            <div key={insumo.id} className="bg-white rounded-3xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{insumo.nombre}</p>
                <p className="text-gray-400 text-sm">
                  {formatoMoneda(insumo.costoUnitario)} / {insumo.unidad} · Stock: {insumo.stock ?? 0} envases
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditando(insumo);
                    setMostrarForm(true);
                  }}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => eliminar(insumo.id)}
                  className="w-9 h-9 rounded-full bg-coral/10 text-coral flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarForm && (
        <InsumoFormModal
          insumoExistente={editando}
          onClose={() => setMostrarForm(false)}
          onGuardado={refrescar}
        />
      )}
    </div>
  );
}
