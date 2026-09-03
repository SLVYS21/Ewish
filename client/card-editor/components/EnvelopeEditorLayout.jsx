import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCardState } from '../hooks/useCardState';
import { loadContext, clearContext } from '../../create-flow/context';
import OccasionSelector from './OccasionSelector';
import ThemeSelector from './ThemeSelector';
import ContentWizard from './ContentWizard';
import KadoStep from './KadoStep';
import ShareStep from './ShareStep';
import CardPreviewRenderer from '../preview/CardPreviewRenderer';
import UnboxingView from '../preview/UnboxingView';
import {
  LucideArrowLeft, LucideEye, LucideEyeOff,
  LucideType, LucidePalette, LucideGift, LucideShare2, LucideSend,
  LucideChevronRight, LucideLoader2, LucideCheck,
} from 'lucide-react';
import '../card-editor.css';
import styles from '../envelope-editor.module.css';

/* Mapping /create → occasions du card-editor (identique à l'ancien wizard). */
const OCCASION_MAP_FROM_CREATE = {
  anniversary: 'anniversaire',
  wedding:     'mariage',
  birth:       'naissance',
  farewell:    'retraite',
  welcome:     'felicitations',
  thanks:      'merci',
  tribute:     'condoleances',
  other:       'autre',
};

/* Tabs. currentStep synchronisé pour compat avec composants existants
   (CardPreviewRenderer, KadoStep, ShareStep) qui lisent currentStep. */
const TABS = [
  { id: 'content', label: 'CONTENU', Icon: LucideType,    step: 3 },
  { id: 'style',   label: 'STYLE',   Icon: LucidePalette, step: 2 },
  { id: 'gift',    label: 'CADEAU',  Icon: LucideGift,    step: 4, comingSoon: true },
  { id: 'share',   label: 'PARTAGE', Icon: LucideShare2,  step: 5 },
];

/* ── Footer button permanent sous panelContent ─────────────────────
   Tabs 1-3 : "Continuer" passe à l'onglet suivant.
   Tab 4 (share) :
     - idle       : "Publier & Partager" → shareStepRef.startPublish()
     - publishing : "Publication en cours…" disabled + spinner
     - published  : "Voir la carte" → ouvre unboxing
     - error      : "Réessayer"
*/
function FooterAction({ activeTab, setActiveTab, canPublish, publishState, onPublish, onOpenUnboxing }) {
  const idx  = TABS.findIndex(t => t.id === activeTab);
  const last = idx === TABS.length - 1;

  if (!last) {
    const nextTab = TABS[idx + 1];
    return (
      <div className="ee-panel-footer">
        <button
          type="button"
          className="ee-footer-btn ee-footer-btn-primary"
          onClick={() => setActiveTab(nextTab.id)}
        >
          <span>Continuer vers {nextTab.label.charAt(0) + nextTab.label.slice(1).toLowerCase()}</span>
          <LucideChevronRight size={16} />
        </button>
      </div>
    );
  }

  // Last tab (share)
  if (publishState === 'publishing') {
    return (
      <div className="ee-panel-footer">
        <button type="button" className="ee-footer-btn ee-footer-btn-primary" disabled>
          <LucideLoader2 size={16} className="ee-spin" />
          <span>Publication en cours…</span>
        </button>
      </div>
    );
  }
  if (publishState === 'published') {
    return (
      <div className="ee-panel-footer">
        <button type="button" className="ee-footer-btn ee-footer-btn-primary" onClick={onOpenUnboxing}>
          <LucideCheck size={16} />
          <span>Voir la carte publiée</span>
        </button>
      </div>
    );
  }
  const errored = publishState === 'error';
  return (
    <div className="ee-panel-footer">
      <button
        type="button"
        className="ee-footer-btn ee-footer-btn-primary"
        onClick={onPublish}
        disabled={!canPublish}
        title={!canPublish ? 'Renseigne d\'abord le destinataire' : undefined}
      >
        <LucideSend size={16} />
        <span>{errored ? 'Réessayer la publication' : 'Publier & Partager'}</span>
      </button>
    </div>
  );
}

export default function EnvelopeEditorLayout() {
  const {
    setCurrentStep,
    showUnboxing, setShowUnboxing,
    texts,
    publishState,
    loadPublicationById,
    saveStatus, draftId,
    changeOccasion, setRecipient, updateText,
  } = useCardState();

  const [activeTab, setActiveTab]     = useState('content');
  const [previewOpen, setPreviewOpen] = useState(false); // mobile toggle
  const shareStepRef = useRef(null);

  /* Sync currentStep pour compat. */
  useEffect(() => {
    const tab = TABS.find(t => t.id === activeTab);
    if (tab) setCurrentStep(tab.step);
  }, [activeTab, setCurrentStep]);

  /* Hydrate draft existant depuis ?id=. */
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  useEffect(() => {
    if (idParam) loadPublicationById(idParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam]);

  /* Contexte /create (pré-remplissage occasion / destinataire / titre). */
  useEffect(() => {
    if (idParam) return;
    const ctx = loadContext();
    const ctxForType = ctx && ctx.type === 'envelope' ? ctx : null;
    const occRaw   = searchParams.get('occ')   || ctxForType?.occasion  || '';
    const nameRaw  = searchParams.get('name')  || ctxForType?.recipient || '';
    const titleRaw = searchParams.get('title') || ctxForType?.title     || '';
    if (!occRaw && !nameRaw && !titleRaw) return;

    const mappedOcc = OCCASION_MAP_FROM_CREATE[occRaw];
    if (mappedOcc) changeOccasion(mappedOcc);
    if (nameRaw)   setRecipient(nameRaw);
    if (titleRaw)  updateText('title', titleRaw);
    clearContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam]);

  const saveLabel = saveStatus === 'saving' ? 'Enregistrement…'
    : saveStatus === 'saved' ? 'Enregistré'
    : saveStatus === 'error' ? 'Erreur'
    : draftId ? 'Enregistré' : '';

  const canPublish = (texts.subtitle || '').trim().length > 0
    && publishState !== 'publishing';

  const pubTitle = texts.title
    ? `${texts.title}${texts.subtitle ? ' — ' + texts.subtitle : ''}`
    : 'Nouvelle enveloppe';

  return (
    <div className={styles.root} data-preview-open={previewOpen}>
      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Link to="/ewish-admin" className={styles.back} title="Retour à mes créations">
            <LucideArrowLeft size={16} />
            <span>Retour</span>
          </Link>
          <span className={styles.divider} />
          <span className={styles.pubTitle}>{pubTitle}</span>
        </div>

        <div className={styles.topbarCenter}>
          {saveLabel && (
            <span className={styles.saveStatus} data-status={saveStatus}>
              <span className={styles.saveDot} />
              <span>{saveLabel}</span>
            </span>
          )}
        </div>

        <div className={styles.topbarRight}>
          <button
            type="button"
            className={`${styles.btnGhost} ${styles.previewToggle}`}
            onClick={() => setPreviewOpen(v => !v)}
          >
            {previewOpen ? <LucideEyeOff size={14} /> : <LucideEye size={14} />}
            <span>{previewOpen ? 'Éditer' : 'Aperçu'}</span>
          </button>

          <button
            type="button"
            className={styles.btnPublish}
            onClick={() => setActiveTab('share')}
            disabled={!canPublish}
            title={!canPublish ? 'Renseigne d\'abord le destinataire' : 'Publier & partager'}
          >
            <LucideSend size={14} />
            <span>Publier</span>
          </button>
        </div>
      </header>

      {/* ── Step nav ── */}
      <nav className={styles.stepNav} role="tablist">
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.stepNavBtn} ${active ? styles.stepNavBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.stepNavIcon}>
                <tab.Icon size={16} />
              </span>
              <span className={styles.stepNavLabel}>{tab.label}</span>
              {tab.comingSoon && (
                <span
                  style={{
                    marginLeft: 6,
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: '#161311',
                    color: '#FDE7A5',
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    lineHeight: 1.4,
                  }}
                >
                  Bientôt
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Workspace ── */}
      <div className={styles.workspace}>
        <aside className={styles.panel}>
          <div className={styles.panelMain}>
            <div className={styles.panelContent} key={activeTab}>
              {activeTab === 'content' && (
                <>
                  <OccasionSelector />
                  <ContentWizard />
                </>
              )}
              {activeTab === 'style' && <ThemeSelector />}
              {activeTab === 'gift'  && <KadoStep />}
              {activeTab === 'share' && <ShareStep ref={shareStepRef} onOpenUnboxing={() => setShowUnboxing(true)} />}
            </div>

            <FooterAction
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              canPublish={canPublish}
              publishState={publishState}
              onPublish={() => shareStepRef.current?.startPublish()}
              onOpenUnboxing={() => setShowUnboxing(true)}
            />
          </div>
        </aside>

        <main className={styles.preview}>
          <div className={styles.previewInner}>
            <CardPreviewRenderer />
          </div>
        </main>
      </div>

      {showUnboxing && (
        <div className={styles.unboxingOverlay}>
          <UnboxingView onBack={() => setShowUnboxing(false)} />
        </div>
      )}
    </div>
  );
}
