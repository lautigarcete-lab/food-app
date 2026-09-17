import { Home, ShoppingBag, BookOpen, Users, Settings } from 'lucide-react';
import { MarcaF } from './FudiLogo.jsx';
import NegocioAvatar from './NegocioAvatar.jsx';
import { useNegocio } from '../negocio/NegocioContext.jsx';

// Menú lateral para pantallas grandes (notebook, PC). En el celular no se
// muestra: ahí manda la píldora flotante de abajo.
const NAV = [
  { id: 'home', vista: 'inicio', icon: Home, label: 'Inicio' },
  { id: 'vender', vista: 'vender', icon: ShoppingBag, label: 'Vender' },
  { id: 'catalogo', vista: 'catalogo', icon: BookOpen, label: 'Catálogo' },
  { id: 'clientes', vista: 'clientes', icon: Users, label: 'Clientes' },
  { id: 'ajustes', vista: 'mas', icon: Settings, label: 'Ajustes' },
];

const GRUPO_AJUSTES = new Set(['mas', 'insumos', 'recetas', 'gastos', 'tareas', 'metas', 'respaldo', 'cuenta']);

export default function SideNav({ vistaActual, onCambiarVista }) {
  const { negocioActivo } = useNegocio();

  return (
    <nav className="hidden lg:flex flex-col w-[240px] shrink-0 h-full px-4 py-6 border-r border-fudi-red/10">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-fudi-red flex items-center justify-center shrink-0">
          <MarcaF size={40} />
        </div>
        <span className="text-xl font-black tracking-tight text-fudi-text">Fudi</span>
      </div>

      <div className="flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.vista === 'mas' ? GRUPO_AJUSTES.has(vistaActual) : vistaActual === item.vista;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onCambiarVista(item.vista)}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-colors ${
                isActive
                  ? 'bg-fudi-red text-white font-bold'
                  : 'text-fudi-muted hover:bg-fudi-red/5 font-semibold'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

      {negocioActivo && (
        <button
          type="button"
          onClick={() => onCambiarVista('cuenta')}
          className="mt-auto flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-fudi-red/5 transition-colors text-left min-w-0"
        >
          <NegocioAvatar negocio={negocioActivo} size={36} />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-fudi-text truncate">
              {negocioActivo.nombre}
            </span>
            <span className="block text-xs font-medium text-fudi-muted">Ver cuenta</span>
          </span>
        </button>
      )}
    </nav>
  );
}
