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
import WishesManager from '../components/WishesManager';
import ClientTab from '../components/ClientTab';
import styles from './Editor.module.css';

/* ─── Tab definitions ────────────────────────────────────────── */
const TABS = [
  { key: 'content', label: 'Contenu', icon: '✏️' },
  { key: 'style', label: 'Style', icon: '🎨' },
  { key: 'background', label: 'Fond', icon: '🖼' },
  { key: 'decorations', label: 'Décorations', icon: '🌸' },
  { key: 'photos', label: 'Photos', icon: '📐' },
  { key: 'jar', label: 'Jar', icon: '🫙', templates: ['birthday', 'special'] },
  { key: 'widgets', label: 'Widgets', icon: '🧩' },
  { key: 'wishes', label: 'Vœux', icon: '💌', templatePrefix: 'collective' },
  { key: 'client', label: 'Client', icon: '📝' },
  { key: 'branding', label: 'Promo', icon: '📣' },
];

function BrandingTab({ show, url, onToggle, onUrlChange }) {
  const DEFAULT_URL = 'https://app.mykado.store';
  //previewSrc
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
            background: show ? 'var(--brand, #c8963e)' : 'rgba(255,255,255,.15)',
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
            color: 'var(--text, #fff)', marginBottom: '4px'
          }}>
            📣 Afficher le bouton eWishWell
          </div>
          <div style={{
            fontSize: '0.75rem', color: 'var(--text-3, rgba(255,255,255,.4))',
            lineHeight: '1.5'
          }}>
            Un petit bouton discret s'affiche en bas de la page.
            Tes clients peuvent cliquer pour commander leur propre création.
            <br />
            <span style={{ color: 'var(--brand, #c8963e)', fontWeight: '600' }}>
              Offre une réduction en échange ! 🎁
            </span>
          </div>
        </div>
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
            }}>
              Crée le tien sur eWishWell ✨
            </span>
          </div>
        </div>
      )}

      {/* URL */}
      <div>
        <label style={{
          display: 'block', fontSize: '0.65rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--text-3, rgba(255,255,255,.35))', marginBottom: '8px'
        }}>
          Lien de destination
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
            fontSize: '0.85rem', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--brand, #c8963e)'}
          onBlur={e => e.target.style.borderColor = 'var(--border, rgba(255,255,255,.1))'}
        />
        <p style={{
          fontSize: '0.7rem', color: 'var(--text-3, rgba(255,255,255,.35))',
          marginTop: '6px', lineHeight: '1.5'
        }}>
          Ton WhatsApp : <code style={{ color: 'var(--brand, #c8963e)' }}>
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

  const [activeTab, setActiveTab] = useState('content');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [showBranding, setShowBranding] = useState(false);
  const [brandingUrl, setBrandingUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [slugEditing, setSlugEditing] = useState(false);
  const [slugDraft, setSlugDraft] = useState('');
  const [slugStatus, setSlugStatus] = useState('');

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
  }, [id]);

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
      {/* ── Top Bar ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Link to="/ewish-admin/ewish" className={styles.back}>← Dashboard</Link>
          <span className={styles.divider} />
          <span className={styles.pubTitle}>{pub.title || 'Sans titre'}</span>
        </div>
        <div className={styles.topbarCenter}>
          <span className={`${styles.saveStatus} ${styles[saveStatus]}`}>
            {saveStatus === 'saving' && '↻ Sauvegarde…'}
            {saveStatus === 'saved' && '✓ Sauvegardé'}
            {saveStatus === 'unsaved' && '● Non sauvegardé'}
          </span>
        </div>
        <div className={styles.topbarRight}>
          {shortCode && (
            <div className={styles.shortUrlWrap}>
              {slugEditing ? (
                <>
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
                          setSlugStatus(err.response?.data?.error || 'error');
                        }
                      }
                      if (e.key === 'Escape') setSlugEditing(false);
                    }}
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
                      setSlugStatus(err.response?.data?.error || 'error');
                    }
                  }}>✓</button>
                  <button className={styles.slugCancel} onClick={() => setSlugEditing(false)}>✕</button>
                  {slugStatus && slugStatus !== 'saving' && (
                    <span className={styles.slugMsg}>{slugStatus === 'saved' ? '✓' : slugStatus}</span>
                  )}
                </>
              ) : (
                <>
                  <button
                    className={styles.shortUrl}
                    title="Copier le lien court"
                    onClick={() => {
                      const origin = import.meta.env.VITE_API_URL || window.location.origin;
                      navigator.clipboard.writeText(`${origin}/s/${shortCode}`);
                    }}
                  >
                    /s/{shortCode} 📋
                  </button>
                  <button
                    className={styles.slugEdit}
                    title="Modifier le slug"
                    onClick={() => { setSlugDraft(shortCode); setSlugEditing(true); setSlugStatus(''); }}
                  >✏️</button>
                  <a href={publishedUrl} target="_blank" rel="noreferrer" className={styles.btnGhost}>↗</a>
                </>
              )}
            </div>
          )}
          <button className={styles.btnPublish} onClick={handlePublish} disabled={publishing}>
            {publishing ? 'Publication…' : pub.published ? 'Mettre à jour' : 'Publier'}
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        {/* ── Left Panel ── */}
        <aside className={styles.panel}>
          {/* Tabs */}
          <div className={styles.tabs} ref={tabsBarRef}>
            {visibleTabs.map(tab => (
              <button
                key={tab.key}
                data-tabkey={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => {
                  setActiveTab(tab.key);
                  const bar = tabsBarRef.current;
                  const btn = bar?.querySelector(`[data-tabkey="${tab.key}"]`);
                  if (bar && btn) {
                    const btnLeft = btn.offsetLeft;
                    const btnRight = btnLeft + btn.offsetWidth;
                    const barWidth = bar.clientWidth;
                    const scroll = bar.scrollLeft;
                    if (btnLeft < scroll + 12) bar.scrollTo({ left: btnLeft - 12, behavior: 'smooth' });
                    else if (btnRight > scroll + barWidth - 12) bar.scrollTo({ left: btnRight - barWidth + 12, behavior: 'smooth' });
                  }
                }}
                title={tab.label}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
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
                onToggle={(v) => {
                  setShowBranding(v);
                  updatePublication(id, { showBranding: v, brandingUrl }).catch(() => { });
                }}
                onUrlChange={(v) => {
                  setBrandingUrl(v);
                  updatePublication(id, { showBranding, brandingUrl: v }).catch(() => { });
                }}
              />
            )}
          </div>
        </aside>

        {/* ── Preview ── */}
        <div className={styles.previewArea}>
          <div className={styles.previewBar}>
            <span className={styles.previewLabel}>Preview</span>
            <div className={styles.previewNav}>
              <button
                className={styles.previewBtn}
                onClick={() => { const f = iframeRef.current; if (f) { const s = f.src; f.src = ''; f.src = s; } }}
              //onClick={() => iframeRef.current?.contentWindow?.location.reload()}
              >↺ Restart</button>
            </div>
            <span className={styles.previewUrl}>/site/{pub.templateName}/{pub.customName}</span>
          </div>
          <div className={styles.previewFrame}>
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

      {publishedUrl && pub.published && (
        <div className={styles.toast}>
          🎉 En ligne sur{' '}
          <a href={publishedUrl} target="_blank" rel="noreferrer">
            {window.location.origin}{publishedUrl}
          </a>
        </div>
      )}
    </div>
  );
}