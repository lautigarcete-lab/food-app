import { IconInicio, IconVender, IconMas } from './icons.jsx';
import BurgerMascot from './BurgerMascot.jsx';

// Catálogo y Clientes usan la mascota (variantes 'catalogo' y 'clientes')
// en vez de un ícono de línea, así que se envuelven para que reciban las
// mismas props de tamaño que el resto.
const MascotaCatalogo = (props) => <BurgerMascot size={props.width} variant="catalogo" icono />;
const MascotaClientes = (props) => <BurgerMascot size={props.width} variant="clientes" icono />;

const TABS_IZQ = [
  { id: 'inicio', label: 'Inicio', Icon: IconInicio },
  { id: 'catalogo', label: 'Catálogo', Icon: MascotaCatalogo },
];

const TABS_DER = [
  { id: 'clientes', label: 'Clientes', Icon: MascotaClientes },
  { id: 'mas', label: 'Más', Icon: IconMas },
];

// Las sub-vistas (insumos, gastos, tareas, respaldo, cuenta) cuelgan de
// "Más" y se muestran como activo el ícono "Más" para no confundir con
// menús anidados.
const GRUPO_MAS = new Set(['mas', 'insumos', 'recetas', 'gastos', 'tareas', 'respaldo', 'cuenta']);

export default function BottomNav({ vistaActual, onCambiarVista }) {
  function activo(id) {
    return id === 'mas' ? GRUPO_MAS.has(vistaActual) : vistaActual === id;
  }

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <div className="bottom-nav__fila">
        {TABS_IZQ.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`bottom-nav__item${activo(id) ? ' is-active' : ''}`}
            onClick={() => onCambiarVista(id)}
          >
            <Icon width={34} height={34} />
            <span>{label}</span>
          </button>
        ))}

        <button
          type="button"
          className={`bottom-nav__central${activo('vender') ? ' is-active' : ''}`}
          onClick={() => onCambiarVista('vender')}
          aria-label="Vender"
        >
          <IconVender width={26} height={26} />
        </button>

        {TABS_DER.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`bottom-nav__item${activo(id) ? ' is-active' : ''}`}
            onClick={() => onCambiarVista(id)}
          >
            <Icon width={34} height={34} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
