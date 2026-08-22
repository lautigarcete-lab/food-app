import { Check } from 'lucide-react';
import NegocioAvatar from './NegocioAvatar.jsx';
import { COLORES_NEGOCIO } from '../utils/coloresNegocio.js';

/**
 * Elección del color del negocio. Es lo que después se ve como ícono en el
 * inicio cuando todavía no hay una foto del local cargada.
 */
export default function SelectorColorNegocio({ color, onElegir, nombre, foto = null, ayuda }) {
  return (
    <div>
      <span className="block text-xs font-bold text-fudi-muted uppercase tracking-wide mb-2">
        Color del negocio
      </span>
      <div className="bg-white rounded-[24px] p-4 shadow-soft">
        <div className="flex items-center gap-4 mb-4">
          <NegocioAvatar negocio={{ color, nombre, foto }} size={52} />
          <p className="text-xs font-medium text-fudi-muted">
            {ayuda || 'Así se va a ver en el inicio hasta que cargues una foto del local.'}
          </p>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {COLORES_NEGOCIO.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.label}
              onClick={() => onElegir(c.id)}
              style={{ backgroundColor: c.hex }}
              className={`h-11 rounded-2xl flex items-center justify-center text-white transition-transform active:scale-95 ${
                color === c.id ? 'ring-2 ring-offset-2 ring-fudi-text/30' : ''
              }`}
            >
              {color === c.id && <Check size={20} strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
