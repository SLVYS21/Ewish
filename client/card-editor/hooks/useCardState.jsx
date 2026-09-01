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
    // Fallback to default when the id is unknown (legacy pub, renamed theme, etc.)
    // so downstream preview pages can safely read theme.cover / theme.envelope / ...
    const base = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
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

  /* Payload PATCH/POST vers les nouveaux champs plats du back (Publication.js).
     Remplace l'ancien blob data.kind='myenvelope'. Le back shallow-merge les
     sous-objets (envelopeTheme, envelopeTexts, envelopeGift) — voir
     server/routes/publication.js PATCH /publications/:id. */
  const buildEnvelopePayload = useCallback(() => ({
    envelopeOccasion: occasionId,
    envelopeTheme: {
      id:      themeId,
      color:   envelopeColor,
      texture: envelopeTexture,
      liner:   linerChoice,
    },
    envelopeTexts: {
      title:        texts.title || '',
      recipient:    texts.subtitle || '',
      photoCaption: texts.photoCaption || '',
      message:      texts.message || '',
      signature:    texts.signature || '',
      backNote:     texts.backNote || '',
    },
    envelopePhoto: photo || '',
    envelopeGift: {
      enabled:  !!gift.enabled,
      amount:   Number(gift.amount) || 0,
      currency: gift.currency || 'XOF',
      message:  gift.message || '',
    },
    envelopeConfetti:   confettiStyle,
    envelopeUnboxingBg: unboxingBg,
  }), [occasionId, themeId, envelopeColor, envelopeTexture, linerChoice,
       texts, photo, gift, confettiStyle, unboxingBg]);

  const publishCard = useCallback(async ({ feexpayReference, promoCode } = {}) => {
    setPublishState('publishing');
    setPublishError(null);
    let workingId = draftId;
    try {
      const envelopePayload = buildEnvelopePayload();
      const title = `${texts.title || 'Carte'} — ${texts.subtitle || 'myKado'}`;

      // Reuse the autosave draft if one exists; otherwise create fresh + flush.
      if (workingId) {
        await updatePublication(workingId, { title, ...envelopePayload });
      } else {
        const customName = 'card-' + Math.random().toString(36).slice(2, 10);
        const created = await createPublication({
          templateName: 'myenvelope',
          customName,
          title,
          style: { primaryColor: '#FF5470', accentColor: '#FFC145' },
          ...envelopePayload,
        });
        workingId = created.data._id;
        setDraftId(workingId);
      }

      // Flag it as published so /c/:slug resolves it. Server returns 402 if
      // the FCFA fee (1500 + gift) hasn't been paid — the caller retries with
      // a feexpayReference obtained from the FeexPay widget. promoCode réduit
      // le socle 1500 côté serveur (jamais le gift).
      const publishBody = {};
      if (feexpayReference) publishBody.feexpayReference = feexpayReference;
      if (promoCode)        publishBody.promoCode        = promoCode;
      const publishRes = await publishPublication(workingId, publishBody);
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
  }, [buildEnvelopePayload, texts.title, texts.subtitle, draftId]);

  const resetPublish = useCallback(() => {
    setPublishState('idle');
    setPublishedPub(null);
    setPublishError(null);
  }, []);

  /* payGiftTopUp : carte déjà publiée, l'utilisateur augmente le gift.
     On PATCH la nouvelle valeur (champ envelopeGift plat) puis on retente
     publishPublication. Le serveur renvoie 402 avec priceFCFA = delta
     (owedGiftFcfa) — le caller (KadoStep) ouvre FeexPay pour cette portion. */
  const payGiftTopUp = useCallback(async ({ feexpayReference } = {}) => {
    const workingId = publishedPub?._id || draftId;
    if (!workingId) return { ok: false, error: 'Publication introuvable.' };
    try {
      await updatePublication(workingId, {
        envelopeGift: {
          enabled:  !!gift.enabled,
          amount:   Number(gift.amount) || 0,
          currency: gift.currency || 'XOF',
          message:  gift.message || '',
        },
      });
      const res = await publishPublication(workingId, feexpayReference ? { feexpayReference } : {});
      const finalPub = res?.data || null;
      if (finalPub) setPublishedPub(finalPub);
      return { ok: true, pub: finalPub };
    } catch (err) {
      const data = err?.response?.data || {};
      if (data.code === 'PAYMENT_REQUIRED') {
        return { ok: false, paymentRequired: true, priceFCFA: data.priceFCFA, topUp: !!data.topUp, pubId: workingId };
      }
      return { ok: false, error: data.error || err?.message || 'Erreur' };
    }
  }, [gift, publishedPub, draftId]);

  /* Reopen an existing publication (used when arriving at /card-editor?id=XXX
     from the Dashboard). Fetches the pub, hydrates every editor field, and
     jumps straight to the Share step if it's already published. */
  const loadPublicationById = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await getPublicationById(id);
      const pub = res?.data;
      if (!pub) return;

      // Prevent the autosave effect from firing on the hydration setState burst.
      skipNextSaveRef.current = true;

      /* Lecture prioritaire des nouveaux champs plats (envelopeXxx).
         Fallback sur pub.data.* pour les enveloppes pré-migration. */
      const d = pub.data || {};
      const t = pub.envelopeTheme || {};
      const tx = pub.envelopeTexts || {};
      const g = pub.envelopeGift || null;

      const occ = pub.envelopeOccasion || d.occasionId;
      if (occ) setOccasionId(occ);

      const themeIdRaw = t.id || d.themeId;
      if (themeIdRaw && THEMES[themeIdRaw]) setThemeId(themeIdRaw);

      const color = t.color || d.envelopeColor;
      if (color) setEnvelopeColor(color);

      const texture = t.texture || d.envelopeTexture;
      if (texture) setEnvelopeTexture(texture);

      const liner = t.liner || d.linerChoice;
      if (liner) setLinerChoice(liner);

      const conf = pub.envelopeConfetti || d.confettiStyle;
      if (conf) setConfettiStyle(conf);

      const bg = pub.envelopeUnboxingBg || d.unboxingBg;
      if (bg) setUnboxingBg(bg);

      const hasNewTexts = tx && (tx.title || tx.recipient || tx.message);
      if (hasNewTexts) {
        setTexts(prev => ({
          ...prev,
          title:        tx.title        || prev.title,
          subtitle:     tx.recipient    || prev.subtitle,
          photoCaption: tx.photoCaption || prev.photoCaption,
          message:      tx.message      || prev.message,
          signature:    tx.signature    || prev.signature,
          backNote:     tx.backNote     || prev.backNote,
        }));
      } else if (d.texts) {
        setTexts(prev => ({ ...prev, ...d.texts }));
      }

      const photoUrl = pub.envelopePhoto || d.photo;
      if (photoUrl) setPhoto(photoUrl);

      if (g && (g.enabled || g.amount)) {
        setGift({
          enabled:  !!g.enabled,
          amount:   Number(g.amount) || 0,
          currency: g.currency || 'XOF',
          message:  g.message || '',
        });
      } else if (d.gift) {
        setGift(d.gift);
      }

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
     a refresh reopens the same draft. Continues after publish : le
     lecteur public /c/:slug relit les champs envelope* à chaque requête,
     donc un PATCH post-publish se propage immédiatement. On skip juste
     pendant la fenêtre de publication pour éviter la course avec publishCard. */
  const envelopeDraft = useMemo(() => ({
    envelopeOccasion: occasionId,
    envelopeTheme: {
      id: themeId, color: envelopeColor, texture: envelopeTexture, liner: linerChoice,
    },
    envelopeTexts: {
      title:        texts.title || '',
      recipient:    texts.subtitle || '',
      photoCaption: texts.photoCaption || '',
      message:      texts.message || '',
      signature:    texts.signature || '',
      backNote:     texts.backNote || '',
    },
    envelopePhoto: photo || '',
    envelopeGift: {
      enabled:  !!gift.enabled,
      amount:   Number(gift.amount) || 0,
      currency: gift.currency || 'XOF',
      message:  gift.message || '',
    },
    envelopeConfetti:   confettiStyle,
    envelopeUnboxingBg: unboxingBg,
  }), [occasionId, themeId, envelopeColor, envelopeTexture, linerChoice,
       confettiStyle, unboxingBg, texts, photo, gift]);

  useEffect(() => {
    if (skipNextSaveRef.current) { skipNextSaveRef.current = false; return; }
    if (publishState === 'publishing') return;

    const hasContent = (texts.subtitle || '').trim().length > 0;
    if (!draftId && !hasContent) return;   // wait until user starts typing

    const timeout = setTimeout(async () => {
      if (draftInflightRef.current) return;
      draftInflightRef.current = true;
      setSaveStatus('saving');
      try {
        if (draftId) {
          await updatePublication(draftId, envelopeDraft);
        } else {
          const title = `${texts.title || 'Carte'} — ${texts.subtitle || 'Brouillon'}`;
          const customName = 'card-' + Math.random().toString(36).slice(2, 10);
          const res = await createPublication({
            templateName: 'myenvelope',
            customName,
            title,
            style: { primaryColor: '#FF5470', accentColor: '#FFC145' },
            ...envelopeDraft,
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
  }, [envelopeDraft, draftId, publishState, texts.subtitle, texts.title]);

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
    publishState, publishedPub, publishError, publishCard, resetPublish, payGiftTopUp,
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
