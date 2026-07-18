import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  ArrowLeft, Copy, Check, Download, Link2, Palette, Eye, QrCode,
  Sparkles, MessageSquare, PenLine, Gift,
} from 'lucide-react';
import { getPublicationById, getShortLink } from '../utils/api';
import WallRecipientPreview from '../wall-wizard/WallRecipientPreview';

/* ══════════════════════════════════════════════════════════
   WallShareHub — /ewish-admin/wall/:id/share
   Enrichit l'ancien SharePage pour les murs :
     - QR customisable (formes coins + dots, palette Kado, logo)
     - Backgrounds poster pour export
     - Grid réseaux 3x2
     - Copie de lien
     - Aperçu destinataire interactif
   ══════════════════════════════════════════════════════════ */

/* ─── QR shapes (coins + dots) ─── */
const CORNER_SHAPES = [
  { id: 'rounded',  label: 'Doux'      },
  { id: 'classic',  label: 'Classique' },
  { id: 'heart',    label: 'Cœur'      },
  { id: 'mykado',   label: 'myKado'    },
  { id: 'flower',   label: 'Fleur'     },
  { id: 'star',     label: 'Étoile'    },
];

const DOT_SHAPES = [
  { id: 'rounded',  label: 'Ronds doux' },
  { id: 'circle',   label: 'Cercles'    },
  { id: 'classic',  label: 'Carrés'     },
  { id: 'star',     label: 'Étoiles'    },
];

/* ─── QR colors (palette mascotte Kado) ─── */
const QR_COLORS = [
  { id: 'ink',    label: 'Ink',    fg: '#2B2440', bg: '#FFFFFF' },
  { id: 'rose',   label: 'Rose',   fg: '#FF5470', bg: '#FFE9EE' },
  { id: 'gold',   label: 'Or',     fg: '#C79600', bg: '#FFFCF3' },
  { id: 'mint',   label: 'Menthe', fg: '#1E7457', bg: '#E4FBF3' },
  { id: 'violet', label: 'Violet', fg: '#5B3FAA', bg: '#F1EAFB' },
  { id: 'night',  label: 'Nuit',   fg: '#FFFFFF', bg: '#2B2440' },
];

/* ─── Poster backgrounds (pour export image) ─── */
const POSTER_BGS = [
  { id: 'aurora',  label: 'Aurore Kado', css: 'linear-gradient(135deg, #FF5470 0%, #FF8DAA 55%, #FFC145 100%)' },
  { id: 'rose',    label: 'Rose blush',  css: 'linear-gradient(135deg, #FFFAFB 0%, #FFC1CB 100%)' },
  { id: 'white',   label: 'Blanc pur',   css: '#FFFFFF' },
  { id: 'mint',    label: 'Menthe',      css: 'linear-gradient(135deg, #E4FBF3 0%, #7CE0C1 100%)' },
  { id: 'night',   label: 'Nuit',        css: '#2B2440' },
  { id: 'gold',    label: 'Or crème',    css: 'linear-gradient(135deg, #FFFCF3 0%, #FFC145 100%)' },
];

/* ─── Social networks ─── */
const NETWORKS = [
  { id: 'wa',  label: 'WhatsApp',  bg: '#25D366', txt: '#fff', href: (url) => `https://wa.me/?text=${encodeURIComponent(url)}` },
  { id: 'fb',  label: 'Facebook',  bg: '#1877F2', txt: '#fff', href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { id: 'tg',  label: 'Telegram',  bg: '#2CA5E0', txt: '#fff', href: (url) => `https://t.me/share/url?url=${encodeURIComponent(url)}` },
  { id: 'x',   label: 'X',         bg: '#000',    txt: '#fff', href: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}` },
  { id: 'ig',  label: 'Instagram', bg: 'linear-gradient(45deg, #FFB13B 0%, #DD4A8C 50%, #7638FA 100%)', txt: '#fff', copy: true },
  { id: 'tt',  label: 'TikTok',    bg: '#010101', txt: '#fff', copy: true },
];

/* ─── QR renderer (SVG) ─── */
function QrSvg({ url, cornerShape, dotShape, color }) {
  const { cells, N } = useMemo(() => {
    if (!url) return { cells: [], N: 21 };
    try {
      const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
      const size = qr.modules.size;
      const result = [];
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++)
          if (qr.modules.data[y * size + x]) result.push({ x, y });
      return { cells: result, N: size };
    } catch { return { cells: [], N: 21 }; }
  }, [url]);

  const renderDot = (c, i) => {
    const cx = c.x + 0.5, cy = c.y + 0.5;
    if (dotShape === 'classic') return <rect key={i} x={c.x} y={c.y} width={1} height={1} fill={color.fg} />;
    if (dotShape === 'circle')  return <circle key={i} cx={cx} cy={cy} r={0.5} fill={color.fg} />;
    if (dotShape === 'star')    return (
      <path key={i}
        d={`M${cx},${c.y+.1}L${cx+.15},${cy-.1}L${cx+.45},${cy-.1}L${cx+.2},${cy+.1}L${cx+.3},${c.y+.45}L${cx},${cy+.25}L${cx-.3},${c.y+.45}L${cx-.2},${cy+.1}L${cx-.45},${cy-.1}L${cx-.15},${cy-.1}Z`}
        fill={color.fg} />
    );
    return <rect key={i} x={c.x + 0.06} y={c.y + 0.06} width={0.88} height={0.88} rx={0.32} fill={color.fg} />;
  };

  if (!cells.length) {
    return <div style={{ color: '#aaa', fontSize: 12, textAlign: 'center', padding: 40 }}>…</div>;
  }

  return (
    <svg viewBox={`0 0 ${N} ${N}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        {cornerShape === 'heart' && (
          <clipPath id="qr-clip" clipPathUnits="userSpaceOnUse">
            <path d={`M ${N/2},${N*.92} C -${N*.3},${N*.45} ${N*.1},-${N*.15} ${N/2},${N*.28} C ${N*.9},-${N*.15} ${N*1.3},${N*.45} ${N/2},${N*.92} Z`} />
          </clipPath>
        )}
        {cornerShape === 'mykado' && (
          <clipPath id="qr-clip" clipPathUnits="userSpaceOnUse">
            <rect x={1} y={3} width={N-2} height={N-4} rx={2} />
          </clipPath>
        )}
        {cornerShape === 'flower' && (
          <clipPath id="qr-clip" clipPathUnits="userSpaceOnUse">
            <circle cx={N/2} cy={N/2} r={N*.18} />
            <circle cx={N/2} cy={N*.2} r={N*.22} />
            <circle cx={N/2} cy={N*.8} r={N*.22} />
            <circle cx={N*.2} cy={N/2} r={N*.22} />
            <circle cx={N*.8} cy={N/2} r={N*.22} />
            <circle cx={N*.27} cy={N*.27} r={N*.18} />
            <circle cx={N*.73} cy={N*.27} r={N*.18} />
            <circle cx={N*.27} cy={N*.73} r={N*.18} />
            <circle cx={N*.73} cy={N*.73} r={N*.18} />
          </clipPath>
        )}
        {cornerShape === 'star' && (
          <clipPath id="qr-clip" clipPathUnits="userSpaceOnUse">
            <path d={`M ${N/2},${N*.05} L ${N*.62},${N*.36} L ${N*.95},${N*.4} L ${N*.68},${N*.6} L ${N*.78},${N*.95} L ${N/2},${N*.75} L ${N*.22},${N*.95} L ${N*.32},${N*.6} L ${N*.05},${N*.4} L ${N*.38},${N*.36} Z`} />
          </clipPath>
        )}
      </defs>
      <g clipPath={['heart','mykado','flower','star'].includes(cornerShape) ? 'url(#qr-clip)' : undefined}>
        {cells.map(renderDot)}
      </g>
    </svg>
  );
}

/* ─── Le hub ─── */
export default function WallShareHub() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [pub, setPub] = useState(null);
  const [shortCode, setShortCode] = useState('');
  const [loading, setLoading] = useState(true);

  const [cornerShape, setCornerShape] = useState('mykado');
  const [dotShape, setDotShape] = useState('rounded');
  const [colorId, setColorId] = useState('ink');
  const [posterId, setPosterId] = useState('aurora');
  const [showLogo, setShowLogo] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const color = QR_COLORS.find(c => c.id === colorId) || QR_COLORS[0];
  const poster = POSTER_BGS.find(p => p.id === posterId) || POSTER_BGS[0];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getPublicationById(id);
        setPub(data);
        try {
          const sl = await getShortLink(id);
          setShortCode(sl.data.shortCode || '');
        } catch {}
      } catch {
        navigate('/ewish-admin');
      } finally { setLoading(false); }
    })();
  }, [id, navigate]);

  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const shareUrl = pub
    ? (shortCode
        ? `${base}/s/${shortCode}`
        : `${base}/site/${pub.templateName}/${pub.customName}`)
    : '';

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    showToast('Lien copié');
  };

  const handleDownload = async () => {
    if (!cardRef.current || !shareUrl) return;
    setDownloading(true);
    try {
      const svgEl = cardRef.current.querySelector('svg');
      const W = 720, H = 900;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');

      /* Background poster : simuler CSS avec canvas (gradient linéaire ou fallback couleur) */
      if (poster.css.includes('linear-gradient')) {
        const grad = ctx.createLinearGradient(0, 0, W, H);
        /* Extraction naive des couleurs — suffisant pour nos 6 presets */
        const stops = poster.css.match(/#[0-9A-F]{6}/gi) || ['#FF5470','#FFC145'];
        stops.forEach((c, i) => grad.addColorStop(i / Math.max(1, stops.length - 1), c));
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = poster.css.startsWith('#') ? poster.css : '#FFFFFF';
      }
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(0, 0, W, H, 40); else ctx.rect(0, 0, W, H);
      ctx.fill();

      /* Titre + sous-titre */
      const titleColor = ['night','aurora'].includes(posterId) ? '#FFFFFF' : '#2B2440';
      ctx.fillStyle = titleColor;
      ctx.textAlign = 'center';
      ctx.font = '600 italic 44px Fraunces, Georgia, serif';
      ctx.globalAlpha = 0.94;
      ctx.fillText(pub?.title || 'myKado', W / 2, 100);
      ctx.font = '500 20px Inter, sans-serif';
      ctx.globalAlpha = 0.78;
      ctx.fillText('Scanne pour rejoindre le mur', W / 2, 138);
      ctx.globalAlpha = 1;

      /* Cadre blanc autour du QR */
      const QR_SIZE = 460;
      const qrX = (W - QR_SIZE) / 2;
      const qrY = 190;
      ctx.fillStyle = color.bg;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(qrX - 24, qrY - 24, QR_SIZE + 48, QR_SIZE + 48, 24);
      else ctx.rect(qrX - 24, qrY - 24, QR_SIZE + 48, QR_SIZE + 48);
      ctx.fill();

      if (svgEl) {
        const svgStr = new XMLSerializer().serializeToString(svgEl);
        const img = new Image();
        await new Promise((res) => {
          img.onload = res;
          img.onerror = res;
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
        });
        ctx.drawImage(img, qrX, qrY, QR_SIZE, QR_SIZE);
      }

      /* Short link + branding */
      const shortDomain = (import.meta.env.VITE_API_URL || 'mykado.store').replace(/^https?:\/\//, '');
      ctx.fillStyle = titleColor;
      ctx.globalAlpha = 0.9;
      ctx.font = '700 22px "DM Mono", monospace';
      ctx.fillText(shortCode ? `${shortDomain}/s/${shortCode}` : shortDomain, W / 2, qrY + QR_SIZE + 84);
      ctx.globalAlpha = 0.6;
      ctx.font = '700 16px Inter, sans-serif';
      ctx.fillText('PROPULSÉ PAR MYKADO', W / 2, H - 46);
      ctx.globalAlpha = 1;

      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `qr-${pub?.customName || 'mykado'}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      });
      showToast('Poster QR téléchargé');
    } catch {
      showToast('Téléchargement impossible');
    } finally { setDownloading(false); }
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FFFFFF',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid #EEEBF3',
          borderTopColor: '#FF5470',
          animation: 'mk-spin .8s linear infinite',
        }} />
      </div>
    );
  }

  if (!pub) return null;

  const recipient = pub.data?.recipient || pub.data?.titleName || '';

  return (
    <div style={{
      minHeight: '100vh', background: '#FFFFFF',
      padding: '32px 24px 60px',
      fontFamily: 'var(--mk-font-sans, Inter, sans-serif)',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
          <button
            type="button"
            onClick={() => navigate(`/ewish-admin/wall/${id}`)}
            style={{
              width: 40, height: 40, borderRadius: 999, border: '1px solid #EEEBF3',
              background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#55506B',
            }}
            aria-label="Retour aux réglages du mur"
          >
            <ArrowLeft size={17} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--mk-font-mono, DM Mono, monospace)',
              fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
              color: '#C79600', fontWeight: 700,
            }}>
              Ton mur est en ligne
            </div>
            <h1 style={{
              fontFamily: 'var(--mk-font-serif, Fraunces, serif)',
              fontStyle: 'italic', fontWeight: 500,
              fontSize: 32, letterSpacing: '-.01em', margin: 0, lineHeight: 1.1,
            }}>
              Partage-le au monde
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, height: 40,
              padding: '0 16px', borderRadius: 12,
              border: '1px solid #EEEBF3',
              background: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
              color: '#55506B', cursor: 'pointer',
            }}
          >
            <Eye size={15} /> Aperçu destinataire
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)',
          gap: 26,
          alignItems: 'start',
        }}
        className="mkShareGrid"
        >

          {/* ─── Colonne QR ─── */}
          <section
            aria-label="Aperçu du QR code"
            style={{
              background: '#fff', borderRadius: 20,
              padding: 24, border: '1px solid #F0EEF5',
              boxShadow: 'var(--mk-shadow-md, 0 4px 12px -2px rgba(45,32,14,.08))',
            }}
          >
            <div
              ref={cardRef}
              style={{
                background: poster.css,
                borderRadius: 24,
                padding: '32px 22px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
                color: ['night','aurora'].includes(posterId) ? '#fff' : '#2B2440',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--mk-font-mono, DM Mono, monospace)',
                  fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase',
                  opacity: 0.85, fontWeight: 700,
                }}>
                  Scanne pour rejoindre
                </div>
                <div style={{
                  fontFamily: 'var(--mk-font-serif, Fraunces, serif)',
                  fontSize: 22, fontStyle: 'italic', fontWeight: 500,
                  marginTop: 4, lineHeight: 1.1, letterSpacing: '-.01em',
                }}>
                  {pub.title}
                </div>
              </div>

              <div style={{
                background: color.bg, padding: 16, borderRadius: 18,
                width: 240, height: 240, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <QrSvg url={shareUrl} cornerShape={cornerShape} dotShape={dotShape} color={color} />
                {showLogo && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 46, height: 46, borderRadius: 12,
                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 6px 14px -4px rgba(0,0,0,.35)',
                    border: `2px solid ${color.bg}`,
                  }}>
                    <span style={{
                      fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                      fontSize: 18, fontWeight: 700, color: '#FF5470',
                    }}>K</span>
                  </div>
                )}
              </div>

              <div style={{
                fontFamily: 'var(--mk-font-mono, DM Mono, monospace)',
                fontSize: 13, fontWeight: 700, letterSpacing: '.06em', opacity: 0.92,
              }}>
                {shortCode ? `mykado.store/s/${shortCode}` : 'mykado.store'}
              </div>

              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
                opacity: 0.6,
              }}>
                Propulsé par myKado
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading || !shareUrl}
                style={{
                  flex: 1, height: 48, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: '#FF5470', color: '#fff',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: 14.5,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: 'var(--mk-shadow-brand, 0 12px 32px -8px rgba(30,41,82,.25))',
                }}
              >
                <Download size={16} /> {downloading ? 'Génération…' : 'Télécharger le poster'}
              </button>
            </div>
          </section>

          {/* ─── Colonne personnalisation + partage ─── */}
          <section aria-label="Personnalisation et partage" style={{ display: 'grid', gap: 18 }}>

            {/* Lien copiable */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: 18,
              border: '1px solid #F0EEF5',
            }}>
              <div style={{
                fontSize: 12, fontWeight: 800, letterSpacing: '.08em',
                textTransform: 'uppercase', color: '#A29CB4',
                marginBottom: 10,
              }}>
                Lien du mur
              </div>
              <div style={{
                display: 'flex', gap: 8, alignItems: 'center',
                background: '#FFFFFF', border: '1px solid #F0EEF5',
                borderRadius: 10, padding: '10px 14px',
              }}>
                <Link2 size={14} style={{ color: '#A29CB4', flexShrink: 0 }} />
                <span style={{
                  flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  fontFamily: 'var(--mk-font-mono, DM Mono, monospace)', fontSize: 12.5,
                  color: '#55506B',
                }}>
                  {shareUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    height: 32, padding: '0 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: copied ? '#4FAB86' : '#FF5470',
                    color: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: 12,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}
                >
                  {copied ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
                </button>
              </div>
            </div>

            {/* Personnalisation QR */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: 18,
              border: '1px solid #F0EEF5',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                fontSize: 12, fontWeight: 800, letterSpacing: '.08em',
                textTransform: 'uppercase', color: '#A29CB4',
              }}>
                <Palette size={13} /> Personnaliser le QR
              </div>

              {/* Formes coins */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#55506B' }}>
                  Contour
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CORNER_SHAPES.map(sh => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => setCornerShape(sh.id)}
                      style={{
                        padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                        border: cornerShape === sh.id ? '2px solid #FF5470' : '1.5px solid #EEEBF3',
                        background: cornerShape === sh.id ? '#FFE9EE' : '#fff',
                        color: '#55506B',
                        fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                      }}
                    >
                      {sh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formes points */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#55506B' }}>
                  Points
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DOT_SHAPES.map(sh => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => setDotShape(sh.id)}
                      style={{
                        padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                        border: dotShape === sh.id ? '2px solid #FF5470' : '1.5px solid #EEEBF3',
                        background: dotShape === sh.id ? '#FFE9EE' : '#fff',
                        color: '#55506B',
                        fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                      }}
                    >
                      {sh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Couleurs */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#55506B' }}>
                  Couleur du QR
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {QR_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorId(c.id)}
                      aria-label={c.label}
                      style={{
                        width: 44, height: 44, borderRadius: 12,
                        border: colorId === c.id ? '2.5px solid #FF5470' : '1.5px solid #EEEBF3',
                        background: c.bg, cursor: 'pointer', position: 'relative',
                      }}
                    >
                      <span style={{
                        position: 'absolute', inset: '26%', borderRadius: 4, background: c.fg,
                      }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Backgrounds poster */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#55506B' }}>
                  Fond du poster (export)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {POSTER_BGS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPosterId(p.id)}
                      style={{
                        aspectRatio: '4 / 3', borderRadius: 10, cursor: 'pointer',
                        border: posterId === p.id ? '2.5px solid #FF5470' : '1.5px solid #EEEBF3',
                        background: p.css, position: 'relative', overflow: 'hidden',
                      }}
                      aria-label={p.label}
                    >
                      <span style={{
                        position: 'absolute', left: 6, right: 6, bottom: 6,
                        background: 'rgba(255,255,255,.92)', padding: '2px 8px',
                        borderRadius: 6, fontSize: 10, fontWeight: 700,
                      }}>
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo toggle */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, fontWeight: 600, color: '#55506B',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  style={{ accentColor: '#FF5470', width: 16, height: 16 }}
                />
                Afficher le logo Kado au centre du QR
              </label>
            </div>

            {/* Réseaux sociaux */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: 18,
              border: '1px solid #F0EEF5',
            }}>
              <div style={{
                fontSize: 12, fontWeight: 800, letterSpacing: '.08em',
                textTransform: 'uppercase', color: '#A29CB4',
                marginBottom: 12,
              }}>
                Partager sur
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
              }}>
                {NETWORKS.map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (n.copy) {
                        navigator.clipboard?.writeText(shareUrl);
                        showToast(`Lien copié — colle-le dans ${n.label}`);
                      } else {
                        window.open(n.href(shareUrl), '_blank');
                      }
                    }}
                    style={{
                      height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: n.bg, color: n.txt, fontFamily: 'inherit',
                      fontWeight: 700, fontSize: 13,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA final : réglages du mur */}
            <div style={{
              display: 'flex', gap: 10, alignItems: 'center',
              padding: 14, borderRadius: 14,
              background: 'linear-gradient(135deg, #FFFCF3 0%, #FFFFFF 100%)',
              border: '1px solid #FFC145',
            }}>
              <Sparkles size={20} style={{ color: '#C79600', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2440' }}>
                  Ajuster titre, mots reçus, cagnotte
                </div>
                <div style={{ fontSize: 12, color: '#55506B' }}>
                  Tout est modifiable après publication.
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/ewish-admin/wall/${id}`)}
                style={{
                  height: 36, padding: '0 14px', borderRadius: 10, border: 'none',
                  background: '#FF5470', color: '#fff', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: 12.5,
                }}
              >
                Réglages
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modal aperçu destinataire */}
      {previewOpen && (
        <div
          onClick={() => setPreviewOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,20,40,0.72)',
            zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative', width: 360, aspectRatio: '9 / 16',
              borderRadius: 28, overflow: 'hidden',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,.5)',
              background: '#2B2440',
              maxHeight: '92vh',
            }}
          >
            <WallRecipientPreview
              event={pub.data?.occasion || 'anniversary'}
              recipient={recipient}
              title={pub.title}
              phrase={pub.data?.subtitle || ''}
              backgroundId={pub.style?.wallBackgroundId || 'aurore-kado'}
              cagnotteEnabled={!!pub.cagnotteConfig?.enabled}
              cagnotteTitle={pub.cagnotteConfig?.collectTitle}
              cagnotteGoal={pub.cagnotteConfig?.goal}
            />
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#2B2440', color: '#fff',
          padding: '10px 18px', borderRadius: 999,
          fontSize: 13, fontWeight: 600, zIndex: 2000,
          boxShadow: '0 12px 24px -6px rgba(0,0,0,.35)',
          animation: 'mk-toast-in .3s ease-out',
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes mk-toast-in {
          from { opacity: 0; transform: translate(-50%, 6px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (max-width: 780px) {
          .mkShareGrid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
