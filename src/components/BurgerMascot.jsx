// Mascota de Fudi. Estilo "kawaii" simple y redondeado: pocas formas
// grandes, degradados suaves, ojos grandes con brillo y nada de contornos
// duros. La versión anterior tenía piernas, zapatos, gorro, brazos y un
// ticket: demasiado detalle para verse bien a 48px y visualmente ruidosa.
//
// variants: 'normal' (neutra), 'success' (venta cobrada), 'balance' (cierre)
export default function BurgerMascot({ size = 100, variant = 'normal', className = '' }) {
  // Los ids de los degradados van prefijados con "fudi" para que no choquen
  // cuando hay más de una mascota montada a la vez (ej: la del header y la
  // del modal de venta exitosa abierto encima).
  return (
    <div
      className={`mascota${className ? ` ${className}` : ''}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="fudiDome" cx="35%" cy="25%" r="80%">
            <stop offset="0%" stopColor="#FFE9C4" />
            <stop offset="45%" stopColor="#F3B067" />
            <stop offset="100%" stopColor="#D07E30" />
          </radialGradient>
          <linearGradient id="fudiBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F7C588" />
            <stop offset="100%" stopColor="#CE7C2E" />
          </linearGradient>
          <linearGradient id="fudiCheese" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE07A" />
            <stop offset="100%" stopColor="#F5A623" />
          </linearGradient>
          <linearGradient id="fudiPatty" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8A5233" />
            <stop offset="100%" stopColor="#5B3220" />
          </linearGradient>
          <linearGradient id="fudiLettuce" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8FE2A0" />
            <stop offset="100%" stopColor="#43B168" />
          </linearGradient>
        </defs>

        {/* Sombra en el piso */}
        <ellipse cx="100" cy="180" rx="54" ry="7.5" fill="#8A5233" opacity="0.15" />

        {/* Bracitos: simples y redondos, apenas asomando a los costados */}
        {variant === 'success' ? (
          <>
            <rect x="18" y="86" width="14" height="34" rx="7" fill="#E3A055" transform="rotate(28 25 103)" />
            <rect x="168" y="86" width="14" height="34" rx="7" fill="#E3A055" transform="rotate(-28 175 103)" />
          </>
        ) : (
          <>
            <rect x="20" y="112" width="14" height="30" rx="7" fill="#E3A055" />
            <rect x="166" y="112" width="14" height="30" rx="7" fill="#E3A055" />
          </>
        )}

        {/* Pan de abajo */}
        <path d="M34 142 L166 142 L166 148 A26 26 0 0 1 140 174 L60 174 A26 26 0 0 1 34 148 Z" fill="url(#fudiBase)" />

        {/* Lechuga */}
        <path
          d="M32 138 C40 128 52 142 62 134 C72 127 82 141 92 134 C102 127 112 141 122 134 C132 127 142 142 152 134 C162 127 170 132 168 140 C168 148 160 150 150 150 L50 150 C40 150 32 148 32 138 Z"
          fill="url(#fudiLettuce)"
        />

        {/* Medallón */}
        <rect x="34" y="124" width="132" height="18" rx="9" fill="url(#fudiPatty)" />

        {/* Queso con dos gotas */}
        <path
          d="M36 116 L164 116 A7 7 0 0 1 164 130 L36 130 A7 7 0 0 1 36 116 Z"
          fill="url(#fudiCheese)"
        />
        <path d="M62 128 a7 8 0 0 0 14 0 z" fill="#F5A623" />
        <path d="M126 128 a7 8 0 0 0 14 0 z" fill="#F5A623" />

        {/* Pan de arriba */}
        <path
          d="M30 112 C30 62 60 36 100 36 C140 36 170 62 170 112 C170 117 166 120 161 120 L39 120 C34 120 30 117 30 112 Z"
          fill="url(#fudiDome)"
        />

        {/* Brillo del pan */}
        <ellipse cx="80" cy="60" rx="30" ry="12" fill="#FFFFFF" opacity="0.28" transform="rotate(-14 80 60)" />

        {/* Semillas de sésamo */}
        <g fill="#FFF6E2" opacity="0.95">
          <ellipse cx="62" cy="72" rx="4.5" ry="2.6" transform="rotate(-22 62 72)" />
          <ellipse cx="103" cy="55" rx="4.5" ry="2.6" transform="rotate(6 103 55)" />
          <ellipse cx="138" cy="74" rx="4.5" ry="2.6" transform="rotate(24 138 74)" />
          <ellipse cx="122" cy="96" rx="4" ry="2.3" transform="rotate(14 122 96)" />
        </g>

        {/* Cachetes */}
        <ellipse cx="55" cy="102" rx="10" ry="6" fill="#FF8B86" opacity="0.55" />
        <ellipse cx="145" cy="102" rx="10" ry="6" fill="#FF8B86" opacity="0.55" />

        {/* Ojos grandes con brillo */}
        {variant === 'success' ? (
          <>
            <path d="M64 96 q13 -15 26 0" stroke="#3A2317" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M110 96 q13 -15 26 0" stroke="#3A2317" strokeWidth="6" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <ellipse cx="77" cy="94" rx="13" ry="15" fill="#3A2317" />
            <circle cx="72" cy="87" r="5" fill="#FFFFFF" />
            <circle cx="82" cy="99" r="2.6" fill="#FFFFFF" opacity="0.9" />
            <ellipse cx="123" cy="94" rx="13" ry="15" fill="#3A2317" />
            <circle cx="118" cy="87" r="5" fill="#FFFFFF" />
            <circle cx="128" cy="99" r="2.6" fill="#FFFFFF" opacity="0.9" />
          </>
        )}

        {/* Boca según el estado */}
        {variant === 'normal' && (
          <path d="M92 108 q8 8 16 0" stroke="#3A2317" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        )}
        {variant === 'success' && (
          <path d="M86 106 a14 14 0 0 0 28 0 z" fill="#C4453F" />
        )}
        {variant === 'balance' && (
          <ellipse cx="100" cy="110" rx="6" ry="7" fill="#3A2317" />
        )}

        {/* Destellos de festejo */}
        {variant === 'success' && (
          <g fill="#FFC93C">
            <path d="M28 44 l3.4 7.6 7.6 3.4 -7.6 3.4 -3.4 7.6 -3.4 -7.6 -7.6 -3.4 7.6 -3.4 z" />
            <path d="M172 52 l2.8 6.2 6.2 2.8 -6.2 2.8 -2.8 6.2 -2.8 -6.2 -6.2 -2.8 6.2 -2.8 z" />
            <path d="M156 26 l2.2 4.8 4.8 2.2 -4.8 2.2 -2.2 4.8 -2.2 -4.8 -4.8 -2.2 4.8 -2.2 z" />
          </g>
        )}
      </svg>
    </div>
  );
}
