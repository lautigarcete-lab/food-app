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

function PantallaEsperando({ texto, mostrarReintentar, onReintentar }) {
  return (
    <div className="pantalla-centrada">
      <BurgerMascot size={80} variant="normal" />
      <p className="marca">Fudi</p>
      <p className="ayuda-texto">{texto}</p>
      {mostrarReintentar && (
        <button type="button" className="btn btn--secundario" onClick={onReintentar}>
          Reintentar
        </button>
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
