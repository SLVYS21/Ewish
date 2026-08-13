import React from 'react';
import { useCardState } from '../hooks/useCardState';
import OccasionSelector from './OccasionSelector';
import ThemeSelector from './ThemeSelector';
import ContentWizard from './ContentWizard';
import KadoStep from './KadoStep';
import ShareStep from './ShareStep';
import CardPreviewRenderer from '../preview/CardPreviewRenderer';
import UnboxingView from '../preview/UnboxingView';
import { LucideChevronRight, LucideChevronLeft } from 'lucide-react';
import '../card-editor.css';

const STEP_LABELS = ['Occasion', 'Style', 'Contenu', 'Kado', 'Partage'];
const MAX_STEP = 5;

export default function CardEditorLayout() {
  const {
    currentStep, setCurrentStep,
    showUnboxing, setShowUnboxing,
    texts, publishState,
  } = useCardState();

  const next = () => setCurrentStep(s => Math.min(s + 1, MAX_STEP));
  const prev = () => setCurrentStep(s => Math.max(s - 1, 1));

  const canGoNext = currentStep === 1
    ? (texts.subtitle || '').trim().length > 0
    : true;

  // On the share step, hide the primary Next button (there is no next).
  const showNext = currentStep < MAX_STEP;

  return (
    <div className="ce-layout">
      <aside className="ce-sidebar">
        <header className="ce-header">
          <div>
            <div className="ce-brand">myKado</div>
            <div className="ce-brand-sub">Éditeur de carte</div>
          </div>
          <div className="ce-steps-bar">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`ce-step ${currentStep >= i ? 'active' : ''} ${currentStep === i ? 'current' : ''}`}>
                <div className="ce-step-dot">{i}</div>
                <div className="ce-step-label">{STEP_LABELS[i - 1]}</div>
              </div>
            ))}
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
