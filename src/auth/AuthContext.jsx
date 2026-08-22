import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  PhoneAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  'auth/account-exists-with-different-credential':
    'Ya existe una cuenta con ese correo usando otro método de inicio de sesión.',
  'auth/invalid-verification-code': 'El código ingresado no es correcto.',
  'auth/invalid-phone-number':
    'El número de teléfono no es válido. Escribilo con código de país, ej: +54 9 11 5555 5555.',
  'auth/missing-verification-code': 'Ingresá el código que te llegó por SMS.',
  'auth/code-expired': 'El código venció. Pedí uno nuevo.',
};

export function mensajeDeError(error) {
  return ERRORES[error?.code] || error?.message || 'Ocurrió un error. Probá de nuevo.';
}

// Login con Google o teléfono no pasan por crearCuenta (que arma este
// documento a mano con el nombre que la persona escribió), así que acá se
// crea solo si todavía no existe.
async function asegurarPerfilUsuario(user) {
  const ref = doc(db, 'usuarios', user.uid);
  const existente = await getDoc(ref);
  if (existente.exists()) return;
  const datos = {
    nombre: user.displayName || (user.phoneNumber ? `Usuario ${user.phoneNumber.slice(-4)}` : 'Usuario'),
    creadoEn: new Date().toISOString(),
  };
  if (user.email) datos.email = user.email;
  if (user.phoneNumber) datos.telefono = user.phoneNumber;
  await setDoc(ref, datos);
}

export function AuthProvider({ children }) {
  // undefined = todavía no sabemos (cargando), null = no hay sesión
  const [usuario, setUsuario] = useState(undefined);
  const verificationIdRef = useRef(null);

  useEffect(() => onAuthStateChanged(auth, setUsuario), []);

  // En Android/iOS el plugin de Capacitor verifica el teléfono en la capa
  // nativa. Cuando el propio teléfono se autoverifica sin pedirle el código
  // a la persona, este listener hace el mismo puente hacia el SDK de
  // Firebase que usa el resto de la app (ver iniciarSesionConGoogle).
  useEffect(() => {
    let montado = true;
    const handles = [];
    (async () => {
      const h1 = await FirebaseAuthentication.addListener('phoneCodeSent', (event) => {
        verificationIdRef.current = event.verificationId;
      });
      const h2 = await FirebaseAuthentication.addListener('phoneVerificationCompleted', async (event) => {
        if (!event.verificationCode || !verificationIdRef.current) return;
        try {
          const credential = PhoneAuthProvider.credential(verificationIdRef.current, event.verificationCode);
          await signInWithCredential(auth, credential);
        } catch {
          // Si falla el puente automático, la persona igual puede escribir el código a mano.
        }
      });
      if (montado) {
        handles.push(h1, h2);
      } else {
        h1.remove();
        h2.remove();
      }
    })();
    return () => {
      montado = false;
      handles.forEach((h) => h.remove());
    };
  }, []);

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

  async function iniciarSesionConGoogle() {
    const resultado = await FirebaseAuthentication.signInWithGoogle();
    // En la web el plugin ya usa el mismo SDK de Firebase que el resto de la
    // app, así que auth.currentUser queda listo solo. En Android/iOS el
    // inicio de sesión ocurre en la capa nativa y hay que replicarlo acá.
    if (Capacitor.isNativePlatform()) {
      const idToken = resultado.credential?.idToken;
      if (!idToken) throw new Error('Google no devolvió las credenciales esperadas.');
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    }
    if (auth.currentUser) await asegurarPerfilUsuario(auth.currentUser);
  }

  async function enviarCodigoTelefono(numero) {
    verificationIdRef.current = null;
    await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber: numero.trim() });
  }

  async function confirmarCodigoTelefono(codigo) {
    if (!verificationIdRef.current) throw { code: 'auth/code-expired' };
    const credential = PhoneAuthProvider.credential(verificationIdRef.current, codigo.trim());
    await signInWithCredential(auth, credential);
    if (auth.currentUser) await asegurarPerfilUsuario(auth.currentUser);
  }

  function cerrarSesion() {
    return signOut(auth);
  }

  const value = {
    usuario,
    iniciarSesion,
    crearCuenta,
    iniciarSesionConGoogle,
    enviarCodigoTelefono,
    confirmarCodigoTelefono,
    cerrarSesion,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
