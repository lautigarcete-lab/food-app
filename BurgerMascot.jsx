// Nota: este proyecto no usa Tailwind (ver package.json), así que el
// wrapper se centra con estilos inline en vez de clases utilitarias.
export default function BurgerMascot({ size = 120, variant = 'normal', className = '' }) {
  return (
    <div
      className={`mascota${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg viewBox="0 0 120 130" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#8B4513" floodOpacity="0.15" />
          </filter>
        </defs>
        <rect x="42" y="105" width="6" height="12" fill="#8D5B4C" />
        <rect x="72" y="105" width="6" height="12" fill="#8D5B4C" />
        <path d="M35 118 C35 114 48 114 52 118 C52 122 35 122 35 118 Z" fill="#1F2937" />
        <rect x="38" y="112" width="12" height="6" rx="2" fill="#374151" />
        <path d="M68 118 C68 114 81 114 85 118 C85 122 68 122 68 118 Z" fill="#1F2937" />
        <rect x="70" y="112" width="12" height="6" rx="2" fill="#374151" />
        <rect x="22" y="85" width="76" height="18" rx="9" fill="#E5A94E" stroke="#C87A28" strokeWidth="2" filter="url(#soft-shadow)" />
        <rect x="18" y="68" width="84" height="17" rx="8.5" fill="#693A2D" stroke="#4A261B" strokeWidth="2" />
        <circle cx="30" cy="76" r="1.5" fill="#4A261B" opacity="0.5" />
        <circle cx="50" cy="74" r="2" fill="#4A261B" opacity="0.5" />
        <circle cx="80" cy="77" r="1.5" fill="#4A261B" opacity="0.5" />
        <path d="M18 68 L102 68 L95 76 L85 68 L70 78 L55 68 L40 76 L25 68 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
        <path d="M16 62 C22 58 28 65 35 60 C42 56 48 64 56 60 C64 56 70 64 78 60 C86 56 92 64 98 60 C102 58 105 62 104 64 C102 68 20 68 16 62 Z" fill="#34D399" stroke="#059669" strokeWidth="2" />
        <rect x="22" y="55" width="35" height="8" rx="4" fill="#F87171" stroke="#DC2626" strokeWidth="1.5" />
        <rect x="63" y="55" width="35" height="8" rx="4" fill="#F87171" stroke="#DC2626" strokeWidth="1.5" />
        <path d="M18 55 C18 25 38 15 60 15 C82 15 102 25 102 55 Z" fill="#E5A94E" stroke="#C87A28" strokeWidth="2" filter="url(#soft-shadow)" />
        <ellipse cx="40" cy="28" rx="2.5" ry="1.5" fill="#FFF8E7" transform="rotate(-15 40 28)" />
        <ellipse cx="60" cy="24" rx="2.5" ry="1.5" fill="#FFF8E7" />
        <ellipse cx="80" cy="30" rx="2.5" ry="1.5" fill="#FFF8E7" transform="rotate(20 80 30)" />
        <ellipse cx="30" cy="38" rx="2.5" ry="1.5" fill="#FFF8E7" transform="rotate(-30 30 38)" />
        <ellipse cx="90" cy="40" rx="2.5" ry="1.5" fill="#FFF8E7" transform="rotate(30 90 40)" />
        <path d="M45 15 L50 -2 L70 -2 L75 15 Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <path d="M48 2 L52 15 M56 -2 L59 15 M64 -2 L66 15" stroke="#EF4444" strokeWidth="3" />
        <path d="M35 15 C50 10 70 10 85 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="36" cy="48" rx="5" ry="3" fill="#F87171" opacity="0.6" />
        <ellipse cx="84" cy="48" rx="5" ry="3" fill="#F87171" opacity="0.6" />
        <circle cx="43" cy="41" r="6" fill="#1F2937" />
        <circle cx="41.5" cy="39" r="2" fill="#FFFFFF" />
        <circle cx="44.5" cy="42" r="1" fill="#FFFFFF" />
        <circle cx="77" cy="41" r="6" fill="#1F2937" />
        <circle cx="75.5" cy="39" r="2" fill="#FFFFFF" />
        <circle cx="78.5" cy="42" r="1" fill="#FFFFFF" />
        {variant === 'normal' && <path d="M56 45 C56 48 58 50 60 50 C62 50 64 48 64 45" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />}
        {variant === 'success' && <path d="M54 44 Q60 52 66 44" fill="#EF4444" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />}
        {variant === 'balance' && <circle cx="60" cy="46" r="2.5" fill="#1F2937" />}
        {variant === 'normal' && (
          <g>
            <path d="M102 55 Q115 65 105 75" fill="none" stroke="#E5A94E" strokeWidth="4" strokeLinecap="round" />
            <rect x="95" y="70" width="15" height="20" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" transform="rotate(15 95 70)" />
            <line x1="98" y1="75" x2="105" y2="77" stroke="#9CA3AF" strokeWidth="1" />
            <line x1="97" y1="79" x2="102" y2="80" stroke="#9CA3AF" strokeWidth="1" />
          </g>
        )}
        {variant === 'success' && (
          <g>
            <path d="M102 50 Q120 40 110 30" fill="none" stroke="#E5A94E" strokeWidth="4" strokeLinecap="round" />
            <circle cx="108" cy="28" r="4" fill="#E5A94E" />
          </g>
        )}
        {variant === 'balance' && (
          <g>
            <path d="M18 55 Q5 65 15 75" fill="none" stroke="#E5A94E" strokeWidth="4" strokeLinecap="round" />
            <rect x="5" y="65" width="16" height="22" rx="2" fill="#4B5563" transform="rotate(-15 5 65)" />
            <rect x="8" y="68" width="10" height="6" fill="#9CA3AF" transform="rotate(-15 5 65)" />
          </g>
        )}
      </svg>
    </div>
  );
}
