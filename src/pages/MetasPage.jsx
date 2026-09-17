import { useEffect, useState } from 'react';
import { Target, Check } from 'lucide-react';
import Header from '../components/Header.jsx';
import {
  PERIODOS_META,
  listarMetas,
  guardarMeta,
  progresoDeMeta,
} from '../db/repositories/metasRepo.js';
import { formatMoney, toNumber } from '../utils/money.js';

export default function MetasPage({ onVolver }) {
  const [valores, setValores] = useState({ dia: '', mes: '' });
  const [progresos, setProgresos] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function refrescar() {
    const metas = await listarMetas();
    const porPeriodo = {};
    const avances = {};
    for (const p of PERIODOS_META) {
      const meta = metas.find((m) => m.id === p.id);
      porPeriodo[p.id] = meta ? String(meta.monto) : '';
      if (meta) avances[p.id] = await progresoDeMeta(p.id, meta.monto);
    }
    setValores(porPeriodo);
    setProgresos(avances);
    setCargando(false);
  }

  useEffect(() => {
    refrescar().catch(() => setCargando(false));
  }, []);

  async function handleGuardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    setMensaje('');
    try {
      for (const p of PERIODOS_META) {
        await guardarMeta(p.id, toNumber(valores[p.id]));
      }
      await refrescar();
      setMensaje('Listo, se guardaron tus metas.');
    } catch (err) {
      setError(err.message || 'No se pudieron guardar las metas.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="page">
      <Header titulo="Metas" subtitulo="Cuánto te proponés vender" onVolver={onVolver} />
      <div className="page__content">
        <p className="ayuda-texto">
          Poné cuánto querés cobrar por día y por mes. En el inicio vas a ver cómo venís y cuánto te
          falta. Dejalo en cero o vacío si no querés esa meta.
        </p>

        {cargando ? (
          <p className="ayuda-texto">Cargando…</p>
        ) : (
          <form className="form" onSubmit={handleGuardar}>
            {PERIODOS_META.map((p) => {
              const avance = progresos[p.id];
              return (
                <div key={p.id} className="bg-white rounded-[24px] p-4 shadow-soft">
                  <label className="campo">
                    <span>{p.largo}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={valores[p.id]}
                      onChange={(e) => setValores((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      placeholder={p.id === 'dia' ? 'Ej: 80000' : 'Ej: 1500000'}
                    />
                  </label>

                  {avance && (
                    <div className="mt-3">
                      <BarraMeta avance={avance} />
                      <p className="text-xs font-medium text-fudi-muted mt-2">
                        Llevás {formatMoney(avance.cobrado)} de {formatMoney(avance.objetivo)}.
                        {avance.cumplida
                          ? ' ¡Ya la cumpliste!'
                          : ` Te faltan ${formatMoney(avance.falta)}.`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {error && <p className="mensaje-error">{error}</p>}
            {mensaje && <p className="mensaje-ok">{mensaje}</p>}

            <button type="submit" className="btn btn--primario" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar metas'}
            </button>
          </form>
        )}

        <div className="espaciador" />
        <p className="ayuda-texto">
          Se cuenta lo <strong>cobrado</strong>, no lo facturado: un fiado recién suma cuando te lo
          pagan. Si no, la meta se cumpliría con plata que todavía no está en la caja.
        </p>
      </div>
    </div>
  );
}

/** Barra de avance. Verde al cumplirse, bordó mientras tanto. */
export function BarraMeta({ avance, className = '' }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-fudi-muted uppercase tracking-wide">
          {avance.porcentaje}%
        </span>
        {avance.cumplida ? (
          <span className="flex items-center gap-1 text-xs font-bold text-green-600">
            <Check size={14} strokeWidth={3} />
            Cumplida
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-fudi-muted">
            <Target size={13} strokeWidth={2.5} />
            {formatMoney(avance.objetivo)}
          </span>
        )}
      </div>
      <div className="h-2.5 w-full rounded-full bg-fudi-red/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            avance.cumplida ? 'bg-green-500' : 'bg-fudi-red'
          }`}
          style={{ width: `${Math.max(avance.porcentaje, avance.cobrado > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  );
}
