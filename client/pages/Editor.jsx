import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublications, updatePublication, publishPublication, uploadFile, getShortLink, setCustomSlug } from '../utils/api';
import ContentTab from '../components/ContentTab';
import StyleTab from '../components/StyleTab';
import BackgroundTab from '../components/BackgroundTab';
import DecoTab from '../components/DecoTab';
import WidgetTab from '../components/WidgetTab';
import PhotoLayoutTab from '../components/PhotoLayoutTab';
import JarTab from '../components/JarTab';
import ConfettiTab from '../components/ConfettiTab';
import WishesManager from '../components/WishesManager';
import ClientTab from '../components/ClientTab';
import QRCodeModal from '../components/QRCodeModal';
import PaymentModal from '../admin/components/PaymentModal';
import { Joyride, STATUS } from 'react-joyride';
import {
  QrCode, Sparkles, Coffee, Blocks, MailOpen, ClipboardList,
  Megaphone, Info, Copy, Check, X, RefreshCw, Gift, ArrowLeft, ChevronRight,
  Shield, Lock,
} from 'lucide-react';
import KycModal from '../components/KycModal';
import MSheet from '../components/MSheet';
import styles from './Editor.module.css';

/* ─── Guided steps ────────────────────────────────────────────── */
const STEPS = [
  { id: 'Message', n: 1, title: 'Le message',  sub: 'Texte, photos, musique',  emoji: '💬', color: '#E11D48', soft: '#fff1f6', accent: '#fbcfe8' },
  { id: 'Look',    n: 2, title: 'Le style',    sub: 'Couleurs, fond, ambiance', emoji: '🎨', color: '#6E4FBA', soft: '#F6EEFB', accent: '#D7C5F2' },
  { id: 'Cadeau',  n: 3, title: 'La cagnotte', sub: 'Objectif cadeau commun',   emoji: '🎁', color: '#9B7EE2', soft: '#F6EEFB', accent: '#E5D9F5' },
  { id: 'Share',   n: 4, title: 'Le partage',  sub: 'Lien & QR Code',           emoji: '🔗', color: '#b45309', soft: '#fffbeb', accent: '#fde68a' },
];

/* ─── Section jump map — templates with animated GSAP timeline ── */
const TEMPLATE_SECTIONS = {
  birthday:           [
    { id: 'section-greeting', label: 'Intro',     emoji: '👋' },
    { id: 'section-music',    label: 'Musique',   emoji: '🎵' },
    { id: 'section-message',  label: 'Message',   emoji: '💬' },
    { id: 'section-special',  label: 'WhatsApp',  emoji: '📱' },
    { id: 'section-ideas',    label: 'Idées',     emoji: '✨' },
    { id: 'section-balloons', label: 'Ballons',   emoji: '🎈' },
    { id: 'section-outro',    label: 'Outro',     emoji: '🥂' },
  ],
  'collective-family': [
    { id: 'section-greeting', label: 'Intro',     emoji: '👋' },
    { id: 'section-music',    label: 'Musique',   emoji: '🎵' },
    { id: 'section-message',  label: 'Message',   emoji: '💬' },
    { id: 'section-ideas',    label: 'Idées',     emoji: '✨' },
    { id: 'section-balloons', label: 'Ballons',   emoji: '🎈' },
    { id: 'section-wishes',   label: 'Vœux',     emoji: '💌' },
    { id: 'section-outro',    label: 'Outro',     emoji: '🥂' },
  ],
  'collective-pro': [
    { id: 'section-greeting', label: 'Intro',     emoji: '👋' },
    { id: 'section-music',    label: 'Musique',   emoji: '🎵' },
    { id: 'section-message',  label: 'Message',   emoji: '💬' },
    { id: 'section-ideas',    label: 'Idées',     emoji: '✨' },
    { id: 'section-balloons', label: 'Ballons',   emoji: '🎈' },
    { id: 'section-wishes',   label: 'Vœux',     emoji: '💌' },
    { id: 'section-outro',    label: 'Outro',     emoji: '🥂' },
  ],
  special: [
    { id: 'section-greeting', label: 'Intro',     emoji: '👋' },
    { id: 'section-music',    label: 'Musique',   emoji: '🎵' },
    { id: 'section-message',  label: 'Message',   emoji: '💬' },
    { id: 'section-special',  label: 'Google',    emoji: '🔍' },
    { id: 'section-ideas',    label: 'Idées',     emoji: '✨' },
    { id: 'section-balloons', label: 'Ballons',   emoji: '🎈' },
    { id: 'section-outro',    label: 'Outro',     emoji: '🥂' },
  ],
};

/* ─── Tab visibility rules ────────────────────────────────────── */
const TABS = [
  { key: 'content' },
  { key: 'style' },
  { key: 'background' },
  { key: 'decorations', excludeTemplates: ['wall-of-wishes'] },
  { key: 'photos',      excludeTemplates: ['wall-of-wishes'] },
  { key: 'jar',         templates: ['birthday', 'special'] },
  { key: 'confetti',    templatePrefixes: ['birthday', 'special', 'collective'] },
  { key: 'widgets',     excludeTemplates: ['wall-of-wishes'] },
  { key: 'wishes',      templatePrefixes: ['collective', 'wall-of-wishes'] },
  { key: 'client' },
  { key: 'branding' },
];

/* ─── BrandingTab ─────────────────────────────────────────────── */
function BrandingTab({ show, url, text, onToggle, onUrlChange, onTextChange }) {
  const DEFAULT_URL  = 'https://app.mykado.store';
  const DEFAULT_TEXT = 'Crée le tien sur myKado';
  const displayText  = text || DEFAULT_TEXT;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        background: 'var(--surface, rgba(255,255,255,.05))',
        border: '1.5px solid var(--border, rgba(255,255,255,.1))',
        borderRadius: '12px', padding: '14px 16px',
      }}>
        <button
          onClick={() => onToggle(!show)}
          style={{
            width: '44px', height: '24px', borderRadius: '50px', border: 'none',
            cursor: 'pointer', flexShrink: 0, marginTop: '2px',
            background: show ? 'var(--brand, #c8963e)' : 'rgba(120,120,128,0.2)',
            position: 'relative', transition: 'background .25s',
          }}
        >
          <span style={{
            position: 'absolute', top: '3px', left: show ? '22px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#fff', transition: 'left .25s',
          }} />
        </button>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text, #fff)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Megaphone size={16} /> Afficher le bouton myKado
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3, rgba(255,255,255,.4))', lineHeight: '1.5' }}>
            Un petit bouton discret s'affiche en bas de la page.
            <br />
            <span style={{ color: 'var(--brand)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Offre une réduction en échange ! <Gift size={14} />
            </span>
          </div>
        </div>
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '8px' }}>
          Texte du bouton
        </label>
        <input
          type="text" value={text} onChange={e => onTextChange(e.target.value)}
          placeholder={DEFAULT_TEXT} maxLength={60}
          style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = 'var(--brand)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {show && (
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 12px', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'rgba(0,0,0,.2)' }}>
            Aperçu du bouton
          </div>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,.03)' }}>
            <span style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '50px', padding: '8px 18px', fontSize: '0.72rem', fontWeight: '600', color: '#444', boxShadow: '0 4px 16px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {displayText} <Sparkles size={14} />
            </span>
          </div>
        </div>
      )}

      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '8px' }}>
          Lien de destination <span title="URL vers laquelle le bouton myKado redirigera"><Info size={14} /></span>
        </label>
        <input
          type="url" value={url} onChange={e => onUrlChange(e.target.value)} placeholder={DEFAULT_URL}
          style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = 'var(--brand)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '6px', lineHeight: '1.5' }}>
          Ton WhatsApp : <code style={{ color: 'var(--brand)' }}>https://wa.me/+229...</code>
        </p>
      </div>
    </div>
  );
}

/* ─── AccordionCard (extras step) ────────────────────────────── */
function AccordionCard({ icon: Icon, title, sub, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.extraCard} style={{ borderColor: open ? color + '50' : undefined }}>
      <button className={styles.extraCardHeader} onClick={() => setOpen(o => !o)}>
        <span className={styles.extraCardIcon} style={{ background: color + '18', color }}>
          {Icon && <Icon size={16} />}
        </span>
        <div className={styles.extraCardInfo}>
          <div className={styles.extraCardTitle}>{title}</div>
          <div className={styles.extraCardSub}>{sub}</div>
        </div>
        <ChevronRight size={16} className={styles.extraCardChevron} style={{ transform: open ? 'rotate(90deg)' : 'none', color }} />
      </button>
      {open && <div className={styles.extraCardBody}>{children}</div>}
    </div>
  );
}

/* ─── Editor ──────────────────────────────────────────────────── */
export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pub, setPub]                     = useState(null);
  const [template, setTemplate]           = useState(null);
  const [linkedOrder, setLinkedOrder]     = useState(null);
  const [data, setData]                   = useState({});
  const [style, setStyle]                 = useState({});
  const [backgrounds, setBackgrounds]     = useState({});
  const [decorations, setDecorations]     = useState([]);
  const [jarConfig, setJarConfig]         = useState(null);
  const [widgets, setWidgets]             = useState([]);
  const [photoTransforms, setPhotoTransforms] = useState({});
  const [confettiType, setConfettiType]   = useState('default');

  /* step state */
  const [activeStep, setActiveStep]   = useState('Message');
  const [lookSubTab, setLookSubTab]   = useState('couleur');

  const [saveStatus, setSaveStatus]         = useState('saved');
  const [publishing, setPublishing]         = useState(false);
  const [publishedUrl, setPublishedUrl]     = useState('');
  const [showBranding, setShowBranding]     = useState(false);
  const [brandingUrl, setBrandingUrl]       = useState('');
  const [brandingText, setBrandingText]     = useState('');
  const [shortCode, setShortCode]           = useState('');
  const [slugDraft, setSlugDraft]           = useState('');
  const [slugStatus, setSlugStatus]         = useState('');
  const [linkCopied, setLinkCopied]         = useState(false);

  const [isPanelOpen, setIsPanelOpen]           = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [showQrModal, setShowQrModal]           = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [runTour, setRunTour]                   = useState(false);
  const [cagnotte, setCagnotte]               = useState(false);
  const [cagnotteGoal, setCagnotteGoal]       = useState(250000);
  const [cagnotteName, setCagnotteName]       = useState('');
  const [cagnotteImage, setCagnotteImage]     = useState('');
  const [cagnotteDeadline, setCagnotteDeadline] = useState('');
  const [cagnotteImgUploading, setCagnotteImgUploading] = useState(false);
  const [showKyc, setShowKyc]                 = useState(false);
  const [kycDone, setKycDone]                 = useState(false);
  const [previewDevice, setPreviewDevice]     = useState('desktop');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [showAdvancedLook, setShowAdvancedLook] = useState(false);

  const tourSteps = [
    { target: '.tour-step-nav',     content: 'Suivez ces 4 étapes pour personnaliser votre création !', disableBeacon: true, placement: 'bottom' },
    { target: '.tour-step-preview', content: 'Prévisualisez vos changements en temps réel ici.',        placement: 'left' },
    { target: '.tour-step-publish', content: 'Une fois satisfait, publiez votre création !',            placement: 'bottom' },
  ];

  const handleJoyrideCallback = ({ status }) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      localStorage.setItem('ewish_onboarding_done', 'true');
    }
  };

  const iframeRef  = useRef(null);
  const saveTimer  = useRef(null);
  const [activeSection, setActiveSection] = useState(null);

  /* sync slugDraft when shortCode changes */
  useEffect(() => { if (shortCode) setSlugDraft(shortCode); }, [shortCode]);

  /* load publication */
  useEffect(() => {
    const load = async () => {
      try {
        const r     = await getPublications({ limit: 1000 });
        const found = r.data.find(p => p._id === id);
        if (!found) { navigate('/'); return; }

        setPub(found);
        setData(found.data || {});
        const st = found.style || {};
        setStyle(st);
        setBackgrounds(st.backgrounds || {});
        setDecorations(found.decorations || []);
        setJarConfig(found.jarConfig || null);
        setWidgets(found.widgets || []);
        setPhotoTransforms(found.photoTransforms || {});
        setShowBranding(found.showBranding || false);
        setBrandingUrl(found.brandingUrl || '');
        setBrandingText(found.brandingText || '');
        setConfettiType(st.confettiType || 'default');

        const cc = found.cagnotteConfig || {};
        setCagnotte(cc.enabled || false);
        setCagnotteGoal(cc.goal || 250000);
        setCagnotteName(cc.description || '');
        setCagnotteImage(cc.image || '');
        setCagnotteDeadline(cc.deadline ? cc.deadline.slice(0, 10) : '');

        if (found.published) {
          setPublishedUrl(`/site/${found.templateName}/${found.customName}`);
          try { const sl = await getShortLink(id); setShortCode(sl.data.shortCode); } catch {}
        }

        try {
          const tr = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${found.templateName}`);
          if (tr.ok) setTemplate(await tr.json());
        } catch {}

        try {
          const orderRes = await import('../utils/api').then(m => m.getOrderByPublication(id));
          setLinkedOrder(orderRes.data);
        } catch { setLinkedOrder(null); }
      } catch { navigate('/ewish-admin/ewish'); }
    };
    load();
    if (!localStorage.getItem('ewish_onboarding_done')) setRunTour(true);
  }, [id, navigate]);

  /* auto-save */
  const autoSave = useCallback(async (newData, newStyle, newBgs, newDecos, newJar, newWidgets, newPhotoTransforms) => {
    clearTimeout(saveTimer.current);
    setSaveStatus('unsaved');
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updatePublication(id, {
          data: newData,
          style: { ...newStyle, backgrounds: newBgs },
          decorations: newDecos, jarConfig: newJar,
          widgets: newWidgets, photoTransforms: newPhotoTransforms,
        });
        setSaveStatus('saved');
      } catch { setSaveStatus('unsaved'); }
    }, 1000);
  }, [id]);

  /* cagnotte autosave */
  const cagnotteTimer = useRef(null);
  useEffect(() => {
    if (!id) return;
    clearTimeout(cagnotteTimer.current);
    cagnotteTimer.current = setTimeout(() => {
      updatePublication(id, {
        cagnotteConfig: {
          enabled: cagnotte,
          description: cagnotteName,
          goal: cagnotteGoal,
          image: cagnotteImage,
          deadline: cagnotteDeadline || null,
        },
      }).catch(() => {});
    }, 800);
  }, [id, cagnotte, cagnotteName, cagnotteGoal, cagnotteImage, cagnotteDeadline]);

  /* section jump */
  const jumpToSection = useCallback((sectionId) => {
    setActiveSection(sectionId);
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'WW_JUMP_SECTION', section: sectionId }, '*');
    } catch {}
  }, []);

  /* live preview */
  const refreshPreview = useCallback((d, st, bgs, decos, wids, photoT) => {
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'WW_UPDATE',
        data: { ...d, photoTransforms: photoT },
        style: { ...st, backgrounds: bgs },
        decorations: decos, widgets: wids,
      }, '*');
    } catch {}
  }, []);

  /* change handlers */
  const handleDataChange = (key, value) => {
    const next = { ...data, [key]: value };
    setData(next);
    autoSave(next, style, backgrounds, decorations, jarConfig, widgets, photoTransforms);
    refreshPreview(next, style, backgrounds, decorations, widgets, photoTransforms);
  };

  const handleImportClientData = (templateData) => {
    if (!templateData) return;
    const next = { ...data, ...templateData };
    setData(next);
    autoSave(next, style, backgrounds, decorations, jarConfig, widgets, photoTransforms);
    refreshPreview(next, style, backgrounds, decorations, widgets, photoTransforms);
    alert('Les données du client ont été importées dans le contenu !');
  };

  const handleStyleChange = (keyOrObj, value) => {
    const updates = typeof keyOrObj === 'object' && keyOrObj !== null
      ? keyOrObj : { [keyOrObj]: value };
    const next = { ...style, ...updates };
    setStyle(next);
    autoSave(data, next, backgrounds, decorations, jarConfig, widgets);
    refreshPreview(data, next, backgrounds, decorations, widgets);
  };

  const handleConfettiChange = (type) => {
    setConfettiType(type);
    const next = { ...style, confettiType: type };
    setStyle(next);
    autoSave(data, next, backgrounds, decorations, jarConfig, widgets);
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'WW_CONFETTI', effectType: type }, '*');
      iframeRef.current?.contentWindow?.postMessage({ type: 'WW_UPDATE', style: { ...next, backgrounds } }, '*');
    } catch {}
  };

  const handleBackgroundsChange = (newBgs) => {
    setBackgrounds(newBgs);
    autoSave(data, style, newBgs, decorations, jarConfig, widgets);
    refreshPreview(data, style, newBgs, decorations, widgets);
  };

  const handleDecorationsChange = (newDecos) => {
    setDecorations(newDecos);
    autoSave(data, style, backgrounds, newDecos, jarConfig, widgets);
    refreshPreview(data, style, backgrounds, newDecos, widgets);
  };

  const handlePhotoTransformsChange = (newT) => {
    setPhotoTransforms(newT);
    autoSave(data, style, backgrounds, decorations, jarConfig, widgets, newT);
    refreshPreview(data, style, backgrounds, decorations, widgets, newT);
  };

  const handleWidgetsChange = (newWids) => {
    setWidgets(newWids);
    autoSave(data, style, backgrounds, decorations, jarConfig, newWids);
    refreshPreview(data, style, backgrounds, decorations, newWids);
  };

  const handleJarChange = (newJar) => {
    setJarConfig(newJar);
    autoSave(data, style, backgrounds, decorations, newJar, widgets);
    try { iframeRef.current?.contentWindow?.postMessage({ type: 'WW_UPDATE', data: { ...data, jarConfig: newJar }, style }, '*'); } catch {}
  };

  const handleCagnotteToggle = (on) => {
    if (on && !kycDone) { setShowKyc(true); return; }
    setCagnotte(on);
  };

  const handleUpload = async (file, fieldKey) => {
    try {
      const r = await uploadFile(file);
      handleDataChange(fieldKey, r.data.url);
    } catch (e) { alert('Upload failed: ' + (e.response?.data?.error || e.message)); }
  };

  /* publish */
  const handlePublish = async () => {
    setPublishing(true);
    try {
      await updatePublication(id, {
        data, style: { ...style, backgrounds }, decorations, jarConfig, widgets,
        cagnotteConfig: { enabled: cagnotte, description: cagnotteName, goal: cagnotteGoal, image: cagnotteImage, deadline: cagnotteDeadline || null },
      });
      const r = await publishPublication(id);
      setPublishedUrl(r.data.url);
      setPub(p => ({ ...p, published: true, isPaid: true }));
      try { const sl = await getShortLink(id); setShortCode(sl.data.shortCode); } catch {}
    } catch (e) {
      if (e.response?.status === 402) setPaymentModalOpen(true);
      else alert(e.response?.data?.error || 'Publish failed');
    } finally { setPublishing(false); }
  };

  /* visibility helpers */
  const visibleTabs = TABS.filter(tab => {
    const name = pub?.templateName || '';
    if (tab.templates        && !tab.templates.includes(name))                                          return false;
    if (tab.excludeTemplates && tab.excludeTemplates.includes(name))                                    return false;
    if (tab.templatePrefixes && !tab.templatePrefixes.some(p => name === p || name.startsWith(p)))     return false;
    return true;
  });

  const showJar      = visibleTabs.some(t => t.key === 'jar');
  const showWishes   = visibleTabs.some(t => t.key === 'wishes');
  const showWidgets  = visibleTabs.some(t => t.key === 'widgets');
  const showConfetti = visibleTabs.some(t => t.key === 'confetti');
  const showDeco     = visibleTabs.some(t => t.key === 'decorations');
  const showPhotos   = visibleTabs.some(t => t.key === 'photos');

  const previewSections = pub ? (TEMPLATE_SECTIONS[pub.templateName] || null) : null;

  /* step helpers */
  const currentStepIndex = STEPS.findIndex(s => s.id === activeStep);
  const currentStep      = STEPS[currentStepIndex];

  /* look sub-tabs (filtered by template) */
  const lookSubTabs = [
    { id: 'couleur', label: 'Couleurs' },
    { id: 'fond',    label: 'Fond' },
    ...(showDeco || showConfetti ? [{ id: 'anim', label: 'Déco' }] : []),
    ...(showPhotos               ? [{ id: 'photos', label: 'Photos' }] : []),
  ];

  const previewSrc = pub
    ? `${import.meta.env.VITE_API_URL}/site/${pub.templateName}/${pub.customName}?preview=1`
    : '';

  /* ── step content ────────────────────────────────────────────── */
  const renderStepContent = () => {
    switch (activeStep) {
      case 'Message':
        return (
          <ContentTab
            fields={template?.fields || []}
            data={data}
            onChange={handleDataChange}
            onUpload={handleUpload}
          />
        );

      case 'Look':
        return (
          <div className={styles.lookScroll}>
            {/* Palettes + typographie */}
            <StyleTab style={style} onChange={handleStyleChange} />

            {/* Effet de fond */}
            {showConfetti && (
              <div className={styles.lookGroup}>
                <div className={styles.lookGroupLabel}>EFFET DE FOND</div>
                <div className={styles.effectGrid}>
                  {[
                    { id: 'default',     label: 'Confettis', emoji: '🎊' },
                    { id: 'hearts',      label: 'Cœurs',     emoji: '❤️' },
                    { id: 'stars',       label: 'Étoiles',   emoji: '⭐' },
                    { id: 'gold_rain',   label: 'Paillettes',emoji: '✨' },
                    { id: 'snow',        label: 'Flocons',   emoji: '❄️' },
                    { id: 'none',        label: 'Aucun',     emoji: '⚪' },
                  ].map(e => (
                    <button
                      key={e.id}
                      className={`${styles.effectBtn} ${confettiType === e.id ? styles.effectBtnActive : ''}`}
                      onClick={() => handleConfettiChange(e.id)}
                    >
                      <span className={styles.effectEmoji}>{e.emoji}</span>
                      <span className={styles.effectLabel}>{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fond & décors avancés */}
            <div className={styles.lookGroup}>
              <button className={styles.advancedLookToggle} onClick={() => setShowAdvancedLook(o => !o)}>
                <ChevronRight size={14} style={{ transform: showAdvancedLook ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}/>
                Fond & décors avancés
              </button>
              {showAdvancedLook && (
                <div className={styles.advancedLookContent}>
                  <BackgroundTab templateName={pub.templateName} backgrounds={backgrounds} onChange={handleBackgroundsChange} />
                  {showDeco && <DecoTab decorations={decorations} onChange={handleDecorationsChange} />}
                  {showPhotos && <PhotoLayoutTab transforms={photoTransforms} onChange={handlePhotoTransformsChange} />}
                </div>
              )}
            </div>
          </div>
        );

      case 'Cadeau': {
        const CAGNOTTE_TEMPLATES = ['wall-of-wishes', 'collective-family', 'collective-pro'];
        const supportsCagnotte = CAGNOTTE_TEMPLATES.includes(pub?.templateName);
        return (
          <div className={styles.extrasList}>
            {!supportsCagnotte && (
              <div style={{ padding: '16px', margin: '16px', background: '#FFF3CD', borderRadius: '12px', border: '1px solid #FFD66B', fontSize: '13px', color: '#856404' }}>
                ⚠️ La cagnotte est disponible uniquement pour les templates <strong>Mur de Vœux</strong>, <strong>Collectif Famille</strong> et <strong>Collectif Pro</strong>.
              </div>
            )}
            {/* Pivot banner */}
            <div className={styles.cadeauBanner}>
              <span className={styles.cadeauBannerEmoji}>🎁</span>
              <div>
                <div className={styles.cadeauBannerTitle}>Et si on lui offrait <em style={{ fontFamily: 'var(--mk-display)' }}>vraiment</em> ce qu'il/elle veut ?</div>
                <div className={styles.cadeauBannerDesc}>
                  Active la <strong>cagnotte</strong>. Tes proches voient l'objectif, participent au cadeau commun.
                  Tu reçois directement sur Mobile Money ou virement.
                </div>
              </div>
            </div>

            {/* Cagnotte toggle */}
            <div className={styles.cagnotteToggleRow}>
              <button
                className={styles.cagnotteToggleBtn}
                style={{ background: cagnotte ? '#9B7EE2' : 'rgba(120,120,128,.2)' }}
                onClick={() => handleCagnotteToggle(!cagnotte)}
              >
                <span className={styles.cagnotteToggleKnob} style={{ left: cagnotte ? '22px' : '3px' }} />
              </button>
              <div>
                <div className={styles.cagnotteToggleLabel}>Activer l'objectif cadeau</div>
                <div className={styles.cagnotteToggleSub}>
                  {cagnotte ? "En ligne — vérification d'identité validée" : 'KYC requis avant publication'}
                </div>
              </div>
            </div>

            {cagnotte ? (
              <div className={styles.cagnotteForm}>
                <div className={styles.cagnotteField}>
                  <label className={styles.cagnotteFieldLabel}>QUEL CADEAU ?</label>
                  <input className={styles.cagnotteInput} value={cagnotteName} onChange={e => setCagnotteName(e.target.value)} placeholder="Une PS5, un voyage, un appareil photo..." />
                </div>
                <div className={styles.cagnotteField}>
                  <label className={styles.cagnotteFieldLabel}>OBJECTIF (FCFA)</label>
                  <input className={styles.cagnotteInput} type="number" value={cagnotteGoal} onChange={e => setCagnotteGoal(Number(e.target.value))} />
                  <span className={styles.cagnotteFieldHint}>Soit environ {Math.ceil(cagnotteGoal / 656).toLocaleString('fr-FR')} EUR</span>
                </div>
                <div className={styles.cagnotteField}>
                  <label className={styles.cagnotteFieldLabel}>MÉTHODES DE RÉCEPTION</label>
                  <div className={styles.cagnottePills}>
                    <span className={styles.cagnottePill}>✓ MTN MoMo</span>
                    <span className={styles.cagnottePill}>✓ Moov Money</span>
                    <span className={styles.cagnottePill}>+ Virement</span>
                  </div>
                </div>
                <div className={styles.cagnotteField}>
                  <label className={styles.cagnotteFieldLabel}>IMAGE DU CADEAU (optionnel)</label>
                  {cagnotteImage
                    ? (
                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 100 }}>
                        <img src={cagnotteImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => setCagnotteImage('')} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                      </div>
                    )
                    : (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1.5px dashed var(--mk-line-2)', cursor: 'pointer', fontSize: 13, color: 'var(--mk-ink-2)', background: 'var(--mk-cream)' }}>
                        {cagnotteImgUploading ? '⏳ Upload…' : '📷 Ajouter une image'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} disabled={cagnotteImgUploading} onChange={async e => {
                          const f = e.target.files[0]; if (!f) return;
                          setCagnotteImgUploading(true);
                          try { const r = await uploadFile(f); setCagnotteImage(r.data.url); }
                          catch {}
                          finally { setCagnotteImgUploading(false); e.target.value = ''; }
                        }} />
                      </label>
                    )
                  }
                </div>
                <div className={styles.cagnotteField}>
                  <label className={styles.cagnotteFieldLabel}>DATE LIMITE (optionnel)</label>
                  <input className={styles.cagnotteInput} type="date" value={cagnotteDeadline} onChange={e => setCagnotteDeadline(e.target.value)} />
                </div>
                <div className={styles.cagnotteFees}>
                  <Shield size={13} /> myKado prend <strong>5%</strong> sur les contributions. Plafond : 2 000 000 FCFA/mois.
                </div>
              </div>
            ) : (
              <div className={styles.cagnotteHowTo}>
                <strong>Comment ça marche ?</strong><br />
                Tes invités voient le mur de vœux + un objectif cadeau (ex: PS5). Chacun peut ajouter une contribution (montant libre) en plus de son message. Une barre de progression collective apparaît en direct.
              </div>
            )}

            {/* Extras accordion */}
            {showJar && (
              <AccordionCard icon={Coffee} title="Jarre de Vœux" sub="Messages audio & écrits" color="#047857">
                <JarTab jarConfig={jarConfig} onChange={handleJarChange} templateName={pub.templateName} />
              </AccordionCard>
            )}
            {showWishes && (
              <AccordionCard icon={MailOpen} title="Vœux collectifs" sub="Messages de groupe" color="#047857">
                <WishesManager publicationId={pub._id} templateName={pub.templateName} customName={pub.customName} />
              </AccordionCard>
            )}
            <AccordionCard icon={Megaphone} title="Lien de promotion" sub="Bouton myKado discret" color="#047857">
              <BrandingTab
                show={showBranding} url={brandingUrl} text={brandingText}
                onToggle={v  => { setShowBranding(v);  updatePublication(id, { showBranding: v, brandingUrl, brandingText }).catch(() => {}); }}
                onUrlChange={v => { setBrandingUrl(v);  updatePublication(id, { showBranding, brandingUrl: v, brandingText }).catch(() => {}); }}
                onTextChange={v => { setBrandingText(v); updatePublication(id, { showBranding, brandingUrl, brandingText: v }).catch(() => {}); }}
              />
            </AccordionCard>
          </div>
        );
      }

      case 'Share':
        return (
          <div className={styles.shareStep}>
            {!pub?.published ? (
              <>
                <div className={styles.partageBanner}>
                  <div className={styles.partageBannerEmoji}>🎉</div>
                  <div className={styles.partageBannerTitle}>Prêt(e) à partager ?</div>
                  <div className={styles.partageBannerSub}>Publie pour obtenir ton lien magique + QR Code personnalisable</div>
                </div>
                <button className={styles.sharePublishBtn} onClick={handlePublish} disabled={publishing}>
                  {publishing
                    ? <><RefreshCw size={16} className={styles.spinIcon} /> Publication…</>
                    : <><Sparkles size={15} /> Publier ma création — 3 💎</>}
                </button>
                <div className={styles.partageLockedList}>
                  {[
                    { emoji: '🖼️', label: 'QR Code personnalisé', sub: 'Cœur, cercle, myKado…' },
                    { emoji: '🔗', label: 'Lien court magique',   sub: 'mykado.store/s/sophie-25' },
                    { emoji: '💬', label: 'Partager sur WhatsApp', sub: 'Avec aperçu auto' },
                    { emoji: '📧', label: 'Envoyer par email',    sub: 'Liste de contacts' },
                  ].map((item, i) => (
                    <div key={i} className={styles.partageLockedRow}>
                      <div className={styles.partageLockedIcon}>{item.emoji}</div>
                      <div className={styles.partageLockedInfo}>
                        <div className={styles.partageLockedLabel}>{item.label}</div>
                        <div className={styles.partageLockedSub}>{item.sub}</div>
                      </div>
                      <Lock size={14} className={styles.partageLockedLock} />
                    </div>
                  ))}
                </div>
                <div className={styles.partageNote}>Ces options s'activent une fois la création publiée.</div>
              </>
            ) : (
              <>
                <div className={styles.shareHero} style={{ background: 'linear-gradient(135deg, #F6EEFB, #FFE0E6)' }}>
                  <div className={styles.shareHeroEmoji}>🎉</div>
                  <div className={styles.shareHeroTitle} style={{ color: '#9C1632' }}>C'est en ligne !</div>
                  <div className={styles.shareHeroSub}>Ton lien est prêt à être partagé</div>
                </div>

                {shortCode && (
                  <div className={styles.shareLinkBox}>
                    <span className={styles.shareLinkUrl}>{import.meta.env.VITE_API_URL}/s/{shortCode}</span>
                    <button
                      className={`${styles.shareCopyBtn} ${linkCopied ? styles.shareCopyBtnDone : ''}`}
                      onClick={() => {
                        navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/s/${shortCode}`);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2000);
                      }}
                    >
                      {linkCopied ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier</>}
                    </button>
                  </div>
                )}

                <button className={styles.btnShareFull} onClick={() => navigate(`/ewish-admin/share/${id}`)}>
                  <Sparkles size={14} /> Page de partage complète — QR, canaux, cagnotte
                </button>

                <div className={styles.shareActionGrid}>
                  <button className={styles.shareActionBtn} onClick={() => setShowQrModal(true)}>
                    <QrCode size={18} /><span>Code QR</span>
                  </button>
                  <a
                    className={styles.shareActionBtn}
                    href={`https://wa.me/?text=${encodeURIComponent(`${import.meta.env.VITE_API_URL}/s/${shortCode}`)}`}
                    target="_blank" rel="noreferrer"
                  >
                    <span style={{ fontSize: 18 }}>💬</span><span>WhatsApp</span>
                  </a>
                </div>

                {shortCode && (
                  <div className={styles.shareSlugBox}>
                    <div className={styles.shareSlugLabel}>Personnaliser l'URL</div>
                    <div className={styles.publishUrlBoxEdit}>
                      <span className={styles.shortUrlPrefix}>/s/</span>
                      <input
                        className={styles.slugInput}
                        value={slugDraft}
                        onChange={e => setSlugDraft(e.target.value)}
                        onBlur={async () => {
                          if (slugDraft === shortCode) return;
                          setSlugStatus('saving');
                          try {
                            const r = await setCustomSlug(id, slugDraft);
                            setShortCode(r.data.shortCode);
                            setSlugStatus('saved');
                          } catch (err) { setSlugStatus(err.response?.data?.error || 'Erreur'); }
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setSlugDraft(shortCode); }}
                        placeholder="mon-lien-custom"
                      />
                      {slugStatus === 'saving' && <RefreshCw size={14} className={styles.spinIcon} />}
                      {slugStatus && slugStatus !== 'saving' && (
                        <span className={`${styles.slugMsg} ${slugStatus === 'saved' ? styles.slugOk : styles.slugErr}`}>
                          {slugStatus === 'saved' ? <><Check size={13} /> Sauvegardé</> : slugStatus}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button className={styles.sharePublishBtn} onClick={handlePublish} disabled={publishing} style={{ marginTop: 4 }}>
                  {publishing ? <><RefreshCw size={16} className={styles.spinIcon} /> Mise à jour…</> : 'Mettre à jour'}
                </button>
              </>
            )}
          </div>
        );

      default: return null;
    }
  };

  /* ─────────────────────────────────────────────────────────────── */
  if (!pub) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Chargement…</p>
    </div>
  );

  return (
    <div className={styles.root}>
      <Joyride
        steps={tourSteps} run={runTour} callback={handleJoyrideCallback}
        continuous showProgress showSkipButton
        styles={{ options: { primaryColor: 'var(--brand)', zIndex: 10000 } }}
      />

      {/* ── Top Bar ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button className={styles.btnBack} onClick={() => navigate('/ewish-admin/ewish')}>
            <ArrowLeft size={18} />
          </button>
          <span className={styles.pubTitle}>Personnalisation</span>
        </div>
        <div className={styles.topbarCenter}>
          <span className={`${styles.saveStatus} ${styles[saveStatus]}`}>
            {saveStatus === 'saving'  && <><RefreshCw size={14} className={styles.spinIcon} /> Sauvegarde…</>}
            {saveStatus === 'saved'   && <><Check size={14} /> Sauvegardé</>}
            {saveStatus === 'unsaved' && 'Non sauvegardé'}
          </span>
        </div>
        <div className={styles.topbarRight}>
          {pub.published && shortCode && (
            <button className={styles.btnGhost} onClick={() => setShowQrModal(true)}>
              <QrCode size={16} /> Code QR
            </button>
          )}
          <button
            className={`${styles.btnPublish} tour-step-publish`}
            onClick={() => { handlePublish(); setIsPublishModalOpen(true); }}
          >
            {pub?.published ? 'Partager' : 'Publier'}
          </button>
        </div>
      </header>

      {/* ── Progress strip ── */}
      <div className={styles.progressStrip}>
        <span className={styles.progressLabel}>Étape {currentStepIndex + 1} / {STEPS.length}</span>
        <div className={styles.progressBarWrap}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${(currentStepIndex + 1) * 25}%`, background: currentStep.color }}
          />
        </div>
        <span className={styles.progressPct} style={{ color: currentStep.color }}>
          {(currentStepIndex + 1) * 25}%
        </span>
      </div>

      {/* ── Publish Modal ── */}
      {isPublishModalOpen && (
        <div className={styles.publishModalOverlay} onClick={() => setIsPublishModalOpen(false)}>
          <div className={styles.publishModal} onClick={e => e.stopPropagation()}>
            <div className={styles.dragPill} />
            <div className={styles.publishModalHeader}>
              <h2>{pub?.published ? 'Partager ma création' : 'Publier la création'}</h2>
              <button className={styles.publishModalClose} onClick={() => setIsPublishModalOpen(false)}><X size={18} /></button>
            </div>
            <div className={styles.publishStatusBadge}>
              {pub?.published
                ? <span className={styles.badgePublished}>● Publiée</span>
                : <span className={styles.badgeDraft}>● Brouillon</span>}
            </div>
            <div className={styles.publishModalSection}>
              {publishing ? (
                <div className={styles.publishingStatus}>
                  <div className={styles.spinnerSmall} />
                  <span>{pub?.published ? 'Mise à jour…' : 'Publication…'}</span>
                </div>
              ) : (
                <>
                  <div className={styles.publishLinkLabel}>Lien de publication</div>
                  <div className={styles.publishLinkRow}>
                    <span className={styles.publishUrlText}>
                      {shortCode
                        ? `${import.meta.env.VITE_API_URL}/s/${shortCode}`
                        : <span className={styles.publishUrlPlaceholder}>Sera généré à la publication</span>}
                    </span>
                    {shortCode && (
                      <button
                        className={`${styles.copyBtn} ${linkCopied ? styles.copyBtnDone : ''}`}
                        onClick={() => {
                          navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/s/${shortCode}`);
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }}
                      >
                        {linkCopied ? <><Check size={16} /> Copié !</> : <><Copy size={16} /> Copier le lien</>}
                      </button>
                    )}
                  </div>
                  {shortCode && (
                    <div className={styles.slugSection}>
                      <div className={styles.slugLabel}>Personnaliser l'adresse (URL)</div>
                      <div className={styles.publishUrlBoxEdit}>
                        <span className={styles.shortUrlPrefix}>/s/</span>
                        <input
                          className={styles.slugInput}
                          value={slugDraft}
                          onChange={e => setSlugDraft(e.target.value)}
                          onBlur={async () => {
                            if (slugDraft === shortCode) return;
                            setSlugStatus('saving');
                            try {
                              const r = await setCustomSlug(id, slugDraft);
                              setShortCode(r.data.shortCode);
                              setSlugStatus('saved');
                            } catch (err) { setSlugStatus(err.response?.data?.error || 'Erreur'); }
                          }}
                          onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setSlugDraft(shortCode); }}
                          placeholder="mon-lien-custom"
                        />
                        {slugStatus === 'saving' && <RefreshCw size={14} className={styles.spinIcon} />}
                        {slugStatus && slugStatus !== 'saving' && (
                          <span className={`${styles.slugMsg} ${slugStatus === 'saved' ? styles.slugOk : styles.slugErr}`}>
                            {slugStatus === 'saved' ? <><Check size={13} /> Sauvegardé</> : slugStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className={styles.publishModalActions}>
              <button className={styles.modalConfirm} onClick={() => setIsPublishModalOpen(false)}>Terminer</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.workspace}>
        {/* ── Panel ── */}
        <aside className={`${styles.panel} ${isPanelOpen ? styles.panelOpen : styles.panelClosed}`}>

          {/* Mobile handle */}
          <div className={styles.mobilePanelHeader} onClick={() => setIsPanelOpen(o => !o)}>
            <div className={styles.dragPill} />
            <div className={styles.mobilePanelTitleBar}>
              <span className={styles.mobilePanelTitle}>{currentStep.title}</span>
              <span className={styles.mobilePanelToggleIcon}>
                {isPanelOpen
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>}
              </span>
            </div>
          </div>

          {/* Step nav */}
          <div className={`${styles.stepNav} tour-step-nav`}>
            {STEPS.map((step, i) => {
              const isActive = activeStep === step.id;
              const isDone   = currentStepIndex > i;
              return (
                <button
                  key={step.id}
                  className={`${styles.stepNavBtn} ${isActive ? styles.stepNavBtnActive : ''} ${isDone ? styles.stepNavBtnDone : ''}`}
                  onClick={() => setActiveStep(step.id)}
                  style={isActive ? { borderBottomColor: step.color, color: step.color, background: step.soft } : {}}
                >
                  <span className={styles.stepNavEmoji}>{isDone ? '✓' : step.emoji}</span>
                  <span className={styles.stepNavLabel}>{step.title.split(' ').slice(-1)[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Panel main */}
          <div className={styles.panelMain}>
            {/* Step header */}
            <div className={styles.stepHeader} style={{ background: currentStep.soft, borderBottom: `2px solid ${currentStep.accent}` }}>
              <span className={styles.stepHeaderNum} style={{ background: currentStep.color }}>{currentStep.n}</span>
              <div>
                <div className={styles.stepHeaderTitle} style={{ color: currentStep.color }}>{currentStep.title}</div>
                <div className={styles.stepHeaderSub}>{currentStep.sub}</div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className={styles.stepContent}>
              {renderStepContent()}
            </div>

            {/* Footer nav */}
            <div className={styles.stepFooter}>
              <button
                className={styles.btnPrev}
                onClick={() => { const p = STEPS[currentStepIndex - 1]; if (p) setActiveStep(p.id); }}
                disabled={currentStepIndex === 0}
              >
                ← Précédent
              </button>
              {currentStepIndex < STEPS.length - 1 ? (
                <button
                  className={styles.btnNext}
                  onClick={() => { const n = STEPS[currentStepIndex + 1]; if (n) setActiveStep(n.id); }}
                  style={{ background: currentStep.color }}
                >
                  Suivant →
                </button>
              ) : (
                <button
                  className={styles.btnNext}
                  onClick={handlePublish}
                  disabled={publishing}
                  style={{ background: currentStep.color }}
                >
                  {pub?.published ? 'Mettre à jour' : '✨ Publier'}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Preview ── */}
        <div className={styles.previewArea}>
          <div className={styles.previewBar}>
            <span className={styles.previewLabel}>Preview</span>
            <div className={styles.deviceToggle}>
              <button className={`${styles.deviceBtn} ${previewDevice === 'phone' ? styles.deviceBtnActive : ''}`} onClick={() => setPreviewDevice('phone')}>📱</button>
              <button className={`${styles.deviceBtn} ${previewDevice === 'desktop' ? styles.deviceBtnActive : ''}`} onClick={() => setPreviewDevice('desktop')}>💻</button>
            </div>
            <span className={styles.previewLiveChip}><span className={styles.liveDot} /> Aperçu en direct</span>
            <div className={styles.previewNav}>
              <button
                className={styles.previewBtn}
                onClick={() => { const f = iframeRef.current; if (f) { const s = f.src; f.src = ''; f.src = s; setActiveSection(null); } }}
              ><RefreshCw size={16} /></button>
            </div>
            {previewSections && (<>
              <select
                className={styles.sectionSelect}
                value={activeSection || ''}
                onChange={e => e.target.value && jumpToSection(e.target.value)}
              >
                <option value="">Aller à…</option>
                {previewSections.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.emoji} {sec.label}</option>
                ))}
              </select>
              <div className={styles.sectionPicker}>
                {previewSections.map(sec => (
                  <button
                    key={sec.id}
                    className={`${styles.sectionBtn} ${activeSection === sec.id ? styles.sectionBtnActive : ''}`}
                    onClick={() => jumpToSection(sec.id)}
                    title={sec.label}
                  >
                    <span className={styles.sectionEmoji}>{sec.emoji}</span>
                    <span className={styles.sectionLabel}>{sec.label}</span>
                  </button>
                ))}
              </div>
            </>)}
            <span className={styles.previewUrl}>/site/{pub.templateName}/{pub.customName}</span>
          </div>
          <div className={`${styles.previewFrame} tour-step-preview`}>
            {previewDevice === 'phone' ? (
              <div className={styles.phoneWrap}>
                <div className={styles.phoneNotch} />
                <iframe ref={iframeRef} src={previewSrc} title="Preview" className={styles.iframePhone} key={pub._id} />
              </div>
            ) : (
              <iframe ref={iframeRef} src={previewSrc} title="Preview" className={styles.iframe} key={pub._id} />
            )}
          </div>
        </div>
      </div>

      {showQrModal && pub.published && shortCode && (
        <QRCodeModal url={`${import.meta.env.VITE_API_URL}/s/${shortCode}`} onClose={() => setShowQrModal(false)} />
      )}

      {paymentModalOpen && (
        <PaymentModal onClose={() => setPaymentModalOpen(false)} onSuccess={handlePublish} />
      )}

      {showKyc && (
        <KycModal
          open={showKyc}
          onClose={() => setShowKyc(false)}
          onDone={() => {
            setShowKyc(false);
            setKycDone(true);
            setCagnotte(true);
          }}
        />
      )}

      {/* ── Mobile bottom dock ── */}
      <div className={styles.mobileDock}>
        {STEPS.map(step => (
          <button
            key={step.id}
            className={`${styles.mobileDockBtn} ${activeStep === step.id ? styles.mobileDockBtnActive : ''}`}
            style={activeStep === step.id ? { background: step.soft, color: step.color } : {}}
            onClick={() => { setActiveStep(step.id); setMobileSheetOpen(true); }}
          >
            <span className={styles.mobileDockEmoji}>{step.emoji}</span>
            <span className={styles.mobileDockLabel}>{step.title.split(' ').slice(-1)[0]}</span>
          </button>
        ))}
      </div>

      {/* ── Mobile sheet ── */}
      <MSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        title={currentStep?.title}
      >
        <div className={styles.mobileSheetContent}>
          {renderStepContent()}
          <div className={styles.mobileSheetFooter}>
            {currentStepIndex < STEPS.length - 1 ? (
              <button
                className={styles.mobileSheetNext}
                style={{ background: currentStep.color }}
                onClick={() => { setActiveStep(STEPS[currentStepIndex + 1].id); }}
              >
                Suivant → {STEPS[currentStepIndex + 1]?.emoji}
              </button>
            ) : (
              <button
                className={styles.mobileSheetNext}
                style={{ background: currentStep.color }}
                onClick={() => { setMobileSheetOpen(false); handlePublish(); }}
                disabled={publishing}
              >
                {pub?.published ? '✨ Mettre à jour' : '✨ Publier — 3 💎'}
              </button>
            )}
          </div>
        </div>
      </MSheet>
    </div>
  );
}
