import { useState, useMemo, createContext, useContext, useCallback } from 'react';
import { THEMES, DEFAULT_THEME_ID } from '../data/themes';
import { OCCASIONS, DEFAULT_OCCASION_ID, findOccasion } from '../data/occasions';
import { DEFAULT_BG_KEY, DEFAULT_CONFETTI_KEY } from '../data/backgrounds';
import { createPublication, publishPublication } from '../../utils/api';

const CardStateContext = createContext(null);

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

  const publishCard = useCallback(async () => {
    setPublishState('publishing');
    setPublishError(null);
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
      const customName = 'card-' + Math.random().toString(36).slice(2, 10);

      // 1) create the publication
      const created = await createPublication({
        templateName: 'myenvelope',
        customName,
        title,
        data: cardData,
        style: { primaryColor: '#FF5470', accentColor: '#FFC145' },
      });

      // 2) flag it as published so /c/:slug resolves it
      const publishRes = await publishPublication(created.data._id, {}).catch(() => null);
      const finalPub = publishRes?.data || created.data;

      setPublishedPub(finalPub);
      setPublishState('published');
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Erreur inconnue';
      setPublishError(message);
      setPublishState('error');
    }
  }, [themeId, texts, photo, occasionId, envelopeColor, envelopeTexture, linerChoice, confettiStyle, unboxingBg, gift]);

  const resetPublish = useCallback(() => {
    setPublishState('idle');
    setPublishedPub(null);
    setPublishError(null);
  }, []);

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
