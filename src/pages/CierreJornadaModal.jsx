import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import BurgerMascot from '../components/BurgerMascot.jsx';
import { listarVentas } from '../db/repositories/ventasRepo.js';
import { listarGastos } from '../db/repositories/gastosRepo.js';
import { formatMoney } from '../utils/money.js';
import { rangoDelPeriodo, formatearFechaLarga } from '../utils/fechas.js';

const LABEL_MEDIO_PAGO = {
  efectivo: 'Efectivo',
  mercadopago: 'Mercado Pago',
  tarjeta: 'Tarjeta',
};

/**
 * CierreJornadaModal
 * Balance del día: ventas separadas por medio de pago, gastos y neto en caja.
 * Las ventas fiadas no suman a "cobrado" (todavía no entró plata), pero se
 * muestran aparte para que quede claro cuánto quedó pendiente.
 */
export default function CierreJornadaModal({ onClose }) {
  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const { desde, hasta } = rangoDelPeriodo('dia');
    Promise.all([listarVentas({ desde, hasta }), listarGastos({ desde, hasta })])
      .then(([v, g]) => {
        setVentas(v);
        setGastos(g);
      })
      .finally(() => setCargando(false));
  }, []);

  const ventasPorMedio = useMemo(() => {
    const acc = { efectivo: 0, mercadopago: 0, tarjeta: 0 };
    ventas
      .filter((v) => v.tipoPago !== 'fiado')
      .forEach((v) => {
        acc[v.medioPago] = (acc[v.medioPago] || 0) + Number(v.total);
      });
    return acc;
  }, [ventas]);

  const totalFiado = useMemo(
    () => ventas.filter((v) => v.tipoPago === 'fiado').reduce((acc, v) => acc + Number(v.total), 0),
    [ventas]
  );

  const totalCobrado = useMemo(
    () => Object.values(ventasPorMedio).reduce((a, b) => a + b, 0),
    [ventasPorMedio]
  );

  const totalGastos = useMemo(() => gastos.reduce((acc, g) => acc + Number(g.monto), 0), [gastos]);

  const neto = totalCobrado - totalGastos;
  const efectivoEnCaja = (ventasPorMedio.efectivo || 0) - totalGastos;

  function armarResumenTexto() {
    const lineas = [
      '📋 *Cierre de jornada*',
      formatearFechaLarga(new Date()),
      '',
      '*Ventas por medio de pago:*',
      ...Object.entries(ventasPorMedio).map(
        ([m, monto]) => `• ${LABEL_MEDIO_PAGO[m] || m}: ${formatMoney(monto)}`
      ),
    ];
    if (totalFiado > 0) lineas.push(`• Fiado (pendiente): ${formatMoney(totalFiado)}`);
    lineas.push(
      '',
      `Total cobrado: ${formatMoney(totalCobrado)}`,
      `Gastos: ${formatMoney(totalGastos)}`,
      `*Neto: ${formatMoney(neto)}*`,
      `Efectivo esperado en caja: ${formatMoney(efectivoEnCaja)}`
    );
    return lineas.join('\n');
  }

  async function compartirResumen() {
    const texto = armarResumenTexto();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Cierre de jornada', text: texto });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }
    const ventana = window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    if (!ventana) {
      try {
        await navigator.clipboard.writeText(texto);
        setMensaje('No se pudo abrir WhatsApp: se copió el resumen al portapapeles.');
      } catch {
        setMensaje('No se pudo compartir el resumen.');
      }
    }
  }

  return (
    <Modal
      titulo="Cierre de jornada"
      onClose={onClose}
      footer={
        <button type="button" className="btn btn--primario" onClick={compartirResumen} disabled={cargando}>
          Compartir por WhatsApp
        </button>
      }
    >
      <div className="form">
        <div className="cierre-jornada__cabecera">
          <BurgerMascot size={80} variant="balance" />
          <small className="ayuda-texto">{formatearFechaLarga(new Date())}</small>
        </div>

        {cargando ? (
          <p className="ayuda-texto">Cargando…</p>
        ) : (
          <>
            <h3 className="titulo-seccion">Ventas por medio de pago</h3>
            {Object.entries(ventasPorMedio).map(([m, monto]) => (
              <div key={m} className="cierre-jornada__fila">
                <span>{LABEL_MEDIO_PAGO[m] || m}</span>
                <strong>{formatMoney(monto)}</strong>
              </div>
            ))}
            {totalFiado > 0 && (
              <div className="cierre-jornada__fila">
                <span>Fiado (pendiente de cobro)</span>
                <strong>{formatMoney(totalFiado)}</strong>
              </div>
            )}

            <div className="cierre-jornada__fila">
              <span>Total cobrado</span>
              <strong>{formatMoney(totalCobrado)}</strong>
            </div>
            <div className="cierre-jornada__fila">
              <span>Gastos</span>
              <strong className="texto-negativo">-{formatMoney(totalGastos)}</strong>
            </div>

            <div className="cierre-jornada__neto">
              <span>Neto</span>
              <strong>{formatMoney(neto)}</strong>
            </div>

            <p className="ayuda-texto">
              Efectivo esperado en caja: <strong>{formatMoney(efectivoEnCaja)}</strong>
            </p>

            {mensaje && <p className="mensaje-ok">{mensaje}</p>}
          </>
        )}
      </div>
    </Modal>
  );
}
