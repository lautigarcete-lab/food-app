import React, { useRef, useState } from 'react';
import { Share2, Download, Upload, CheckCircle2 } from 'lucide-react';
import { generarRespaldo, restaurarRespaldo } from '../lib/db';

export default function RespaldoPage() {
  const inputRef = useRef(null);
  const [mensaje, setMensaje] = useState('');

  function nombreArchivo() {
    const fecha = new Date().toISOString().slice(0, 10);
    return `burgerpos-respaldo-${fecha}.json`;
  }

  async function compartirRespaldo() {
    const data = generarRespaldo();
    const contenido = JSON.stringify(data, null, 2);
    const archivo = new File([contenido], nombreArchivo(), { type: 'application/json' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [archivo] })) {
      try {
        await navigator.share({
          files: [archivo],
          title: 'Respaldo BurgerPOS',
          text: 'Respaldo de datos de BurgerPOS',
        });
        setMensaje('Respaldo compartido correctamente.');
        return;
      } catch {
        // el usuario canceló, seguimos con la descarga tradicional
      }
    }
    descargarRespaldo();
  }

  function descargarRespaldo() {
    const data = generarRespaldo();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo();
    a.click();
    URL.revokeObjectURL(url);
    setMensaje('Respaldo descargado correctamente.');
  }

  function onArchivoSeleccionado(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        restaurarRespaldo(data);
        setMensaje('Respaldo restaurado. Recargá la app para ver los cambios.');
      } catch {
        setMensaje('El archivo seleccionado no es un respaldo válido.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-5">Respaldo</h1>

      <div className="bg-white rounded-3xl p-5 mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Generá un archivo <strong>.json</strong> con todos tus insumos, platos, ventas y gastos
          para guardarlo o compartirlo.
        </p>
        <button
          onClick={compartirRespaldo}
          className="w-full bg-mint text-white font-bold py-3 rounded-3xl flex items-center justify-center gap-2 mb-3 active:scale-95 transition-transform"
        >
          <Share2 size={18} /> Compartir respaldo
        </button>
        <button
          onClick={descargarRespaldo}
          className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Download size={18} /> Descargar archivo
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5">
        <p className="text-sm text-gray-600 mb-4">
          Restaurar datos desde un archivo de respaldo previamente generado.
        </p>
        <input ref={inputRef} type="file" accept="application/json" onChange={onArchivoSeleccionado} className="hidden" />
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full bg-cheddar/20 text-gray-700 font-medium py-3 rounded-3xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Upload size={18} /> Restaurar respaldo
        </button>
      </div>

      {mensaje && (
        <div className="mt-4 flex items-center gap-2 text-sm text-mint bg-mint/10 rounded-3xl p-3">
          <CheckCircle2 size={16} /> {mensaje}
        </div>
      )}
    </div>
  );
}
