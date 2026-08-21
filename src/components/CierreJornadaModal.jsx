import React, { useMemo } from 'react';
import { X, Share2 } from 'lucide-react';
import BurgerMascot from './BurgerMascot';
import { getVentas, getGastos, esMismoDia, formatoMoneda, compartirPorWhatsApp } from '../lib/db';

const LABELS_MEDIO_PAGO = {
  efectivo: 'Efectivo',
  mercadopago: 'Mercado Pago / Transferencia',
  tarjeta: 'Tarjeta',
};

export default function CierreJornadaModal({ onClose }) {
  const resumen = useMemo(() => {
    const hoy = new Date();
    const ventasHoy = getVentas().filter((v) => esMismoDia(v.fecha, hoy));
    const gastosHoy = getGastos().filter((g) => esMismoDia(g.fecha, hoy));

    const porMedioPago = { efectivo: 0, mercadopago: 0, tarjeta: 0 };
    let totalVentas = 0;
    ventasHoy.forEach((v) => {
      porMedioPago[v.medioPago] = (porMedioPago[v.medioPago] || 0) + v.total;
      totalVentas += v.total;
    });

    const totalGastos = gastosHoy.reduce((acc, g) => acc + g.monto, 0);
    const balanceNeto = totalVentas - totalGastos;

    return { porMedioPago, totalVentas, totalGastos, balanceNeto, cantidadVentas: ventasHoy.length };
  }, []);

  function compartir() {
    const fecha = new Date().toLocaleDateString('es-AR');
    const lineasMedioPago = Object.entries(resumen.porMedioPago)
      .filter(([, monto]) => monto > 0)
      .map(([medio, monto]) => `• ${LABELS_MEDIO_PAGO[medio] || medio}: ${formatoMoneda(monto)}`);

    const texto = [
      `📊 *Cierre de jornada — ${fecha}*`,
      '',
      `Ventas totales: *${formatoMoneda(resumen.totalVentas)}*`,
      ...lineasMedioPago,
      '',
      `Gastos del día: ${formatoMoneda(resumen.totalGastos)}`,
      '',
      `💰 Balance neto: *${formatoMoneda(resumen.balanceNeto)}*`,
    ].join('\n');

    compartirPorWhatsApp(texto, 'Cierre de jornada');
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-cream rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">
          <X size={22} />
        </button>

        <div className="text-center mb-4">
          <BurgerMascot size={100} variant="balance" className="mx-auto mb-2" />
          <h2 className="font-display text-xl font-bold text-gray-800">Cierre de jornada</h2>
          <p className="text-sm text-gray-400">{new Date().toLocaleDateString('es-AR')}</p>
        </div>

        <div className="bg-white rounded-3xl p-4 mb-3 space-y-2">
          {Object.entries(resumen.porMedioPago).map(([medio, monto]) => (
            <div key={medio} className="flex justify-between text-sm">
              <span className="text-gray-600">{LABELS_MEDIO_PAGO[medio]}</span>
              <span className="font-medium text-gray-800">{formatoMoneda(monto)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
            <span className="text-gray-700">Total ventas ({resumen.cantidadVentas})</span>
            <span className="text-mint">{formatoMoneda(resumen.totalVentas)}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 mb-4 flex justify-between text-sm">
          <span className="text-gray-600">Gastos del día</span>
          <span className="font-medium text-coral">-{formatoMoneda(resumen.totalGastos)}</span>
        </div>

        <div className="bg-mint/10 border border-mint/30 rounded-3xl p-4 mb-5 flex justify-between items-center">
          <span className="font-semibold text-gray-700">Balance neto</span>
          <span className="font-bouncy text-2xl font-extrabold text-mint">{formatoMoneda(resumen.balanceNeto)}</span>
        </div>

        <button
          onClick={compartir}
          className="w-full bg-mint text-white font-bold py-3 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Share2 size={18} /> Compartir cierre por WhatsApp
        </button>
      </div>
    </div>
  );
}
