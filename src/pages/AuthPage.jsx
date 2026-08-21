import { useState } from 'react';
import BurgerMascot from '../components/BurgerMascot.jsx';
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

  return (
    <div className="pantalla-centrada">
      <div className="pantalla-centrada__marca">
        <BurgerMascot size={90} variant="normal" />
        <h1>Fudi POS</h1>
        <p>Tu caja registradora de bolsillo</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
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
    </div>
  );
}
