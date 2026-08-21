import React from 'react';

export default function BurgerMascot({ size = 100, variant = 'normal', className = '' }) {
  // variants: 'normal' (cobro/ticket), 'success' (venta exitosa/festejo), 'balance' (cierre/calculadora)
  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 210" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Sombra base suave */}
          <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2A1B12" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2A1B12" stopOpacity="0" />
          </radialGradient>

          {/* Degradado Pan Brioche Realista (Dorado Tostado) */}
          <radialGradient id="bunTopGrad" cx="45%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FDE3B2" />
            <stop offset="35%" stopColor="#DF9B42" />
            <stop offset="75%" stopColor="#AF631F" />
            <stop offset="100%" stopColor="#7E3A0B" />
          </radialGradient>

          <linearGradient id="bunBottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EEAC57" />
            <stop offset="60%" stopColor="#C87A28" />
            <stop offset="100%" stopColor="#7E3A0B" />
          </linearGradient>

          {/* Degradado Medallón de Carne Grillada */}
          <linearGradient id="pattyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5A2E1B" />
            <stop offset="35%" stopColor="#3C1A0D" />
            <stop offset="70%" stopColor="#4A2212" />
            <stop offset="100%" stopColor="#220B03" />
          </linearGradient>

          {/* Degradado Queso Cheddar Fundido */}
          <linearGradient id="cheeseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="40%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Degradado Tomate y Salsa */}
          <linearGradient id="tomatoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF7676" />
            <stop offset="60%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          {/* Degradado Lechuga Fresca */}
          <linearGradient id="lettuceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Brillo en ojos */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 0. SOMBRA EN EL SUELO */}
        <ellipse cx="100" cy="200" rx="65" ry="8" fill="url(#floorShadow)" />

        {/* 1. PIERNAS Y ZAPATOS DE TRABAJO */}
        <rect x="68" y="165" width="10" height="22" rx="4" fill="#6B391F" />
        <rect x="122" y="165" width="10" height="22" rx="4" fill="#6B391F" />
        {/* Zapato Izquierdo */}
        <path d="M55 186 C55 180 78 180 84 186 C86 193 84 196 68 196 C56 196 55 192 55 186 Z" fill="#1F2937" />
        <path d="M58 187 C62 183 75 183 80 187" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
        <rect x="64" y="193" width="18" height="3" fill="#111827" />
        {/* Zapato Derecho */}
        <path d="M116 186 C116 180 139 180 145 186 C147 193 145 196 129 196 C117 196 116 192 116 186 Z" fill="#1F2937" />
        <path d="M119 187 C123 183 136 183 141 187" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
        <rect x="125" y="193" width="18" height="3" fill="#111827" />

        {/* 2. PAN INFERIOR REALISTA */}
        <path d="M38 145 C38 145 42 172 100 172 C158 172 162 145 162 145 Z" fill="url(#bunBottomGrad)" />
        <ellipse cx="100" cy="146" rx="62" ry="7" fill="#C87A28" opacity="0.6" />

        {/* 3. HOJAS DE LECHUGA CON ONDULACIONES */}
        <path d="M30 138 C36 132 44 144 54 138 C64 132 72 144 82 137 C92 131 100 143 110 137 C120 131 130 144 140 138 C150 132 158 144 168 138 C172 135 174 143 166 148 C150 152 48 152 32 147 C28 143 26 141 30 138 Z" fill="url(#lettuceGrad)" />

        {/* 4. MEDALLÓN DE CARNE TEXTURADO */}
        <rect x="30" y="118" width="140" height="26" rx="13" fill="url(#pattyGrad)" />
        {/* Textura grill/costra */}
        <circle cx="50" cy="128" r="2.5" fill="#220B03" opacity="0.8" />
        <circle cx="75" cy="132" r="3" fill="#220B03" opacity="0.7" />
        <circle cx="120" cy="126" r="3" fill="#220B03" opacity="0.8" />
        <circle cx="145" cy="131" r="2.5" fill="#220B03" opacity="0.7" />
        <path d="M42 125 Q60 130 80 124 Q110 132 140 125" stroke="#1A0701" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

        {/* 5. QUESO CHEDDAR DERRETIDO */}
        <path d="M32 118 L168 118 L160 130 L146 118 L124 136 L100 120 L76 134 L56 118 L42 129 Z" fill="url(#cheeseGrad)" />

        {/* 6. TOMATE / SALSA */}
        <path d="M36 106 Q100 114 164 106 C166 114 158 120 158 120 L42 120 C42 120 34 114 36 106 Z" fill="url(#tomatoGrad)" />

        {/* 7. PAN SUPERIOR (BRIOCHE TOSTADO VOLUMÉTRICO) */}
        <path d="M28 106 C28 50 58 32 100 32 C142 32 172 50 172 106 C172 112 28 112 28 106 Z" fill="url(#bunTopGrad)" />
        {/* Reflejo de luz superior */}
        <ellipse cx="90" cy="46" rx="42" ry="12" fill="#FFFFFF" opacity="0.25" />

        {/* SEMILLAS DE SÉSAMO 3D */}
        <g fill="#FFF5DC" stroke="#D19B53" strokeWidth="0.7">
          <ellipse cx="65" cy="52" rx="4" ry="2.2" transform="rotate(-25 65 52)" />
          <ellipse cx="95" cy="44" rx="4" ry="2.2" transform="rotate(5 95 44)" />
          <ellipse cx="130" cy="50" rx="4" ry="2.2" transform="rotate(30 130 50)" />
          <ellipse cx="50" cy="70" rx="4" ry="2.2" transform="rotate(-40 50 70)" />
          <ellipse cx="148" cy="72" rx="4" ry="2.2" transform="rotate(45 148 72)" />
          <ellipse cx="80" cy="62" rx="3.5" ry="2" transform="rotate(-10 80 62)" />
          <ellipse cx="118" cy="62" rx="3.5" ry="2" transform="rotate(15 118 62)" />
        </g>

        {/* 8. GORRITO GASTRONÓMICO A RAYAS */}
        <g transform="translate(10, 0)">
          <path d="M96 34 L102 6 L144 6 L148 34 Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
          {/* Rayas rojas del gorro */}
          <path d="M106 6 L108 34 M116 6 L118 34 M126 6 L128 34 M136 6 L137 34" stroke="#DC2626" strokeWidth="4.5" strokeLinecap="round" />
          {/* Base del gorrito */}
          <path d="M88 34 C110 26 142 26 156 34" stroke="#1F2937" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* 9. MEJILLAS SONROJADAS */}
        <ellipse cx="58" cy="94" rx="9" ry="5.5" fill="#FF7676" opacity="0.65" />
        <ellipse cx="142" cy="94" rx="9" ry="5.5" fill="#FF7676" opacity="0.65" />

        {/* 10. OJOS GRANDES EXPRESIVOS */}
        {/* Ojo Izquierdo */}
        <circle cx="70" cy="80" r="11" fill="#18110D" />
        <circle cx="67" cy="76" r="4.5" fill="#FFFFFF" filter="url(#glow)" />
        <circle cx="73" cy="83" r="2.2" fill="#FFFFFF" />

        {/* Ojo Derecho */}
        <circle cx="130" cy="80" r="11" fill="#18110D" />
        <circle cx="127" cy="76" r="4.5" fill="#FFFFFF" filter="url(#glow)" />
        <circle cx="133" cy="83" r="2.2" fill="#FFFFFF" />

        {/* 11. BOCA DINÁMICA SEGÚN ESTADO */}
        {variant === 'normal' && (
          <path d="M92 88 C92 95 108 95 108 88" stroke="#18110D" strokeWidth="4" strokeLinecap="round" />
        )}
        {variant === 'success' && (
          <g>
            <path d="M88 85 Q100 102 112 85 Z" fill="#DC2626" stroke="#18110D" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M93 94 Q100 90 107 94" stroke="#FFA4A4" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
        {variant === 'balance' && (
          <g>
            <ellipse cx="100" cy="90" rx="5" ry="6" fill="#18110D" />
            <path d="M64 66 L78 70 M136 66 L122 70" stroke="#18110D" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* 12. BRAZOS Y ACCESORIOS SEGÚN ESTADO */}
        {variant === 'normal' && (
          <g>
            {/* Brazo izquierdo posando */}
            <path d="M30 110 Q14 125 34 135" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            {/* Brazo derecho sosteniendo ticket */}
            <path d="M170 110 Q192 120 178 135" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <rect x="168" y="125" width="24" height="32" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" transform="rotate(12 168 125)" />
            <line x1="174" y1="133" x2="186" y2="136" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="173" y1="140" x2="183" y2="142" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="172" y1="147" x2="185" y2="150" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {variant === 'success' && (
          <g>
            {/* Brazos alzados festejando con pulgar arriba */}
            <path d="M28 110 Q10 85 24 72" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <circle cx="24" cy="70" r="6" fill="#DF9B42" />
            <path d="M172 110 Q190 85 176 72" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <circle cx="176" cy="70" r="6" fill="#DF9B42" />
            {/* Destellos de éxito */}
            <path d="M18 55 L24 63 M26 50 L28 60 M182 55 L176 63 M174 50 L172 60" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {variant === 'balance' && (
          <g>
            {/* Brazo sosteniendo calculadora de caja */}
            <path d="M30 110 Q10 125 25 135" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
            <rect x="8" y="122" width="24" height="34" rx="4" fill="#374151" stroke="#1F2937" strokeWidth="2" transform="rotate(-10 8 122)" />
            <rect x="13" y="127" width="16" height="8" rx="2" fill="#9CA3AF" />
            <circle cx="15" cy="142" r="1.5" fill="#E5E7EB" />
            <circle cx="21" cy="142" r="1.5" fill="#E5E7EB" />
            <circle cx="15" cy="148" r="1.5" fill="#10B981" />
            <circle cx="21" cy="148" r="1.5" fill="#F59E0B" />
            {/* Brazo derecho rascándose la cabeza pensativo */}
            <path d="M170 108 Q190 85 162 65" fill="none" stroke="#AF631F" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
