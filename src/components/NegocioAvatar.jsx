import { Store } from 'lucide-react';
import { colorDeNegocio } from '../utils/coloresNegocio.js';

// Identidad visual del negocio: la foto del local si hay una cargada y, si
// no, un ícono sobre el color que la persona eligió al crearlo.
export default function NegocioAvatar({ negocio, size = 56, className = '' }) {
  const { hex } = colorDeNegocio(negocio?.color);
  const estilo = { width: size, height: size };

  if (negocio?.foto) {
    return (
      <img
        src={negocio.foto}
        alt={negocio.nombre || 'Negocio'}
        style={estilo}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ ...estilo, backgroundColor: hex }}
      className={`rounded-full flex items-center justify-center shrink-0 text-white ${className}`}
      aria-hidden="true"
    >
      <Store size={Math.round(size * 0.5)} strokeWidth={2.2} />
    </div>
  );
}
