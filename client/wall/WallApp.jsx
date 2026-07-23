import { useEffect, useMemo, useState } from 'react';
import { useKKiaPay } from 'kkiapay-react';
import { Copy, Gift, Lock, Send, Share2, Sparkles, X, Heart, Image as ImageIcon, Music, ImagePlay } from 'lucide-react';
import api, {
  getApprovedWishes,
  getContributionStats,
  uploadFile,
  verifyContribution,
} from '../utils/api';
import { fireConfetti } from '../utils/confettiFx';
import AnimatedBackground from './AnimatedBackground';
import StoryViewer from './StoryViewer';
import AudioWavePlayer from './AudioWavePlayer';

const data = typeof window !== 'undefined' ? (window.__WW_DATA__ || {}) : {};
const meta = typeof window !== 'undefined' ? (window.__WW_META__ || {}) : {};
const style = typeof window !== 'undefined' ? (window.__WW_STYLE__ || {}) : {};
const branding = typeof window !== 'undefined' ? (window.__WW_BRANDING__ || {}) : {};
const deco = typeof window !== 'undefined' ? (window.__WW_DECO__ || []) : [];
const widgets = typeof window !== 'undefined' ? (window.__WW_WIDGETS__ || []) : [];
const confettiType = typeof window !== 'undefined' ? (window.__WW_CONFETTI_TYPE__ || 'default') : 'default';

const isModern = String(meta.templateName || data.templateName || '').includes('modern');
const publicId = String(meta.id || data.publicationId || '');
const apiBase = String(data.apiBase || '').trim();
const streamBase = apiBase.replace(/\/api$/, '');
const streamUrl = `${streamBase || ''}/api/walls/${publicId}/stream`;
const wallTitle = data.title || meta.title || 'Mur myKado';
const wallName = data.name || data.recipientName || data.customName || '';
const wallMessage = data.subtitle || data.tagline || data.description || 'Un espace vivant pour déposer des mots, des souvenirs et des gestes d’amour.';
const wishesEnabled = data.wishesEnabled !== false;
const isPrivate = !!data.isPrivate && !!data.accessCode;
const isPreview = !!data.previewMode;
const isAdmin = !!data.isAdmin;
const previewBanner = isPreview ? 'Aperçu' : '';
const maxWishes = 80;

function formatMoney(value) {
  return Number(value || 0).toLocaleString('fr-FR');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function mediaKind(wish) {
  if (wish.photoUrl) return 'photo';
  if (wish.videoUrl) return 'video';
  if (wish.audioUrl) return 'audio';
  return '';
}

function buildMedia(wish) {
  if (wish.photoUrl) return <img src={wish.photoUrl} alt="" loading="lazy" />;
  if (wish.videoUrl) return <video src={wish.videoUrl} controls playsInline />;
  if (wish.audioUrl) return <AudioWavePlayer src={wish.audioUrl} />;
  return null;
}

function PrivateGate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  return (
    <div id="access-gate" style={{ display: 'flex' }}>
      <div className="gate-card">
        <div className="gate-ic">
          <Lock size={28} />
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 22, color: 'var(--mk-ink)', marginBottom: 8, fontWeight: 400 }}>Mur privé</h2>
        <p style={{ fontSize: 13.5, color: 'var(--mk-ink-3)', lineHeight: 1.55, marginBottom: 18 }}>
          Ce mur est protégé.<br/>Entrez le code d'accès pour continuer.
        </p>
        <input
          id="gate-input"
          className="gate-input"
          type="text"
          placeholder="Code d'accès"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(''); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (String(code).trim() === String(data.accessCode || '').trim()) {
                localStorage.setItem(`ww-access-${publicId}`, code.trim());
                onUnlock();
              } else {
                setError('Code incorrect.');
              }
            }
          }}
        />
        <button
          className="gate-btn"
          onClick={() => {
            if (String(code).trim() === String(data.accessCode || '').trim()) {
              localStorage.setItem(`ww-access-${publicId}`, code.trim());
              onUnlock();
            } else {
              setError('Code incorrect.');
            }
          }}
        >
          Accéder
        </button>
        {error && <div id="gate-err" style={{ fontSize: 12.5, color: 'var(--mk-rose)', marginTop: 10, fontWeight: 600 }}>{error}</div>}
      </div>
    </div>
  );
}

function ModernIntro({ onReveal }) {
  return (
    <div id="env-overlay" className="show pop">
      <span className="env-glow eg1"></span>
      <span className="env-glow eg2"></span>
      <div className="env-brand">myKado</div>
      <button className="gift-box" id="gift-box" onClick={onReveal} aria-label="Déballer mon cadeau" type="button">
        <span className="gift-ring"></span>
        <span className="gift-ring r2"></span>
        <img className="gift-anim"
             src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f381/512.gif"
             alt=""
             onError={(e) => e.target.src='https://fonts.gstatic.com/s/e/notoemoji/latest/1f381/512.webp'} />
        <span className="gift-spark s1">✨</span>
        <span className="gift-spark s2">✨</span>
      </button>
      <h3 id="env-title" className="gift-title">Ton mur<br/>de mots est prêt</h3>
      <button id="env-open-btn" onClick={onReveal} type="button">
        Déballer mon cadeau
      </button>
      <div className="env-hint">Touche le paquet pour l'ouvrir ✨</div>
    </div>
  );
}

export default function WallApp() {
  const [wishes, setWishes] = useState([]);
  const [stats, setStats] = useState(data.cagnotte || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [storyIndex, setStoryIndex] = useState(-1);
  const [gateOpen, setGateOpen] = useState(!isPrivate);
  const [showIntro, setShowIntro] = useState(!data.skipIntro && !isPreview && isModern);
  const [composerOpen, setComposerOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [wishForm, setWishForm] = useState({
    firstName: '',
    role: '',
    message: '',
    color: 0,
    mediaType: 'none',
    photoUrl: '',
    audioUrl: '',
    videoUrl: '',
  });
  const [giftForm, setGiftForm] = useState({
    contributorName: '',
    amount: data.minContribution || 500,
    isAnonymous: false,
  });
  const [uploading, setUploading] = useState(false);
  const kkiapay = useKKiaPay();

  const streamEnabled = !isPrivate || gateOpen;
  const goal = stats?.goal || data?.cagnotte?.goal || 0;
  const collected = stats?.total || data?.cagnotte?.collected || 0;
  const percent = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0;
  const unlockedKey = `ww-access-${publicId}`;

  useEffect(() => {
    document.title = wallName ? `${wallTitle} · ${wallName}` : wallTitle;
  }, []);

  useEffect(() => {
    if (!isPrivate) return;
    const saved = localStorage.getItem(unlockedKey);
    if (saved && String(saved).trim() === String(data.accessCode || '').trim()) {
      setGateOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!streamEnabled || !publicId) return;

    let es = null;
    let alive = true;
    let poll = null;

    const refresh = async () => {
      const wishesPromise = getApprovedWishes(publicId);
      const statsPromise = data.cagnotte?.enabled ? getContributionStats(publicId) : Promise.resolve(null);
      const [w, s] = await Promise.all([wishesPromise, statsPromise]);
      if (!alive) return;
      setWishes(Array.isArray(w.data) ? w.data : []);
      if (s?.data) setStats(s.data);
      setLoading(false);
    };

    refresh().catch(() => {
      if (alive) setLoading(false);
    });

    try {
      es = new EventSource(streamUrl);
      es.addEventListener('wish', (event) => {
        const payload = JSON.parse(event.data);
        setWishes((prev) => {
          const next = [payload.data, ...prev.filter((item) => String(item._id) !== String(payload.data._id))];
          return next.slice(0, maxWishes);
        });
        fireConfetti(confettiType);
      });
      es.addEventListener('contribution', (event) => {
        const payload = JSON.parse(event.data);
        if (payload.stats) setStats(payload.stats);
        fireConfetti('gold_rain');
      });
      es.addEventListener('stats', (event) => {
        const payload = JSON.parse(event.data);
        if (payload.data) setStats(payload.data);
      });
    } catch {
      es = null;
    }

    poll = setInterval(() => {
      refresh().catch(() => {});
    }, 30000);

    return () => {
      alive = false;
      if (es) es.close();
      if (poll) clearInterval(poll);
    };
  }, [streamEnabled, publicId]);

  useEffect(() => {
    if (showIntro) return;
    fireConfetti(confettiType);
  }, [showIntro]);

  useEffect(() => {
    const onSuccess = async (response) => {
      try {
        const payload = {
          transactionId: response.transactionId,
          publicationId: publicId,
          contributorName: giftForm.contributorName,
          isAnonymous: giftForm.isAnonymous,
        };
        await verifyContribution(payload);
        setToast('Merci ! Ta contribution a été enregistrée.');
        fireConfetti('gold_rain');
        setGiftOpen(false);
        setGiftForm((prev) => ({ ...prev, amount: data.minContribution || 500 }));
      } catch (error) {
        setToast(error?.response?.data?.error || 'Paiement confirmé, mais la vérification a échoué.');
      }
    };

    if (kkiapay?.addSuccessListener) {
      kkiapay.addSuccessListener(onSuccess);
    }
  }, [kkiapay, giftForm]);

  const handleWishSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      firstName: wishForm.firstName.trim(),
      role: wishForm.role.trim(),
      message: wishForm.message.trim(),
      color: Number(wishForm.color) || 0,
      mediaType: wishForm.mediaType,
      photoUrl: wishForm.photoUrl,
      audioUrl: wishForm.audioUrl,
      videoUrl: wishForm.videoUrl,
      rot: Math.round((Math.random() * 6) - 3),
    };

    if (!payload.firstName || !payload.message) {
      setToast('Le prénom et le message sont obligatoires.');
      return;
    }

    try {
      await api.post(`/wishes/${publicId}`, payload);
      setWishForm({
        firstName: '',
        role: '',
        message: '',
        color: 0,
        mediaType: 'none',
        photoUrl: '',
        audioUrl: '',
        videoUrl: '',
      });
      setComposerOpen(false);
      setToast('Ton mot a bien été envoyé.');
      fireConfetti(confettiType);
    } catch (error) {
      setToast(error?.response?.data?.error || 'Impossible d’envoyer le mot.');
    }
  };

  const handleMediaUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data: uploaded } = await uploadFile(file);
      const url = uploaded?.url || uploaded?.secure_url || uploaded?.data?.url || '';
      if (!url) throw new Error('Upload failed');
      if (file.type.startsWith('image/')) {
        setWishForm((prev) => ({ ...prev, photoUrl: url, mediaType: 'photo' }));
      } else if (file.type.startsWith('audio/')) {
        setWishForm((prev) => ({ ...prev, audioUrl: url, mediaType: 'audio' }));
      } else if (file.type.startsWith('video/')) {
        setWishForm((prev) => ({ ...prev, videoUrl: url, mediaType: 'video' }));
      }
      setToast('Média ajouté.');
    } catch {
      setToast('Le fichier n’a pas pu être envoyé.');
    } finally {
      setUploading(false);
    }
  };

  const handleGiftPay = () => {
    if (!kkiapay?.openKkiapayWidget) {
      setToast('Le module de paiement est indisponible.');
      return;
    }

    const amount = Number(giftForm.amount || 0);
    if (!amount) {
      setToast('Choisis un montant.');
      return;
    }

    kkiapay.openKkiapayWidget({
      amount,
      key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || '',
      sandbox: import.meta.env.VITE_KKIAPAY_SANDBOX === 'true',
      name: giftForm.isAnonymous ? 'Anonyme' : (giftForm.contributorName || ''),
      email: '',
      data: JSON.stringify({
        publicationId: publicId,
        contributorName: giftForm.contributorName || '',
        isAnonymous: giftForm.isAnonymous,
      }),
    });
  };

  const currentBoard = wishes.slice(0, maxWishes);

  if (showIntro) {
    return <ModernIntro onReveal={() => { setShowIntro(false); fireConfetti('stars'); }} />;
  }

  const wrapperClass = isModern ? 'ww-shell--modern' : 'ww-shell--classic';

  return (
    <div className={wrapperClass}>
      <AnimatedBackground backgroundId={style.wallBackgroundId || data.wallBackgroundId} />

      {isPrivate && !gateOpen ? <PrivateGate onUnlock={() => setGateOpen(true)} /> : null}
      
      {storyIndex >= 0 ? (
        <StoryViewer 
           wishes={currentBoard} 
           initialIndex={storyIndex} 
           onClose={() => setStoryIndex(-1)} 
        />
      ) : null}

      <header id="wall-header">
        <div id="wall-cover">
          <div className="cover-body">
            <div className="wall-eyebrow">
              <Sparkles size={16} /> Mur de mots
            </div>
            <h1 className="wall-title">
              <em>{wallName || 'Prénom'}</em>
            </h1>
            <p className="wall-subtitle">{wallMessage}</p>
          </div>
        </div>

        {data.cagnotte?.enabled && (
          <div id="cagnotte-strip" style={{ display: 'block' }}>
            <div className="cagnotte-card">
              <div className="cag-top">
                <span className="cag-mascot" aria-hidden="true">
                  <Gift size={32} />
                </span>
                <div className="cag-info">
                  <div className="cag-name-row">
                    <span className="cag-name">Cadeau commun</span>
                    <span className="cag-pct">{percent}%</span>
                  </div>
                  <div className="cag-track">
                    <div className="cag-fill" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="cag-stats">
                    {formatMoney(collected)} FCFA collectés
                  </div>
                </div>
              </div>
              <button className="cag-cta" onClick={() => setGiftOpen(true)}>
                Participer au kado
              </button>
            </div>
          </div>
        )}
      </header>

      {wishesEnabled ? (
        <button id="add-btn" onClick={() => setComposerOpen(true)} aria-label="Laisser un mot">
          <Send size={18} /> Laisser un mot
        </button>
      ) : (
        <div id="wishes-closed">
          Le mur n'accepte plus de nouveaux mots
        </div>
      )}

      {currentBoard.length === 0 && !loading ? (
        <div id="empty-state" style={{ display: 'block' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✍️</div>
          <p className="empty-title">Le mur attend son <em>premier mot</em></p>
          <p className="empty-sub">Sois la première voix, écris ce qui te vient, sincèrement.</p>
        </div>
      ) : (
        <main id="notes-container" role="main" aria-label="Mur de mots">
          {currentBoard.map((wish, index) => {
            const kind = mediaKind(wish);
            const tones = ['tone-rose','tone-lilac','tone-mint','tone-butter','tone-peach','tone-sky'];
            const toneClass = tones[(wish.color || 0) % 6];
            return (
              <div 
                key={wish._id || index} 
                className={`pin ${toneClass} ${!isModern && Math.random() > 0.5 ? 'polaroid' : ''}`} 
                style={{ '--rot': `${wish.rot || 0}deg` }}
                onClick={() => setStoryIndex(index)}
              >
                {!isModern && <div className={`tape ${Math.random() > 0.5 ? 'tape-l' : 'tape-r'}`}></div>}
                <div className="nm">
                  <span className="av">{wish.firstName?.[0] || '?'}</span>
                  <span className="nm-text">{wish.firstName || 'Anonyme'}</span>
                </div>
                <div className="tx">{wish.message}</div>
                {kind === 'photo' && (
                  <img className="pin-photo" src={wish.photoUrl} alt="Photo" />
                )}
                {kind === 'audio' && (
                  <AudioWavePlayer src={wish.audioUrl} />
                )}
                {kind === 'video' && (
                  <video className="pin-photo" src={wish.videoUrl} controls />
                )}
              </div>
            );
          })}
        </main>
      )}

      {/* Composer Modal */}
      {composerOpen ? (
        <div id="add-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target.id === 'add-overlay') setComposerOpen(false); }}>
          <div id="add-sheet">
            <div className="sheet-h">
              <h2 className="sheet-title">Laisser un mot</h2>
              <button id="close-btn" className="icon-btn" onClick={() => setComposerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="sheet-body">
              <span className="field-lbl">Ton message</span>
              <textarea 
                value={wishForm.message}
                onChange={(e) => setWishForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Écris ce qui te vient…" 
                maxLength="400" 
                rows="4"
              />

              <span className="field-lbl">Ton Prénom</span>
              <input 
                type="text" 
                value={wishForm.firstName}
                onChange={(e) => setWishForm(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Ex. Aïcha" 
                maxLength="40" 
              />

              <span className="field-lbl">Lien avec la personne (optionnel)</span>
              <input 
                type="text" 
                value={wishForm.role}
                onChange={(e) => setWishForm(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Ami, sœur..." 
              />

              <span className="field-lbl">Couleur de ta carte</span>
              <div className="color-row">
                {[0,1,2,3,4,5,6].map(c => (
                  <span 
                    key={c}
                    className={`color-swatch swatch-${c} ${wishForm.color === c ? 'active' : ''}`} 
                    onClick={() => setWishForm(prev => ({ ...prev, color: c }))}
                  />
                ))}
              </div>

              <span className="field-lbl media-label">Ajoute un média</span>
              <input
                type="file"
                accept="image/*,audio/*,video/*"
                onChange={(e) => handleMediaUpload(e.target.files?.[0])}
                style={{ width: '100%', marginBottom: 12 }}
              />
              {uploading && <div style={{ fontSize: 13, marginBottom: 12 }}>Téléchargement en cours...</div>}

              <button id="submit-btn" onClick={handleWishSubmit}>
                Publier mon mot
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Gift Modal */}
      {giftOpen ? (
        <div id="gift-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target.id === 'gift-overlay') setGiftOpen(false); }}>
          <div id="gift-sheet">
            <div className="gift-head">
              <div className="gift-eyebrow">
                <Gift size={12} /> CADEAU COMMUN
              </div>
              <h2 className="gift-name">Participer au cadeau</h2>
            </div>
            
            <div style={{ marginTop: 20 }}>
              <div className="ww-field" style={{ marginBottom: 16 }}>
                <label className="ww-small" style={{ fontSize: 13, fontWeight: 700, opacity: 0.7 }}>Nom (optionnel)</label>
                <input
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 16, border: '1px solid #ccc' }}
                  value={giftForm.contributorName}
                  onChange={(e) => setGiftForm((prev) => ({ ...prev, contributorName: e.target.value }))}
                  placeholder="Ton nom"
                />
              </div>
              <div className="ww-field" style={{ marginBottom: 16 }}>
                <label className="ww-small" style={{ fontSize: 13, fontWeight: 700, opacity: 0.7 }}>Montant (FCFA)</label>
                <input
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 16, border: '1px solid #ccc' }}
                  type="number"
                  min={data.minContribution || 0}
                  max={data.maxContribution || 0}
                  value={giftForm.amount}
                  onChange={(e) => setGiftForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 24 }}>
                <input
                  type="checkbox"
                  checked={giftForm.isAnonymous}
                  onChange={(e) => setGiftForm((prev) => ({ ...prev, isAnonymous: e.target.checked }))}
                />
                Contribuer anonymement
              </label>
              
              <button id="gift-pay-btn" onClick={handleGiftPay} style={{ width: '100%', border: 'none' }}>
                Payer {formatMoney(giftForm.amount || 0)} FCFA
              </button>
              <button onClick={() => setGiftOpen(false)} className="gift-skip-btn">Annuler</button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div id="toast" className="show">{toast}</div>
      ) : null}
    </div>
  );
}
