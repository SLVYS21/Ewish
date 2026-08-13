import { useState, useEffect, useRef } from 'react';
import { X, Smartphone, Monitor, ArrowRight, Sparkles, Users, Heart } from 'lucide-react';
import s from './OccasionPreviewModal.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function OccasionPreviewModal({ isOpen, onClose, item, onSelectCreate }) {
  const [deviceMode, setDeviceMode] = useState('mobile'); // 'mobile' | 'desktop'
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, item, onClose]);

  if (!isOpen || !item) return null;

  const isWall = item.kind === 'wall';
  const previewSrc = item.previewUrl || `${API_URL}/preview/${item.templateName || 'birthday'}`;

  const handleCreate = () => {
    onClose();
    if (onSelectCreate) {
      onSelectCreate(item);
    }
  };

  return (
    <div className={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Top Header */}
      <header className={s.topBar}>
        <div className={s.leftInfo}>
          <span className={`${s.typeBadge} ${isWall ? s.typeWall : s.typeCard}`}>
            {isWall ? <Users size={12} /> : <Sparkles size={12} />}
            {isWall ? 'Mur Collaboratif' : 'Carte Animée'}
          </span>
          <div>
            <h3 className={s.modalTitle}>{item.title}</h3>
            <span className={s.modalSub}>
              {isWall ? 'Plusieurs contributeurs · Messages & Photos' : 'Expérience interactive 1-to-1 avec musique & animation'}
            </span>
          </div>
        </div>

        {/* Center device toggle */}
        <div className={s.centerControls}>
          <button
            className={`${s.deviceBtn} ${deviceMode === 'mobile' ? s.deviceBtnActive : ''}`}
            onClick={() => setDeviceMode('mobile')}
            title="Aperçu smartphone"
          >
            <Smartphone size={15} />
            <span>Mobile</span>
          </button>
          <button
            className={`${s.deviceBtn} ${deviceMode === 'desktop' ? s.deviceBtnActive : ''}`}
            onClick={() => setDeviceMode('desktop')}
            title="Aperçu grand écran"
          >
            <Monitor size={15} />
            <span>Bureau</span>
          </button>
        </div>

        {/* Right action & close */}
        <div className={s.rightActions}>
          <button className={s.createBtn} onClick={handleCreate}>
            <span>{isWall ? 'Créer mon Mur' : 'Créer ma Carte'}</span>
            <ArrowRight size={15} />
          </button>
          <button className={s.closeBtn} onClick={onClose} aria-label="Fermer la prévisualisation (Échap)">
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Viewport Stage */}
      <main className={s.viewportArea} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        {deviceMode === 'mobile' ? (
          <div className={s.phoneFrame} onClick={(e) => e.stopPropagation()}>
            <div className={s.phoneNotch}>
              <div className={s.phoneSpeaker} />
              <div className={s.phoneCamera} />
            </div>
            <div className={s.iframeWrapper}>
              {loading && (
                <div className={s.loadingCover}>
                  <div className={s.spinner} />
                  <span>Chargement de la démonstration…</span>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={previewSrc}
                className={s.previewIframe}
                title={item.title}
                onLoad={() => setLoading(false)}
                allow="autoplay"
              />
            </div>
          </div>
        ) : (
          <div className={s.desktopFrame} onClick={(e) => e.stopPropagation()}>
            <div className={s.desktopHeader}>
              <span className={`${s.windowDot} ${s.dotRed}`} />
              <span className={`${s.windowDot} ${s.dotYellow}`} />
              <span className={`${s.windowDot} ${s.dotGreen}`} />
              <div className={s.desktopUrlBar}>
                https://mykado.store/demo/{item.templateName || 'apercu'}
              </div>
            </div>
            <div className={s.iframeWrapper}>
              {loading && (
                <div className={s.loadingCover}>
                  <div className={s.spinner} />
                  <span>Chargement de la démonstration…</span>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={previewSrc}
                className={s.previewIframe}
                title={item.title}
                onLoad={() => setLoading(false)}
                allow="autoplay"
              />
            </div>
          </div>
        )}

        <div className={s.bottomHint}>
          <Sparkles size={14} style={{ color: '#F59E0B' }} />
          <span>{isWall ? 'Tu peux tester l\'ajout de messages sur ce mur !' : 'Clique sur la carte pour tester l\'animation de déballage !'}</span>
        </div>
      </main>
    </div>
  );
}
