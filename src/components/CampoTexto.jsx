// Campo de texto con el estilo nuevo (tarjeta blanca redondeada, etiqueta
// chica arriba). Lo comparten las pantallas de inicio de sesión y de
// elección de negocio.
export default function CampoTexto({ etiqueta, value, onChange, ...props }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-fudi-muted uppercase tracking-wide mb-2">
        {etiqueta}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border-2 border-transparent focus:border-fudi-red rounded-2xl px-5 min-h-[54px] text-base font-medium text-fudi-text shadow-soft outline-none transition-colors placeholder:text-fudi-muted/50"
        {...props}
      />
    </label>
  );
}
