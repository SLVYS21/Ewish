import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Tag, X, Image as ImageIcon, Layers } from 'lucide-react';
import { getAssets, uploadAsset, deleteAsset } from '../../utils/api';
import PageShell from '../components/PageShell';
import s from './SuperAdminAssets.module.css';

const TYPES = [
  { key: 'background', label: 'Backgrounds', icon: <Layers size={16} /> },
  { key: 'decoration', label: 'Décorations', icon: <ImageIcon size={16} /> },
];

export default function SuperAdminAssets() {
  const [activeType, setActiveType] = useState('background');
  const [assets, setAssets]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const fileRef = useRef(null);

  const load = (type) => {
    setLoading(true);
    getAssets(type)
      .then(r => setAssets(r.data))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(activeType); }, [activeType]);

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setUploadName(f.name.replace(/\.[^.]+$/, ''));
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) pickFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', activeType);
      fd.append('name', uploadName || file.name);
      fd.append('tags', uploadTags);
      await uploadAsset(fd);
      setFile(null); setPreview(null); setUploadName(''); setUploadTags('');
      load(activeType);
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur upload');
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet asset ?')) return;
    setDeleting(id);
    try { await deleteAsset(id); load(activeType); }
    catch (e) { alert(e.response?.data?.error || 'Erreur'); }
    setDeleting(null);
  };

  return (
    <PageShell title="Banque d'images">
      {/* Tabs */}
      <div className={s.tabs}>
        {TYPES.map(t => (
          <button
            key={t.key}
            className={`${s.tab} ${activeType === t.key ? s.tabActive : ''}`}
            onClick={() => setActiveType(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Upload zone */}
      <div
        className={`${s.dropZone} ${dragOver ? s.dragOver : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && fileRef.current.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={s.fileInput}
          onChange={e => pickFile(e.target.files[0])}
        />

        {file ? (
          <div className={s.previewArea}>
            <img src={preview} alt="preview" className={s.previewImg} />
            <div className={s.previewMeta}>
              <input
                className={s.metaInput}
                placeholder="Nom de l'asset"
                value={uploadName}
                onChange={e => setUploadName(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
              <div className={s.tagRow} onClick={e => e.stopPropagation()}>
                <Tag size={14} />
                <input
                  className={s.metaInput}
                  placeholder="Tags (séparés par virgule)"
                  value={uploadTags}
                  onChange={e => setUploadTags(e.target.value)}
                />
              </div>
              <div className={s.uploadActions} onClick={e => e.stopPropagation()}>
                <button className={s.cancelBtn} onClick={() => { setFile(null); setPreview(null); }}>
                  <X size={14} /> Annuler
                </button>
                <button className={s.uploadBtn} onClick={handleUpload} disabled={uploading}>
                  <Upload size={14} /> {uploading ? 'Upload…' : 'Uploader'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={s.dropPrompt}>
            <Upload size={28} />
            <div>Glissez une image ici ou <span>parcourir</span></div>
            <div className={s.dropHint}>PNG, JPG, WebP — max 20 Mo</div>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className={s.loading}>Chargement…</div>
      ) : assets.length === 0 ? (
        <div className={s.empty}>Aucun asset dans cette catégorie</div>
      ) : (
        <div className={s.grid}>
          {assets.map(asset => (
            <div key={asset._id} className={s.assetCard}>
              <div className={s.assetThumb}>
                <img src={asset.url} alt={asset.name} loading="lazy" />
                <button
                  className={s.deleteBtn}
                  onClick={() => handleDelete(asset._id)}
                  disabled={deleting === asset._id}
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className={s.assetName}>{asset.name}</div>
              {asset.tags?.length > 0 && (
                <div className={s.tagList}>
                  {asset.tags.map(t => <span key={t} className={s.tagPill}>{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
