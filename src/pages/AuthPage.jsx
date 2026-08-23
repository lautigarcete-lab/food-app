import { useState } from 'react';
import CampoTexto from '../components/CampoTexto.jsx';
import { useAuth, mensajeDeError } from '../auth/AuthContext.jsx';

export default function AuthPage() {
  const { iniciarSesion, crearCuenta } = useAuth();
  const [modo, setModo] = useState('ingresar'); // 'ingresar' | 'crear'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError(modo === 'crear' ? 'Completá el correo y la contraseña.' : 'Completá el usuario y la clave.');
      return;
    }
    if (modo === 'crear' && !nombre.trim()) {
      setError('Ingresá tu nombre.');
      return;
    }
    setEnviando(true);
    try {
      if (modo === 'crear') {
        await crearCuenta(nombre, email, password);
      } else {
        await iniciarSesion(email, password);
      }
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-fudi-bg font-sans flex flex-col w-full max-w-[520px] mx-auto">
      {/* Cabecera con la misma tarjeta bordó del inicio */}
      <div className="px-6 pt-14 pb-2">
        <div className="bg-gradient-to-br from-fudi-red to-fudi-red-dark rounded-[32px] p-8 text-white relative overflow-hidden shadow-soft">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-fudi-yellow rounded-full opacity-90"></div>
          <div className="absolute right-12 top-10 w-8 h-8 rounded-full border-2 border-white/30"></div>
          <div className="absolute left-6 bottom-6 w-2 h-2 bg-white/50 rounded-full"></div>

          <h1 className="text-4xl font-black tracking-tight relative z-10">Fudi</h1>
          <p className="text-white/80 text-sm font-medium mt-2 relative z-10">
            Tu caja registradora de bolsillo
          </p>
        </div>
      </div>

      <div className="px-6 mt-6 flex-1">
        <h2 className="text-2xl font-extrabold text-fudi-text mb-1">
          {modo === 'crear' ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>
        <p className="text-sm font-medium text-fudi-muted mb-5">
          {modo === 'crear'
            ? 'Con tu correo y una contraseña alcanza.'
            : 'Con tu correo, o con el usuario que te dio el dueño del negocio.'}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {modo === 'crear' && (
            <CampoTexto
              etiqueta="Tu nombre"
              value={nombre}
              onChange={setNombre}
              placeholder="Ej: Lautaro"
              autoFocus
            />
          )}
          <CampoTexto
            etiqueta={modo === 'crear' ? 'Correo' : 'Correo o usuario'}
            type={modo === 'crear' ? 'email' : 'text'}
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            value={email}
            onChange={setEmail}
            placeholder={modo === 'crear' ? 'tu@correo.com' : 'tu@correo.com o juan@tunegocio'}
            autoFocus={modo === 'ingresar'}
          />
          <CampoTexto
            etiqueta={modo === 'crear' ? 'Contraseña (mínimo 6 caracteres)' : 'Contraseña'}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          {error && (
            <p className="text-sm font-semibold text-fudi-red bg-red-50 rounded-2xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-fudi-yellow text-fudi-text rounded-2xl font-bold min-h-[54px] px-6 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {enviando ? 'Un segundo…' : modo === 'crear' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <button
          type="button"
          className="w-full mt-5 mb-10 text-sm font-semibold text-fudi-red"
          onClick={() => {
            setModo((m) => (m === 'crear' ? 'ingresar' : 'crear'));
            setError('');
          }}
        >
          {modo === 'crear' ? '¿Ya tenés cuenta? Iniciá sesión' : 'Crear cuenta nueva'}
        </button>
      </div>
    </div>
  );
}
