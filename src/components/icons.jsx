// Set mínimo de íconos en SVG inline (sin librerías) para mantener el
// bundle liviano — importa cuando la app se empaqueta como APK.

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

// Trazos de la hamburguesita, reutilizados por varios íconos. Están
// dibujados dentro de la caja de 24x24 y se reescalan con <g transform>;
// cada grupo lleva su propio strokeWidth para compensar la escala y que
// todos los íconos terminen con el mismo grosor de línea.
const PAN_ARRIBA = 'M4 10.6a8 8 0 0 1 16 0';
const RELLENO = 'M3.7 13.2h16.6';
const PAN_ABAJO = 'M4.2 15.9h15.6c0 2.3-1.7 3.9-3.9 3.9H8.1c-2.2 0-3.9-1.6-3.9-3.9Z';

function Hamburguesa() {
  return (
    <>
      <path d={PAN_ARRIBA} />
      <path d={RELLENO} />
      <path d={PAN_ABAJO} />
    </>
  );
}

export function IconInicio(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function IconVender(props) {
  // Bolsita de compras. La versión anterior se leía como un tacho de basura
  // porque tenía una línea horizontal cruzando todo el ancho (parecía la
  // tapa) y otra adentro. Esta es solo el cuerpo de la bolsa con el asa
  // asomando por arriba, que es lo que la hace reconocible.
  return (
    <svg {...base} strokeWidth={2.2} {...props}>
      <path d="M5.2 7.8h13.6l-1 11a2.2 2.2 0 0 1-2.2 2H8.4a2.2 2.2 0 0 1-2.2-2l-1-11Z" />
      <path d="M9 10.5V6.9a3 3 0 0 1 6 0v3.6" />
    </svg>
  );
}

export function IconCatalogo(props) {
  // Carta de menú: la tapa con el lomo a la izquierda y los renglones de
  // los platos. Antes eran cuatro cuadraditos genéricos.
  return (
    <svg {...base} {...props}>
      <path d="M6.5 3.2h11.8a1.6 1.6 0 0 1 1.6 1.6v14.4a1.6 1.6 0 0 1-1.6 1.6H6.5a2.3 2.3 0 0 1-2.3-2.3V5.5a2.3 2.3 0 0 1 2.3-2.3Z" />
      <path d="M8.4 7.6h7.2" />
      <path d="M8.4 11.2h7.2" />
      <path d="M8.4 14.8h4.4" />
    </svg>
  );
}

export function IconClientes(props) {
  // Dos hamburguesitas, una atrás y otra adelante: la misma idea que el
  // clásico ícono de dos personitas, pero con el personaje de la app.
  return (
    <svg {...base} {...props}>
      <g transform="translate(10.6 4.2) scale(0.54)" strokeWidth={3.7}>
        <Hamburguesa />
      </g>
      <g transform="translate(-0.6 6.8) scale(0.58)" strokeWidth={3.4}>
        <Hamburguesa />
      </g>
    </svg>
  );
}

export function IconDeben(props) {
  // Hamburguesita enojada: la hamburguesa entera, con cejas caídas y
  // ojitos sobre el pan de arriba. Una versión anterior le dibujaba
  // además la boca y le sacaba el relleno, y a tamaño chico el pan de
  // abajo pasaba a leerse como una segunda boca: parecía una máscara y
  // no una hamburguesa.
  return (
    <svg {...base} {...props}>
      <path d={PAN_ARRIBA} />
      <path d="M8.2 6.4l2.2 1.3" />
      <path d="M15.8 6.4l-2.2 1.3" />
      <path d="M9.7 9.4h.01" />
      <path d="M14.3 9.4h.01" />
      <path d={RELLENO} />
      <path d={PAN_ABAJO} />
    </svg>
  );
}

export function IconContactar(props) {
  // Hamburguesita con un celular al lado.
  return (
    <svg {...base} {...props}>
      <g transform="translate(-1.4 3.4) scale(0.64)" strokeWidth={3.1}>
        <Hamburguesa />
      </g>
      <rect x="15.4" y="3.4" width="6.4" height="10.6" rx="1.7" />
      <path d="M17.7 5.6h1.8" />
    </svg>
  );
}

export function IconMas(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconVolver(props) {
  return (
    <svg {...base} {...props}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

export function IconMas2(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconCerrar(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function IconAlerta(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.2" fill="currentColor" />
    </svg>
  );
}

export function IconInsumos(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10h16l-1.5 9.2a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 10Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

export function IconRecetas(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
      <path d="M9 8h6M9 12h4" />
    </svg>
  );
}

export function IconGastos(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9" />
      <path d="M9.3 15c0 1.1 1.1 2 2.7 2s2.7-.8 2.7-2-1.1-1.6-2.7-2-2.7-.9-2.7-2 1.1-2 2.7-2 2.7.8 2.7 1.8" />
    </svg>
  );
}

export function IconRespaldo(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v10" />
      <path d="m8 9.5 4 4 4-4" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}

export function IconTareas(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4.5" width="16" height="15" rx="2" />
      <path d="M8 10.5l2 2 4-4.5" />
      <path d="M8 16h6" />
    </svg>
  );
}

export function IconCierre(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v3" />
      <path d="M4 8h16" />
      <path d="M6 8l1.5 4.5a2.5 2.5 0 0 0 4.7 0L14 8" />
      <path d="M10 8l1.5 4.5a2.5 2.5 0 0 0 4.7 0L18 8" />
      <path d="M12 12v6" />
      <path d="M8.5 21h7" />
    </svg>
  );
}

export function IconCuenta(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20.5a8 8 0 0 1 16 0" />
    </svg>
  );
}
