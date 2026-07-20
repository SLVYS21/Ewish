import { Check, Sparkles, Palette, Rocket, Share2 } from 'lucide-react';
import s from './WallProgress.module.css';

/* WallProgress — barre de progression du setup mur.
   4 étapes : Créer → Style → Publier → Partager
   step = 1 quand on vient de créer, 2 style choisi, 3 publié, 4 partage.
   Chaque étape avant la current est cliquable via onGoTo (target id). */
const STEPS = [
  { id: 'create', label: 'Créer',    Icon: Sparkles },
  { id: 'style',  label: 'Style',    Icon: Palette },
  { id: 'setup',  label: 'Publier',  Icon: Rocket },
  { id: 'share',  label: 'Partager', Icon: Share2 },
];

export default function WallProgress({ step = 1, isPublished = false, onGoTo }) {
  const total = STEPS.length;
  const activeIndex = Math.min(Math.max(step - 1, 0), total - 1);
  const fillPct = (activeIndex / (total - 1)) * 100;

  return (
    <div className={s.wrap} role="list" aria-label="Progression du mur">
      <div className={s.rail}>
        <div className={s.railFill} style={{ width: `${fillPct}%` }} />
      </div>
      {STEPS.map((step, idx) => {
        const Icon = step.Icon;
        const done = idx < activeIndex || (idx === activeIndex && isPublished && step.id === 'setup');
        const current = idx === activeIndex && !done;
        const upcoming = idx > activeIndex;
        const clickable = !!onGoTo && !upcoming;

        return (
          <div key={step.id} className={s.step} role="listitem">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onGoTo?.(step.id)}
              className={`${s.dot} ${done ? s.dotDone : current ? s.dotCurrent : s.dotUpcoming}`}
              aria-current={current ? 'step' : undefined}
              aria-label={step.label}
            >
              {done ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
            </button>
            <span className={`${s.label} ${current ? s.labelCurrent : ''} ${done ? s.labelDone : ''}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
