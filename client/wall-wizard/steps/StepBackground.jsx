import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import s from '../WizardWall.module.css';
import { BACKGROUNDS_CATALOG, BACKGROUND_TABS, getBackground, getEvent } from '../constants';

/* ══════════════════════════════════════════════════════════
   Étape 3 — Choix du background
   Applique : IKEA (le mur devient "son" mur au premier choix
   visuel) + Smart Default (Aurore Kado est présélectionné).
   ══════════════════════════════════════════════════════════ */
export default function StepBackground({ state, update }) {
  const [tab, setTab] = useState('gradient');

  const filtered = useMemo(
    () => BACKGROUNDS_CATALOG.filter((bg) => bg.tab === tab),
    [tab]
  );

  const current = getBackground(state.backgroundId);
  const event = getEvent(state.eventId);

  const previewTitle = state.title.trim() || event.title(state.recipient.trim() || '…');
  const previewPhrase = state.phrase.trim() || event.subtitle(state.recipient.trim() || '');

  return (
    <>
      <div className={s.stepHeader}>
        <div className={s.stepEyebrow}>Étape 3 — Ambiance</div>
        <h1 className={s.stepTitle}>Choisis un fond pour ton mur</h1>
        <p className={s.stepSubtitle}>
          Le fond donne le ton dès l'ouverture. Aurore Kado (le dégradé signature) va
          bien avec toutes les occasions — c'est notre coup de cœur.
        </p>
      </div>

      <div className={s.bgTabs} role="tablist" aria-label="Catégorie de fond">
        {BACKGROUND_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={s.bgTab}
            data-active={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={s.bgGrid}>
        {filtered.map((bg) => (
          <button
            key={bg.id}
            type="button"
            aria-label={`Choisir le fond ${bg.label}`}
            className={s.bgTile}
            data-active={state.backgroundId === bg.id}
            onClick={() => update({ backgroundId: bg.id })}
          >
            <div className={s.bgTileMedia} style={{ background: bg.preview }} />
            <span className={s.bgTileCheck} aria-hidden><Check size={13} /></span>
            <span className={s.bgTileLabel}>{bg.label}</span>
          </button>
        ))}
      </div>

      {/* Preview live du titre par-dessus le fond choisi */}
      <div
        className={s.bgPreview}
        style={{ background: current.css, color: current.ink }}
        aria-live="polite"
      >
        <div>
          <div className={s.bgPreviewTitle}>{previewTitle}</div>
          <div className={s.bgPreviewSub}>{previewPhrase}</div>
        </div>
      </div>
    </>
  );
}
