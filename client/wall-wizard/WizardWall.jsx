import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  createPublication, updatePublication, publishPublication, getPublicationById,
} from '../utils/api';
import WizardShell from './WizardShell';
import MascotteLoader from './MascotteLoader';
import StepEvent from './steps/StepEvent';
import StepRecipient from './steps/StepRecipient';
import StepBackground from './steps/StepBackground';
import StepCagnotte from './steps/StepCagnotte';
import StepOptions from './steps/StepOptions';
import StepPreview from './steps/StepPreview';
import {
  DEFAULT_WALL_TEMPLATE, DEFAULT_BACKGROUND_ID, DEFAULT_CAGNOTTE_GOAL,
  DEFAULT_CONFETTI, defaultDeadlineISO, getEvent, getBackground,
} from './constants';

/* Construit le state par défaut du wizard (Smart Defaults). */
function makeDefaultState() {
  const event = getEvent('anniversary');
  return {
    eventId: event.id,
    recipient: '',
    title: '',
    titleTouched: false,        // IKEA : détecte si l'utilisateur a modifié
    phrase: '',
    phraseTouched: false,
    backgroundId: DEFAULT_BACKGROUND_ID,
    cagnotteEnabled: false,
    cagnotteTitle: '',
    cagnotteDescription: '',
    cagnotteGoal: DEFAULT_CAGNOTTE_GOAL,
    cagnotteCover: '',
    cagnotteMin: 0,
    cagnotteMax: 0,
    requireModeration: false,
    deadline: defaultDeadlineISO(),
    confettiType: DEFAULT_CONFETTI,
    isPrivate: false,
    accessCode: '',
  };
}

/* Depuis un state wizard, produit le payload PATCH pour /publication/:id. */
function buildPatchPayload(state) {
  const event = getEvent(state.eventId);
  const bg = getBackground(state.backgroundId);

  const recipient = state.recipient.trim();
  const finalTitle = state.title.trim() || event.title(recipient || '…');
  const finalPhrase = state.phrase.trim() || event.subtitle(recipient || '');

  return {
    title: finalTitle,
    data: {
      eyebrow: event.eyebrow,
      titleName: recipient,
      recipient,
      subtitle: finalPhrase,
      phrase: finalPhrase,
      occasion: event.id,
      occasionLabel: event.label,
      festive: event.festive,
      wishesEnabled: true,
    },
    style: {
      wallBackgroundId: state.backgroundId,
      wallBackground: bg.css,
      wallBackgroundInk: bg.ink,
      confettiType: state.confettiType,
    },
    cagnotteConfig: {
      enabled: state.cagnotteEnabled,
      collectTitle: state.cagnotteTitle.trim() || (recipient ? `Cadeau pour ${recipient}` : 'Cadeau surprise'),
      description: state.cagnotteDescription.trim(),
      goal: Number(state.cagnotteGoal) || 0,
      collectCover: state.cagnotteCover || '',
      minContribution: Number(state.cagnotteMin) || 0,
      maxContribution: Number(state.cagnotteMax) || 0,
      wishesEnabled: true,
      requireModeration: !!state.requireModeration,
      deadline: state.deadline || null,
      isPrivate: !!state.isPrivate,
      accessCode: state.accessCode.trim().toUpperCase(),
    },
  };
}

/* Depuis un objet Publication chargé, hydrate le state du wizard. */
function hydrateFromPub(pub) {
  const d = pub.data || {};
  const st = pub.style || {};
  const cc = pub.cagnotteConfig || {};
  const eventId = d.occasion || 'anniversary';
  const event = getEvent(eventId);
  const recipient = (d.recipient || d.titleName || '').trim();

  const defaultTitle = event.title(recipient || '…');
  const defaultPhrase = event.subtitle(recipient || '');
  const title = pub.title || '';
  const phrase = d.subtitle || d.phrase || '';

  return {
    eventId,
    recipient,
    title,
    titleTouched: title && title !== defaultTitle,
    phrase,
    phraseTouched: phrase && phrase !== defaultPhrase,
    backgroundId: st.wallBackgroundId || DEFAULT_BACKGROUND_ID,
    cagnotteEnabled: !!cc.enabled,
    cagnotteTitle: cc.collectTitle || '',
    cagnotteDescription: cc.description || '',
    cagnotteGoal: cc.goal || DEFAULT_CAGNOTTE_GOAL,
    cagnotteCover: cc.collectCover || '',
    cagnotteMin: cc.minContribution || 0,
    cagnotteMax: cc.maxContribution || 0,
    requireModeration: !!cc.requireModeration,
    deadline: cc.deadline ? cc.deadline.slice(0, 10) : defaultDeadlineISO(),
    confettiType: st.confettiType || DEFAULT_CONFETTI,
    isPrivate: !!cc.isPrivate,
    accessCode: cc.accessCode || '',
  };
}

/* ══════════════════════════════════════════════════════════
   WizardWall — orchestrateur des 6 étapes.
   Route : /ewish-admin/wall/new (et /ewish-admin/wall/new?id=…)
   ══════════════════════════════════════════════════════════ */
export default function WizardWall() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id');

  const [step, setStep] = useState(1);
  const [pubId, setPubId] = useState(initialId || null);
  const [state, setState] = useState(makeDefaultState);
  const [bootLoading, setBootLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  const dirtyRef = useRef(false);   // au moins un champ modifié depuis dernier save
  const saveTimer = useRef(null);
  const boostrapped = useRef(false); // guard contre double POST /publication

  /* ── Bootstrap : crée ou charge la publication ─────────── */
  useEffect(() => {
    if (boostrapped.current) return;
    boostrapped.current = true;

    (async () => {
      try {
        if (initialId) {
          const { data } = await getPublicationById(initialId);
          setState(hydrateFromPub(data));
          setPubId(data._id);
        } else {
          const event = getEvent('anniversary');
          const { data } = await createPublication({
            templateName: DEFAULT_WALL_TEMPLATE,
            customName: `wall-${Date.now()}`,
            title: event.title('…'),
            data: {
              eyebrow: event.eyebrow,
              titleName: '',
              recipient: '',
              subtitle: event.subtitle(''),
              phrase: event.subtitle(''),
              occasion: event.id,
              occasionLabel: event.label,
              festive: event.festive,
              wishesEnabled: true,
            },
            style: {
              wallBackgroundId: DEFAULT_BACKGROUND_ID,
              wallBackground: getBackground(DEFAULT_BACKGROUND_ID).css,
              confettiType: DEFAULT_CONFETTI,
            },
          });
          setPubId(data._id);
          setSearchParams({ id: data._id }, { replace: true });
        }
      } catch (err) {
        console.error('Wizard bootstrap failed', err);
        navigate('/ewish-admin', { replace: true });
      } finally {
        setBootLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Auto-save debounced ────────────────────────────────── */
  useEffect(() => {
    if (bootLoading || !pubId) return;
    if (!dirtyRef.current) return;
    setSaveStatus('unsaved');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updatePublication(pubId, buildPatchPayload(state));
        setSaveStatus('saved');
        dirtyRef.current = false;
      } catch (err) {
        console.error('Auto-save failed', err);
        setSaveStatus('error');
      }
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [state, pubId, bootLoading]);

  /* ── State updater — marque dirty automatiquement ───────── */
  const update = useCallback((patch) => {
    dirtyRef.current = true;
    setState((prev) => {
      const next = { ...prev, ...patch };
      /* Regénère titre + phrase par défaut si non touchés (Smart Defaults) */
      const event = getEvent(next.eventId);
      if (!next.titleTouched) {
        next.title = event.title(next.recipient.trim() || '…');
      }
      if (!next.phraseTouched) {
        next.phrase = event.subtitle(next.recipient.trim() || '');
      }
      /* Cagnotte : préremplit le titre auto si vide et enable/recipient change */
      if (next.cagnotteEnabled && !next.cagnotteTitle && next.recipient.trim()) {
        next.cagnotteTitle = `Cadeau pour ${next.recipient.trim()}`;
      }
      /* Change le confetti par défaut selon l'évènement si non touché */
      if (patch.eventId && !prev.confettiType_touched) {
        next.confettiType = event.confettiSuggestion || prev.confettiType;
      }
      return next;
    });
  }, []);

  /* ── Navigation ─────────────────────────────────────────── */
  const totalSteps = 6;
  const goPrev = () => setStep((s) => Math.max(1, s - 1));
  const goNext = () => setStep((s) => Math.min(totalSteps, s + 1));
  const close = () => {
    if (dirtyRef.current) {
      const ok = window.confirm(
        'Ton mur est sauvegardé automatiquement. Tu peux le retrouver dans tes créations. Quitter maintenant ?'
      );
      if (!ok) return;
    }
    navigate('/ewish-admin');
  };

  /* ── Validation par étape (pour désactiver Suivant) ─────── */
  const canGoNext = useMemo(() => {
    if (step === 1) return !!state.eventId;
    if (step === 2) return state.recipient.trim().length > 0;
    return true;
  }, [step, state]);

  /* ── Publish ────────────────────────────────────────────── */
  const handlePublish = async () => {
    if (!pubId) return;
    setIsPublishing(true);
    setPublishError('');
    try {
      /* Flush pending save avant de publier (sinon on peut publier un état incomplet) */
      clearTimeout(saveTimer.current);
      await updatePublication(pubId, buildPatchPayload(state));
      await publishPublication(pubId);
      /* Le loader mascotte reste ~2s pour la célébration */
      setTimeout(() => {
        navigate(`/ewish-admin/wall/${pubId}/share`);
      }, 2200);
    } catch (err) {
      console.error('Publish failed', err);
      setPublishError(err.response?.data?.error || 'Impossible de publier ce mur.');
      setIsPublishing(false);
    }
  };

  /* ── Raccourcis clavier ─────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (isPublishing) return;
      if (e.key === 'Escape') { close(); }
      /* On active Enter → suivant sur les étapes non textuelles uniquement (évite conflit input) */
      if (e.key === 'Enter' && step !== 2 && step !== 4 && step !== 6 && canGoNext) {
        if (document.activeElement?.tagName !== 'BUTTON' &&
            document.activeElement?.tagName !== 'INPUT' &&
            document.activeElement?.tagName !== 'TEXTAREA') {
          goNext();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, canGoNext, isPublishing]);

  if (bootLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FFFFFF',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid #EEEBF3',
          borderTopColor: '#FF5470',
          animation: 'mk-spin .8s linear infinite',
        }} />
      </div>
    );
  }

  const commonProps = { state, update };

  return (
    <>
      <WizardShell
        step={step}
        totalSteps={totalSteps}
        saveStatus={saveStatus}
        onClose={close}
        onPrev={goPrev}
        onNext={goNext}
        onPublish={handlePublish}
        canGoNext={canGoNext}
        isPublishing={isPublishing}
      >
        {step === 1 && <StepEvent {...commonProps} />}
        {step === 2 && <StepRecipient {...commonProps} />}
        {step === 3 && <StepBackground {...commonProps} />}
        {step === 4 && <StepCagnotte {...commonProps} />}
        {step === 5 && <StepOptions {...commonProps} />}
        {step === 6 && <StepPreview {...commonProps} publishError={publishError} />}
      </WizardShell>

      {isPublishing && <MascotteLoader message="On publie ton mur…" />}
    </>
  );
}
