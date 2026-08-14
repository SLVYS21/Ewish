import { useState, useMemo, createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { THEMES, DEFAULT_THEME_ID } from '../data/themes';
import { OCCASIONS, DEFAULT_OCCASION_ID, findOccasion } from '../data/occasions';
import { DEFAULT_BG_KEY, DEFAULT_CONFETTI_KEY } from '../data/backgrounds';
import { createPublication, publishPublication, getPublicationById, updatePublication } from '../../utils/api';

const CardStateContext = createContext(null);
const MAX_STEP = 5;

const DEFAULT_TEXTS = {
  title:        findOccasion(DEFAULT_OCCASION_ID).title,
  subtitle:     '',                                       // recipient name — cover
  photoCaption: '',
  message:      findOccasion(DEFAULT_OCCASION_ID).message,
  signature:    'Toute la famille',
  backNote:     'Fait avec amour',
};

// Preview surfaces a field targets. Cover, inside spread, or back page.
export const FIELD_PREVIEW = {
  subtitle:     'cover',
  title:        'cover',
  photo:        'inside',
  photoCaption: 'inside',
  message:      'inside',
  signature:    'inside',
  backNote:     'back',
};

export const CardStateProvider = ({ children }) => {
  const [occasionId,       setOccasionId]      = useState(DEFAULT_OCCASION_ID);
  const [themeId,          setThemeId]         = useState(DEFAULT_THEME_ID);
  const [envelopeColor,    setEnvelopeColor]   = useState(THEMES[DEFAULT_THEME_ID].envelope.color);
  const [envelopeTexture,  setEnvelopeTexture] = useState(THEMES[DEFAULT_THEME_ID].envelope.texture);
  const [linerChoice,      setLinerChoice]     = useState('theme'); // 'theme' | preset key
  const [texts,            setTexts]           = useState(DEFAULT_TEXTS);
  const [titleEdited,      setTitleEdited]     = useState(false);   // becomes true once the user types
  const [messageEdited,    setMessageEdited]   = useState(false);
  const [photo,            setPhoto]           = useState(null);
  const [currentStep,      setCurrentStep]     = useState(1);       // 1..4
  const [showUnboxing,     setShowUnboxing]    = useState(false);
  const [previewFocus,     setPreviewFocus]    = useState(null);    // 'cover' | 'inside' | 'back' | 'envelope' | null
  const [confettiStyle,    setConfettiStyle]   = useState(DEFAULT_CONFETTI_KEY);
  const [unboxingBg,       setUnboxingBg]      = useState(DEFAULT_BG_KEY);

  // Gift attachment (Kado step)
  const [gift, setGift] = useState({ enabled: false, amount: 0, currency: 'XOF', message: '' });

  // Publishing (Share step)
  const [publishState,  setPublishState]  = useState('idle');  // 'idle' | 'publishing' | 'published' | 'error'
  const [publishedPub,  setPublishedPub]  = useState(null);
  const [publishError,  setPublishError]  = useState(null);

  // Draft autosave — created on first meaningful change, then PATCHed.
  const [draftId,      setDraftId]      = useState(null);
  const [saveStatus,   setSaveStatus]   = useState('idle');  // 'idle' | 'saving' | 'saved' | 'error'
  const draftInflightRef = useRef(false);
  const skipNextSaveRef  = useRef(false);  // set right after hydration to avoid re-saving what we just loaded

  const theme = useMemo(() => {
    const base = THEMES[themeId];
    if (!base) return null;
    const liner = resolveLiner(linerChoice, base.envelope.linerPattern);
    return {
      ...base,
      envelope: {
        ...base.envelope,
        color: envelopeColor,
        texture: envelopeTexture,
        linerPattern: liner,
      },
    };
  }, [themeId, envelopeColor, envelopeTexture, linerChoice]);

  const occasion = useMemo(() => findOccasion(occasionId), [occasionId]);

  const changeTheme = useCallback((id) => {
    if (!THEMES[id]) return;
    setThemeId(id);
    setEnvelopeColor(THEMES[id].envelope.color);
    setEnvelopeTexture(THEMES[id].envelope.texture);
    setLinerChoice('theme');
  }, []);

  const changeOccasion = useCallback((id) => {
    setOccasionId(id);
    const occ = findOccasion(id);
    setTexts(prev => ({
      ...prev,
      // Only overwrite fields the user hasn't touched.
      title:   titleEdited   ? prev.title   : (occ.title   || prev.title),
      message: messageEdited ? prev.message : (occ.message || prev.message),
    }));
  }, [titleEdited, messageEdited]);

  const updateText = useCallback((field, value) => {
    if (field === 'title')   setTitleEdited(true);
    if (field === 'message') setMessageEdited(true);
    setTexts(prev => ({ ...prev, [field]: value }));
  }, []);

  const focusPreview = useCallback((target) => {
    const view = FIELD_PREVIEW[target] || target;
    if (!view) return;
    setPreviewFocus(view);
  }, []);

  const setRecipient = useCallback((name) => {
    setTexts(prev => ({ ...prev, subtitle: name }));
  }, []);

  const publishCard = useCallback(async ({ feexpayReference } = {}) => {
    setPublishState('publishing');
    setPublishError(null);
    let workingId = draftId;
    try {
      // Everything the public renderer needs to reconstruct the card.
      // Kept under `data` so we don't collide with the Publication model's
      // top-level fields (title, style, etc.).
      const cardData = {
        kind:            'myenvelope',
        occasionId,
        themeId,
        envelopeColor,
        envelopeTexture,
        linerChoice,
        confettiStyle,
        unboxingBg,
        texts,
        photo,
        gift,
        recipient: texts.subtitle || '',
        occasion:  occasionId,
      };
      const title = `${texts.title || 'Carte'} — ${texts.subtitle || 'myKado'}`;

      // Reuse the autosave draft if one exists; otherwise create fresh + flush data.
      if (workingId) {
        await updatePublication(workingId, { title, data: cardData });
      } else {
        const customName = 'card-' + Math.random().toString(36).slice(2, 10);
        const created = await createPublication({
          templateName: 'myenvelope',
          customName,
          title,
          data: cardData,
          style: { primaryColor: '#FF5470', accentColor: '#FFC145' },
        });
        workingId = created.data._id;
        setDraftId(workingId);
      }

      // Flag it as published so /c/:slug resolves it. Server returns 402 if
      // the FCFA fee (1500 + gift) hasn't been paid — the caller retries with
      // a feexpayReference obtained from the FeexPay widget.
      const publishRes = await publishPublication(workingId, feexpayReference ? { feexpayReference } : {});
      const finalPub = publishRes?.data || null;

      setPublishedPub(finalPub);
      setPublishState('published');
      return { ok: true, pub: finalPub };
    } catch (err) {
      const data = err?.response?.data || {};
      const message = data.error || err?.message || 'Erreur inconnue';
      setPublishError(message);
      setPublishState('error');
      // Surface the price so the caller can open FeexPay when payment is required.
      // workingId is fresh (created above if needed) — safer than reading stale draftId.
      if (data.code === 'PAYMENT_REQUIRED') {
        return { ok: false, paymentRequired: true, priceFCFA: data.priceFCFA, pubId: workingId };
      }
      return { ok: false, error: message };
    }
  }, [themeId, texts, photo, occasionId, envelopeColor, envelopeTexture, linerChoice, confettiStyle, unboxingBg, gift, draftId]);

  const resetPublish = useCallback(() => {
    setPublishState('idle');
    setPublishedPub(null);
    setPublishError(null);
  }, []);

  /* Reopen an existing publication (used when arriving at /card-editor?id=XXX
     from the Dashboard). Fetches the pub, hydrates every editor field, and
     jumps straight to the Share step if it's already published. */
  const loadPublicationById = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await getPublicationById(id);
      const pub = res?.data;
      if (!pub || !pub.data) return;
      const d = pub.data;

      // Prevent the autosave effect from firing on the hydration setState burst.
      skipNextSaveRef.current = true;

      if (d.occasionId)      setOccasionId(d.occasionId);
      if (d.themeId)         setThemeId(d.themeId);
      if (d.envelopeColor)   setEnvelopeColor(d.envelopeColor);
      if (d.envelopeTexture) setEnvelopeTexture(d.envelopeTexture);
      if (d.linerChoice)     setLinerChoice(d.linerChoice);
      if (d.confettiStyle)   setConfettiStyle(d.confettiStyle);
      if (d.unboxingBg)      setUnboxingBg(d.unboxingBg);
      if (d.texts)           setTexts(prev => ({ ...prev, ...d.texts }));
      if (d.photo)           setPhoto(d.photo);
      if (d.gift)            setGift(d.gift);
      /* Auto-edited flags so switching occasion later doesn't nuke the loaded
         title/message that the user has explicitly chosen and saved. */
      setTitleEdited(true);
      setMessageEdited(true);

      setDraftId(pub._id);
      setSaveStatus('saved');

      if (pub.published) {
        setPublishedPub(pub);
        setPublishState('published');
        setCurrentStep(MAX_STEP);
      } else if (typeof d.currentStep === 'number' && d.currentStep >= 1 && d.currentStep <= MAX_STEP) {
        setCurrentStep(d.currentStep);
      }
    } catch (err) {
      // Silent : dashboard can only reach this for pubs the user owns, but
      // an expired session would 401. We just leave the editor blank.
      // eslint-disable-next-line no-console
      console.warn('[card-editor] loadPublicationById failed:', err?.response?.data?.error || err?.message);
    }
  }, []);

  /* ── Autosave draft ──────────────────────────────────────────────────
     Debounced (~1.2s). Creates the publication on first meaningful edit,
     then PATCHes on every subsequent change. Puts ?id=XXX in the URL so
     a refresh reopens the same draft. Skips while publishing or once
     the card is published (nothing more to draft). */
  const draftPayload = useMemo(() => ({
    occasionId, themeId, envelopeColor, envelopeTexture, linerChoice,
    confettiStyle, unboxingBg, texts, photo, gift,
    currentStep,
    recipient: texts.subtitle || '',
    occasion:  occasionId,
    kind:      'myenvelope',
  }), [occasionId, themeId, envelopeColor, envelopeTexture, linerChoice,
       confettiStyle, unboxingBg, texts, photo, gift, currentStep]);

  useEffect(() => {
    if (skipNextSaveRef.current) { skipNextSaveRef.current = false; return; }
    if (publishState === 'publishing' || publishState === 'published') return;

    const hasContent = (texts.subtitle || '').trim().length > 0;
    if (!draftId && !hasContent) return;   // wait until user starts typing

    const timeout = setTimeout(async () => {
      if (draftInflightRef.current) return;
      draftInflightRef.current = true;
      setSaveStatus('saving');
      try {
        if (draftId) {
          await updatePublication(draftId, { data: draftPayload });
        } else {
          const title = `${texts.title || 'Carte'} — ${texts.subtitle || 'Brouillon'}`;
          const customName = 'card-' + Math.random().toString(36).slice(2, 10);
          const res = await createPublication({
            templateName: 'myenvelope',
            customName,
            title,
            data: draftPayload,
            style: { primaryColor: '#FF5470', accentColor: '#FFC145' },
          });
          const newId = res?.data?._id;
          if (newId) {
            setDraftId(newId);
            // Reflect in the URL so a refresh reopens this draft.
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.set('id', newId);
              window.history.replaceState({}, '', url.toString());
            }
          }
        }
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
        // eslint-disable-next-line no-console
        console.warn('[card-editor] autosave failed:', err?.response?.data?.error || err?.message);
      } finally {
        draftInflightRef.current = false;
      }
    }, 1200);
    return () => clearTimeout(timeout);
  }, [draftPayload, draftId, publishState, texts.subtitle, texts.title]);

  const value = {
    occasionId, occasion, changeOccasion,
    themeId, setThemeId, changeTheme,
    envelopeColor, setEnvelopeColor,
    envelopeTexture, setEnvelopeTexture,
    linerChoice, setLinerChoice,
    texts, setTexts, updateText,
    setRecipient,
    photo, setPhoto,
    currentStep, setCurrentStep,
    showUnboxing, setShowUnboxing,
    previewFocus, focusPreview,
    confettiStyle, setConfettiStyle,
    unboxingBg, setUnboxingBg,
    gift, setGift,
    publishState, publishedPub, publishError, publishCard, resetPublish,
    loadPublicationById,
    draftId, saveStatus,
    theme,
  };

  return (
    <CardStateContext.Provider value={value}>
      {children}
    </CardStateContext.Provider>
  );
};

export const useCardState = () => {
  const ctx = useContext(CardStateContext);
  if (!ctx) throw new Error('useCardState must be used within a CardStateProvider');
  return ctx;
};

// ---------------------------------------------------------------------------
// Envelope liner presets — kept for the future "advanced" panel.
export const LINER_PRESETS = {
  theme:     { label: 'Assorti au thème', kind: 'theme' },
  wisteria:  { label: 'Glycine violette', kind: 'image', imageUrl: '/backgrounds/theme-floral/floral_liner.webp' },
  cream:     { label: 'Uni ivoire',       kind: 'color', color: '#FFF9EE' },
  blush:     { label: 'Uni blush',        kind: 'color', color: '#FCEFEB' },
  gold:      { label: 'Doré',             kind: 'color', color: '#E6C88E' },
  sage:      { label: 'Sauge',            kind: 'color', color: '#C6D3B9' },
  ink:       { label: 'Encre',            kind: 'color', color: '#2B2440' },
};

function resolveLiner(choice, themeDefault) {
  const preset = LINER_PRESETS[choice];
  if (!preset || preset.kind === 'theme') return themeDefault;
  if (preset.kind === 'image') return { imageUrl: preset.imageUrl, svg: themeDefault.svg };
  if (preset.kind === 'color') return { imageUrl: null, svg: null, color: preset.color };
  return themeDefault;
}

export const ENVELOPE_TEXTURES = [
  { key: 'smooth', label: 'Uni' },
  { key: 'linen',  label: 'Lin' },
  { key: 'kraft',  label: 'Kraft' },
  { key: 'satin',  label: 'Satin' },
];

export { OCCASIONS };
