import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCardState } from '../hooks/useCardState';
import OccasionSelector from './OccasionSelector';
import ThemeSelector from './ThemeSelector';
import ContentWizard from './ContentWizard';
import KadoStep from './KadoStep';
import ShareStep from './ShareStep';
import CardPreviewRenderer from '../preview/CardPreviewRenderer';
import UnboxingView from '../preview/UnboxingView';
import { LucideChevronRight, LucideChevronLeft, LucideArrowLeft } from 'lucide-react';
import '../card-editor.css';

const STEP_LABELS = ['Occasion', 'Style', 'Contenu', 'Kado', 'Partage'];
const MAX_STEP = 5;

export default function CardEditorLayout() {
  const {
    currentStep, setCurrentStep,
    showUnboxing, setShowUnboxing,
    texts, publishState,
    loadPublicationById,
    saveStatus, draftId,
  } = useCardState();

  const saveLabel = saveStatus === 'saving' ? 'Enregistrement…'
    : saveStatus === 'saved' ? 'Brouillon enregistré'
    : saveStatus === 'error' ? 'Erreur de sauvegarde'
    : draftId ? 'Brouillon enregistré' : '';

  /* Reopen an existing draft when arriving from the Dashboard via ?id=XXX.
     If the pub is already published, loadPublicationById jumps to step 5. */
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  useEffect(() => {
    if (idParam) loadPublicationById(idParam);
    // Intentionally only depend on idParam so we hydrate once per URL id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam]);

  const next = () => setCurrentStep(s => Math.min(s + 1, MAX_STEP));
  const prev = () => setCurrentStep(s => Math.max(s - 1, 1));

  const canGoNext = currentStep === 1
    ? (texts.subtitle || '').trim().length > 0
    : true;

  // On the share step, hide the primary Next button (there is no next).
  const showNext = currentStep < MAX_STEP;

  return (
    <div className="ce-layout" data-step={currentStep}>
      <aside className="ce-sidebar">
        <header className="ce-header">
          <Link to="/ewish-admin" className="ce-back-link" title="Retour à mes créations">
            <LucideArrowLeft size={14} />
            <span>Mes créations</span>
          </Link>
          <div>
            <div className="ce-brand">myKado</div>
            <div className="ce-brand-sub">Éditeur de carte</div>
          </div>
          <div className="ce-steps-bar">
            {[1, 2, 3, 4, 5].map(i => {
              const isReachable = i <= currentStep;
              return (
                <button
                  key={i}
                  type="button"
                  className={`ce-step ${currentStep >= i ? 'active' : ''} ${currentStep === i ? 'current' : ''} ${isReachable ? 'reachable' : ''}`}
                  onClick={() => isReachable && setCurrentStep(i)}
                  disabled={!isReachable || publishState === 'publishing'}
                  aria-label={`Étape ${i} : ${STEP_LABELS[i - 1]}`}
                  aria-current={currentStep === i ? 'step' : undefined}
                >
                  <span className="ce-step-dot">{i}</span>
                  <span className="ce-step-label">{STEP_LABELS[i - 1]}</span>
                </button>
              );
            })}
          </div>
        </header>

        <div className="ce-content">
          {currentStep === 1 && <OccasionSelector />}
          {currentStep === 2 && <ThemeSelector />}
          {currentStep === 3 && <ContentWizard />}
          {currentStep === 4 && <KadoStep />}
          {currentStep === 5 && <ShareStep onOpenUnboxing={() => setShowUnboxing(true)} />}
        </div>

        <footer className="ce-footer">
          <button
            className="ce-btn ce-btn-ghost"
            onClick={prev}
            disabled={currentStep === 1 || publishState === 'publishing'}
          >
            <LucideChevronLeft size={18} />
            <span>Retour</span>
          </button>
          {saveLabel && (
            <span className="ce-save-status" data-status={saveStatus} title={saveLabel}>
              <span className="ce-save-dot" aria-hidden="true" />
              <span>{saveLabel}</span>
            </span>
          )}
          {showNext && (
            <button
              className="ce-btn ce-btn-primary"
              onClick={next}
              disabled={!canGoNext}
              title={!canGoNext ? 'Renseignez d\'abord le destinataire' : undefined}
            >
              <span>Continuer</span>
              <LucideChevronRight size={18} />
            </button>
          )}
        </footer>
      </aside>

      <main className="ce-preview-area">
        <div className="ce-sky" aria-hidden="true">
          <div className="ce-sky-layer ce-sky-1" />
          <div className="ce-sky-layer ce-sky-2" />
          <div className="ce-sky-layer ce-sky-3" />
        </div>
        <CardPreviewRenderer />
      </main>

      {showUnboxing && (
        <div className="ce-unboxing-overlay">
          <UnboxingView onBack={() => setShowUnboxing(false)} />
        </div>
      )}
    </div>
  );
}
