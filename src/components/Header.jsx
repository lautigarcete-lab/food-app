import { IconVolver } from './icons.jsx';

// Cabecera de pantalla. El título va alineado a la izquierda y grande (antes
// era chico y centrado, y hacía que todas las pantallas se vieran iguales y
// sin jerarquía), con un subtítulo opcional para dar contexto.
export default function Header({ titulo, subtitulo, onVolver, accion }) {
  return (
    <header className="app-header">
      {onVolver && (
        <button type="button" className="icon-button" onClick={onVolver} aria-label="Volver">
          <IconVolver width={22} height={22} />
        </button>
      )}
      <div className="app-header__titulo">
        <h1>{titulo}</h1>
        {subtitulo && <small>{subtitulo}</small>}
      </div>
      {accion}
    </header>
  );
}
