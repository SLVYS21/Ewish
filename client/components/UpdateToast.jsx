import { RefreshCw, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { usePwaUpdate } from '../hooks/usePwaUpdate';
import s from './UpdateToast.module.css';

/* Routes publiques (destinataire / visiteur d'un mur ou d'une carte) sur
   lesquelles le toast "Nouvelle version" ne doit PAS s'afficher — le
   visiteur n'est pas là pour gérer sa PWA. Match par préfixe. */
const PUBLIC_ROUTE_PREFIXES = ['/m/', '/g/', '/c/', '/s/', '/site/', '/collect/', '/wall/'];

/* Toast global "Nouvelle version disponible".
   Monté une seule fois près de la racine (App.jsx) pour éviter que le hook
   PWA s'enregistre plusieurs fois. Non-bloquant, ferme-able, auto-force
   après 24h d'inactivité (voir usePwaUpdate). */
export default function UpdateToast() {
  const { needRefresh, dismiss, update } = usePwaUpdate();
  const { pathname } = useLocation();
  const onPublicRoute = PUBLIC_ROUTE_PREFIXES.some(p => pathname.startsWith(p));
  if (!needRefresh || onPublicRoute) return null;
  return (
    <div className={s.toast} role="status" aria-live="polite">
      <div className={s.dot} aria-hidden="true" />
      <div className={s.body}>
        <div className={s.title}>Nouvelle version disponible</div>
        <div className={s.sub}>Recharge pour bénéficier des dernières améliorations.</div>
      </div>
      <button className={s.btn} onClick={update}>
        <RefreshCw size={13} /> Mettre à jour
      </button>
      <button className={s.close} onClick={dismiss} aria-label="Plus tard">
        <X size={15} />
      </button>
    </div>
  );
}
