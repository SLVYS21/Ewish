import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPublications, updatePublication, publishPublication, uploadFile } from '../utils/api';
import ContentTab     from '../components/ContentTab';
import StyleTab       from '../components/StyleTab';
import BackgroundTab  from '../components/BackgroundTab';
import DecoTab from '../components/DecoTab';
import JarTab         from '../components/JarTab';
import WishesManager  from '../components/WishesManager';
import styles from './Editor.module.css';

/* ─── Tab definitions ────────────────────────────────────────── */
const TABS = [
  { key: 'content',     label: 'Contenu',         icon: '✏️' },
  { key: 'style',       label: 'Style',            icon: '🎨' },
  { key: 'background',  label: 'Fond',             icon: '🖼' },
  { key: 'decorations', label: 'Décorations',      icon: '🌸' },
  { key: 'jar',         label: 'Jar',              icon: '🫙',  templates: ['birthday', 'special'] },
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
  const [activeTab,   setActiveTab]   = useState('content');
  const [saveStatus,  setSaveStatus]  = useState('saved');
  const [publishing,  setPublishing]  = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');

  const iframeRef  = useRef(null);
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
        if (found.published) setPublishedUrl(`/site/${found.templateName}/${found.customName}`);

        try {
          const tr = await fetch(`/api/templates/${found.templateName}`);
          if (tr.ok) setTemplate(await tr.json());
        } catch {}
      } catch { navigate('/'); }
    };
    load();
  }, [id]);

  /* ── Auto-save (debounced 1s) ───────────────────────────────── */
  const autoSave = useCallback(async (newData, newStyle, newBgs, newDecos, newJar) => {
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
        });
        setSaveStatus('saved');
      } catch { setSaveStatus('unsaved'); }
    }, 1000);
  }, [id]);

  /* ── Live iframe refresh ────────────────────────────────────── */
  const refreshPreview = useCallback((d, st, bgs, decos) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    try {
      // Update data/style fields
      iframe.contentWindow.postMessage({
        type:  'WW_UPDATE',
        data:  d,
        style: { ...st, backgrounds: bgs },
      }, '*');
      // Update decorations + backgrounds via engine
      iframe.contentWindow.postMessage({
        type:        'WW_DECO_UPDATE',
        decorations: decos,
        style:       { backgrounds: bgs },
      }, '*');
    } catch {}
  }, []);

  /* ── Change handlers ────────────────────────────────────────── */
  const handleDataChange = (key, value) => {
    const next = { ...data, [key]: value };
    setData(next);
    autoSave(next, style, backgrounds, decorations, jarConfig);
    refreshPreview(next, style, backgrounds, decorations);
  };

  const handleStyleChange = (key, value) => {
    const next = { ...style, [key]: value };
    setStyle(next);
    autoSave(data, next, backgrounds, decorations, jarConfig);
    refreshPreview(data, next, backgrounds, decorations);
  };

  const handleBackgroundsChange = (newBgs) => {
    setBackgrounds(newBgs);
    autoSave(data, style, newBgs, decorations, jarConfig);
    refreshPreview(data, style, newBgs, decorations);
  };

  const handleDecorationsChange = (newDecos) => {
    setDecorations(newDecos);
    autoSave(data, style, backgrounds, newDecos, jarConfig);
    refreshPreview(data, style, backgrounds, newDecos);
  };

  const handleJarChange = (newJar) => {
    setJarConfig(newJar);
    autoSave(data, style, backgrounds, decorations, newJar);
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
      await updatePublication(id, { data, style: fullStyle, decorations, jarConfig });
      const r = await publishPublication(id);
      setPublishedUrl(r.data.url);
      setPub(p => ({ ...p, published: true }));
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

  const previewSrc = pub ? `/site/${pub.templateName}/${pub.customName}` : '';

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
          <Link to="/" className={styles.back}>← Dashboard</Link>
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
          {publishedUrl && (
            <a href={publishedUrl} target="_blank" rel="noreferrer" className={styles.btnGhost}>
              Voir en live ↗
            </a>
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
          <div className={styles.tabs}>
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