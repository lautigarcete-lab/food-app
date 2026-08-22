import { useState } from 'react';
import BurgerMascot from '../components/BurgerMascot.jsx';
import { useAuth, mensajeDeError } from '../auth/AuthContext.jsx';

export default function AuthPage() {
  const { iniciarSesion, crearCuenta, iniciarSesionConGoogle, enviarCodigoTelefono, confirmarCodigoTelefono } =
    useAuth();
  const [metodo, setMetodo] = useState('correo'); // 'correo' | 'telefono'
  const [modo, setModo] = useState('ingresar'); // 'ingresar' | 'crear' (solo para 'correo')
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  function cambiarMetodo(m) {
    setMetodo(m);
    setError('');
    setCodigoEnviado(false);
    setCodigo('');
  }

  async function handleSubmitCorreo(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Completá el correo y la contraseña.');
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

  async function handleGoogle() {
    setError('');
    setEnviando(true);
    try {
      await iniciarSesionConGoogle();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  async function handleEnviarCodigo(e) {
    e.preventDefault();
    setError('');
    if (!telefono.trim().startsWith('+')) {
      setError('Escribí el número con código de país, ej: +54 9 11 5555 5555.');
      return;
    }
    setEnviando(true);
    try {
      await enviarCodigoTelefono(telefono);
      setCodigoEnviado(true);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  async function handleConfirmarCodigo(e) {
    e.preventDefault();
    setError('');
    if (codigo.trim().length < 6) {
      setError('Ingresá el código de 6 dígitos que te llegó por SMS.');
      return;
    }
    setEnviando(true);
    try {
      await confirmarCodigoTelefono(codigo);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pantalla-centrada">
      <div className="pantalla-centrada__marca">
        <BurgerMascot size={90} variant="normal" />
        <h1>Fudi POS</h1>
        <p>Tu caja registradora de bolsillo</p>
      </div>

      <button type="button" className="btn btn--secundario" onClick={handleGoogle} disabled={enviando}>
        Continuar con Google
      </button>

      <div className="separador-o">
        <span>o</span>
      </div>

      <div className="tabs-metodo">
        <button
          type="button"
          className={metodo === 'correo' ? 'tab-activo' : 'tab'}
          onClick={() => cambiarMetodo('correo')}
        >
          Correo
        </button>
        <button
          type="button"
          className={metodo === 'telefono' ? 'tab-activo' : 'tab'}
          onClick={() => cambiarMetodo('telefono')}
        >
          Teléfono
        </button>
      </div>

      {metodo === 'correo' && (
        <>
          <form className="form" onSubmit={handleSubmitCorreo}>
            {modo === 'crear' && (
              <label className="campo">
                <span>Tu nombre</span>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Lautaro" autoFocus />
              </label>
            )}
            <label className="campo">
              <span>Correo</span>
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoFocus={modo === 'ingresar'}
              />
            </label>
            <label className="campo">
              <span>Contraseña {modo === 'crear' && '(mínimo 6 caracteres)'}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            {error && <p className="mensaje-error">{error}</p>}

            <button type="submit" className="btn btn--primario" disabled={enviando}>
              {enviando ? 'Un segundo…' : modo === 'crear' ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </form>

          <button
            type="button"
            className="enlace-alterno"
            onClick={() => {
              setModo((m) => (m === 'crear' ? 'ingresar' : 'crear'));
              setError('');
            }}
          >
            {modo === 'crear' ? '¿Ya tenés cuenta? Iniciá sesión' : 'Crear cuenta nueva'}
          </button>
        </>
      )}

      {metodo === 'telefono' && !codigoEnviado && (
        <form className="form" onSubmit={handleEnviarCodigo}>
          <label className="campo">
            <span>Número de teléfono</span>
            <input
              type="tel"
              inputMode="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+54 9 11 5555 5555"
              autoFocus
            />
          </label>
          {error && <p className="mensaje-error">{error}</p>}
          <button type="submit" className="btn btn--primario" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar código por SMS'}
          </button>
        </form>
      )}

      {metodo === 'telefono' && codigoEnviado && (
        <form className="form" onSubmit={handleConfirmarCodigo}>
          <p className="ayuda-texto">Te enviamos un código por SMS a {telefono}.</p>
          <label className="campo">
            <span>Código</span>
            <input
              type="text"
              inputMode="numeric"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="123456"
              autoFocus
            />
          </label>
          {error && <p className="mensaje-error">{error}</p>}
          <button type="submit" className="btn btn--primario" disabled={enviando}>
            {enviando ? 'Confirmando…' : 'Confirmar código'}
          </button>
          <button type="button" className="enlace-alterno" onClick={() => setCodigoEnviado(false)}>
            Usar otro número
          </button>
        </form>
      )}
    </div>
  );
}
