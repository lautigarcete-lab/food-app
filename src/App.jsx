import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav.jsx';
import SideNav from './components/SideNav.jsx';
import FudiLogo from './components/FudiLogo.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import VenderPage from './pages/VenderPage.jsx';
import CatalogoPage from './pages/CatalogoPage.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import MasPage from './pages/MasPage.jsx';
import InsumosPage from './pages/InsumosPage.jsx';
import RecetasPage from './pages/RecetasPage.jsx';
import GastosPage from './pages/GastosPage.jsx';
import TareasPage from './pages/TareasPage.jsx';
import MetasPage from './pages/MetasPage.jsx';
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
      <SideNav vistaActual={vista} onCambiarVista={setVista} />
      <main className="app-main">
        {vista === 'inicio' && <DashboardPage setView={setVista} />}
        {vista === 'vender' && <VenderPage />}
        {vista === 'catalogo' && <CatalogoPage />}
        {vista === 'clientes' && <ClientesPage />}
        {vista === 'mas' && <MasPage onIr={setVista} />}
        {vista === 'insumos' && <InsumosPage onVolver={volverAMas} />}
        {vista === 'recetas' && <RecetasPage onVolver={volverAMas} />}
        {vista === 'gastos' && <GastosPage onVolver={volverAMas} />}
        {vista === 'tareas' && <TareasPage onVolver={volverAMas} />}
        {vista === 'metas' && <MetasPage onVolver={volverAMas} />}
        {vista === 'respaldo' && <RespaldoPage onVolver={volverAMas} />}
        {vista === 'cuenta' && <CuentaPage onVolver={volverAMas} />}
      </main>
      <div className="lg:hidden">
        <BottomNav vistaActual={vista} onCambiarVista={setVista} />
      </div>
    </div>
  );
}

function PantallaEsperando({ texto, mostrarReintentar, onReintentar }) {
  return (
    <div className="min-h-screen bg-fudi-bg font-sans flex flex-col items-center justify-center px-8 text-center">
      <FudiLogo size={88} />
      <h1 className="text-3xl font-black tracking-tight text-fudi-text mt-7">Fudi</h1>
      <p className="text-sm font-medium text-fudi-muted mt-2 max-w-[16rem]">{texto}</p>

      {mostrarReintentar ? (
        <button
          type="button"
          onClick={onReintentar}
          className="mt-7 bg-fudi-yellow text-fudi-text rounded-2xl font-bold min-h-[52px] px-8 shadow-sm transition-transform active:scale-[0.98]"
        >
          Reintentar
        </button>
      ) : (
        <div className="flex gap-2 mt-7" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-fudi-yellow animar-punto"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Si algo tarda más de lo normal (típicamente: sin señal), después de unos
// segundos habilita un botón de reintentar en vez de dejar a la persona
// mirando "Cargando…" sin ninguna acción posible.
function useTardaDemasiado(activo, ms = 9000) {
  const [tarda, setTarda] = useState(false);
  useEffect(() => {
    if (!activo) {
      setTarda(false);
      return;
    }
    const id = setTimeout(() => setTarda(true), ms);
    return () => clearTimeout(id);
  }, [activo, ms]);
  return tarda;
}

function ConNegocio() {
  const { negocios, negocioActivo, errorNegocios, refrescarNegocios } = useNegocio();
  const cargando = negocios === undefined;
  const tarda = useTardaDemasiado(cargando && !errorNegocios);

  if (cargando) {
    const sinConexion = typeof navigator !== 'undefined' && navigator.onLine === false;
    let texto = 'Buscando tu negocio…';
    if (errorNegocios) {
      texto = sinConexion ? 'Sin conexión. Vas a poder entrar apenas vuelva la señal.' : 'No se pudo cargar tu negocio.';
    } else if (tarda) {
      texto = sinConexion ? 'Sin conexión. Esperando señal…' : 'Esto está tardando más de lo normal…';
    }
    return (
      <PantallaEsperando
        texto={texto}
        mostrarReintentar={Boolean(errorNegocios) || tarda}
        onReintentar={() => refrescarNegocios().catch(() => {})}
      />
    );
  }
  if (!negocioActivo) return <SeleccionarNegocioPage />;
  return <AppPrincipal />;
}

export default function App() {
  const { usuario } = useAuth();
  const tardaAuth = useTardaDemasiado(usuario === undefined);

  // Avisa a la red de seguridad de arranque (index.html) que React montó y
  // está renderizando: de acá en más, si algo se cuelga (sesión, negocio),
  // cada pantalla lo maneja con su propio mensaje y botón de reintentar en
  // vez de la pantalla de error genérica de esa red de seguridad.
  useEffect(() => {
    window.__fudiMontada = true;
  }, []);

  if (usuario === undefined) {
    return (
      <PantallaEsperando
        texto={tardaAuth ? 'Esto está tardando más de lo normal…' : 'Cargando…'}
        mostrarReintentar={tardaAuth}
        onReintentar={() => window.location.reload()}
      />
    );
  }
  if (usuario === null) return <AuthPage />;

  return (
    <NegocioProvider uid={usuario.uid}>
      <ConNegocio />
    </NegocioProvider>
  );
}
