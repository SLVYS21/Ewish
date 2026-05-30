import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { getPublications, getShortLink } from '../utils/api';
import s from './SharePage.module.css';
import { ArrowLeft, Image, Share2, Check, Copy, ArrowRight } from 'lucide-react';

const QR_SHAPES = [
  { id: 'classic', label: 'Classique', emoji: '⬛' },
  { id: 'rounded', label: 'Doux',      emoji: '◯' },
  { id: 'heart',   label: 'Cœur',      emoji: '💖' },
  { id: 'mykado',  label: 'myKado',    emoji: '🎁' },
  { id: 'flower',  label: 'Fleur',     emoji: '🌸' },
  { id: 'star',    label: 'Étoile',    emoji: '⭐' },
];

const QR_COLORS = [
  { id: 'ink',   fg: '#2B1A2D', bg: '#FFFFFF' },
  { id: 'rose',  fg: '#E11D48', bg: '#FFE0E6' },
  { id: 'lilac', fg: '#6E4FBA', bg: '#F6EEFB' },
  { id: 'mint',  fg: '#1F6E55', bg: '#D4F1E5' },
  { id: 'gold',  fg: '#A86E00', bg: '#FFE7AD' },
  { id: 'night', fg: '#FFD7E0', bg: '#2B1A2D' },
];

const CHANNELS = [
  { id: 'wa',   label: 'WhatsApp', emoji: '💬', color: '#25D366' },
  { id: 'sms',  label: 'SMS',      emoji: '📩', color: '#9B7EE2' },
  { id: 'mail', label: 'Email',    emoji: '📧', color: '#FFAE82' },
  { id: 'fb',   label: 'Facebook', emoji: '📘', color: '#1877F2' },
  { id: 'tg',   label: 'Telegram', emoji: '✈️', color: '#0088CC' },
  { id: 'tw',   label: 'X',        emoji: '🐦', color: '#1DA1F2' },
];

function QrPreview({ url, shape, color }) {
  const { cells, N } = useMemo(() => {
    if (!url) return { cells: [], N: 21 };
    try {
      const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
      const size = qr.modules.size;
      const result = [];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (qr.modules.data[y * size + x]) result.push({ x, y });
        }
      }
      return { cells: result, N: size };
    } catch { return { cells: [], N: 21 }; }
  }, [url]);

  const renderCell = (c, i) => {
    const cx = c.x + 0.5;
    const cy = c.y + 0.5;
    if (shape === 'classic') return <rect key={i} x={c.x} y={c.y} width={1} height={1} fill={color.fg} />;
    if (shape === 'rounded') return <rect key={i} x={c.x + .05} y={c.y + .05} width={.9} height={.9} rx={.35} fill={color.fg} />;
    if (shape === 'star') return <path key={i} d={`M${cx},${c.y + .1}L${cx + .15},${cy - .1}L${cx + .45},${cy - .1}L${cx + .2},${cy + .1}L${cx + .3},${c.y + .45}L${cx},${cy + .25}L${cx - .3},${c.y + .45}L${cx - .2},${cy + .1}L${cx - .45},${cy - .1}L${cx - .15},${cy - .1}Z`} fill={color.fg} />;
    return <circle key={i} cx={cx} cy={cy} r={.42} fill={color.fg} />;
  };

  if (!cells.length) return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#aaa' }}>Génération…</div>;

  return (
    <svg viewBox={`0 0 ${N} ${N}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        {shape === 'heart' && (
          <clipPath id="qr-sp-clip" clipPathUnits="userSpaceOnUse">
            <path d={`M ${N / 2},${N * .92} C -${N * .3},${N * .45} ${N * .1},-${N * .15} ${N / 2},${N * .28} C ${N * .9},-${N * .15} ${N * 1.3},${N * .45} ${N / 2},${N * .92} Z`} />
          </clipPath>
        )}
        {shape === 'mykado' && (
          <clipPath id="qr-sp-clip" clipPathUnits="userSpaceOnUse">
            <rect x={1} y={3} width={N - 2} height={N - 4} rx={2} />
            <path d={`M ${N / 2 - 3},3 C ${N / 2 - 5},-1 ${N / 2 - 9},1 ${N / 2 - 7},5 L${N / 2},5 Z`} />
            <path d={`M ${N / 2 + 3},3 C ${N / 2 + 5},-1 ${N / 2 + 9},1 ${N / 2 + 7},5 L${N / 2},5 Z`} />
          </clipPath>
        )}
        {shape === 'flower' && (
          <clipPath id="qr-sp-clip" clipPathUnits="userSpaceOnUse">
            <circle cx={N / 2} cy={N / 2} r={N * .18} />
            <circle cx={N / 2} cy={N * .2} r={N * .22} />
            <circle cx={N / 2} cy={N * .8} r={N * .22} />
            <circle cx={N * .2} cy={N / 2} r={N * .22} />
            <circle cx={N * .8} cy={N / 2} r={N * .22} />
            <circle cx={N * .27} cy={N * .27} r={N * .18} />
            <circle cx={N * .73} cy={N * .27} r={N * .18} />
            <circle cx={N * .27} cy={N * .73} r={N * .18} />
            <circle cx={N * .73} cy={N * .73} r={N * .18} />
          </clipPath>
        )}
      </defs>
      <g clipPath={(shape === 'heart' || shape === 'mykado' || shape === 'flower') ? 'url(#qr-sp-clip)' : undefined}>
        {cells.map(renderCell)}
      </g>
    </svg>
  );
}

export default function SharePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pub, setPub]         = useState(null);
  const [shortCode, setShortCode] = useState('');
  const [shape, setShape]     = useState('heart');
  const [color, setColor]     = useState('rose');
  const [copied, setCopied]   = useState(false);
  const [showConf, setShowConf] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await getPublications({ limit: 1000 });
        const found = r.data.find(p => p._id === id);
        if (found) {
          setPub(found);
          try { const sl = await getShortLink(id); setShortCode(sl.data.shortCode); } catch {}
        }
      } catch {}
    };
    load();
    const t = setTimeout(() => setShowConf(false), 5000);
    return () => clearTimeout(t);
  }, [id]);

  const shareUrl = shortCode
    ? `${import.meta.env.VITE_API_URL}/s/${shortCode}`
    : pub ? `${import.meta.env.VITE_API_URL}/site/${pub.templateName}/${pub.customName}` : '';

  const selectedColor = QR_COLORS.find(c => c.id === color) || QR_COLORS[1];

  const handleDownload = async () => {
    if (!shareUrl) return;
    const dataUrl = await QRCode.toDataURL(shareUrl, {
      errorCorrectionLevel: 'M',
      width: 800,
      margin: 2,
      color: { dark: selectedColor.fg, light: selectedColor.bg },
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qr-${pub?.customName || 'mykado'}.png`;
    a.click();
  };

  const handleShare = (chId) => {
    if (!shareUrl) return;
    const enc = encodeURIComponent(shareUrl);
    const map = {
      wa:   `https://wa.me/?text=${enc}`,
      sms:  `sms:?body=${enc}`,
      mail: `mailto:?subject=Regarde%20ça !&body=${enc}`,
      fb:   `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
      tg:   `https://t.me/share/url?url=${enc}`,
      tw:   `https://twitter.com/intent/tweet?url=${enc}`,
    };
    if (map[chId]) window.open(map[chId], '_blank');
  };

  return (
    <div className={s.root}>
      {showConf && (
        <div className={s.confettiLayer}>
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={s.confPiece} style={{
              left: `${(i * 5.5 + 3) % 100}%`,
              animationDelay: `${(i * 0.18) % 2}s`,
              background: ['#E11D48','#9B7EE2','#6BCFAF','#FFC95A','#FF9F7A','#FFB3C1'][i % 6],
            }} />
          ))}
        </div>
      )}

      <div className={s.content}>
        <button className={s.backBtn} onClick={() => navigate(`/ewish-admin/ewish/edit/${id}`)}>
          <ArrowLeft size={14} /> Retour à l'éditeur
        </button>

        <div className={s.hero}>
          <div className={s.heroEmoji}>🎉</div>
          <div className={s.heroHand}>C'est en ligne !</div>
          <h1 className={s.heroTitle}>Maintenant, partage la magie</h1>
          <p className={s.heroSub}>
            Ton lien est prêt. Choisis ton QR Code préféré et envoie-le par WhatsApp, SMS ou imprime-le sur ton invitation.
          </p>
        </div>

        <div className={s.grid}>
          <div className={s.qrPanel}>
            <div className={s.qrBox} style={{ background: selectedColor.bg }}>
              <QrPreview url={shareUrl || 'https://mykado.store'} shape={shape} color={selectedColor} />
              <span className={s.qrLogo}>🎂</span>
            </div>
            <div className={s.qrFooter}>
              <div className={s.qrFootHand}>flashe-moi !</div>
              <div className={s.qrFootUrl}>{shareUrl}</div>
            </div>
            <div className={s.qrActions}>
              <button className={s.btnGhost} onClick={handleDownload}><Image size={13} /> Télécharger PNG</button>
              <button className={s.btnRose}><Share2 size={13} /> Partager</button>
            </div>
          </div>

          <div className={s.controls}>
            <div className={s.card}>
              <div className={s.cardLabel}>TON LIEN MAGIQUE</div>
              <div className={s.linkRow}>
                <span className={s.linkEmoji}>🔗</span>
                <span className={s.linkUrl}>{shareUrl || 'Publication en cours…'}</span>
                <button
                  className={`${s.copyBtn} ${copied ? s.copyBtnDone : ''}`}
                  onClick={() => { if (shareUrl) { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                >
                  {copied ? <><Check size={13} /> Copié !</> : <><Copy size={13} /> Copier</>}
                </button>
              </div>
            </div>

            <div className={s.card}>
              <div className={s.cardLabelRow}>
                <div>
                  <div className={s.cardLabel}>FORME DU QR</div>
                  <div className={s.cardHand}>fais-toi plaisir 💕</div>
                </div>
              </div>
              <div className={s.shapeGrid}>
                {QR_SHAPES.map(sh => (
                  <button
                    key={sh.id}
                    className={`${s.shapeBtn} ${shape === sh.id ? s.shapeBtnActive : ''}`}
                    onClick={() => setShape(sh.id)}
                  >
                    <span className={s.shapeEmoji}>{sh.emoji}</span>
                    <span className={s.shapeLabel}>{sh.label}</span>
                  </button>
                ))}
              </div>
              <div className={s.cardLabel} style={{ marginTop: 18 }}>COULEURS</div>
              <div className={s.colorRow}>
                {QR_COLORS.map(c => (
                  <button
                    key={c.id}
                    className={`${s.colorBtn} ${color === c.id ? s.colorBtnActive : ''}`}
                    style={{ background: c.bg }}
                    onClick={() => setColor(c.id)}
                  >
                    <span className={s.colorDot} style={{ background: c.fg }} />
                  </button>
                ))}
              </div>
            </div>

            <div className={s.card}>
              <div className={s.cardLabel} style={{ marginBottom: 14 }}>PARTAGER PARTOUT</div>
              <div className={s.channelGrid}>
                {CHANNELS.map(ch => (
                  <button
                    key={ch.id}
                    className={s.channelBtn}
                    style={{ background: ch.color + '18', border: `1px solid ${ch.color}33` }}
                    onClick={() => handleShare(ch.id)}
                  >
                    <span className={s.channelEmoji}>{ch.emoji}</span>
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <button className={s.cagnotteBanner} onClick={() => navigate('/ewish-admin/cagnotte/' + id)}>
              <span className={s.cagnotteEmoji}>🎁</span>
              <div className={s.cagnotteInfo}>
                <div className={s.cagnotteBannerTitle}>Suivre la cagnotte cadeau</div>
                <div className={s.cagnotteBannerSub}>Suivez les contributions de vos proches</div>
              </div>
              <ArrowRight size={18} color="var(--mk-ink)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
