import { X, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import s from './WizardWall.module.css';
import { WIZARD_PROGRESS } from './constants';

const STEP_LABELS = {
  1: 'Événement',
  2: 'Destinataire',
  3: 'Ambiance',
  4: 'Cagnotte',
  5: 'Options',
  6: 'Aperçu',
};

/* ══════════════════════════════════════════════════════════
   Enveloppe visuelle du wizard :
   - Header sticky avec brand, badge d'étape, close X, progress bar
   - Body qui rend la step courante (children)
   - Footer sticky avec état save, boutons Précédent / Suivant / Publier
   ══════════════════════════════════════════════════════════ */
export default function WizardShell({
  step,
  totalSteps = 6,
  onClose,
  onPrev,
  onNext,
  onPublish,
  canGoNext = true,
  isPublishing = false,
  saveStatus = 'saved',        // 'unsaved' | 'saving' | 'saved' | 'error'
  primaryLabel,                // override le label du bouton primary
  hidePrimary = false,
  children,
}) {
  const isLast = step === totalSteps;
  const progress = WIZARD_PROGRESS[step] ?? Math.round((step / totalSteps) * 100);

  return (
    <div className={s.root}>
      <header className={s.header}>
        <div className={s.headerRow}>
          <span className={s.brand}>myKado <span aria-hidden>·</span> Nouveau mur</span>
          <span className={s.stepBadge}>Étape {step} / {totalSteps}</span>
          <button
            type="button"
            className={s.closeBtn}
            onClick={onClose}
            aria-label="Fermer et revenir au tableau de bord"
          >
            <X size={17} />
          </button>
        </div>
        <div className={s.progressTrack} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className={s.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={s.progressLabels} aria-hidden>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n} data-current={n === step ? 'true' : 'false'}>{STEP_LABELS[n]}</span>
          ))}
        </div>
      </header>

      <main className={s.body}>
        <div className={s.stepAnim} key={step}>
          {children}
        </div>
      </main>

      <footer className={s.footer}>
        <div className={s.footerInner}>
          <span className={s.saveStatus} data-status={saveStatus}>
            {saveStatus === 'saving' && <><Loader2 size={13} style={{ animation: 'mk-spin .75s linear infinite' }} /> Sauvegarde…</>}
            {saveStatus === 'saved' && <><Check size={13} /> Sauvegardé</>}
            {saveStatus === 'unsaved' && <>Modifications en attente…</>}
            {saveStatus === 'error' && <>Sauvegarde impossible</>}
          </span>

          <button
            type="button"
            className={s.btnBack}
            onClick={onPrev}
            disabled={step <= 1}
          >
            <ArrowLeft size={16} /> Précédent
          </button>

          {!hidePrimary && (
            isLast ? (
              <button
                type="button"
                className={s.btnPrimary}
                onClick={onPublish}
                disabled={isPublishing}
              >
                {isPublishing
                  ? <><Loader2 size={16} style={{ animation: 'mk-spin .75s linear infinite' }} /> Publication…</>
                  : <>{primaryLabel || 'Publier et partager'} <ArrowRight size={16} /></>}
              </button>
            ) : (
              <button
                type="button"
                className={s.btnNext}
                onClick={onNext}
                disabled={!canGoNext}
              >
                {primaryLabel || 'Suivant'} <ArrowRight size={16} />
              </button>
            )
          )}
        </div>
      </footer>
    </div>
  );
}
