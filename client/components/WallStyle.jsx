import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Ban, Check, Plus, Loader2, Eye, X, ExternalLink } from 'lucide-react';
import { updatePublication, uploadFile } from '../utils/api';
import { fireConfetti, stopConfetti } from '../utils/confettiFx';
import AnimatedBackground from '../wall/AnimatedBackground';
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
   Animated backgrounds based on the mockup.
   ────────────────────────────────────────────────────────────── */
export const STYLE_BACKGROUNDS = [
  {
    id: 'bg-blob',
    label: 'Blob fluide',
    previewBg: 'linear-gradient(155deg,#243157 0%,#1A234A 45%,#141B3B 100%)',
    css: 'transparent',
    ink: '#FFFFFF',
  },
  {
    id: 'bg-polka',
    label: 'Vague de pois',
    previewBg: 'linear-gradient(160deg,#F0B24C,#E4922B)',
    css: 'transparent',
    ink: '#453E2E',
  },
  {
    id: 'bg-bokeh',
    label: 'Bokeh',
    previewBg: 'radial-gradient(120% 90% at 50% 15%,#3A2450 0%,#241634 55%,#160D22 100%)',
    css: 'transparent',
    ink: '#FFFFFF',
  },
  {
    id: 'bg-comic',
    label: 'Comic burst',
    previewBg: '#F2D24C',
    css: 'transparent',
    ink: '#161311',
  },
  {
    id: 'bg-synthwave',
    label: 'Grille synthwave',
    previewBg: 'linear-gradient(180deg,#1A1140 0%,#2A1550 46%,#3E1C5E 58%,#160D22 100%)',
    css: 'transparent',
    ink: '#FFFFFF',
  },
  {
    id: 'bg-sunburst',
    label: 'Sunburst',
    previewBg: '#1B2450',
    css: 'transparent',
    ink: '#FFFFFF',
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
  { id: 'hearts',       label: 'Cœurs',     emoji: '💖' },
  { id: 'side_cannons', label: 'Canons',    emoji: '💥' },
  { id: 'school_pride', label: 'Équipe',    emoji: '🏁' },
  { id: 'gold_rain',    label: 'Pluie d\'or', emoji: '✨' },
];

/* ─── Icônes de Révélation (Noto Emoji) ─── */
export const STYLE_REVEAL_ICONS = [
  { id: 'gift',  label: 'Cadeau', emojiCode: '1f381' },
  { id: 'cake',  label: 'Gâteau', emojiCode: '1f382' },
  { id: 'heart', label: 'Cœur',   emojiCode: '1f49d' },
  { id: 'party', label: 'Canon',  emojiCode: '1f389' },
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
    <div className={s.tplGrid} role="radiogroup" aria-label="Type de mur">
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
            <div className={s.tplColorBlock} style={{ background: opt.swatch }} aria-hidden />
            <div className={s.tplCardText}>
              <span className={s.tplLabel}>{opt.label}</span>
              <span className={s.tplHint}>{opt.hint}</span>
            </div>
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
  const [revealMascot, setRevealMascot] = useState(style.revealMascot ?? false);
  const [revealEmojis, setRevealEmojis] = useState(style.revealEmojis ?? true);
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
      return STYLE_BACKGROUNDS.find(b => b.id === bgId) || null;
    },
    [bgId]
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
            revealMascot,
            revealEmojis,
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
  }, [bgId, paletteId, confettiId, revealIconId, revealMascot, revealEmojis, customBgUrl]);

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
        title="Arrière-plan"
        hint="Derrière tous les mots du mur."
      >
        <div className={s.bgList}>
          <div className={`${s.bgItem} ${bgId === null ? s.bgItemActive : ''}`} onClick={() => setBgId(null)}>
            <div className={`${s.bgSquare} ${s.bgNoneSquare}`}>
              <Ban size={22} strokeWidth={1.5} />
            </div>
            <span className={s.bgLabel}>Aucun</span>
          </div>
          {STYLE_BACKGROUNDS.map(bg => (
            <div key={bg.id} className={`${s.bgItem} ${bgId === bg.id ? s.bgItemActive : ''}`} onClick={() => setBgId(bg.id)}>
              <div className={s.bgSquare} style={{ background: bg.previewBg, position: 'relative', overflow: 'hidden' }}>
                <AnimatedBackground backgroundId={bg.id} previewMode={true} />
              </div>
              <span className={s.bgLabel}>{bg.label}</span>
            </div>
          ))}
          {/* Custom Image Upload could go here as well if needed */}
        </div>
      </StyleSection>

      {/* ── Icône de Révélation ── */}
      <StyleSection
        title="Icône de déballage"
        hint="Ce que le destinataire touche pour ouvrir (animé)."
      >
        <div className={s.bgList}>
          {STYLE_REVEAL_ICONS.map(icon => (
            <div key={icon.id} className={`${s.iconCard} ${revealIconId === icon.id ? s.iconCardActive : ''}`} onClick={() => setRevealIconId(icon.id)}>
              <img src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${icon.emojiCode}/512.gif`} alt={icon.label} className={s.iconImg} />
              <span className={s.iconLabel}>{icon.label}</span>
            </div>
          ))}
        </div>
      </StyleSection>

      {/* ── Palette ── */}
      <StyleSection
        title="Palette des boutons"
        hint=""
      >
        <div className={s.paletteList}>
          {STYLE_PALETTES.map(p => (
            <div
              key={p.id}
              className={`${s.paletteCircle} ${paletteId === p.id ? s.paletteCircleActive : ''}`}
              style={{ background: p.accent }}
              onClick={() => setPaletteId(p.id)}
              title={p.label}
            />
          ))}
        </div>
      </StyleSection>

      {/* ── Confetti ── */}
      <StyleSection
        title="Confettis à l'ouverture"
        hint=""
      >
        <div className={s.confettiList}>
          {STYLE_CONFETTI.map(c => (
            <button
              key={c.id}
              type="button"
              className={`${s.confettiPill} ${confettiId === c.id ? s.confettiPillActive : ''}`}
              onClick={() => pickConfetti(c.id)}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </StyleSection>
      {/* ── Toggles ── */}
      <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 15, margin: '24px 20px 0', fontFamily: 'var(--mk-body)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--mk-body)', fontWeight: 700, fontSize: 13.5, color: 'var(--mk-ink, #161311)' }}>Emojis animés</div>
            <div style={{ fontFamily: 'var(--mk-body)', fontWeight: 400, fontSize: 12, color: 'var(--mk-ink-2)', marginTop: 2, lineHeight: 1.5 }}>Noto Emoji en mouvement</div>
          </div>
          <button
            type="button"
            onClick={() => setRevealEmojis(!revealEmojis)}
            style={{ width: 44, height: 26, borderRadius: 999, background: revealEmojis ? '#1E1A2D' : '#E5E0E8', position: 'relative', flex: '0 0 auto', cursor: 'pointer', border: 'none', transition: 'background 0.2s' }}
          >
            <span style={{ position: 'absolute', top: 3, left: revealEmojis ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,.18)' }}></span>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--mk-body)', fontWeight: 700, fontSize: 13.5, color: 'var(--mk-ink, #161311)' }}>Ouverture « Kado apporte le cadeau »</div>
            <div style={{ fontFamily: 'var(--mk-body)', fontWeight: 400, fontSize: 12, color: 'var(--mk-ink-2)', marginTop: 2, lineHeight: 1.5 }}>La mascotte accueille le destinataire</div>
          </div>
          <button
            type="button"
            onClick={() => setRevealMascot(!revealMascot)}
            style={{ width: 44, height: 26, borderRadius: 999, background: revealMascot ? '#1E1A2D' : '#E5E0E8', position: 'relative', flex: '0 0 auto', cursor: 'pointer', border: 'none', transition: 'background 0.2s' }}
          >
            <span style={{ position: 'absolute', top: 3, left: revealMascot ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,.18)' }}></span>
          </button>
        </div>
      </div>

      </div>
    </div>
  );
}
