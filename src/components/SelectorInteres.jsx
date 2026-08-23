import { formatMoney } from '../utils/money.js';
import { PORCENTAJES_INTERES, calcularRecargo } from '../utils/interes.js';

/**
 * Pregunta si se le suma interés al cobro con tarjeta o transferencia.
 * Arranca siempre en "Sin interés": sumarlo tiene que ser una decisión, no
 * algo que pase solo.
 */
export default function SelectorInteres({ total, porcentaje, onCambiar, compacto = false }) {
  const recargo = calcularRecargo(total, porcentaje);
  const esOtro = porcentaje > 0 && !PORCENTAJES_INTERES.includes(Number(porcentaje));

  return (
    <div className={compacto ? '' : 'bg-white rounded-2xl p-4 shadow-soft'}>
      <p className="text-xs font-bold text-fudi-muted uppercase tracking-wide mb-2">
        ¿Le sumás el interés del cobro?
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {PORCENTAJES_INTERES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onCambiar(p)}
            className={`min-h-[38px] px-3 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors ${
              Number(porcentaje) === p
                ? 'bg-fudi-yellow/20 border-fudi-yellow text-fudi-text'
                : 'bg-white border-[#EFE8DE] text-fudi-muted'
            }`}
          >
            {p === 0 ? 'Sin interés' : `+${p}%`}
          </button>
        ))}
        <label
          className={`flex items-center gap-1 min-h-[38px] px-3 rounded-full border text-xs font-semibold shrink-0 ${
            esOtro ? 'bg-fudi-yellow/20 border-fudi-yellow text-fudi-text' : 'bg-white border-[#EFE8DE] text-fudi-muted'
          }`}
        >
          <span>Otro</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            value={esOtro ? porcentaje : ''}
            onChange={(e) => onCambiar(e.target.value === '' ? 0 : Number(e.target.value))}
            className="w-8 bg-transparent border-0 outline-none text-xs font-bold p-0 text-center"
          />
          <span>%</span>
        </label>
      </div>
      {/* En el panel de cobro el total de abajo ya lo dice; repetirlo acá
          solo agrega ruido. */}
      {recargo > 0 && !compacto && (
        <p className="text-xs font-semibold text-fudi-text mt-2">
          Se suman {formatMoney(recargo)} · cobrás {formatMoney(total + recargo)}
        </p>
      )}
    </div>
  );
}
