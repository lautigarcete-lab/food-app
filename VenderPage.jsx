import React, { useState, useEffect } from 'react';
import { platosRepo } from '../db/repositories/platosRepo';
import { combosRepo } from '../db/repositories/combosRepo';
import { formatMoney } from '../utils/money';
import BurgerMascot from '../components/BurgerMascot';
import CerrarVentaModal from './CerrarVentaModal';
import CierreJornadaModal from '../components/CierreJornadaModal';

export default function VenderPage() {
  const [catalogo, setCatalogo] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [modalCobro, setModalCobro] = useState(false);
  const [modalCierre, setModalCierre] = useState(false);
  const [medioPagoDirecto, setMedioPagoDirecto] = useState('Efectivo');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    const p = await platosRepo.listar();
    const c = await combosRepo.listar();
    setCatalogo([...(p || []), ...(c || []).map(item => ({ ...item, esCombo: true }))]);
  };

  const agregarAlCarrito = (item) => {
    setCarrito(prev => {
      const existe = prev.find(x => x.id === item.id);
      if (existe) {
        return prev.map(x => x.id === item.id ? { ...x, cantidad: x.cantidad + 1 } : x);
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto pb-20 bg-[#FDFBF7]">
      {/* Header FUDI POS */}
      <div className="bg-[#10B981] text-white px-4 py-3 rounded-b-3xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BurgerMascot size={52} variant="normal" />
          <div>
            <h1 className="text-lg font-black leading-tight">FUDI POS</h1>
            <p className="text-[11px] text-emerald-100 font-medium">Caja de Cobro Rápido</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setModalCierre(true)}
            className="text-xs bg-emerald-700/90 text-white px-2.5 py-1.5 rounded-xl font-bold active:scale-95 flex items-center gap-1 shadow-sm"
          >
            <span>📊</span> Cierre
          </button>
          {carrito.length > 0 && (
            <button
              onClick={() => setCarrito([])}
              className="text-xs bg-red-500/90 text-white px-2.5 py-1.5 rounded-xl font-bold active:scale-95 shadow-sm"
            >
              Vaciar
            </button>
          )}
        </div>
      </div>

      {/* Categorías */}
      <div className="flex gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar">
        {['todos', 'platos', 'combos'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-black capitalize transition-all shrink-0 ${
              filtroCategoria === cat
                ? 'bg-[#10B981] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catálogo en Grilla */}
      <div className="flex-1 overflow-y-auto px-3 grid grid-cols-2 gap-2.5 pb-4">
        {catalogo
          .filter(item => {
            if (filtroCategoria === 'platos') return !item.esCombo;
            if (filtroCategoria === 'combos') return item.esCombo;
            return true;
          })
          .map(item => {
            const enCarrito = carrito.find(x => x.id === item.id);
            return (
              <button
                key={item.id}
                onClick={() => agregarAlCarrito(item)}
                className={`card-soft p-3 text-left flex flex-col justify-between relative active:scale-95 transition-all ${
                  enCarrito ? 'border-[#10B981] bg-emerald-50/50' : 'bg-white'
                }`}
              >
                {enCarrito && (
                  <span className="absolute top-2 right-2 bg-[#10B981] text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow">
                    {enCarrito.cantidad}
                  </span>
                )}
                <div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block mb-0.5">
                    {item.esCombo ? '🔥 Combo' : '🍔 Plato'}
                  </span>
                  <h3 className="font-black text-gray-800 text-sm line-clamp-2 leading-tight">{item.nombre}</h3>
                </div>
                <div className="mt-3">
                  <span className="text-base font-black text-gray-900">{formatMoney(item.precio)}</span>
                </div>
              </button>
            );
          })}
      </div>

      {/* Barra de Cobro Fija */}
      <div className="bg-white border-t border-gray-100 p-3 rounded-t-3xl shadow-xl">
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          {['Efectivo', 'Mercado Pago', 'Tarjeta'].map(medio => (
            <button
              key={medio}
              onClick={() => setMedioPagoDirecto(medio)}
              className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                medioPagoDirecto === medio
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              {medio === 'Efectivo' ? '💵 ' : medio === 'Mercado Pago' ? '📱 ' : '💳 '}
              {medio}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <span className="text-[10px] text-gray-400 font-bold block uppercase">Total a Cobrar</span>
            <span className="text-2xl font-black text-gray-900 leading-none">{formatMoney(total)}</span>
          </div>
          <button
            disabled={carrito.length === 0}
            onClick={() => setModalCobro(true)}
            className={`btn-pos px-6 py-3.5 flex items-center justify-center gap-2 text-white shadow-lg ${
              carrito.length > 0
                ? 'bg-[#10B981] hover:bg-emerald-700 shadow-emerald-200 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <span className="text-base font-black">Cobrar</span>
            <span className="text-sm">👉</span>
          </button>
        </div>
      </div>

      {modalCobro && (
        <CerrarVentaModal
          carrito={carrito}
          total={total}
          medioPagoPreseleccionado={medioPagoDirecto}
          onClose={() => setModalCobro(false)}
          onVentaCompletada={() => {
            setCarrito([]);
            setModalCobro(false);
          }}
        />
      )}

      {modalCierre && (
        <CierreJornadaModal onClose={() => setModalCierre(false)} />
      )}
    </div>
  );
}
