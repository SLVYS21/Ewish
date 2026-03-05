import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPublications, updatePublication, publishPublication, uploadFile } from '../utils/api';
import ContentTab from '../components/ContentTab';
import StyleTab from '../components/StyleTab';
import JarTab from '../components/JarTab';
import styles from './Editor.module.css';
import WishesManager from '../components/WishesManager';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pub, setPub] = useState(null);
  const [template, setTemplate] = useState(null);
  const [data, setData] = useState({});
  const [style, setStyle] = useState({});
  const [activeTab, setActiveTab] = useState('content');
  const [saveStatus, setSaveStatus] = useState('saved'); // saved | saving | unsaved
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const iframeRef = useRef(null);
  const saveTimer = useRef(null);

  // Load publication
  useEffect(() => {
    const load = async () => {
      try {
        const r = await getPublications();
        const found = r.data.find(p => p._id === id);
        if (!found) { navigate('/'); return; }
        setPub(found);
        setData(found.data || {});
        setStyle(found.style || {});
        if (found.published) setPublishedUrl(`/site/${found.templateName}/${found.customName}`);

        // Load template definition
        try {
          const tr = await fetch(`/api/templates/${found.templateName}`);
          if (tr.ok) setTemplate(await tr.json());
        } catch {}
      } catch { navigate('/'); }
    };
    load();
  }, [id]);

  // Auto-save with debounce
  const autoSave = useCallback(async (newData, newStyle) => {
    clearTimeout(saveTimer.current);
    setSaveStatus('unsaved');
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updatePublication(id, { data: newData, style: newStyle });
        setSaveStatus('saved');
      } catch { setSaveStatus('unsaved'); }
    }, 1000);
  }, [id]);

  const handleDataChange = (key, value) => {
    const next = { ...data, [key]: value };
    setData(next);
    autoSave(next, style);
    refreshPreview(next, style);
  };

  const handleStyleChange = (key, value) => {
    const next = { ...style, [key]: value };
    setStyle(next);
    autoSave(data, next);
    refreshPreview(data, next);
  };

  // Inject updated data into live iframe without reloading
  const refreshPreview = useCallback((d, s) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage({ type: 'WW_UPDATE', data: d, style: s }, '*');
    } catch {}
  }, []);

  // Handle file uploads from within the editor
  const handleUpload = async (file, fieldKey) => {
    try {
      const r = await uploadFile(file);
      handleDataChange(fieldKey, r.data.url);
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.error || e.message));
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Save first
      await updatePublication(id, { data, style });
      const r = await publishPublication(id);
      setPublishedUrl(r.data.url);
      setPub(p => ({ ...p, published: true }));
    } catch (e) {
      alert(e.response?.data?.error || 'Publish failed');
    } finally { setPublishing(false); }
  };

  const previewSrc = pub ? `/site/${pub.templateName}/${pub.customName}` : '';

  if (!pub) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Loading editor…</p>
    </div>
  );

  return (
    <div className={styles.root}>
      {/* ── Top Bar ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Link to="/" className={styles.back}>← Dashboard</Link>
          <span className={styles.divider} />
          <span className={styles.pubTitle}>{pub.title || 'Untitled'}</span>
        </div>
        <div className={styles.topbarCenter}>
          <span className={`${styles.saveStatus} ${styles[saveStatus]}`}>
            {saveStatus === 'saving' && '↻ Saving…'}
            {saveStatus === 'saved' && '✓ Saved'}
            {saveStatus === 'unsaved' && '● Unsaved'}
          </span>
        </div>
        <div className={styles.topbarRight}>
          {publishedUrl && (
            <a href={publishedUrl} target="_blank" rel="noreferrer" className={styles.btnGhost}>
              View live ↗
            </a>
          )}
          <button className={styles.btnPublish} onClick={handlePublish} disabled={publishing}>
            {publishing ? 'Publishing…' : pub.published ? 'Update' : 'Publish'}
          </button>
        </div>
      </header>

      <div className={styles.workspace}>
        {/* ── Left Panel ── */}
        <aside className={styles.panel}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'content' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('content')}
            >Content</button>
            <button
              className={`${styles.tab} ${activeTab === 'style' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('style')}
            >Style</button>
            {pub.templateName?.startsWith('collective') && (
              <button
                className={`${styles.tab} ${activeTab === 'wishes' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('wishes')}
              >💌 Vœux</button>
            )}
            {(pub.templateName === 'birthday' || pub.templateName === 'special') && (
              <button
                className={`${styles.tab} ${activeTab === 'jar' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('jar')}
              >🫙 Jar</button>
            )}
          </div>

          {/* Tab content */}
          <div className={styles.panelBody}>
            {activeTab === 'content' ? (
              <ContentTab
                fields={template?.fields || []}
                data={data}
                onChange={handleDataChange}
                onUpload={handleUpload}
              />
            ) : activeTab === 'style' ? (
              <StyleTab
                style={style}
                onChange={handleStyleChange}
              />
            ) : activeTab === 'jar' ? (
              <JarTab
                data={data}
                onChange={handleDataChange}
                templateName={pub.templateName}
              />
            ) : (
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
              <button className={styles.previewBtn} onClick={() => iframeRef.current?.contentWindow?.location.reload()}>↺ Restart</button>
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

      {/* Publish success toast */}
      {publishedUrl && pub.published && (
        <div className={styles.toast}>
          🎉 Live at{' '}
          <a href={publishedUrl} target="_blank" rel="noreferrer">
            {window.location.origin}{publishedUrl}
          </a>
        </div>
      )}
    </div>
  );
}