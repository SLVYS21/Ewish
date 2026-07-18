import { Check } from 'lucide-react';
import s from '../WizardWall.module.css';
import { WALL_EVENTS } from '../constants';

/* ══════════════════════════════════════════════════════════
   Étape 1 — Choix de l'évènement
   Applique : Goal Gradient (progress 20% de base) + Smart Default
   (Anniversaire pré-sélectionné, couvre ~70% des cas).
   ══════════════════════════════════════════════════════════ */
export default function StepEvent({ state, update }) {
  return (
    <>
      <div className={s.stepHeader}>
        <div className={s.stepEyebrow}>Étape 1 — Événement</div>
        <h1 className={s.stepTitle}>Quelle est l'occasion ?</h1>
        <p className={s.stepSubtitle}>
          On adapte le titre, les confettis et le ton du mur en fonction de l'évènement.
          Anniversaire est pré-sélectionné — le plus courant.
        </p>
      </div>

      <div className={s.cardGrid} role="radiogroup" aria-label="Type d'évènement">
        {WALL_EVENTS.map((ev) => {
          const Icon = ev.Icon;
          const active = ev.id === state.eventId;
          return (
            <button
              key={ev.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={s.selectCard}
              data-active={active}
              onClick={() => update({ eventId: ev.id })}
            >
              <span className={s.cardCheck} aria-hidden><Check size={14} /></span>
              <span
                className={s.cardIcon}
                style={{ background: ev.accent }}
                aria-hidden
              >
                <Icon size={22} />
              </span>
              <div className={s.cardLabel}>{ev.label}</div>
              <div className={s.cardHint}>{ev.eyebrow}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}
