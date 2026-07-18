import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  getPublicationById, getShortLink, setCustomSlug, publishPublication,
} from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import {
  ArrowLeft, Check, Copy, RefreshCw, Download, Link2, Edit3,
  Lock, Zap, Coins, Eye, Palette, X, MessageSquare, Mail, Phone, Gift,
  Sparkles, PenLine, QrCode,
} from 'lucide-react';
import QRExport from '../components/QRExport';
import PersonalizeLinkModal from '../components/PersonalizeLinkModal';

/* ─── constants ─── */
const WALL_NAMES = new Set(['wall-of-wishes','wall-of-wishes-3d','wall-of-wishes-modern','wall-of-wishes-space']);
const FREE_WORDS = 5;

const QR_SHAPES = [
  { id: 'rounded',  label: 'Doux'     },
  { id: 'classic',  label: 'Classique'},
  { id: 'heart',    label: 'Cœur'     },
  { id: 'mykado',   label: 'myKado'   },
  { id: 'flower',   label: 'Fleur'    },
  { id: 'star',     label: 'Étoile'   },
];

const QR_COLORS = [
  { id: 'ink',   fg: '#2B1A2D', bg: '#FFFFFF' },
  { id: 'rose',  fg: '#E11D48', bg: '#FFE0E6' },
  { id: 'lilac', fg: '#6E4FBA', bg: '#F6EEFB' },
  { id: 'mint',  fg: '#1F6E55', bg: '#D4F1E5' },
  { id: 'gold',  fg: '#A86E00', bg: '#FFE7AD' },
  { id: 'night', fg: '#FFD7E0', bg: '#2B1A2D' },
];

/* ─── social logos ─── */
function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
      <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}
function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function TelegramLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
      <circle cx="12" cy="12" r="12" fill="#2CA5E0"/>
      <path fill="white" d="M5.491 11.74 18.3 6.82c.618-.222 1.16.151.958.988L17.2 17.61c-.16.689-.594.857-1.205.532l-3.27-2.41-1.578 1.52c-.175.175-.322.322-.66.322l.236-3.336 6.08-5.49c.264-.235-.057-.365-.41-.13L6.985 14.29l-3.24-.997c-.7-.22-.714-.7.153-1.033Z"/>
    </svg>
  );
}
function XLogo() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <circle cx="12" cy="12" r="12" fill="#000"/>
      <path fill="white" d="M13.545 10.239 17.9 5h-1.025l-3.78 4.394L9.952 5H6.5l4.569 6.646L6.5 17.004h1.025l3.993-4.644 3.188 4.644H18.5zm-1.414 1.645-.463-.661-3.68-5.26h1.585l2.974 4.249.463.661 3.863 5.519h-1.585z"/>
    </svg>
  );
}
function InstagramLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
      <defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#ffd600"/><stop offset="50%" stopColor="#ff0069"/><stop offset="100%" stopColor="#7638fa"/></radialGradient></defs>
      <rect width="24" height="24" rx="6" fill="url(#ig)"/>
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="white" strokeWidth="1.8" fill="none"/>
    </svg>
  );
}
function TikTokLogo() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <rect width="24" height="24" rx="6" fill="#010101"/>
      <path fill="white" d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5 2.592 2.592 0 0 1-2.59-2.5 2.592 2.592 0 0 1 2.59-2.5c.28 0 .54.04.79.1V9.83a5.66 5.66 0 0 0-.79-.05 5.69 5.69 0 0 0-5.69 5.69 5.69 5.69 0 0 0 5.69 5.69 5.69 5.69 0 0 0 5.69-5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/>
    </svg>
  );
}

const NETWORKS = [
  { id: 'wa',  label: 'WhatsApp',  Logo: WhatsAppLogo,  bg: '#E8FFF1', copy: false, href: (enc, url) => `https://wa.me/?text=${encodeURIComponent('Un petit quelque chose pour toi : ')}${enc}` },
  { id: 'fb',  label: 'Facebook',  Logo: FacebookLogo,  bg: '#EBF3FF', copy: false, href: (enc, url) => `https://www.facebook.com/sharer/sharer.php?u=${url}` },
  { id: 'tg',  label: 'Telegram',  Logo: TelegramLogo,  bg: '#E8F7FF', copy: false, href: (enc, url) => `https://t.me/share/url?url=${url}` },
  { id: 'x',   label: 'X',         Logo: XLogo,         bg: '#F5F5F5', copy: false, href: (enc, url) => `https://twitter.com/intent/tweet?url=${url}` },
  { id: 'ig',  label: 'Instagram', Logo: InstagramLogo, bg: '#FFF0F7', copy: true  },
  { id: 'tt',  label: 'TikTok',    Logo: TikTokLogo,    bg: '#F5F5F5', copy: true  },
];

/* ─── QR SVG renderer ─── */
function QrSvg({ url, shape, color }) {
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

  const renderCell = (c, i) => {
    const cx = c.x + 0.5, cy = c.y + 0.5;
    if (shape === 'classic') return <rect key={i} x={c.x} y={c.y} width={1} height={1} fill={color.fg} />;
    if (shape === 'star')    return <path key={i} d={`M${cx},${c.y+.1}L${cx+.15},${cy-.1}L${cx+.45},${cy-.1}L${cx+.2},${cy+.1}L${cx+.3},${c.y+.45}L${cx},${cy+.25}L${cx-.3},${c.y+.45}L${cx-.2},${cy+.1}L${cx-.45},${cy-.1}L${cx-.15},${cy-.1}Z`} fill={color.fg} />;
    if (shape === 'rounded') return <rect key={i} x={c.x + .05} y={c.y + .05} width={.9} height={.9} rx={.35} fill={color.fg} />;
    return <circle key={i} cx={cx} cy={cy} r={.42} fill={color.fg} />;
  };

  if (!cells.length) return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 12 }}>…</div>
  );

  return (
    <svg viewBox={`0 0 ${N} ${N}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        {shape === 'heart' && (
          <clipPath id="qr-clip" clipPathUnits="userSpaceOnUse">
            <path d={`M ${N/2},${N*.92} C -${N*.3},${N*.45} ${N*.1},-${N*.15} ${N/2},${N*.28} C ${N*.9},-${N*.15} ${N*1.3},${N*.45} ${N/2},${N*.92} Z`} />
          </clipPath>
        )}
        {shape === 'mykado' && (
          <clipPath id="qr-clip" clipPathUnits="userSpaceOnUse">
            <rect x={1} y={3} width={N-2} height={N-4} rx={2} />
          </clipPath>
        )}
        {shape === 'flower' && (
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
      </defs>
      <g clipPath={(shape === 'heart' || shape === 'mykado' || shape === 'flower') ? 'url(#qr-clip)' : undefined}>
        {cells.map(renderCell)}
      </g>
    </svg>
  );
}

/* ─── Branded QR card ─── */
function QrCard({ pub, shortCode, shareUrl, shape, color, branded }) {
  const shortDomain = (import.meta.env.VITE_API_URL || 'mykado.store').replace(/^https?:\/\//, '');
  return (
    <div className="card qr-card" id="mk-qr-card" style={{ background: color.bg, border: '1px solid rgba(0,0,0,.06)', padding: '20px 18px', gap: 14, alignItems: 'center', textAlign: 'center' }}>
      <div>
        <div style={{ fontFamily: 'var(--mk-hand)', fontSize: 19, color: color.fg, opacity: .85 }}>Scanne-moi</div>
        <div style={{ fontFamily: 'var(--mk-display)', fontSize: 20, color: color.fg, fontStyle: 'italic' }}>{pub?.title || 'myKado'}</div>
      </div>
      <div className="qr-frame">
        <QrSvg url={shareUrl || 'https://mykado.store'} shape={shape} color={color} />
      </div>
      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700, color: color.fg, opacity: .85, letterSpacing: '.04em' }}>
        {shortCode ? `${shortDomain}/s/${shortCode}` : shortDomain}
      </div>
      {branded && (
        <div style={{ fontSize: 10, fontWeight: 700, color: color.fg, opacity: .55, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          Propulsé par myKado
        </div>
      )}
    </div>
  );
}

/* ─── Share networks ─── */
function ShareNetworks({ shareUrl, onCopy }) {
  return (
    <div className="net-row">
      {NETWORKS.map(n => (
        <button
          key={n.id}
          className="net-btn"
          style={{ background: n.bg }}
          onClick={() => {
            if (n.copy) {
              navigator.clipboard?.writeText(shareUrl);
              onCopy?.(`Lien copié  colle-le dans ${n.label}`);
            } else {
              window.open(n.href(encodeURIComponent(shareUrl), encodeURIComponent(shareUrl)), '_blank');
            }
          }}
        >
          <n.Logo />
          {n.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ message }) {
  if (!message) return null;
  return <div className="mk-toast">{message}</div>;
}

/* ─── Unlock view ─── */
function UnlockView({ pub, onUnlocked }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [unlocking, setUnlocking] = useState(false);
  const [err, setErr] = useState('');

  const isWall = WALL_NAMES.has(pub?.templateName);
  const cost = pub?.creditsRequired ?? 1;
  const credits = user?.credits ?? 0;
  const enough = credits >= cost;

  const handleUnlock = async () => {
    if (!enough) { navigate('/ewish-admin/credits'); return; }
    setUnlocking(true); setErr('');
    try {
      await publishPublication(pub._id);
      if (setUser) setUser(prev => ({ ...prev, credits: (prev.credits ?? 0) - cost }));
      onUnlocked();
    } catch (e) {
      setErr(e.response?.data?.error || 'Erreur lors de la publication');
    } finally { setUnlocking(false); }
  };

  const FEATURES = [
    { icon: <Link2 size={15} />, t: 'Lien court personnalisable', s: 'mykado.store/s/ton-code' },
    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>, t: 'QR code à ton image', s: 'Couleurs et formes, export PNG' },
    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51 15.42 17.49M15.41 6.51 8.59 10.49"/></svg>, t: 'Partage rapide', s: 'WhatsApp, Facebook, Telegram…' },
    ...(isWall ? [{ icon: <MessageSquare size={15} />, t: 'Mots illimités', s: 'Avec photos et mise en forme' }] : []),
  ];

  return (
    <div className="unlock-hero">
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--mk-accent-pale)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Lock size={22} color="var(--mk-accent)" />
      </div>

      <h1 style={{ fontFamily: 'var(--mk-display)', fontSize: 30, letterSpacing: '-.01em', margin: '16px 0 8px', fontStyle: 'italic' }}>
        Prêt à partager
      </h1>

      <p style={{ fontSize: 13.5, color: 'var(--mk-ink-2)', lineHeight: 1.6, maxWidth: '46ch', textAlign: 'center' }}>
        {isWall
          ? `Ton mur est déjà actif : les ${FREE_WORDS} premiers mots sont gratuits. Débloque-le pour des mots illimités, le QR code stylé et le partage sur les réseaux.`
          : `« ${pub?.title} » est prêt. Débloque-le pour obtenir son lien définitif, son QR code et le partage sur les réseaux.`}
      </p>

      <div className="card" style={{ width: '100%', maxWidth: 420, margin: '22px 0 0', padding: '4px 16px', textAlign: 'left' }}>
        {FEATURES.map((r, i) => (
          <div className="setting-row" key={i} style={{ padding: '10px 0', borderBottom: i < FEATURES.length - 1 ? '1px solid var(--mk-line)' : 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'var(--mk-accent-pale)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--mk-accent)', flexShrink: 0,
            }}>
              {r.icon}
            </div>
            <div className="body">
              <div className="t">{r.t}</div>
              <div className="s">{r.s}</div>
            </div>
            <Check size={15} style={{ color: 'var(--mk-mint)', flexShrink: 0, marginTop: 6 }} />
          </div>
        ))}
      </div>

      <div style={{ margin: '22px 0 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {err && <p style={{ fontSize: 12, color: 'var(--mk-accent)', fontWeight: 700 }}>{err}</p>}
        <button
          className="btn btn-primary btn-lg"
          onClick={handleUnlock}
          disabled={unlocking}
          style={{ minWidth: 240, justifyContent: 'center' }}
        >
          {unlocking
            ? <><RefreshCw size={15} style={{ animation: 'mk-spin .75s linear infinite' }} /> Publication…</>
            : enough
              ? <><Zap size={16} /> Débloquer avec {cost} crédit{cost > 1 ? 's' : ''}</>
              : <><Coins size={16} /> Recharger mes crédits</>
          }
        </button>
        <p style={{ fontSize: 12, color: 'var(--mk-ink-3)' }}>
          Il te reste <strong style={{ color: enough ? 'var(--mk-mint)' : 'var(--mk-accent)' }}>{credits} crédit{credits > 1 ? 's' : ''}</strong>
          {enough
            ? `  il t'en restera ${credits - cost} après.`
            : `  il t'en faut ${cost}.`}
        </p>
      </div>
    </div>
  );
}

/* ─── Envoyer au destinataire ─── */
function buildRecipientMessage(pub, url) {
  const d = pub?.data || {};
  const recipient = (d.recipient || d.titleName || '').trim();
  const occLabel  = (d.occasionLabel || '').trim().toLowerCase();

  const openers = {
    anniversary: n => `Coucou ${n} ! Un mur t'attend pour ton anniversaire ✦`,
    wedding:     n => `${n}, on a préparé un mur de mots pour vos noces ✦`,
    birth:       n => `Bienvenue à ${n} ! Un mur de mots t'attend ✦`,
    farewell:    n => `${n}, un dernier mur pour ton départ ✦`,
    welcome:     n => `Bienvenue ${n} ! Ce mur est pour toi ✦`,
    thanks:      n => `${n}, on t'a préparé un mur pour te dire merci ✦`,
    tribute:     n => `Un mur en mémoire de ${n} ✦`,
    other:       n => `${n}, on a un petit quelque chose pour toi ✦`,
  };
  const line1 = recipient
    ? (openers[d.occasion] || openers.other)(recipient)
    : `J'ai un petit quelque chose pour toi ✦`;
  const line2 = occLabel
    ? `Ouvre-le ici (${occLabel}) : ${url}`
    : `Ouvre-le ici : ${url}`;
  return `${line1}\n${line2}`;
}

function RecipientInvite({ pub, shareUrl, showToast, isWall }) {
  const recipient = (pub?.data?.recipient || pub?.data?.titleName || '').trim();
  const initial = useMemo(() => buildRecipientMessage(pub, shareUrl), [pub, shareUrl]);
  const [msg, setMsg] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => { setMsg(initial); }, [initial]);

  const enc = encodeURIComponent(msg);
  const waHref   = `https://wa.me/?text=${enc}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(
    recipient ? `Un mur pour toi, ${recipient}` : 'Un petit quelque chose pour toi'
  )}&body=${enc}`;
  const smsHref  = `sms:?&body=${enc}`;

  const openHref = (href) => {
    try { window.open(href, '_blank'); } catch { window.location.href = href; }
  };

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    showToast?.('Lien destinataire copié');
  };

  return (
    <div className="card" style={{ padding: '18px 20px', borderColor: 'var(--mk-accent-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 'var(--mk-r-xs)',
          background: 'var(--mk-accent-pale)', color: 'var(--mk-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Gift size={17} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>
            {recipient ? `Envoyer à ${recipient}` : 'Envoyer au destinataire'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--mk-ink-2)', marginTop: 2, lineHeight: 1.4 }}>
            {isWall
              ? <>Le lien qui déclenche le déballage <Sparkles size={11} style={{ display: 'inline', verticalAlign: -1 }} /> et les confettis.</>
              : 'Un message personnalisé, prêt à envoyer.'}
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setEditing(v => !v)}
        >
          {editing ? <><Check size={12} /> OK</> : <><Edit3 size={12} /> Modifier</>}
        </button>
      </div>

      {isWall && (
        <div className="linkbox" style={{ marginBottom: 10 }}>
          <Link2 size={13} style={{ color: 'var(--mk-ink-3)', flexShrink: 0 }} />
          <span className="url" style={{ fontSize: 12 }}>{shareUrl || '…'}</span>
          <button
            className={`btn btn-sm ${copiedLink ? 'btn-soft' : 'btn-ink'}`}
            style={{ flexShrink: 0 }}
            onClick={copyLink}
          >
            {copiedLink ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
          </button>
        </div>
      )}

      {editing ? (
        <textarea
          className="mk-textarea"
          rows={4}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          style={{ fontSize: 13, marginBottom: 10 }}
        />
      ) : (
        <div style={{
          background: 'var(--mk-blush)', border: '1px solid var(--mk-line-2)',
          borderRadius: 'var(--mk-r-xs)', padding: '10px 12px', marginBottom: 10,
          fontSize: 12.5, color: 'var(--mk-ink-2)', lineHeight: 1.55, whiteSpace: 'pre-line',
        }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <button
          className="btn btn-primary"
          style={{ background: '#25D366', boxShadow: 'none', justifyContent: 'center' }}
          onClick={() => openHref(waHref)}
        >
          <MessageSquare size={14} /> WhatsApp
        </button>
        <a
          className="btn btn-ghost"
          href={mailHref}
          style={{ justifyContent: 'center' }}
        >
          <Mail size={14} /> Email
        </a>
        <a
          className="btn btn-ghost"
          href={smsHref}
          style={{ justifyContent: 'center' }}
        >
          <Phone size={14} /> SMS
        </a>
      </div>

      <button
        className="btn btn-soft"
        style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
        onClick={() => {
          navigator.clipboard?.writeText(msg);
          showToast?.('Message copié');
        }}
      >
        <Copy size={13} /> Copier le message
      </button>
    </div>
  );
}

/* ─── Personnaliser modal ─── */
function PersonnaliserModal({ shape, setShape, colorId, setColorId, shareUrl, onClose }) {
  const color = QR_COLORS.find(c => c.id === colorId) || QR_COLORS[0];
  return (
    <div className="modal-veil" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mk-modal" style={{ maxWidth: 520 }}>
        <div className="mk-modal-head">
          <div>
            <div className="mk-modal-title">Personnaliser le QR code</div>
            <div className="mk-modal-sub">La forme et les couleurs s'appliquent aussi à l'image téléchargée.</div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mk-modal-body">
          <div className="section-label" style={{ marginBottom: 8 }}>Forme</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {QR_SHAPES.map(s => (
              <button
                key={s.id}
                className={`pill${shape === s.id ? ' on' : ''}`}
                onClick={() => setShape(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="section-label" style={{ marginBottom: 8 }}>Couleurs</div>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 18 }}>
            {QR_COLORS.map(col => (
              <button
                key={col.id}
                onClick={() => setColorId(col.id)}
                title={col.id}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  position: 'relative', overflow: 'hidden',
                  border: colorId === col.id ? '2.5px solid var(--mk-ink)' : '2.5px solid transparent',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ position: 'absolute', inset: 0, background: col.bg }} />
                <span style={{ position: 'absolute', left: '26%', top: '26%', width: '48%', height: '48%', borderRadius: 5, background: col.fg }} />
              </button>
            ))}
          </div>

          <div style={{ height: 180, display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div style={{ width: 160, padding: 12, borderRadius: 14, background: color.bg }}>
              <QrSvg url={shareUrl || 'https://mykado.store'} shape={shape} color={color} />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
            C'est parfait
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Share view (published) ─── */
export function ShareView({ pub, shortCode, setShortCode, shareUrl, isWall, onSlugUpdated }) {
  const navigate = useNavigate();
  const [shape,      setShape]      = useState('rounded');
  const [colorId,    setColorId]    = useState('rose');
  const [branded,    setBranded]    = useState(true);
  const [customizing,setCustomizing]= useState(false);
  const [copied,     setCopied]     = useState(false);
  const [toast,      setToast]      = useState('');
  const [downloading,setDownloading]= useState(false);
  const [qrExportOpen, setQrExportOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  /* shortcode editing */
  const [slugEditing, setSlugEditing] = useState(false);
  const [slugDraft,   setSlugDraft]   = useState(shortCode);
  const [slugSaving,  setSlugSaving]  = useState(false);
  const [slugStatus,  setSlugStatus]  = useState('');

  useEffect(() => { setSlugDraft(shortCode); }, [shortCode]);

  const color = QR_COLORS.find(c => c.id === colorId) || QR_COLORS[1];

  /* Sur un mur : deux liens distincts.
     - shareUrl        → lien destinataire (déballage + confettis)
     - collectUrl      → même URL + ?collect=1 pour les contributeurs
     Pour un autre type de publication, un seul lien suffit. */
  const collectUrl = useMemo(() => {
    if (!shareUrl) return '';
    if (!isWall) return shareUrl;
    return shareUrl.includes('?') ? `${shareUrl}&collect=1` : `${shareUrl}?collect=1`;
  }, [shareUrl, isWall]);

  const primaryShareUrl = isWall ? collectUrl : shareUrl;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleCopy = useCallback(() => {
    if (!primaryShareUrl) return;
    navigator.clipboard.writeText(primaryShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast(isWall ? 'Lien contributeurs copié' : 'Lien copié');
  }, [primaryShareUrl, isWall]);

  const handleSaveSlug = useCallback(async () => {
    const val = slugDraft.trim();
    if (val === shortCode) { setSlugEditing(false); return; }
    if (val.length < 4) { setSlugStatus('Minimum 4 caractères'); return; }
    setSlugSaving(true); setSlugStatus('');
    try {
      const r = await setCustomSlug(pub._id, val);
      setShortCode(r.data.shortCode);
      setSlugDraft(r.data.shortCode);
      setSlugEditing(false);
      setSlugStatus('saved');
      setTimeout(() => setSlugStatus(''), 2500);
      showToast('Code court mis à jour');
    } catch (err) {
      setSlugStatus(err.response?.data?.error || 'Ce code est déjà utilisé.');
    } finally { setSlugSaving(false); }
  }, [pub._id, slugDraft, shortCode, setShortCode]);

  const handleDownload = useCallback(async () => {
    if (!primaryShareUrl) return;
    setDownloading(true);
    try {
      const node = document.getElementById('mk-qr-card');
      const svgEl = node?.querySelector('svg');
      const W = 720, H = 880;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = color.bg;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(0, 0, W, H, 48);
      else ctx.rect(0, 0, W, H);
      ctx.fill();
      ctx.fillStyle = color.fg;
      ctx.textAlign = 'center';
      ctx.font = '44px Caveat, cursive';
      ctx.globalAlpha = .85;
      ctx.fillText('Scanne-moi', W / 2, 96);
      ctx.globalAlpha = 1;
      ctx.font = "52px 'Instrument Serif', Georgia, serif";
      ctx.fillText(pub?.title || 'myKado', W / 2, 162);
      const shortDomain = (import.meta.env.VITE_API_URL || 'mykado.store').replace(/^https?:\/\//, '');
      ctx.font = '600 26px ui-monospace, monospace';
      ctx.globalAlpha = .85;
      ctx.fillText(shortCode ? `${shortDomain}/s/${shortCode}` : shortDomain, W / 2, H - (branded ? 96 : 56));
      if (branded) {
        ctx.globalAlpha = .55;
        ctx.font = "700 22px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText('PROPULSÉ PAR MYKADO', W / 2, H - 44);
      }
      ctx.globalAlpha = 1;
      if (svgEl) {
        const svgStr = new XMLSerializer().serializeToString(svgEl);
        const img = new Image();
        await new Promise(res => {
          img.onload = res;
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
        });
        ctx.drawImage(img, (W - 460) / 2, 210, 460, 460);
      }
      canvas.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `qr-${pub?.customName || 'mykado'}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      });
      showToast('Image PNG téléchargée');
    } finally { setDownloading(false); }
  }, [primaryShareUrl, color, branded, pub, shortCode]);

  const siteUrl = pub
    ? `${import.meta.env.VITE_API_URL || ''}/site/${pub.templateName}/${pub.customName}`
    : '';

  return (
    <>
      <Toast message={toast} />

      {isWall && (
        <div className="card" style={{
          padding: '16px 20px', marginBottom: 18,
          background: 'linear-gradient(135deg, var(--mk-accent-pale) 0%, var(--mk-blush) 100%)',
          borderColor: 'var(--mk-accent-soft)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 'var(--mk-r-xs)',
              background: 'var(--mk-ink)', color: '#fff', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PenLine size={17} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--mk-ink)', marginBottom: 4 }}>
                Lien 1 · Contributeurs
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--mk-ink-2)', lineHeight: 1.5 }}>
                À partager largement pour <strong>récolter des mots</strong>. Ouvre directement l'écriture, sans cérémonie.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 'var(--mk-r-xs)',
              background: 'var(--mk-accent)', color: '#fff', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Gift size={17} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--mk-accent)', marginBottom: 4 }}>
                Lien 2 · Destinataire
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--mk-ink-2)', lineHeight: 1.5 }}>
                À envoyer <strong>uniquement à la personne à qui tu offres</strong>. Déclenche le déballage + confettis.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="share-grid">

        {/* ── Left: QR card column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {isWall && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
              color: 'var(--mk-ink)', alignSelf: 'flex-start',
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: 6, background: 'var(--mk-ink)',
                color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 900,
              }}>1</span>
              QR du lien contributeurs
            </div>
          )}
          <QrCard
            pub={pub}
            shortCode={shortCode}
            shareUrl={primaryShareUrl}
            shape={shape}
            color={color}
            branded={branded}
          />

          {isWall && (
            <div style={{
              fontSize: 11.5, color: 'var(--mk-ink-3)', textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              <PenLine size={12} /> Le scan ouvre directement l'écriture d'un mot
            </div>
          )}

          <div className="share-dl-row">
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setCustomizing(true)}>
              <Palette size={15} /> Personnaliser
            </button>
            <button
              className="btn btn-ink"
              style={{ flex: 1 }}
              onClick={handleDownload}
              disabled={downloading || !primaryShareUrl}
            >
              {downloading
                ? <><RefreshCw size={13} style={{ animation: 'mk-spin .75s linear infinite' }} /> Génération…</>
                : <><Download size={13} /> Télécharger PNG</>}
            </button>
          </div>

          {/* Export QR unifié (myKado design system) */}
          <button
            className="btn btn-ghost"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => setQrExportOpen(true)}
            disabled={!primaryShareUrl}
          >
            <QrCode size={15} /> Exporter en QR (formes, fonds, tailles)
          </button>

          <label style={{
            display: 'flex', alignItems: 'center', gap: 9,
            fontSize: 12, color: 'var(--mk-ink-2)', fontWeight: 600,
            cursor: 'pointer', userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={branded}
              onChange={e => setBranded(e.target.checked)}
              style={{ accentColor: 'var(--mk-accent)', width: 15, height: 15 }}
            />
            Afficher « Propulsé par myKado » sur l'image
          </label>
        </div>

        {/* ── Right: link + networks column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* ─── LIEN 1 : Contributeurs ─── */}
          {isWall && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
              color: 'var(--mk-ink)',
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: 6, background: 'var(--mk-ink)',
                color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 900,
              }}>1</span>
              Récolter des mots
            </div>
          )}

          {/* Le lien (contributeurs pour un mur, sinon lien général) */}
          <div>
            <div className="section-label" style={{ marginBottom: 10 }}>
              {isWall ? 'Lien pour tes contributeurs' : 'Le lien'}
            </div>
            <div className="linkbox">
              <Link2 size={14} style={{ color: 'var(--mk-ink-3)', flexShrink: 0 }} />
              <span className="url">{primaryShareUrl || '…'}</span>
              <button
                className={`btn btn-sm ${copied ? 'btn-soft' : 'btn-ink'}`}
                style={{ flexShrink: 0 }}
                onClick={handleCopy}
              >
                {copied ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
              </button>
            </div>
          </div>

          {/* Le code court */}
          <div>
            <div className="section-label" style={{ marginBottom: 10 }}>Le code court</div>
            <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1 }}>
                {slugEditing ? (
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: 'var(--mk-ink-3)' }}>/s/</span>
                      <input
                        className="mk-input"
                        style={{ fontFamily: 'ui-monospace, monospace', letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 13, flex: 1 }}
                        value={slugDraft}
                        maxLength={10}
                        autoFocus
                        onChange={e => { setSlugDraft(e.target.value.toUpperCase()); setSlugStatus(''); }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveSlug();
                          if (e.key === 'Escape') { setSlugEditing(false); setSlugDraft(shortCode); setSlugStatus(''); }
                        }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={handleSaveSlug} disabled={slugSaving}>
                        {slugSaving ? <RefreshCw size={12} style={{ animation: 'mk-spin .75s linear infinite' }} /> : 'Enregistrer'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSlugEditing(false); setSlugDraft(shortCode); setSlugStatus(''); }}>
                        Annuler
                      </button>
                    </div>
                    {slugStatus && slugStatus !== 'saved' && (
                      <div style={{ fontSize: 11, color: 'var(--mk-accent)', marginTop: 6, fontWeight: 700 }}>{slugStatus}</div>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 22, fontWeight: 700, letterSpacing: '.14em' }}>
                      {shortCode || ''}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--mk-ink-3)', marginTop: 3 }}>
                      À saisir sur mykado.store pour retrouver la page.
                    </div>
                    {slugStatus === 'saved' && (
                      <div style={{ fontSize: 11, color: 'var(--mk-mint)', marginTop: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={11} /> Sauvegardé
                      </div>
                    )}
                  </>
                )}
              </div>
              {!slugEditing && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setSlugEditing(true); setSlugStatus(''); }}>
                  <Edit3 size={13} /> Personnaliser
                </button>
              )}
            </div>
          </div>

          {/* Personnaliser le lien myKado (nouveau slug canonique /c/:slug /m/:slug /g/:slug) */}
          {pub?._id && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => setLinkModalOpen(true)}
            >
              <Link2 size={13} /> Personnaliser le lien myKado
            </button>
          )}

          {/* Réseaux */}
          <div>
            <div className="section-label" style={{ marginBottom: 10 }}>
              {isWall ? 'Partager le lien contributeurs' : 'Partager sur les réseaux'}
            </div>
            <ShareNetworks shareUrl={primaryShareUrl} onCopy={showToast} />
          </div>

          {isWall && (
            <a
              href={collectUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ justifyContent: 'center', alignSelf: 'flex-start' }}
            >
              <PenLine size={13} /> Prévisualiser l'écriture d'un mot
            </a>
          )}

          {/* ─── LIEN 2 : Destinataire ─── */}
          {isWall && (
            <>
              <div style={{
                height: 1, background: 'var(--mk-line)',
                margin: '4px -4px 4px',
              }} />
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
                color: 'var(--mk-accent)',
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 6, background: 'var(--mk-accent)',
                  color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900,
                }}>2</span>
                Offrir le mur au destinataire
              </div>
            </>
          )}

          {/* Envoyer au destinataire (walls surtout) */}
          <RecipientInvite pub={pub} shareUrl={shareUrl} showToast={showToast} isWall={isWall} />

          {isWall && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ justifyContent: 'center', alignSelf: 'flex-start' }}
            >
              <Sparkles size={13} /> Prévisualiser le déballage
            </a>
          )}
        </div>
      </div>

      {customizing && (
        <PersonnaliserModal
          shape={shape}
          setShape={setShape}
          colorId={colorId}
          setColorId={setColorId}
          shareUrl={primaryShareUrl}
          onClose={() => setCustomizing(false)}
        />
      )}

      {/* myKado — nouveau QR export unifié (design system) */}
      <QRExport
        open={qrExportOpen}
        onClose={() => setQrExportOpen(false)}
        url={primaryShareUrl || ''}
        defaultTitle={pub?.title || pub?.customName || ''}
      />

      {/* myKado — personnaliser le lien canonique /c/:slug /m/:slug /g/:slug */}
      {pub?._id && (
        <PersonalizeLinkModal
          open={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          publicationId={pub._id}
          currentSlug={pub.slug || ''}
          brique={pub.brique || 'carte'}
          suggestedBase={pub.title || pub.customName || ''}
          onUpdated={(newSlug) => onSlugUpdated?.(newSlug)}
        />
      )}
    </>
  );
}

/* ─── Main page ─── */
export default function SharePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pub,        setPub]        = useState(null);
  const [shortCode,  setShortCode]  = useState('');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await getPublicationById(id);
        if (r.data) {
          setPub(r.data);
          try {
            const sl = await getShortLink(id);
            setShortCode(sl.data.shortCode || '');
          } catch {}
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--mk-line)', borderTopColor: 'var(--mk-accent)', animation: 'mk-spin .75s linear infinite' }} />
    </div>
  );

  if (!pub) return (
    <div className="page">
      <div className="empty-state"><div className="e-title">Création introuvable</div></div>
    </div>
  );

  const isWall   = WALL_NAMES.has(pub.templateName);
  const editPath = isWall ? `/ewish-admin/wall/${pub._id}` : `/ewish-admin/ewish/edit/${pub._id}`;

  const shareUrl = shortCode
    ? `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/s/${shortCode}`
    : `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/site/${pub.templateName}/${pub.customName}`;

  return (
    <div className="page">
      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-hand">{pub.published ? 'En ligne' : 'Dernière étape'}</div>
          <h1 className="ph-title">{pub.published ? 'Partage ta création' : pub.title}</h1>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(editPath)}>
          <ArrowLeft size={14} /> Retour à l'édition
        </button>
      </div>

      {pub.published ? (
        <ShareView
          pub={pub}
          shortCode={shortCode}
          setShortCode={setShortCode}
          shareUrl={shareUrl}
          isWall={isWall}
          onSlugUpdated={(newSlug) => setPub((prev) => (prev ? { ...prev, slug: newSlug } : prev))}
        />
      ) : (
        <UnlockView
          pub={pub}
          onUnlocked={() => setPub(prev => ({ ...prev, published: true }))}
        />
      )}
    </div>
  );
}
