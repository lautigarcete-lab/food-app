import { Inbox, Users, AlertCircle, PhoneCall, BookOpen, PartyPopper, Wallet } from 'lucide-react';

// Ícono según el "tono" de la pantalla vacía. La variante viene de las
// pantallas que ya la venían pasando, así no hubo que tocarlas.
const ICONOS = {
  normal: Inbox,
  success: PartyPopper,
  balance: Wallet,
  clientes: Users,
  deben: AlertCircle,
  contactar: PhoneCall,
  catalogo: BookOpen,
};

export default function EmptyState({ titulo, descripcion, variant = 'normal' }) {
  const Icono = ICONOS[variant] || Inbox;
  return (
    <div className="empty-state">
      <div className="w-20 h-20 rounded-full bg-fudi-yellow/15 flex items-center justify-center text-fudi-red mb-1">
        <Icono size={36} strokeWidth={2} />
      </div>
      <p className="empty-state__titulo">{titulo}</p>
      {descripcion && <p className="empty-state__descripcion">{descripcion}</p>}
    </div>
  );
}
