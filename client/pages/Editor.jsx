import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { Joyride, STATUS } from 'react-joyride';
import { QrCode, PenTool, Palette, Image as ImageIcon, Sparkles, LayoutTemplate, Coffee, Blocks, MailOpen, ClipboardList, Megaphone, Info, Copy, Edit2, Check, X, RefreshCw, Gift, ArrowLeft } from 'lucide-react';
import styles from './Editor.module.css';

/* ─── Tab definitions ────────────────────────────────────────── */
const TABS = [
  { key: 'content', label: 'Contenu', icon: <PenTool size={18} strokeWidth={1.5} /> },
  { key: 'style', label: 'Style', icon: <Palette size={18} strokeWidth={1.5} /> },
  { key: 'background', label: 'Fond', icon: <ImageIcon size={18} strokeWidth={1.5} /> },
  { key: 'decorations', label: 'Décorations', icon: <Sparkles size={18} strokeWidth={1.5} /> },
  { key: 'photos', label: 'Photos', icon: <LayoutTemplate size={18} strokeWidth={1.5} /> },
  { key: 'jar', label: 'Jar', icon: <Coffee size={18} strokeWidth={1.5} />, templates: ['birthday', 'special'] },
  { key: 'confetti', label: 'Confettis', icon: <span style={{fontSize:'16px'}}>🎊</span>, templatePrefixes: ['birthday', 'special', 'collective'] },
  { key: 'widgets', label: 'Widgets', icon: <Blocks size={18} strokeWidth={1.5} /> },
  { key: 'wishes', label: 'Vœux', icon: <MailOpen size={18} strokeWidth={1.5} />, templatePrefix: 'collective' },
  { key: 'client', label: 'Client', icon: <ClipboardList size={18} strokeWidth={1.5} /> },
  { key: 'branding', label: 'Promo', icon: <Megaphone size={18} strokeWidth={1.5} /> },
];

function BrandingTab({ show, url, text, onToggle, onUrlChange, onTextChange }) {
  const DEFAULT_URL = 'https://app.mykado.store';
  const DEFAULT_TEXT = 'Crée le tien sur myKado';
  const displayText = text || DEFAULT_TEXT;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toggle */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        background: 'var(--surface, rgba(255,255,255,.05))',
        border: '1.5px solid var(--border, rgba(255,255,255,.1))',
        borderRadius: '12px', padding: '14px 16px'
      }}>
        <button
          onClick={() => onToggle(!show)}
          style={{
            width: '44px', height: '24px', borderRadius: '50px',
            border: 'none', cursor: 'pointer', flexShrink: 0, marginTop: '2px',
            background: show ? 'var(--brand, #c8963e)' : 'rgba(120, 120, 128, 0.2)',
            position: 'relative', transition: 'background .25s',
          }}
        >
          <span style={{
            position: 'absolute', top: '3px',
            left: show ? '22px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#fff', transition: 'left .25s',
          }} />
        </button>
        <div>
          <div style={{
            fontSize: '0.85rem', fontWeight: '700',
            color: 'var(--text, #fff)', marginBottom: '4px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Megaphone size={16} /> Afficher le bouton myKado
          </div>
          <div style={{
            fontSize: '0.75rem', color: 'var(--text-3, rgba(255,255,255,.4))',
            lineHeight: '1.5'
          }}>
            Un petit bouton discret s'affiche en bas de la page.
            Tes clients peuvent cliquer pour commander leur propre création.
            <br />
            <span style={{ color: 'var(--brand)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Offre une réduction en échange ! <Gift size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* Texte du bouton */}
      <div>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--text-3, rgba(255,255,255,.35))', marginBottom: '8px'
        }}>
          Texte du bouton
        </label>
        <input
          type="text"
          value={text}
          onChange={e => onTextChange(e.target.value)}
          placeholder={DEFAULT_TEXT}
          maxLength={60}
          style={{
            width: '100%', padding: '10px 12px',
            background: 'var(--surface, rgba(255,255,255,.05))',
            border: '1.5px solid var(--border, rgba(255,255,255,.1))',
            borderRadius: '8px', color: 'var(--text, #fff)',
            fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--brand, #c8963e)'}
          onBlur={e => e.target.style.borderColor = 'var(--border, rgba(255,255,255,.1))'}
        />
        <p style={{
          fontSize: '0.7rem', color: 'var(--text-3, rgba(255,255,255,.35))',
          marginTop: '4px'
        }}>
          Laisse vide pour utiliser le texte par défaut.
        </p>
      </div>

      {/* Preview */}
      {show && (
        <div style={{
          borderRadius: '10px', overflow: 'hidden',
          border: '1px solid var(--border, rgba(255,255,255,.1))'
        }}>
          <div style={{
            padding: '8px 12px', fontSize: '0.62rem',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--text-3, rgba(255,255,255,.4))', background: 'rgba(0,0,0,.2)'
          }}>
            Aperçu du bouton
          </div>
          <div style={{
            padding: '16px', display: 'flex', justifyContent: 'center',
            background: 'rgba(255,255,255,.03)'
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.92)',
              borderRadius: '50px', padding: '8px 18px',
              fontSize: '0.72rem', fontWeight: '600', color: '#444',
              boxShadow: '0 4px 16px rgba(0,0,0,.12)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              {displayText} <Sparkles size={14} />
            </span>
          </div>
        </div>
      )}

      {/* URL */}
      <div>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--text-3, rgba(255,255,255,.35))', marginBottom: '8px'
        }}>
          Lien de destination <span title="URL vers laquelle le bouton myKado redirigera"><Info size={14} /></span>
        </label>
        <input
          type="url"
          value={url}
          onChange={e => onUrlChange(e.target.value)}
          placeholder={DEFAULT_URL}
          style={{
            width: '100%', padding: '10px 12px',
            background: 'var(--surface, rgba(255,255,255,.05))',
            border: '1.5px solid var(--border, rgba(255,255,255,.1))',
            borderRadius: '8px', color: 'var(--text, #fff)',
            fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--brand, #c8963e)'}
          onBlur={e => e.target.style.borderColor = 'var(--border, rgba(255,255,255,.1))'}
        />
        <p style={{
          fontSize: '0.7rem', color: 'var(--text-3, rgba(255,255,255,.35))',
          marginTop: '6px', lineHeight: '1.5'
        }}>
          Ton WhatsApp : <code style={{ color: 'var(--brand)' }}>
            https://wa.me/+2290000000000
          </code>
          <br />ou l'URL de ta landing page.
        </p>
      </div>

    </div>
  );
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ── State ─────────────────────────────────────────────────── */
  const [pub, setPub] = useState(null);
  const [template, setTemplate] = useState(null);
  const [linkedOrder, setLinkedOrder] = useState(null);
  const [data, setData] = useState({});
  const [style, setStyle] = useState({});
  const [backgrounds, setBackgrounds] = useState({});   // style.backgrounds extracted
  const [decorations, setDecorations] = useState([]);
  const [jarConfig, setJarConfig] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [photoTransforms, setPhotoTransforms] = useState({});
  const [confettiType, setConfettiType] = useState('default');

  const [activeTab, setActiveTab] = useState('content');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [showBranding, setShowBranding] = useState(false);
  const [brandingUrl, setBrandingUrl] = useState('');
  const [brandingText, setBrandingText] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [slugEditing, setSlugEditing] = useState(false);
  const [slugDraft, setSlugDraft] = useState('');
  const [slugStatus, setSlugStatus] = useState('');

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const tourSteps = [
    { target: '.tour-step-tabs', content: 'Voici les onglets pour modifier votre création. Commencez par le Contenu !', disableBeacon: true, placement: 'top' },
    { target: '.tour-step-preview', content: 'Prévisualisez vos changements en temps réel ici.', placement: 'left' },
    { target: '.tour-step-publish', content: 'Une fois satisfait, cliquez ici pour publier votre création !', placement: 'bottom' }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('ewish_onboarding_done', 'true');
    }
  };

  const iframeRef = useRef(null);
  const tabsBarRef = useRef(null);
  const saveTimer = useRef(null);

  /* ── Load publication ───────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const r = await getPublications({ limit: 1000 });
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
        if (found.published) setPublishedUrl(`/site/${found.templateName}/${found.customName}`);

        try {
          const tr = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${found.templateName}`);
          if (tr.ok) setTemplate(await tr.json());
        } catch { }

        // Fetch linked order
        try {
          const orderRes = await import('../utils/api').then(m => m.getOrderByPublication(id));
          setLinkedOrder(orderRes.data);
        } catch {
          setLinkedOrder(null);
        }
      } catch { navigate('/ewish-admin/ewish'); }
    };
    load();

    if (!localStorage.getItem('ewish_onboarding_done')) {
      setRunTour(true);
    }
  }, [id, navigate]);

  /* ── Auto-save (debounced 1s) ───────────────────────────────── */
  const autoSave = useCallback(async (newData, newStyle, newBgs, newDecos, newJar, newWidgets, newPhotoTransforms) => {
    clearTimeout(saveTimer.current);
    setSaveStatus('unsaved');
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const fullStyle = { ...newStyle, backgrounds: newBgs };
        await updatePublication(id, {
          data: newData,
          style: fullStyle,
          decorations: newDecos,
          jarConfig: newJar,
          widgets: newWidgets,
          photoTransforms: newPhotoTransforms,
        });
        setSaveStatus('saved');
      } catch { setSaveStatus('unsaved'); }
    }, 1000);
  }, [id]);

  /* ── Live iframe refresh ────────────────────────────────────── */
  const refreshPreview = useCallback((d, st, bgs, decos, wids, photoT) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    try {
      // Single WW_UPDATE carries everything
      iframe.contentWindow.postMessage({
        type: 'WW_UPDATE',
        data: { ...d, photoTransforms: photoT },
        style: { ...st, backgrounds: bgs },
        decorations: decos,
        widgets: wids,
      }, '*');
    } catch { }
  }, []);

  /* ── Change handlers ────────────────────────────────────────── */
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

  const handleStyleChange = (key, value) => {
    const next = { ...style, [key]: value };
    setStyle(next);
    autoSave(data, next, backgrounds, decorations, jarConfig, widgets);
    refreshPreview(data, next, backgrounds, decorations, widgets);
  };

  const handleConfettiChange = (type) => {
    setConfettiType(type);
    const next = { ...style, confettiType: type };
    setStyle(next);
    autoSave(data, next, backgrounds, decorations, jarConfig, widgets);
    // Send live preview message
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.postMessage({ type: 'WW_CONFETTI', effectType: type }, '*');
        iframe.contentWindow.postMessage({ type: 'WW_UPDATE', style: { ...next, backgrounds } }, '*');
      } catch {}
    }
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
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      try { iframe.contentWindow.postMessage({ type: 'WW_UPDATE', data: { ...data, jarConfig: newJar }, style }, '*'); } catch { }
    }
  };

  const handleUpload = async (file, fieldKey) => {
    try {
      const r = await uploadFile(file);
      handleDataChange(fieldKey, r.data.url);
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.error || e.message));
    }
  };

  /* ── Publish ────────────────────────────────────────────────── */
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const fullStyle = { ...style, backgrounds };
      await updatePublication(id, { data, style: fullStyle, decorations, jarConfig, widgets });
      const r = await publishPublication(id);
      setPublishedUrl(r.data.url);
      setPub(p => ({ ...p, published: true }));
      // Get or generate short code
      try {
        const sl = await getShortLink(id);
        setShortCode(sl.data.shortCode);
      } catch { }
    } catch (e) {
      alert(e.response?.data?.error || 'Publish failed');
    } finally { setPublishing(false); }
  };

  /* ── Visible tabs ───────────────────────────────────────────── */
  const visibleTabs = TABS.filter(tab => {
    if (tab.templates && !tab.templates.includes(pub?.templateName)) return false;
    if (tab.templatePrefix && !pub?.templateName?.startsWith(tab.templatePrefix)) return false;
    if (tab.templatePrefixes) {
      const name = pub?.templateName || '';
      const matches = tab.templatePrefixes.some(p => name === p || name.startsWith(p));
      if (!matches) return false;
    }
    return true;
  });

  const previewSrc = pub ? `${import.meta.env.VITE_API_URL}/site/${pub.templateName}/${pub.customName}?preview=1` : '';

  if (!pub) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Chargement…</p>
    </div>
  );

  return (
    <div className={styles.root}>
      <Joyride
        steps={tourSteps}
        run={runTour}
        callback={handleJoyrideCallback}
        continuous
        showProgress
        showSkipButton
        styles={{
          options: {
            primaryColor: 'var(--brand)',
            zIndex: 10000,
          }
        }}
      />
      {/* ── Top Bar ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button className={styles.btnBack} title="Retour à l'espace client" onClick={() => navigate('/ewish-admin/ewish')}>
            <ArrowLeft size={18} />
          </button>
          <span className={styles.pubTitle}>Personnalisation</span>
        </div>
        <div className={styles.topbarCenter}>
          <span className={`${styles.saveStatus} ${styles[saveStatus]}`}>
            {saveStatus === 'saving' && <><RefreshCw size={14} className={styles.spinIcon} /> Sauvegarde…</>}
            {saveStatus === 'saved' && <><Check size={14} /> Sauvegardé</>}
            {saveStatus === 'unsaved' && 'Non sauvegardé'}
          </span>
        </div>
        <div className={styles.topbarRight}>
          {pub.published && shortCode && (
            <button className={styles.btnGhost} onClick={() => setShowQrModal(true)}>
              <QrCode size={16} /> Code QR
            </button>
          )}
          <button className={`${styles.btnPublish} tour-step-publish`} onClick={() => setIsPublishModalOpen(true)}>
            Publier
          </button>
        </div>
      </header>

      {/* ── Publish Modal ── */}
      {isPublishModalOpen && (
        <div className={styles.publishModalOverlay} onClick={() => setIsPublishModalOpen(false)}>
          <div className={styles.publishModal} onClick={e => e.stopPropagation()}>
            <div className={styles.dragPill} />

            {/* Header */}
            <div className={styles.publishModalHeader}>
              <h2>Publier la création</h2>
              <button className={styles.publishModalClose} onClick={() => setIsPublishModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Status badge */}
            <div className={styles.publishStatusBadge}>
              {pub?.published
                ? <span className={styles.badgePublished}>● Publiée</span>
                : <span className={styles.badgeDraft}>● Brouillon</span>
              }
            </div>

            {/* ── Link section — always visible ── */}
            <div className={styles.publishModalSection}>
              <div className={styles.publishLinkLabel}>Lien de publication</div>

              {/* URL display row */}
              <div className={styles.publishLinkRow}>
                <span className={styles.publishUrlText}>
                  {shortCode
                    ? `${import.meta.env.VITE_API_URL}/s/${shortCode}`
                    : <span className={styles.publishUrlPlaceholder}>Sera généré à la publication</span>
                  }
                </span>
                {shortCode && (
                  <button
                    className={`${styles.copyBtn} ${linkCopied ? styles.copyBtnDone : ''}`}
                    title="Copier le lien"
                    onClick={() => {
                      navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/s/${shortCode}`);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                  >
                    {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                    {linkCopied ? 'Copié !' : 'Copier'}
                  </button>
                )}
              </div>

              {/* Slug editor — always accessible if shortCode exists */}
              {shortCode && !slugEditing && (
                <button
                  className={styles.slugEditTrigger}
                  onClick={() => { setSlugDraft(shortCode); setSlugEditing(true); setSlugStatus(''); }}
                >
                  <Edit2 size={13} /> Modifier le lien court
                </button>
              )}

              {slugEditing && (
                <div className={styles.publishUrlBoxEdit}>
                  <span className={styles.shortUrlPrefix}>/s/</span>
                  <input
                    className={styles.slugInput}
                    value={slugDraft}
                    onChange={e => setSlugDraft(e.target.value)}
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        setSlugStatus('saving');
                        try {
                          const r = await setCustomSlug(id, slugDraft);
                          setShortCode(r.data.shortCode);
                          setSlugStatus('saved');
                          setSlugEditing(false);
                        } catch (err) {
                          setSlugStatus(err.response?.data?.error || 'Erreur');
                        }
                      }
                      if (e.key === 'Escape') setSlugEditing(false);
                    }}
                    placeholder="mon-lien-custom"
                    autoFocus
                  />
                  <button className={styles.slugSave} onClick={async () => {
                    setSlugStatus('saving');
                    try {
                      const r = await setCustomSlug(id, slugDraft);
                      setShortCode(r.data.shortCode);
                      setSlugStatus('saved');
                      setSlugEditing(false);
                    } catch (err) {
                      setSlugStatus(err.response?.data?.error || 'Erreur');
                    }
                  }}><Check size={16} /></button>
                  <button className={styles.slugCancel} onClick={() => setSlugEditing(false)}><X size={16} /></button>
                  {slugStatus && slugStatus !== 'saving' && (
                    <span className={`${styles.slugMsg} ${slugStatus === 'saved' ? styles.slugOk : styles.slugErr}`}>
                      {slugStatus === 'saved' ? <><Check size={13} /> OK</> : slugStatus}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className={styles.publishWarning}>
              {pub?.published
                ? 'Publier mettra à jour la version publique de votre création.'
                : 'Votre création sera accessible via le lien ci-dessus après publication.'
              }
            </div>

            <div className={styles.publishModalActions}>
              <button className={styles.modalCancel} onClick={() => setIsPublishModalOpen(false)}>Fermer</button>
              <button className={styles.modalConfirm} onClick={() => { handlePublish(); setIsPublishModalOpen(false); }} disabled={publishing}>
                {publishing ? 'Publication...' : pub?.published ? 'Republier' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}


      <div className={styles.workspace}>
        {/* ── Left/Bottom Panel ── */}
        <aside className={`${styles.panel} ${isPanelOpen ? styles.panelOpen : styles.panelClosed}`}>
          {/* Mobile Handle / Header */}
          <div className={styles.mobilePanelHeader} onClick={() => setIsPanelOpen(!isPanelOpen)}>
            <div className={styles.dragPill} />
            <div className={styles.mobilePanelTitleBar}>
              <span className={styles.mobilePanelTitle}>Edit Wish</span>
              <div className={styles.mobilePanelActions}>
              <span className={styles.mobilePanelToggleIcon}>
                {isPanelOpen ? (
                  /* Icône Chevron Down */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                ) : (
                  /* Icône Chevron Up */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                )}
              </span>
            </div>
            </div>
          </div>

          <div className={styles.panelContentWrapper}>
            {/* Sidebar tabs */}
            <div className={`${styles.tabsSidebar} tour-step-tabs`}>
              {visibleTabs.map(tab => (
                <button
                  key={tab.key}
                  className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                  title={tab.label}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  <span className={styles.tabLabel}>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.panelBody}>
            {activeTab === 'content' && (
              <ContentTab
                fields={template?.fields || []}
                data={data}
                onChange={handleDataChange}
                onUpload={handleUpload}
              />
            )}
            {activeTab === 'style' && (
              <StyleTab
                style={style}
                onChange={handleStyleChange}
              />
            )}
            {activeTab === 'background' && (
              <BackgroundTab
                templateName={pub.templateName}
                backgrounds={backgrounds}
                onChange={handleBackgroundsChange}
              />
            )}
            {activeTab === 'decorations' && (
              <DecoTab
                decorations={decorations}
                onChange={handleDecorationsChange}
              />
            )}
            {activeTab === 'photos' && (
              <PhotoLayoutTab
                transforms={photoTransforms}
                onChange={handlePhotoTransformsChange}
              />
            )}
            {activeTab === 'widgets' && (
              <WidgetTab
                widgets={widgets}
                onChange={handleWidgetsChange}
              />
            )}
            {activeTab === 'jar' && (
              <JarTab
                jarConfig={jarConfig}
                onChange={handleJarChange}
                templateName={pub.templateName}
              />
            )}
            {activeTab === 'confetti' && (
              <ConfettiTab
                confettiType={confettiType}
                onChange={handleConfettiChange}
                iframeRef={iframeRef}
              />
            )}
            {activeTab === 'wishes' && (
              <WishesManager
                publicationId={pub._id}
                templateName={pub.templateName}
              />
            )}
            {activeTab === 'client' && (
              <ClientTab
                order={linkedOrder}
                pubId={pub._id}
                templateName={pub.templateName}
                onImportAll={handleImportClientData}
              />
            )}
            {activeTab === 'branding' && (
              <BrandingTab
                show={showBranding}
                url={brandingUrl}
                text={brandingText}
                onToggle={(v) => {
                  setShowBranding(v);
                  updatePublication(id, { showBranding: v, brandingUrl, brandingText }).catch(() => { });
                }}
                onUrlChange={(v) => {
                  setBrandingUrl(v);
                  updatePublication(id, { showBranding, brandingUrl: v, brandingText }).catch(() => { });
                }}
                onTextChange={(v) => {
                  setBrandingText(v);
                  updatePublication(id, { showBranding, brandingUrl, brandingText: v }).catch(() => { });
                }}
              />
            )}
          </div>
          </div>
        </aside>

        {/* ── Preview ── */}
        <div className={styles.previewArea}>
          <div className={styles.previewBar}>
            <span className={styles.previewLabel}>Preview</span>
            <div className={styles.previewNav}>
              <button
                className={styles.previewBtn}
                title="Restart Preview"
                onClick={() => { const f = iframeRef.current; if (f) { const s = f.src; f.src = ''; f.src = s; } }}
              ><RefreshCw size={16} /></button>
            </div>
            <span className={styles.previewUrl}>/site/{pub.templateName}/{pub.customName}</span>
          </div>
          <div className={`${styles.previewFrame} tour-step-preview`}>
            <iframe
              ref={iframeRef}
              src={previewSrc}
              title="Preview"
              className={styles.iframe}
              key={pub._id}
            />
          </div>
        </div>
      </div>

      {/* {publishedUrl && pub.published && (
        <div className={styles.toast}>
          🎉 En ligne sur{' '}
          <a href={publishedUrl} target="_blank" rel="noreferrer">
            {window.location.origin}{publishedUrl}
          </a>
        </div>
      )} */}

      {showQrModal && pub.published && shortCode && (
        <QRCodeModal
          url={`${import.meta.env.VITE_API_URL}/s/${shortCode}`}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
}