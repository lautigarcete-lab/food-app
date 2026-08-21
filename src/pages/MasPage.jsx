import { useState } from 'react';
import Header from '../components/Header.jsx';
import CierreJornadaModal from './CierreJornadaModal.jsx';
import { IconInsumos, IconGastos, IconTareas, IconRespaldo, IconCierre } from '../components/icons.jsx';

const OPCIONES = [
  { id: 'insumos', label: 'Insumos', descripcion: 'Stock, mínimos y mermas', Icon: IconInsumos },
  { id: 'gastos', label: 'Gastos', descripcion: 'Registro de gastos del negocio', Icon: IconGastos },
  { id: 'cierre', label: 'Cierre de jornada', descripcion: 'Balance del día por medio de pago', Icon: IconCierre },
  { id: 'tareas', label: 'Organización', descripcion: 'Tareas y calendario de publicaciones', Icon: IconTareas },
  { id: 'respaldo', label: 'Respaldo', descripcion: 'Guardar y restaurar todos tus datos', Icon: IconRespaldo },
];

export default function MasPage({ onIr }) {
  const [verCierre, setVerCierre] = useState(false);

  function handleClick(id) {
    if (id === 'cierre') {
      setVerCierre(true);
      return;
    }
    onIr(id);
  }

  return (
    <div className="page">
      <Header titulo="Más" />
      <div className="page__content">
        <div className="lista-opciones">
          {OPCIONES.map(({ id, label, descripcion, Icon }) => (
            <button key={id} type="button" className="opcion-card" onClick={() => handleClick(id)}>
              <span className="opcion-card__icono">
                <Icon width={26} height={26} />
              </span>
              <span className="opcion-card__texto">
                <strong>{label}</strong>
                <small>{descripcion}</small>
              </span>
            </button>
          ))}
        </div>
      </div>

      {verCierre && <CierreJornadaModal onClose={() => setVerCierre(false)} />}
    </div>
  );
}
