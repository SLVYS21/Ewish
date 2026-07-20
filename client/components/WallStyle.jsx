import { useEffect, useMemo, useRef, useState } from 'react';
import { Ban, Check, Plus, Loader2, Eye, X, ExternalLink } from 'lucide-react';
import { updatePublication, uploadFile } from '../utils/api';
import { fireConfetti, stopConfetti } from '../utils/confettiFx';
import s from './WallStyle.module.css';

/* Templates de mur disponibles. Le switch reporte tout le style existant. */
export const WALL_TEMPLATE_OPTIONS = [
  {
    id: 'wall-of-wishes',
    label: 'Classique',
    hint: 'Petites cartes chaleureuses',
    swatch: 'linear-gradient(135deg,#FFB3C1,#E11D48)',
  },
  {
    id: 'wall-of-wishes-modern',
    label: 'Moderne',
    hint: 'Glassmorphisme épuré',
    swatch: 'linear-gradient(135deg,#ccc0f5,#e8b0d8,#f5a8be)',
  },
];

/* ─── Backgrounds ────────────────────────────────────────────────
   Emojis floutés en preview + gradient CSS côté récepteur.
   L'utilisateur pourra remplacer par images via la card "+".
   ────────────────────────────────────────────────────────────── */
export const STYLE_BACKGROUNDS = [
  {
    id: 'bg-normal',
    label: 'Normal',
    emojis: ['✦', '❋', '✿'],
    emojiColor: '#FF5470',
    previewBg: 'linear-gradient(135deg, #FFFAFB 0%, #FFE9EE 55%, #FFB3C0 100%)',
    css: 'linear-gradient(135deg, #FFFAFB 0%, #FFE9EE 55%, #FFB3C0 100%)',
    ink: '#2B2440', accent: '#FF5470', size: 'cover',
  },
  {
    id: 'bg-fun',
    label: 'Fun',
    emojis: ['🎂', '🎉', '🎁', '🎈', '⭐', '💫'],
    emojiColor: '#2B2440',
    previewBg: 'linear-gradient(135deg, #FFC145 0%, #FF8DAA 50%, #7C5CC9 100%)',
    css: 'radial-gradient(circle at 15% 25%, rgba(255,84,112,0.45) 0 6px, transparent 7px), radial-gradient(circle at 65% 70%, rgba(255,193,69,0.55) 0 5px, transparent 6px), radial-gradient(circle at 85% 20%, rgba(124,224,193,0.5) 0 5px, transparent 6px), radial-gradient(circle at 30% 80%, rgba(181,156,240,0.5) 0 6px, transparent 7px), linear-gradient(135deg, #FFF7E0 0%, #FFE9EE 100%)',
    ink: '#2B2440', accent: '#FF7A45', size: 'tile',
  },
  {
    id: 'bg-chic',
    label: 'Chic',
    emojis: ['✨', '⭐', '🌙'],
    emojiColor: '#FFC145',
    previewBg: 'linear-gradient(160deg, #2B2440 0%, #4A3F6F 55%, #7C5CC9 100%)',
    css: 'linear-gradient(160deg, #2B2440 0%, #4A3F6F 55%, #7C5CC9 100%)',
    ink: '#FFFFFF', accent: '#FFC145', size: 'cover',
  },
  {
    id: 'bg-mint',
    label: 'Menthe',
    emojis: ['🌿', '🍃', '🌱'],
    emojiColor: '#2E7256',
    previewBg: 'linear-gradient(135deg, #E4FBF3 0%, #7CE0C1 60%, #4FAB86 100%)',
    css: 'linear-gradient(135deg, #E4FBF3 0%, #7CE0C1 60%, #4FAB86 100%)',
    ink: '#FFFFFF', accent: '#2E7256', size: 'cover',
  },
  {
    id: 'bg-sunset',
    label: 'Coucher',
    emojis: ['🌅', '☀️', '🔥'],
    emojiColor: '#FFFFFF',
    previewBg: 'linear-gradient(180deg, #FFC145 0%, #FF5470 60%, #7C5CC9 100%)',
    css: 'linear-gradient(180deg, #FFC145 0%, #FF5470 60%, #7C5CC9 100%)',
    ink: '#FFFFFF', accent: '#FFC145', size: 'cover',
  },
  {
    id: 'bg-tropical',
    label: 'Tropical',
    emojis: ['🌴', '🐚', '🌊'],
    emojiColor: '#2B2440',
    previewBg: 'linear-gradient(180deg, #A9D6FF 0%, #7CE0C1 55%, #FFC145 100%)',
    css: 'linear-gradient(180deg, #A9D6FF 0%, #7CE0C1 55%, #FFC145 100%)',
    ink: '#2B2440', accent: '#2E7256', size: 'cover',
  },
];

/* ─── Palettes ── couleur boutons + texte des boutons ─────────── */
export const STYLE_PALETTES = [
  { id: 'palette-normal', label: 'Rose',    accent: '#FF5470', accentText: '#FFFFFF' },
  { id: 'palette-fun',    label: 'Mangue',  accent: '#FF7A45', accentText: '#FFFFFF' },
  { id: 'palette-chic',   label: 'Or',      accent: '#FFC145', accentText: '#2B2440' },
  { id: 'palette-mint',   label: 'Menthe',  accent: '#2E7256', accentText: '#FFFFFF' },
  { id: 'palette-violet', label: 'Violet',  accent: '#7C5CC9', accentText: '#FFFFFF' },
  { id: 'palette-sky',    label: 'Ciel',    accent: '#3B82F6', accentText: '#FFFFFF' },
  { id: 'palette-ink',    label: 'Encre',   accent: '#2B2440', accentText: '#FFFFFF' },
];

/* ─── Confettis ── ids alignés sur templates/birthday & fx engine */
export const STYLE_CONFETTI = [
  { id: 'default',      label: 'Classique', emoji: '🎉' },
  { id: 'emoji_party',  label: 'Fête',      emoji: '🥳' },
  { id: 'hearts',       label: 'Cœurs',     emoji: '💖' },
  { id: 'stars',        label: 'Étoiles',   emoji: '⭐' },
  { id: 'fireworks',    label: 'Feux',      emoji: '🎇' },
  { id: 'gold_rain',    label: 'Pluie d\'or', emoji: '✨' },
  { id: 'snow',         label: 'Neige',     emoji: '❄️' },
  { id: 'side_cannons', label: 'Canons',    emoji: '💥' },
  { id: 'school_pride', label: 'Équipe',    emoji: '🏁' },
  { id: 'realistic',    label: 'Réaliste',  emoji: '🎊' },
];

/* ─── Icônes de Révélation (Noto Emoji) ─── */
export const STYLE_REVEAL_ICONS = [
  { id: 'gift',  label: 'Cadeau', emojiCode: '1f381' },
  { id: 'cake',  label: 'Gâteau', emojiCode: '1f382' },
  { id: 'heart', label: 'Cœur',   emojiCode: '1f49d' },
  { id: 'party', label: 'Canon',  emojiCode: '1f389' },
];

/* ─── Arrière-plans Premium (Images) ─── */
export const STYLE_IMAGES = [
  {
    id: 'img-aura',
    label: 'Aura Magique',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  },
  {
    id: 'img-dark',
    label: 'Élégance Sombre',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 'img-crystal',
    label: 'Cristal 3D',
    url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 'img-gold',
    label: 'Sable d\'Or',
    url: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 'img-pastel',
    label: 'Rêve Pastel',
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2574&auto=format&fit=crop',
  },
];

/* ────────────────────────────────────────────────────────────── */
/* Preview des cards                                              */
/* ────────────────────────────────────────────────────────────── */

function BackgroundPreview({ item }) {
  return (
    <div className={s.thumb} style={{ background: item.previewBg }}>
      <div className={s.emojiLayer} aria-hidden>
        {item.emojis.map((e, i) => (
          <span
            key={i}
            className={s.thumbEmoji}
            style={{
              left: `${(i * 27 + 10) % 88}%`,
              top: `${(i * 41 + 12) % 78}%`,
              fontSize: `${22 + (i % 3) * 8}px`,
              color: item.emojiColor,
            }}
          >{e}</span>
        ))}
      </div>
    </div>
  );
}

function CustomBgPreview({ url }) {
  return (
    <div className={s.thumb} style={url
      ? { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: 'linear-gradient(135deg, #F4F1EC 0%, #E8E1D3 100%)' }
    }>
      {!url && (
        <div className={s.uploadBox}>
          <Plus size={22} />
          <span>Ajouter</span>
        </div>
      )}
    </div>
  );
}

function PalettePreview({ item }) {
  return (
    <div className={s.thumb} style={{ background: '#F4F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: item.accent,
        color: item.accentText,
        padding: '5px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ width: '8px', height: '8px', background: item.accentText, borderRadius: '50%', opacity: 0.9 }} />
        Aa
      </div>
    </div>
  );
}

function ConfettiPreview({ item }) {
  const dots = useMemo(() => confettiPreviewDots(item.id), [item.id]);
  return (
    <div className={s.thumb} style={{ background: 'linear-gradient(160deg, #FDF9F3 0%, #F0E9DA 100%)' }}>
      <div style={{ position: 'absolute', top: 6, right: 8, fontSize: '14px', zIndex: 10 }}>{item.emoji}</div>
      {dots.map((d, i) => (
        d.emoji ? (
          <span
            key={i}
            className={s.confDotEmoji}
            style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: `${d.size}px`, color: d.color }}
          >{d.emoji}</span>
        ) : (
          <span
            key={i}
            className={s.confDot}
            style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.size}px`, height: `${d.size}px`, background: d.color, borderRadius: d.shape === 'square' ? '2px' : '50%' }}
          />
        )
      ))}
    </div>
  );
}

function RevealIconPreview({ item }) {
  return (
    <div className={s.thumb} style={{ background: '#F4F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${item.emojiCode}/512.gif`} alt={item.label} style={{ width: 44, height: 44 }} />
    </div>
  );
}

/* Dots de preview selon le type — visuellement représentatifs. */
function confettiPreviewDots(type) {
  switch (type) {
    case 'emoji_party':
      return [
        { emoji: '🎉', x: 22, y: 30, size: 22 }, { emoji: '🎊', x: 60, y: 22, size: 20 },
        { emoji: '🎈', x: 40, y: 65, size: 22 }, { emoji: '✨', x: 75, y: 60, size: 18 },
        { emoji: '🥳', x: 18, y: 78, size: 20 },
      ];
    case 'hearts':
      return [
        { emoji: '❤', x: 25, y: 28, size: 22, color: '#ff1493' }, { emoji: '❤', x: 60, y: 22, size: 18, color: '#ff69b4' },
        { emoji: '❤', x: 40, y: 65, size: 24, color: '#ff1493' }, { emoji: '❤', x: 75, y: 55, size: 20, color: '#ff6eb4' },
      ];
    case 'stars':
      return [
        { emoji: '⭐', x: 25, y: 25, size: 22 }, { emoji: '✨', x: 60, y: 30, size: 18, color: '#FFBD00' },
        { emoji: '⭐', x: 45, y: 65, size: 24 }, { emoji: '✨', x: 78, y: 65, size: 20, color: '#FFBD00' },
      ];
    case 'gold_rain':
      return [
        { x: 20, y: 15, size: 10, color: '#d4af37' }, { x: 40, y: 25, size: 8, color: '#e8c86a' },
        { x: 60, y: 35, size: 12, color: '#f5e07a' }, { x: 30, y: 50, size: 9, color: '#d4af37' },
        { x: 70, y: 60, size: 11, color: '#c9a84c' }, { x: 25, y: 75, size: 8, color: '#e8c86a' },
      ];
    case 'snow':
      return [
        { x: 20, y: 20, size: 10, color: '#fff' }, { x: 55, y: 30, size: 8, color: '#d0eaff' },
        { x: 75, y: 45, size: 10, color: '#fff' }, { x: 30, y: 55, size: 12, color: '#fff' },
        { x: 60, y: 70, size: 8, color: '#b0d4ff' }, { x: 40, y: 80, size: 10, color: '#fff' },
      ];
    case 'fireworks':
      return [
        { x: 30, y: 30, size: 6, color: '#FF5470' }, { x: 35, y: 25, size: 6, color: '#FFC145' },
        { x: 25, y: 35, size: 6, color: '#7CE0C1' }, { x: 65, y: 60, size: 6, color: '#B59CF0' },
        { x: 70, y: 55, size: 6, color: '#FF5470' }, { x: 60, y: 65, size: 6, color: '#FFC145' },
      ];
    case 'side_cannons':
      return [
        { x: 8,  y: 55, size: 10, color: '#FF5470' }, { x: 15, y: 45, size: 8, color: '#FFC145' },
        { x: 20, y: 60, size: 9, color: '#7CE0C1' }, { x: 85, y: 55, size: 10, color: '#FF5470' },
        { x: 80, y: 45, size: 8, color: '#FFC145' }, { x: 75, y: 65, size: 9, color: '#7CE0C1' },
      ];
    case 'school_pride':
      return [
        { x: 12, y: 40, size: 8, color: '#FF5470' }, { x: 18, y: 55, size: 8, color: '#FFFFFF' },
        { x: 25, y: 50, size: 8, color: '#FF5470' }, { x: 78, y: 40, size: 8, color: '#FFC145' },
        { x: 82, y: 55, size: 8, color: '#FFFFFF' }, { x: 88, y: 50, size: 8, color: '#FFC145' },
      ];
    case 'realistic':
      return [
        { x: 30, y: 30, size: 8, color: '#FF5470' }, { x: 55, y: 40, size: 10, color: '#FFC145' },
        { x: 45, y: 55, size: 7, color: '#7CE0C1' }, { x: 65, y: 65, size: 9, color: '#B59CF0' },
        { x: 25, y: 70, size: 8, color: '#FF8DAA' }, { x: 75, y: 25, size: 7, color: '#5CC8FF' },
      ];
    default: /* default */
      return [
        { x: 22, y: 25, size: 8, color: '#FF5470' }, { x: 60, y: 30, size: 6, color: '#FFC145' },
        { x: 42, y: 55, size: 10, color: '#7CE0C1' }, { x: 75, y: 62, size: 7, color: '#B59CF0' },
        { x: 20, y: 75, size: 8, color: '#FF8DAA' },
      ];
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Une card générique (Aucun + preset + upload)                   */
/* ────────────────────────────────────────────────────────────── */
function StyleCard({ active, onClick, size = 'md', kind = 'default', children, label, disabled }) {
  return (
    <button
      type="button"
      className={`${s.card} ${s[`card_${size}`]} ${s[`card_${kind}`]} ${active ? s.cardActive : ''}`}
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
    >
      {children}
      <div className={s.cardMeta}>
        <div className={s.cardLabel}>{label}</div>
        {active && (
          <span className={s.cardCheck}><Check size={12} strokeWidth={3} /></span>
        )}
      </div>
    </button>
  );
}

function NoneThumb({ size = 'md' }) {
  return (
    <div className={`${s.thumb} ${s.noneThumb}`}>
      <div className={s.noneIcon}><Ban size={size === 'sm' ? 18 : 22} /></div>
    </div>
  );
}

/* Section : titre + hint + rangée scrollable */
function StyleSection({ title, hint, size, children }) {
  return (
    <section className={s.section}>
      <div className={s.sectionHead}>
        <h3 className={s.sectionTitle}>{title}</h3>
        <p className={s.sectionHint}>{hint}</p>
      </div>
      <div className={`${s.rowWrap}`}>
        <div className={`${s.row} ${s[`row_${size}`]}`}>
          {children}
        </div>
      </div>
    </section>
  );
}

/* Template picker — swatchs cliquables en haut du panneau. */
function TemplatePicker({ current, onPick, published, isPublished }) {
  return (
    <div className={s.tplRow} role="radiogroup" aria-label="Type de mur">
      {WALL_TEMPLATE_OPTIONS.map(opt => {
        const active = current === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={`${s.tplCard} ${active ? s.tplCardActive : ''}`}
            onClick={() => !active && onPick(opt.id)}
          >
            <span className={s.tplSwatch} style={{ background: opt.swatch }} aria-hidden />
            <span className={s.tplMeta}>
              <span className={s.tplLabel}>{opt.label}</span>
              <span className={s.tplHint}>{opt.hint}</span>
            </span>
            {active && <span className={s.tplCheck}><Check size={13} strokeWidth={3} /></span>}
          </button>
        );
      })}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   WallStyle
   ═════════════════════════════════════════════════════════ */
export default function WallStyle({ pub, id, onSave, onPubUpdated }) {
  const style = pub?.style || {};

  /* "Aucun" = valeur null. Chaque preset sinon est stocké par id. */
  const [bgId, setBgId] = useState(style.styleBgPreset || null);
  const [paletteId, setPaletteId] = useState(style.stylePalettePreset || null);
  const [confettiId, setConfettiId] = useState(style.styleConfettiPreset || null);
  const [revealIconId, setRevealIconId] = useState(style.revealIcon || null);
  const [customBgUrl, setCustomBgUrl] = useState(style.styleCustomBgUrl || '');
  const [uploading, setUploading] = useState(false);
  const [templateName, setTemplateName] = useState(pub?.templateName || 'wall-of-wishes');
  const [tplSwitching, setTplSwitching] = useState(false);
  const [tplWarn, setTplWarn] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(Date.now());
  const fileRef = useRef(null);

  const inited = useRef(false);
  const saveTimer = useRef(null);

  const activeBg = useMemo(
    () => {
      if (bgId === 'bg-custom' && customBgUrl) return { id: 'bg-custom', css: `url("${customBgUrl}") center/cover no-repeat`, ink: '#FFFFFF', accent: '#FF5470', size: 'cover' };
      const imgBg = STYLE_IMAGES.find(b => b.id === bgId);
      if (imgBg) return { id: imgBg.id, css: `url("${imgBg.url}") center/cover no-repeat`, ink: '#FFFFFF', accent: '#FF5470', size: 'cover' };
      return STYLE_BACKGROUNDS.find(b => b.id === bgId) || null;
    },
    [bgId, customBgUrl]
  );
  const activePalette = useMemo(
    () => STYLE_PALETTES.find(p => p.id === paletteId) || null,
    [paletteId]
  );

  /* Autosave */
  useEffect(() => {
    if (!inited.current) { inited.current = true; return; }
    onSave?.('unsaved');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      onSave?.('saving');
      try {
        const patch = {
          style: {
            ...style,
            styleBgPreset: bgId,
            stylePalettePreset: paletteId,
            styleConfettiPreset: confettiId,
            styleCustomBgUrl: customBgUrl,
            revealIcon: revealIconId,
          },
        };
        /* Si un preset est choisi, on hydrate les champs récepteur ; sinon on n'écrase pas. */
        if (activeBg) {
          patch.style.wallBackgroundId = activeBg.id;
          patch.style.wallBackground = activeBg.css;
          patch.style.wallBackgroundInk = activeBg.ink;
          patch.style.wallBackgroundSize = activeBg.size || 'cover';
        }
        if (activePalette) {
          patch.style.wallAccent = activePalette.accent;
          patch.style.paletteAccentText = activePalette.accentText;
        }
        if (confettiId) patch.style.confettiType = confettiId;
        await updatePublication(id, patch);
        onSave?.('saved');
        const iframe = document.getElementById('wall-preview-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'WW_UPDATE', style: patch.style }, '*');
        }
      } catch {
        onSave?.('unsaved');
      }
    }, 700);
    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgId, paletteId, confettiId, revealIconId, customBgUrl]);

  /* Switch de template : carry-over du style + info d'URL modifiée si publié */
  const handleTemplateSwitch = async (nextTpl) => {
    if (nextTpl === templateName || tplSwitching) return;
    if (pub?.published) {
      const ok = window.confirm(
        "Ce mur est publié — changer le type de mur va modifier son URL publique. Continuer ?"
      );
      if (!ok) return;
    }
    setTplSwitching(true);
    setTplWarn('');
    onSave?.('saving');
    try {
      const res = await updatePublication(id, { templateName: nextTpl });
      setTemplateName(nextTpl);
      onSave?.('saved');
      onPubUpdated?.(res?.data);
      setPreviewNonce(Date.now());
    } catch (e) {
      setTplWarn(e?.response?.data?.error || 'Impossible de changer le type de mur.');
      onSave?.('unsaved');
    } finally {
      setTplSwitching(false);
    }
  };

  /* Nettoyage confettis au démontage */
  useEffect(() => () => stopConfetti(), []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, { background: true });
      const url = res.data.url;
      setCustomBgUrl(url);
      setBgId('bg-custom');
    } catch { /* ignore */ }
    finally { setUploading(false); }
  };

  const pickConfetti = (val) => {
    setConfettiId(val);

    // Send to iframe
    const iframe = document.getElementById('wall-preview-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'WW_CONFETTI', effectType: val }, '*');
    }
  };

  const VITE_SITE = import.meta.env.VITE_API_URL || '';
  const previewSrc = pub?.customName
    ? `${VITE_SITE}/site/${templateName}/${pub.customName}?preview=1&_t=${previewNonce}`
    : '';

  return (
    <div className={s.layout}>
      <div className={s.wrap}>

      {/* ── Template picker ── */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <h3 className={s.sectionTitle}>Type de mur</h3>
          <p className={s.sectionHint}>Le style de base — les mots s'affichent différemment.</p>
        </div>
        <TemplatePicker current={templateName} onPick={handleTemplateSwitch} isPublished={pub?.published} />
        {tplSwitching && (
          <div className={s.tplSaving}><Loader2 size={12} style={{ animation: 'mk-spin .75s linear infinite' }} /> Changement en cours…</div>
        )}
        {tplWarn && <div className={s.tplError}>{tplWarn}</div>}
      </section>

      {/* ── Background ── */}
      <StyleSection
        title="Choisis un arrière-plan"
        hint="S'affiche derrière tous les mots du mur. « Aucun » garde le fond auto de l'occasion."
        size="lg"
      >
        <StyleCard active={bgId === null} onClick={() => setBgId(null)} size="lg" kind="none" label="Aucun">
          <NoneThumb />
        </StyleCard>
        {STYLE_BACKGROUNDS.map(bg => (
          <StyleCard key={bg.id} active={bgId === bg.id} onClick={() => setBgId(bg.id)} size="lg" label={bg.label}>
            <BackgroundPreview item={bg} />
          </StyleCard>
        ))}
        {STYLE_IMAGES.map(img => (
          <StyleCard key={img.id} active={bgId === img.id} onClick={() => setBgId(img.id)} size="lg" label={img.label}>
            <CustomBgPreview url={img.url} />
          </StyleCard>
        ))}
        <StyleCard
          active={bgId === 'bg-custom'}
          onClick={() => {
            if (customBgUrl) setBgId('bg-custom');
            else fileRef.current?.click();
          }}
          size="lg"
          kind="upload"
          label={customBgUrl ? 'Mon image' : 'Ajouter'}
          disabled={uploading}
        >
          {uploading
            ? (<div className={`${s.thumb} ${s.uploadingThumb}`}><Loader2 size={22} style={{ animation: 'mk-spin .75s linear infinite' }} /></div>)
            : <CustomBgPreview url={customBgUrl} />
          }
        </StyleCard>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = '';
          }}
        />
      </StyleSection>

      {/* ── Icône de Révélation ── */}
      <StyleSection
        title="Icône de déballage"
        hint="Ce que le destinataire touche pour ouvrir son mur (animé)."
        size="md"
      >
        <StyleCard active={revealIconId === null} onClick={() => setRevealIconId(null)} size="md" kind="none" label="Aucun">
          <NoneThumb />
        </StyleCard>
        {STYLE_REVEAL_ICONS.map(icon => (
          <StyleCard key={icon.id} active={revealIconId === icon.id} onClick={() => setRevealIconId(icon.id)} size="md" label={icon.label}>
            <RevealIconPreview item={icon} />
          </StyleCard>
        ))}
      </StyleSection>

      {/* ── Palette ── */}
      <StyleSection
        title="Choisis une palette"
        hint="Couleur des boutons et du texte à l'intérieur des boutons."
        size="sm"
      >
        <StyleCard active={paletteId === null} onClick={() => setPaletteId(null)} size="sm" kind="none" label="Aucun">
          <NoneThumb size="sm" />
        </StyleCard>
        {STYLE_PALETTES.map(p => (
          <StyleCard key={p.id} active={paletteId === p.id} onClick={() => setPaletteId(p.id)} size="sm" label={p.label}>
            <PalettePreview item={p} />
          </StyleCard>
        ))}
      </StyleSection>

      {/* ── Confetti ── */}
      <StyleSection
        title="Quels confettis à l'ouverture"
        hint="Ils apparaissent quand le destinataire découvre le mur. Clique pour voir l'effet."
        size="md"
      >
        <StyleCard active={confettiId === null} onClick={() => pickConfetti(null)} size="md" kind="none" label="Aucun">
          <NoneThumb />
        </StyleCard>
        {STYLE_CONFETTI.map(c => (
          <StyleCard key={c.id} active={confettiId === c.id} onClick={() => pickConfetti(c.id)} size="md" label={c.label}>
            <ConfettiPreview item={c} />
          </StyleCard>
        ))}
      </StyleSection>
      </div>

      {/* ── Preview iframe ── desktop sticky right / mobile drawer ── */}
      {previewSrc && (
        <aside className={`${s.previewCol} ${previewOpen ? s.previewOpen : ''}`}>
          <div className={s.previewHead}>
            <div className={s.previewLabel}>
              <Eye size={13} /> Aperçu en direct
            </div>
            <div className={s.previewActions}>
              <a
                href={previewSrc}
                target="_blank"
                rel="noreferrer"
                className={s.previewIcon}
                aria-label="Ouvrir dans un onglet"
                title="Ouvrir dans un onglet"
              >
                <ExternalLink size={14} />
              </a>
              <button
                type="button"
                className={s.previewIcon}
                onClick={() => setPreviewOpen(false)}
                aria-label="Fermer l'aperçu"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className={s.previewFrame}>
            <iframe
              id="wall-preview-iframe"
              key={previewNonce}
              src={previewSrc}
              title="Aperçu du mur"
              className={s.iframe}
              allow="autoplay; clipboard-write"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </aside>
      )}

      {/* Mobile floating button */}
      {previewSrc && !previewOpen && (
        <button
          type="button"
          className={s.previewFab}
          onClick={() => setPreviewOpen(true)}
          aria-label="Voir l'aperçu"
        >
          <Eye size={16} />
          <span>Aperçu</span>
        </button>
      )}
    </div>
  );
}
