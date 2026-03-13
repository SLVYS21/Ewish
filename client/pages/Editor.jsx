import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPublications, updatePublication, publishPublication, uploadFile, getShortLink, setCustomSlug } from '../utils/api';
import ContentTab     from '../components/ContentTab';
import StyleTab       from '../components/StyleTab';
import BackgroundTab  from '../components/BackgroundTab';
import DecoTab         from '../components/DecoTab';
import WidgetTab       from '../components/WidgetTab';
import PhotoLayoutTab  from '../components/PhotoLayoutTab';
import JarTab         from '../components/JarTab';
import WishesManager  from '../components/WishesManager';
import styles from './Editor.module.css';

/* ─── Tab definitions ────────────────────────────────────────── */
const TABS = [
  { key: 'content',     label: 'Contenu',         icon: '✏️' },
  { key: 'style',       label: 'Style',            icon: '🎨' },
  { key: 'background',  label: 'Fond',             icon: '🖼' },
  { key: 'decorations', label: 'Décorations',      icon: '🌸' },
  { key: 'photos',      label: 'Photos',           icon: '📐' },
  { key: 'jar',         label: 'Jar',              icon: '🫙',  templates: ['birthday', 'special'] },
  { key: 'widgets',     label: 'Widgets',           icon: '🧩' },
  { key: 'wishes',      label: 'Vœux',             icon: '💌',  templatePrefix: 'collective' },
];

export default function Editor() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  /* ── State ─────────────────────────────────────────────────── */
  const [pub,         setPub]         = useState(null);
  const [template,    setTemplate]    = useState(null);
  const [data,        setData]        = useState({});
  const [style,       setStyle]       = useState({});
  const [backgrounds, setBackgrounds] = useState({});   // style.backgrounds extracted
  const [decorations, setDecorations] = useState([]);
  const [jarConfig,   setJarConfig]   = useState(null);
  const [widgets,     setWidgets]     = useState([]);
  const [photoTransforms, setPhotoTransforms] = useState({});
  const [activeTab,   setActiveTab]   = useState('content');
  const [saveStatus,  setSaveStatus]  = useState('saved');
  const [publishing,  setPublishing]  = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [shortCode,    setShortCode]    = useState('');
  const [slugEditing,  setSlugEditing]  = useState(false);
  const [slugDraft,    setSlugDraft]    = useState('');
  const [slugStatus,   setSlugStatus]   = useState('');

  const iframeRef  = useRef(null);
  const tabsBarRef = useRef(null);
  const saveTimer  = useRef(null);

  /* ── Load publication ───────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const r     = await getPublications();
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
        if (found.published) setPublishedUrl(`/site/${found.templateName}/${found.customName}`);

        try {
          const tr = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${found.templateName}`);
          if (tr.ok) setTemplate(await tr.json());
        } catch {}
      } catch { navigate('/'); }
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
          data:        newData,
          style:       fullStyle,
          decorations: newDecos,
          jarConfig:   newJar,
          widgets:     newWidgets,
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
        type:        'WW_UPDATE',
        data:        { ...d, photoTransforms: photoT },
        style:       { ...st, backgrounds: bgs },
        decorations: decos,
        widgets:     wids,
      }, '*');
    } catch {}
  }, []);

  /* ── Change handlers ────────────────────────────────────────── */
  const handleDataChange = (key, value) => {
    const next = { ...data, [key]: value };
    setData(next);
    autoSave(next, style, backgrounds, decorations, jarConfig, widgets);
    refreshPreview(next, style, backgrounds, decorations, widgets);
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
      try { iframe.contentWindow.postMessage({ type: 'WW_UPDATE', data: { ...data, jarConfig: newJar }, style }, '*'); } catch {}
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
      } catch {}
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

  const previewSrc = pub ? `${import.meta.env.VITE_API_URL}/site/${pub.templateName}/${pub.customName}` : '';

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
            {saveStatus === 'saving'  && '↻ Sauvegarde…'}
            {saveStatus === 'saved'   && '✓ Sauvegardé'}
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
                        } catch(err) {
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
                    } catch(err) {
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
          </div>
        </aside>

        {/* ── Preview ── */}
        <div className={styles.previewArea}>
          <div className={styles.previewBar}>
            <span className={styles.previewLabel}>Preview</span>
            <div className={styles.previewNav}>
              <button
                className={styles.previewBtn}
                onClick={() => iframeRef.current?.contentWindow?.location.reload()}
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