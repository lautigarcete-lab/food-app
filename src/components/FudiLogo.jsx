// La "F" de Fudi: la misma marca que el ícono de la app, para que la
// pantalla de arranque y el launcher se vean como la misma cosa.
//
// La geometría (tres barras redondeadas + el punto ámbar) está calcada del
// ícono que se genera para Android, así que si se cambia una hay que
// cambiar la otra.
export function MarcaF({ size = 64, color = '#FFFFFF', punto = '#F59E0B', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true" {...props}>
      <rect x="28.3" y="19" width="43.4" height="13.95" rx="6.98" fill={color} />
      <rect x="28.3" y="45.04" width="32.24" height="13.95" rx="6.98" fill={color} />
      <rect x="28.3" y="19" width="13.95" height="62" rx="6.98" fill={color} />
      <circle cx="64.03" cy="73.33" r="7.67" fill={punto} />
    </svg>
  );
}

/** La marca dentro de la baldosa bordó, como se ve en el launcher. */
export default function FudiLogo({ size = 88, className = '' }) {
  return (
    <div
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
      className={`bg-fudi-red flex items-center justify-center shadow-float shrink-0 ${className}`}
    >
      <MarcaF size={size} />
    </div>
  );
}
