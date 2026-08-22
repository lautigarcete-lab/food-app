import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav.jsx';
import BurgerMascot from './components/BurgerMascot.jsx';
import InicioPage from './pages/InicioPage.jsx';
import VenderPage from './pages/VenderPage.jsx';
import CatalogoPage from './pages/CatalogoPage.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import MasPage from './pages/MasPage.jsx';
import InsumosPage from './pages/InsumosPage.jsx';
import GastosPage from './pages/GastosPage.jsx';
import TareasPage from './pages/TareasPage.jsx';
import RespaldoPage from './pages/RespaldoPage.jsx';
import CuentaPage from './pages/CuentaPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import SeleccionarNegocioPage from './pages/SeleccionarNegocioPage.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import { NegocioProvider, useNegocio } from './negocio/NegocioContext.jsx';

// Navegación plana a propósito (sin router ni menús anidados): un solo
// estado de "vista actual" que decide qué pantalla mostrar. Las vistas
// insumos/gastos/tareas/cuenta cuelgan de "Más" pero se manejan igual acá.
function AppPrincipal() {
  const [vista, setVista] = useState('inicio');

  const volverAMas = () => setVista('mas');

  return (
    <div className="app-shell">
      <main className="app-main">
        {vista === 'inicio' && <InicioPage onIr={setVista} />}
        {vista === 'vender' && <VenderPage />}
        {vista === 'catalogo' && <CatalogoPage />}
        {vista === 'clientes' && <ClientesPage />}
        {vista === 'mas' && <MasPage onIr={setVista} />}
        {vista === 'insumos' && <InsumosPage onVolver={volverAMas} />}
        {vista === 'gastos' && <GastosPage onVolver={volverAMas} />}
        {vista === 'tareas' && <TareasPage onVolver={volverAMas} />}
        {vista === 'respaldo' && <RespaldoPage onVolver={volverAMas} />}
        {vista === 'cuenta' && <CuentaPage onVolver={volverAMas} />}
      </main>
      <BottomNav vistaActual={vista} onCambiarVista={setVista} />
    </div>
  );
}

function PantallaCargando() {
  return (
    <div className="pantalla-centrada">
      <BurgerMascot size={80} variant="normal" />
      <p className="marca">Fudi</p>
      <p className="ayuda-texto">Cargando…</p>
    </div>
  );
}

function ConNegocio() {
  const { negocios, negocioActivo } = useNegocio();
  if (negocios === undefined) return <PantallaCargando />;
  if (!negocioActivo) return <SeleccionarNegocioPage />;
  return <AppPrincipal />;
}

export default function App() {
  const { usuario } = useAuth();

  // Avisa a la red de seguridad de arranque (index.html) que Firebase Auth
  // ya resolvió (con o sin usuario) y que el bloqueo de 15s ya no aplica.
  useEffect(() => {
    if (usuario !== undefined) window.__fudiMontada = true;
  }, [usuario]);

  if (usuario === undefined) return <PantallaCargando />;
  if (usuario === null) return <AuthPage />;

  return (
    <NegocioProvider uid={usuario.uid}>
      <ConNegocio />
    </NegocioProvider>
  );
}
