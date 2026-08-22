// Mascota de Fudi.
//
// Variantes: 'normal', 'success', 'balance', 'clientes', 'deben',
// 'contactar', 'catalogo'. Las cuatro últimas se usan como íconos de
// sección (Clientes, Deben, Contactar, Catálogo).
//
// Los ids de gradientes/filtros van prefijados con "fudi" para que no
// choquen cuando hay más de una mascota montada a la vez.
//
// Nota: el proyecto no usa Tailwind, así que el contenedor va con estilos
// propios en vez de clases utilitarias.
export default function BurgerMascot({ size = 100, variant = 'normal', className = '', icono = false }) {
  // Modo ícono: el personaje completo (con patas, zapatos y gorro) tiene
  // mucho aire arriba y abajo, y a 34px en la barra queda ilegible. Acá se
  // ocultan esas partes y se recorta la vista al personaje y su objeto,
  // así la cara y lo que sostiene ocupan casi todo el cuadro.
  const viewBox = icono
    ? variant === 'clientes'
      ? '14 30 178 162'
      : '10 30 182 152'
    : '0 0 200 210';

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
      <svg viewBox={viewBox} width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="fudiFloorShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2A1B12" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2A1B12" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fudiBunTop" cx="45%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FDE3B2" />
            <stop offset="35%" stopColor="#DF9B42" />
            <stop offset="75%" stopColor="#AF631F" />
            <stop offset="100%" stopColor="#7E3A0B" />
          </radialGradient>
          <linearGradient id="fudiBunBottom" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EEAC57" />
            <stop offset="60%" stopColor="#C87A28" />
            <stop offset="100%" stopColor="#7E3A0B" />
          </linearGradient>
          <linearGradient id="fudiPatty" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5A2E1B" />
            <stop offset="35%" stopColor="#3C1A0D" />
            <stop offset="70%" stopColor="#4A2212" />
            <stop offset="100%" stopColor="#220B03" />
          </linearGradient>
          <linearGradient id="fudiCheese" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="40%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="fudiTomato" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF7676" />
            <stop offset="60%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <linearGradient id="fudiLettuce" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <filter id="fudiGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {!icono && (
          <>
            <ellipse cx="100" cy="200" rx="65" ry="8" fill="url(#fudiFloorShadow)" />
            <rect x="68" y="165" width="10" height="22" rx="4" fill="#6B391F" />
            <rect x="122" y="165" width="10" height="22" rx="4" fill="#6B391F" />
            <path d="M55 186 C55 180 78 180 84 186 C86 193 84 196 68 196 C56 196 55 192 55 186 Z" fill="#1F2937" />
            <path d="M58 187 C62 183 75 183 80 187" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
            <rect x="64" y="193" width="18" height="3" fill="#111827" />
            <path d="M116 186 C116 180 139 180 145 186 C147 193 145 196 129 196 C117 196 116 192 116 186 Z" fill="#1F2937" />
            <path d="M119 187 C123 183 136 183 141 187" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
            <rect x="125" y="193" width="18" height="3" fill="#111827" />
          </>
        )}

        <path d="M38 145 C38 145 42 172 100 172 C158 172 162 145 162 145 Z" fill="url(#fudiBunBottom)" />
        <ellipse cx="100" cy="146" rx="62" ry="7" fill="#C87A28" opacity="0.6" />
        <path d="M30 138 C36 132 44 144 54 138 C64 132 72 144 82 137 C92 131 100 143 110 137 C120 131 130 144 140 138 C150 132 158 144 168 138 C172 135 174 143 166 148 C150 152 48 152 32 147 C28 143 26 141 30 138 Z" fill="url(#fudiLettuce)" />
        <rect x="30" y="118" width="140" height="26" rx="13" fill="url(#fudiPatty)" />
        <circle cx="50" cy="128" r="2.5" fill="#220B03" opacity="0.8" />
        <circle cx="75" cy="132" r="3" fill="#220B03" opacity="0.7" />
        <circle cx="120" cy="126" r="3" fill="#220B03" opacity="0.8" />
        <circle cx="145" cy="131" r="2.5" fill="#220B03" opacity="0.7" />
        <path d="M42 125 Q60 130 80 124 Q110 132 140 125" stroke="#1A0701" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M32 118 L168 118 L160 130 L146 118 L124 136 L100 120 L76 134 L56 118 L42 129 Z" fill="url(#fudiCheese)" />
        <path d="M36 106 Q100 114 164 106 C166 114 158 120 158 120 L42 120 C42 120 34 114 36 106 Z" fill="url(#fudiTomato)" />
        <path d="M28 106 C28 50 58 32 100 32 C142 32 172 50 172 106 C172 112 28 112 28 106 Z" fill="url(#fudiBunTop)" />
        <ellipse cx="90" cy="46" rx="42" ry="12" fill="#FFFFFF" opacity="0.25" />

        <g fill="#FFF5DC" stroke="#D19B53" strokeWidth="0.7">
          <ellipse cx="65" cy="52" rx="4" ry="2.2" transform="rotate(-25 65 52)" />
          <ellipse cx="95" cy="44" rx="4" ry="2.2" transform="rotate(5 95 44)" />
          <ellipse cx="130" cy="50" rx="4" ry="2.2" transform="rotate(30 130 50)" />
          <ellipse cx="50" cy="70" rx="4" ry="2.2" transform="rotate(-40 50 70)" />
          <ellipse cx="148" cy="72" rx="4" ry="2.2" transform="rotate(45 148 72)" />
          <ellipse cx="80" cy="62" rx="3.5" ry="2" transform="rotate(-10 80 62)" />
          <ellipse cx="118" cy="62" rx="3.5" ry="2" transform="rotate(15 118 62)" />
        </g>

        {/* Gorrito de Vendedor */}
        {!icono && (
        <g transform="translate(0, -2)">
          <path d="M80 34 L86 10 L114 10 L120 34 Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
          <path d="M89 10 L84 33 M98 10 L96 32 M102 10 L104 32 M111 10 L116 33" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
          <path d="M72 34 C90 27 110 27 128 34" stroke="#1F2937" strokeWidth="4.5" strokeLinecap="round" />
        </g>
        )}

        {/* Mini-Hamburguesa Bebé (Exclusivo variant="clientes") */}
        {variant === 'clientes' && (
          <g transform="translate(115, 110) scale(0.38)">
            <ellipse cx="100" cy="200" rx="65" ry="8" fill="url(#fudiFloorShadow)" />
            <path d="M38 145 C38 145 42 172 100 172 C158 172 162 145 162 145 Z" fill="url(#fudiBunBottom)" />
            <rect x="30" y="118" width="140" height="26" rx="13" fill="url(#fudiPatty)" />
            <path d="M28 106 C28 50 58 32 100 32 C142 32 172 50 172 106 C172 112 28 112 28 106 Z" fill="url(#fudiBunTop)" />
            <circle cx="70" cy="80" r="14" fill="#18110D" />
            <circle cx="130" cy="80" r="14" fill="#18110D" />
            <path d="M92 88 C92 95 108 95 108 88" stroke="#18110D" strokeWidth="6" strokeLinecap="round" />
          </g>
        )}

        <ellipse cx="58" cy="94" rx="9" ry="5.5" fill="#FF7676" opacity="0.65" />
        <ellipse cx="142" cy="94" rx="9" ry="5.5" fill="#FF7676" opacity="0.65" />
        <circle cx="70" cy="80" r="11" fill="#18110D" />
        <circle cx="67" cy="76" r="4.5" fill="#FFFFFF" filter="url(#fudiGlow)" />
        <circle cx="73" cy="83" r="2.2" fill="#FFFFFF" />
        <circle cx="130" cy="80" r="11" fill="#18110D" />
        <circle cx="127" cy="76" r="4.5" fill="#FFFFFF" filter="url(#fudiGlow)" />
        <circle cx="133" cy="83" r="2.2" fill="#FFFFFF" />

        {/* Cejas y Marcas Anime */}
        {variant === 'deben' && (
          <g>
            {/* Cejas de enojo */}
            <path d="M 55 68 L 78 75 M 145 68 L 122 75" stroke="#18110D" strokeWidth="4.5" strokeLinecap="round" />
            {/* Marca de vena anime roja (Enojo) */}
            <g transform="translate(145, 30) rotate(10)" stroke="#DC2626" strokeWidth="3" strokeLinecap="round">
              <path d="M6 0 L6 18 M12 0 L12 18 M0 6 L18 6 M0 12 L18 12" />
            </g>
          </g>
        )}

        {/* Expresión de Boca */}
        {['normal', 'clientes'].includes(variant) && (
          <path d="M92 88 C92 95 108 95 108 88" stroke="#18110D" strokeWidth="4" strokeLinecap="round" />
        )}
        {['success'].includes(variant) && (
          <g>
            <path d="M88 85 Q100 102 112 85 Z" fill="#DC2626" stroke="#18110D" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M93 94 Q100 90 107 94" stroke="#FFA4A4" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
        {['balance', 'catalogo'].includes(variant) && (
          <circle cx="100" cy="92" r="3.5" fill="#18110D" />
        )}
        {['contactar'].includes(variant) && (
          <ellipse cx="100" cy="90" rx="4" ry="6" fill="#18110D" />
        )}
        {['deben'].includes(variant) && (
          <path d="M92 92 Q100 85 108 92" stroke="#18110D" strokeWidth="4" strokeLinecap="round" fill="none" />
        )}

        {/* Accesorios y Brazos */}
        {['normal', 'clientes'].includes(variant) && (
          <g>
            <path d="M30 110 Q14 125 34 135" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <path d="M170 110 Q192 120 178 135" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            {variant === 'normal' && (
              <g>
                <rect x="168" y="125" width="24" height="32" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" transform="rotate(12 168 125)" />
                <line x1="174" y1="133" x2="186" y2="136" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <line x1="173" y1="140" x2="183" y2="142" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <line x1="172" y1="147" x2="185" y2="150" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}

        {variant === 'success' && (
          <g>
            <path d="M28 110 Q10 85 24 72" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <circle cx="24" cy="70" r="6" fill="#DF9B42" />
            <path d="M172 110 Q190 85 176 72" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <circle cx="176" cy="70" r="6" fill="#DF9B42" />
            <path d="M18 55 L24 63 M26 50 L28 60 M182 55 L176 63 M174 50 L172 60" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {variant === 'balance' && (
          <g>
            <path d="M30 110 Q10 125 25 135" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <rect x="8" y="122" width="24" height="34" rx="4" fill="#374151" stroke="#1F2937" strokeWidth="2" transform="rotate(-10 8 122)" />
            <rect x="13" y="127" width="16" height="8" rx="2" fill="#9CA3AF" />
            <circle cx="15" cy="142" r="1.5" fill="#E5E7EB" />
            <circle cx="21" cy="142" r="1.5" fill="#E5E7EB" />
            <circle cx="15" cy="148" r="1.5" fill="#10B981" />
            <circle cx="21" cy="148" r="1.5" fill="#F59E0B" />
            <path d="M170 108 Q190 85 162 65" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}

        {variant === 'deben' && (
          <g>
            {/* Brazos cruzados enojados */}
            <path d="M30 110 Q60 130 95 115" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <path d="M170 110 Q140 130 105 115" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}

        {variant === 'contactar' && (
          <g>
            <path d="M30 110 Q14 125 34 135" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            {/* Brazo con Smartphone */}
            <path d="M170 110 Q180 90 155 75" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <g transform="translate(135, 55) rotate(15)">
              <rect x="0" y="0" width="30" height="50" rx="5" fill="#1F2937" />
              <rect x="2" y="2" width="26" height="46" rx="3" fill="#E5E7EB" />
              <rect x="6" y="10" width="18" height="6" rx="2" fill="#10B981" />
              <rect x="6" y="20" width="12" height="4" rx="2" fill="#9CA3AF" />
            </g>
          </g>
        )}

        {variant === 'catalogo' && (
          <g>
            {/* Tabla de Menú / Catálogo */}
            <g transform="translate(75, 100)">
              <rect x="0" y="0" width="50" height="60" rx="3" fill="#8B4513" />
              <rect x="3" y="8" width="44" height="49" rx="1" fill="#FEF3C7" />
              <line x1="10" y1="18" x2="40" y2="18" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
              <line x1="10" y1="26" x2="30" y2="26" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
              <line x1="10" y1="34" x2="35" y2="34" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
              <rect x="18" y="-4" width="14" height="8" rx="2" fill="#D1D5DB" stroke="#4B5563" strokeWidth="1.5" />
            </g>
            {/* Brazos sosteniendo el menú */}
            <path d="M30 110 Q50 140 80 130" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <path d="M170 110 Q150 140 120 130" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
