import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config.js';

const AuthContext = createContext(null);

const ERRORES = {
  'auth/invalid-email': 'El correo no es válido.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/user-not-found': 'No hay ninguna cuenta con ese correo.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo en unos minutos.',
  'auth/network-request-failed': 'No hay conexión a internet.',
};

export function mensajeDeError(error) {
  return ERRORES[error?.code] || 'Ocurrió un error. Probá de nuevo.';
}

export function AuthProvider({ children }) {
  // undefined = todavía no sabemos (cargando), null = no hay sesión
  const [usuario, setUsuario] = useState(undefined);

  useEffect(() => onAuthStateChanged(auth, setUsuario), []);

  async function iniciarSesion(email, password) {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }

  async function crearCuenta(nombre, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: nombre.trim() });
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      nombre: nombre.trim(),
      email: cred.user.email,
      creadoEn: new Date().toISOString(),
    });
    return cred.user;
  }

  function cerrarSesion() {
    return signOut(auth);
  }

  const value = { usuario, iniciarSesion, crearCuenta, cerrarSesion };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
