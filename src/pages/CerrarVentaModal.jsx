import React, { useEffect, useState } from 'react';
import { Banknote, CreditCard, Smartphone, X, Share2 } from 'lucide-react';
import BurgerMascot from '../components/BurgerMascot';
import { registrarVenta, formatoMoneda, compartirPorWhatsApp } from '../lib/db';

const MEDIOS_PAGO = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
  { id: 'mercadopago', label: 'Mercado Pago / Transferencia', icon: Smartphone },
  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
];

function armarTextoTicket(items, total, medioPago) {
  const medio = MEDIOS_PAGO.find((m) => m.id === medioPago)?.label || medioPago;
  const lineas = items.map(
    (it) => `• ${it.cantidad}x ${it.plato.nombre} — ${formatoMoneda(it.plato.precio * it.cantidad)}`
  );
  return [
    '🍔 *Ticket Fudi POS*',
    '',
    ...lineas,
    '',
    `Total: *${formatoMoneda(total)}*`,
    `Medio de pago: ${medio}`,
    '',
    `¡Gracias por tu compra!`,
  ].join('\n');
}

export default function CerrarVentaModal({
  items,
  total,
  onClose,
  onVentaConfirmada,
  medioPagoInicial = null,
  autoConfirmar = false,
}) {
  const [medioPago, setMedioPago] = useState(medioPagoInicial);
  const [confirmada, setConfirmada] = useState(false);
  // Snapshot de lo cobrado: items/total son props "en vivo" y el padre suele
  // vaciar el carrito apenas se confirma la venta, así que sin esto la
  // pantalla de éxito y el ticket de WhatsApp quedarían mostrando $0.
  const [ventaConfirmada, setVentaConfirmada] = useState(null);

  function confirmarCobro(medio) {
    const medioAUsar = medio || medioPago;
    if (!medioAUsar) return;
    registrarVenta({
      items: items.map((it) => ({ platoId: it.plato.id, nombre: it.plato.nombre, precio: it.plato.precio, cantidad: it.cantidad })),
      total,
      medioPago: medioAUsar,
    });
    setVentaConfirmada({ items, total, medioPago: medioAUsar });
    setConfirmada(true);
    onVentaConfirmada?.();
  }

  useEffect(() => {
    if (autoConfirmar && medioPagoInicial) {
      confirmarCobro(medioPagoInicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function compartir() {
    const texto = armarTextoTicket(ventaConfirmada.items, ventaConfirmada.total, ventaConfirmada.medioPago);
    compartirPorWhatsApp(texto, 'Ticket de venta');
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-cream rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">
          <X size={22} />
        </button>

        {!confirmada ? (
          <>
            <h2 className="font-display text-xl font-bold text-gray-800 mb-1">Cerrar venta</h2>
            <p className="font-bouncy text-3xl font-extrabold text-coral mb-5">{formatoMoneda(total)}</p>

            <p className="text-sm font-medium text-gray-600 mb-2">Medio de pago</p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {MEDIOS_PAGO.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMedioPago(id)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-3xl border-2 transition-colors ${
                    medioPago === id ? 'border-mint bg-mint/10' : 'border-gray-200 bg-white'
                  }`}
                >
                  <Icon size={22} className={medioPago === id ? 'text-mint' : 'text-gray-500'} />
                  <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => confirmarCobro()}
              disabled={!medioPago}
              className="w-full bg-mint disabled:bg-gray-300 text-white font-bold py-3 rounded-3xl active:scale-95 transition-transform"
            >
              Confirmar cobro
            </button>
          </>
        ) : (
          <div className="text-center py-2">
            <BurgerMascot size={110} variant="success" className="mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold text-gray-800 mb-1">¡Venta cobrada!</h2>
            <p className="font-bouncy text-2xl font-extrabold text-mint mb-6">{formatoMoneda(ventaConfirmada?.total)}</p>
            <button
              onClick={compartir}
              className="w-full bg-mint text-white font-bold py-3 rounded-3xl flex items-center justify-center gap-2 mb-3 active:scale-95 transition-transform"
            >
              <Share2 size={18} /> Compartir ticket por WhatsApp
            </button>
            <button onClick={onClose} className="w-full text-gray-500 font-medium py-2">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
