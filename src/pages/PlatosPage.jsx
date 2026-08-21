import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getPlatos, deletePlato, formatoMoneda } from '../lib/db';
import PlatoFormModal from './PlatoFormModal';

export default function PlatosPage() {
  const [platos, setPlatos] = useState(getPlatos());
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  function refrescar() {
    setPlatos(getPlatos());
  }

  function eliminar(id) {
    deletePlato(id);
    refrescar();
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-bold text-gray-800">Platos</h1>
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

      {platos.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Todavía no cargaste ningún plato.</p>
      ) : (
        <div className="space-y-2">
          {platos.map((plato) => (
            <div key={plato.id} className="bg-white rounded-3xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{plato.nombre}</p>
                <p className="text-coral font-bold text-sm">{formatoMoneda(plato.precio)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditando(plato);
                    setMostrarForm(true);
                  }}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => eliminar(plato.id)}
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
        <PlatoFormModal
          platoExistente={editando}
          onClose={() => setMostrarForm(false)}
          onGuardado={refrescar}
        />
      )}
    </div>
  );
}
