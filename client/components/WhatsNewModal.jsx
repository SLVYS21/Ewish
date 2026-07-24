import { useEffect, useState } from 'react';
import { X, Sparkles, Wrench, Zap } from 'lucide-react';
import versions from '../changelog/versions.json';
import s from './WhatsNewModal.module.css';

/* Clé localStorage : la dernière version vue par l'utilisateur.
   Comparée à versions[0].version pour décider si on montre la modal. */
const SEEN_KEY = 'mk_whats_new_seen';

/* Icône par type de highlight — cohérent avec la nomenclature interne :
   'feature' (nouveauté), 'improve' (amélioration), 'fix' (correction). */
const TYPE_META = {
  feature: { Icon: Sparkles, label: 'Nouveau',      color: '#FF5470' },
  improve: { Icon: Zap,      label: 'Amélioration', color: '#FFC145' },
  fix:     { Icon: Wrench,   label: 'Correctif',    color: '#7CE0C1' },
};

export default function WhatsNewModal() {
  const latest = versions[0];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!latest) return;
    let seen = null;
    try { seen = localStorage.getItem(SEEN_KEY); } catch { /* ignore */ }
    /* Cas 1re visite (seen === null) : on ne montre PAS la modal, on
       marque juste la version courante comme vue. Sinon on inonderait
       les nouveaux inscrits avec un historique qui ne les concerne pas. */
    if (seen === null) {
      try { localStorage.setItem(SEEN_KEY, latest.version); } catch { /* ignore */ }
      return;
    }
    if (seen !== latest.version) {
      /* Petit délai pour ne pas être en compétition avec le fade-in de la
         route au boot. 600ms = l'utilisateur a le temps d'atterrir. */
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [latest]);

  function close() {
    setOpen(false);
    try { localStorage.setItem(SEEN_KEY, latest.version); } catch { /* ignore */ }
  }

  if (!latest || !open) return null;

  return (
    <div className={s.overlay} onClick={close} role="dialog" aria-modal="true" aria-labelledby="whats-new-title">
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <button className={s.close} onClick={close} aria-label="Fermer">
          <X size={18} />
        </button>
        <div className={s.header}>
          <div className={s.version}>Version {latest.version}</div>
          <h2 id="whats-new-title" className={s.title}>{latest.title}</h2>
          {latest.summary && <p className={s.summary}>{latest.summary}</p>}
        </div>
        <ul className={s.list}>
          {(latest.highlights || []).map((h, i) => {
            const meta = TYPE_META[h.type] || TYPE_META.feature;
            const { Icon } = meta;
            return (
              <li key={i} className={s.item}>
                <span className={s.pill} style={{ background: meta.color + '22', color: meta.color }}>
                  <Icon size={12} /> {meta.label}
                </span>
                <span className={s.text}>{h.text}</span>
              </li>
            );
          })}
        </ul>
        <div className={s.actions}>
          <button className={s.cta} onClick={close}>C'est parti</button>
        </div>
      </div>
    </div>
  );
}
