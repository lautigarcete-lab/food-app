import React, { useState } from 'react';
import { ShoppingCart, UtensilsCrossed, Package, Wallet, DatabaseBackup } from 'lucide-react';
import BurgerMascot from './components/BurgerMascot';
import VenderPage from './pages/VenderPage';
import PlatosPage from './pages/PlatosPage';
import InsumosPage from './pages/InsumosPage';
import GastosPage from './pages/GastosPage';
import RespaldoPage from './pages/RespaldoPage';

const TABS = [
  { id: 'vender', label: 'Vender', icon: ShoppingCart, Componente: VenderPage },
  { id: 'platos', label: 'Platos', icon: UtensilsCrossed, Componente: PlatosPage },
  { id: 'insumos', label: 'Insumos', icon: Package, Componente: InsumosPage },
  { id: 'gastos', label: 'Gastos', icon: Wallet, Componente: GastosPage },
  { id: 'respaldo', label: 'Respaldo', icon: DatabaseBackup, Componente: RespaldoPage },
];

export default function App() {
  const [tabActiva, setTabActiva] = useState('vender');
  const tab = TABS.find((t) => t.id === tabActiva);
  const Pagina = tab.Componente;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-6 pb-2">
        <BurgerMascot size={44} />
        <div>
          <h1 className="font-display font-black text-xl text-gray-800 leading-tight">Fudi POS</h1>
          <p className="text-xs text-gray-400">Tu caja registradora de bolsillo</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Pagina />
      </main>

      <nav className="grid grid-cols-5 bg-white border-t border-gray-100 sticky bottom-0 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTabActiva(id)}
            className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              tabActiva === id ? 'text-mint' : 'text-gray-400'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
