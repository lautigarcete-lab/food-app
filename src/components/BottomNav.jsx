import { Home, ShoppingBag, BookOpen, Settings } from 'lucide-react';

// Menú inferior flotante tipo píldora.
//
// Los ids del diseño (home / vender / catalogo / ajustes) se mapean a las
// vistas que ya existen en App.jsx, para no tocar la navegación. Clientes
// dejó de tener pestaña propia y se entra desde Ajustes ("Más").
const NAV = [
  { id: 'home', vista: 'inicio', icon: Home, label: 'Inicio' },
  { id: 'vender', vista: 'vender', icon: ShoppingBag, label: 'Vender' },
  { id: 'catalogo', vista: 'catalogo', icon: BookOpen, label: 'Catálogo' },
  { id: 'ajustes', vista: 'mas', icon: Settings, label: 'Ajustes' },
];

// Las sub-vistas cuelgan de Ajustes y lo dejan marcado como activo.
const GRUPO_AJUSTES = new Set(['mas', 'insumos', 'recetas', 'gastos', 'tareas', 'respaldo', 'cuenta', 'clientes']);

export default function BottomNav({ vistaActual, onCambiarVista }) {
  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 mx-auto max-w-[472px]">
      <div className="bg-fudi-red rounded-full px-6 py-4 flex justify-between items-center shadow-float">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.vista === 'mas' ? GRUPO_AJUSTES.has(vistaActual) : vistaActual === item.vista;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              onClick={() => onCambiarVista(item.vista)}
              className={`relative p-3 rounded-full transition-all duration-300 ${
                isActive ? 'bg-fudi-yellow shadow-lg -translate-y-2' : 'bg-transparent hover:bg-white/10'
              }`}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-white' : 'text-white/60'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
