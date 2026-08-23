import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import './styles/index.css'

// Service worker: hace que la app abra sin señal y que se pueda instalar
// desde el navegador (en iPhone, "Agregar a inicio" desde Safari). En
// desarrollo no se registra para no servir código viejo mientras se trabaja.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
