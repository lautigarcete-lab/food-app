import BurgerMascot from './BurgerMascot.jsx';

// Pantalla vacía. Muestra la mascota en vez de un emoji gris: es el mismo
// personaje del logo y hace que "todavía no hay nada" se sienta parte de la
// app y no un hueco apagado.
export default function EmptyState({ titulo, descripcion, variant = 'normal' }) {
  return (
    <div className="empty-state">
      <BurgerMascot size={104} variant={variant} />
      <p className="empty-state__titulo">{titulo}</p>
      {descripcion && <p className="empty-state__descripcion">{descripcion}</p>}
    </div>
  );
}
