import React, { useState } from 'react';
import { ventasRepo } from '../db/repositories/ventasRepo';
import { formatMoney } from '../utils/money';
import BurgerMascot from '../components/BurgerMascot';

export default function CerrarVentaModal({ carrito, total, medioPagoPreseleccionado, onClose, onVentaCompletada }) {
  const [medioPago, setMedioPago] = useState(medioPagoPreseleccionado || 'Efectivo');
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [ventaExitosa, setVentaExitosa] = useState(null);

  const procesarVenta = async () => {
    const nuevaVenta = {
      fecha: new Date().toISOString(),
      items: carrito,
      total,
      medioPago,
      cliente: nombreCliente.trim() || 'Consumidor Final',
      telefono: telefonoCliente.trim(),
    };

    const guardada = await ventasRepo.guardar(nuevaVenta);
    setVentaExitosa(guardada || nuevaVenta);
  };

  const enviarWhatsApp = () => {
    if (!ventaExitosa) return;
    const lineasItems = ventaExitosa.items.map(i => `• ${i.cantidad}x ${i.nombre} - ${formatMoney(i.precio * i.cantidad)}`).join('%0A');
    const mensaje = `🍔 *¡Gracias por tu compra!*%0A%0A*Detalle del pedido:*%0A${lineasItems}%0A%0A*Total:* ${formatMoney(ventaExitosa.total)}%0A*Medio de Pago:* ${ventaExitosa.medioPago}%0A%0A_¡Que lo disfrutes!_`;

    const tel = telefonoCliente ? telefonoCliente.replace(/\D/g, '') : '';
    const url = tel ? `https://wa.me/${tel}?text=${mensaje}` : `https://wa.me/?text=${mensaje}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {!ventaExitosa ? (
          <>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-black text-gray-900">Confirmar Venta</h2>
              <button onClick={onClose} className="text-gray-400 font-bold text-xl p-1">✕</button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3.5 mb-3 border border-gray-100">
              <div className="flex justify-between font-black text-gray-800 text-lg mb-1">
                <span>Total a Cobrar</span>
                <span className="text-[#10B981]">{formatMoney(total)}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {carrito.reduce((a, b) => a + b.cantidad, 0)} productos en el pedido
              </p>
            </div>

            <label className="block text-[11px] font-black text-gray-700 mb-1 uppercase tracking-wider">Medio de Pago</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['Efectivo', 'Mercado Pago', 'Tarjeta'].map(mp => (
                <button
                  key={mp}
                  type="button"
                  onClick={() => setMedioPago(mp)}
                  className={`py-2 text-xs font-black rounded-xl border transition-all ${
                    medioPago === mp
                      ? 'bg-[#10B981] text-white border-emerald-700 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {mp}
                </button>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <input
                type="text"
                placeholder="Nombre del cliente (opcional)"
                value={nombreCliente}
                onChange={e => setNombreCliente(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
              />
              <input
                type="tel"
                placeholder="Número de WhatsApp para ticket (opcional)"
                value={telefonoCliente}
                onChange={e => setTelefonoCliente(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
              />
            </div>

            <button
              onClick={procesarVenta}
              className="w-full btn-pos bg-[#10B981] hover:bg-emerald-700 text-white py-3.5 text-base font-black shadow-lg shadow-emerald-200 cursor-pointer"
            >
              Registrar Venta ✓
            </button>
          </>
        ) : (
          <div className="text-center py-3">
            <BurgerMascot size={115} variant="success" className="mb-2" />
            <h3 className="text-xl font-black text-gray-900 mb-0.5">¡Venta Registrada!</h3>
            <p className="text-xs text-gray-500 mb-4 font-semibold">Total cobrado: {formatMoney(ventaExitosa.total)} ({ventaExitosa.medioPago})</p>

            <div className="flex flex-col gap-2">
              <button
                onClick={enviarWhatsApp}
                className="w-full btn-pos bg-emerald-500 hover:bg-emerald-600 text-white py-3 font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-100"
              >
                <span>💬</span> Enviar Ticket por WhatsApp
              </button>
              <button
                onClick={onVentaCompletada}
                className="w-full btn-pos bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 font-bold"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
