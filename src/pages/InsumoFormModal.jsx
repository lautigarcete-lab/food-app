import React, { useState } from 'react';
import { X } from 'lucide-react';
import { saveInsumo, formatoMoneda } from '../lib/db';

const UNIDADES = [
  { id: 'gr', label: 'Gramos (gr)' },
  { id: 'ml', label: 'Mililitros (ml)' },
  { id: 'u', label: 'Unidades (u)' },
];

export default function InsumoFormModal({ insumoExistente, onClose, onGuardado }) {
  const [nombre, setNombre] = useState(insumoExistente?.nombre || '');
  const [precio, setPrecio] = useState(insumoExistente?.precio ?? '');
  const [contenido, setContenido] = useState(insumoExistente?.contenido ?? '');
  const [unidad, setUnidad] = useState(insumoExistente?.unidad || 'gr');
  const [stock, setStock] = useState(insumoExistente?.stock ?? '');

  const precioNum = parseFloat(precio) || 0;
  const contenidoNum = parseFloat(contenido) || 0;
  const stockNum = parseFloat(stock) || 0;
  const costoUnitario = contenidoNum > 0 ? precioNum / contenidoNum : 0;

  function guardar(e) {
    e.preventDefault();
    if (!nombre.trim() || precioNum <= 0 || contenidoNum <= 0) return;
    const nuevo = saveInsumo({
      id: insumoExistente?.id,
      nombre: nombre.trim(),
      precio: precioNum,
      contenido: contenidoNum,
      unidad,
      stock: stockNum,
    });
    onGuardado?.(nuevo);
    onClose?.();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <form onSubmit={guardar} className="bg-cream rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400">
          <X size={22} />
        </button>

        <h2 className="font-display text-xl font-bold text-gray-800 mb-5">
          {insumoExistente ? 'Editar insumo' : 'Nuevo insumo'}
        </h2>

        <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Pan de brioche"
          className="w-full mb-4 px-4 py-3 rounded-3xl border border-gray-200 bg-white focus:outline-none focus:border-mint"
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Precio del envase</label>
            <input
              type="number"
              inputMode="decimal"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="$"
              className="w-full px-4 py-3 rounded-3xl border border-gray-200 bg-white focus:outline-none focus:border-mint"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Contenido del envase</label>
            <input
              type="number"
              inputMode="decimal"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Cantidad"
              className="w-full px-4 py-3 rounded-3xl border border-gray-200 bg-white focus:outline-none focus:border-mint"
            />
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-600 mb-1">Unidad</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {UNIDADES.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setUnidad(u.id)}
              className={`py-2 rounded-3xl border-2 text-sm font-medium ${
                unidad === u.id ? 'border-mint bg-mint/10 text-mint' : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              {u.id}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-gray-600 mb-1">Stock de envases/paquetes</label>
        <input
          type="number"
          inputMode="decimal"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Cantidad de envases en stock"
          className="w-full mb-5 px-4 py-3 rounded-3xl border border-gray-200 bg-white focus:outline-none focus:border-mint"
        />

        <div className="bg-cheddar/20 border border-cheddar/40 rounded-3xl p-3 mb-5 text-sm text-gray-700">
          Costo unitario: <strong>{formatoMoneda(costoUnitario)}</strong> por {unidad}
        </div>

        <button
          type="submit"
          className="w-full bg-mint text-white font-bold py-3 rounded-3xl active:scale-95 transition-transform"
        >
          Guardar insumo
        </button>
      </form>
    </div>
  );
}
