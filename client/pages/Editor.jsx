import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../admin/context/AuthContext';
import { getPublications, getPublicationById, updatePublication, publishPublication, uploadFile, getShortLink, setCustomSlug, createPublication } from '../utils/api';
import ContentTab from '../components/ContentTab';
import StyleTab from '../components/StyleTab';
import BackgroundTab from '../components/BackgroundTab';
import DecoTab from '../components/DecoTab';
import WidgetTab from '../components/WidgetTab';
import PhotoLayoutTab from '../components/PhotoLayoutTab';
import JarTab from '../components/JarTab';
import ConfettiTab from '../components/ConfettiTab';
import WishesManager from '../components/WishesManager';
import InvitationTab from '../components/InvitationTab';
import RsvpManager from '../components/RsvpManager';
import ClientTab from '../components/ClientTab';
import QRCodeModal from '../components/QRCodeModal';
import useFeexPay from '../utils/useFeexPay';
import {
  QrCode, Sparkles, Coffee, Blocks, MailOpen, ClipboardList,
  Megaphone, Info, Copy, Check, X, RefreshCw, Gift, ArrowLeft, ChevronRight,
  Shield, Lock, MessageSquare, Palette, Share2, LayoutTemplate, HelpCircle,
} from 'lucide-react';
import KycModal from '../components/KycModal';
import MSheet from '../components/MSheet';
import PromoInput from '../components/PromoInput';
import { ShareView } from './SharePage';
import { CURRENCIES, findCurrency, formatAmount } from '../card-editor/data/currencies';
import styles from './Editor.module.css';

/* Prix plancher d'une carte publiée (aligné card-editor / server publication.js
   pour myenvelope). Utilisé pour afficher le breakdown dans la modal de paiement
   avant que le serveur ne renvoie sa 402. */
const CARD_PUBLISH_FEE_FCFA = 1500;

/* ─── Guided steps ────────────────────────────────────────────── */
const STEPS = [
  { id: 'Message', n: 1, title: 'Message',  sub: 'Texte, photos, musique',  Icon: MessageSquare, color: '#E11D48', soft: '#fff1f6', accent: '#fbcfe8' },
  { id: 'Look',    n: 2, title: 'Style',    sub: 'Couleurs, fond, ambiance', Icon: Palette,       color: '#6E4FBA', soft: '#F6EEFB', accent: '#D7C5F2' },
  { id: 'Cadeau',  n: 3, title: 'Cagnotte', sub: 'Objectif cadeau commun',   Icon: Gift,          color: '#9B7EE2', soft: '#F6EEFB', accent: '#E5D9F5' },
  { id: 'Share',   n: 4, title: 'Partage',  sub: 'Lien & QR Code',           Icon: Share2,        color: '#b45309', soft: '#fffbeb', accent: '#fde68a' },
];
//partage
/* ─── Section jump map  templates with animated GSAP timeline ── */
const TEMPLATE_SECTIONS = {
  birthday:           [
    { id: 'section-greeting', label: 'Intro',     emoji: '👋' },
    { id: 'section-music',    label: 'Musique',   emoji: '🎵' },
    { id: 'section-message',  label: 'Message',   emoji: '💬' },
    { id: 'section-special',  label: 'WhatsApp',  emoji: '📱' },
    { id: 'section-ideas',    label: 'Idées',     emoji: '✨' },
    { id: 'section-balloons', label: 'Ballons',   emoji: '🎈' },
    { id: 'section-outro',    label: 'Outro',     emoji: '🥂' },
  ],
  'collective-family': [
    { id: 'section-greeting', label: 'Intro',     emoji: '👋' },
    { id: 'section-music',    label: 'Musique',   emoji: '🎵' },
    { id: 'section-message',  label: 'Message',   emoji: '💬' },
    { id: 'section-ideas',    label: 'Idées',     emoji: '✨' },
    { id: 'section-balloons', label: 'Ballons',   emoji: '🎈' },
    { id: 'section-wishes',   label: 'Vœux',     emoji: '💌' },
    { id: 'section-outro',    label: 'Outro',     emoji: '🥂' },
  ],
  'collective-pro': [
    { id: 'section-greeting', label: 'Intro',     emoji: '👋' },
    { id: 'section-music',    label: 'Musique',   emoji: '🎵' },
    { id: 'section-message',  label: 'Message',   emoji: '💬' },
    { id: 'section-ideas',    label: 'Idées',     emoji: '✨' },
    { id: 'section-balloons', label: 'Ballons',   emoji: '🎈' },
    { id: 'section-wishes',   label: 'Vœux',     emoji: '💌' },
    { id: 'section-outro',    label: 'Outro',     emoji: '🥂' },
  ],
  special: [
    { id: 'section-greeting', label: 'Intro',     emoji: '👋' },
    { id: 'section-music',    label: 'Musique',   emoji: '🎵' },
    { id: 'section-message',  label: 'Message',   emoji: '💬' },
    { id: 'section-special',  label: 'Google',    emoji: '🔍' },
    { id: 'section-ideas',    label: 'Idées',     emoji: '✨' },
    { id: 'section-balloons', label: 'Ballons',   emoji: '🎈' },
    { id: 'section-outro',    label: 'Outro',     emoji: '🥂' },
  ],
};

/* ─── Tab visibility rules ────────────────────────────────────── */
const TABS = [
  { key: 'content' },
  { key: 'style' },
  { key: 'background' },
  { key: 'decorations', excludeTemplates: ['wall-of-wishes', 'wall-of-wishes-modern', 'wall-of-wishes-space'] },
  { key: 'photos',      excludeTemplates: ['wall-of-wishes', 'wall-of-wishes-modern', 'wall-of-wishes-space'] },
  { key: 'jar',         templates: ['birthday', 'special'] },
  { key: 'confetti',    templatePrefixes: ['birthday', 'special', 'collective'] },
  { key: 'widgets',     excludeTemplates: ['wall-of-wishes', 'wall-of-wishes-modern', 'wall-of-wishes-space'] },
  { key: 'wishes',      templatePrefixes: ['collective', 'wall-of-wishes'] },
  { key: 'client' },
  { key: 'branding' },
];

/* ─── BrandingTab ─────────────────────────────────────────────── */
function BrandingTab({ show, url, text, onToggle, onUrlChange, onTextChange }) {
  const DEFAULT_URL  = 'https://app.mykado.store';
  const DEFAULT_TEXT = 'Crée le tien sur myKado';
  const displayText  = text || DEFAULT_TEXT;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        background: 'var(--surface, rgba(255,255,255,.05))',
        border: '1.5px solid var(--border, rgba(255,255,255,.1))',
        borderRadius: '12px', padding: '14px 16px',
      }}>
        <button
          onClick={() => onToggle(!show)}
          style={{
            width: '44px', height: '24px', borderRadius: '50px', border: 'none',
            cursor: 'pointer', flexShrink: 0, marginTop: '2px',
            background: show ? 'var(--brand, #c8963e)' : 'rgba(120,120,128,0.2)',
            position: 'relative', transition: 'background .25s',
          }}
        >
          <span style={{
            position: 'absolute', top: '3px', left: show ? '22px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#fff', transition: 'left .25s',
          }} />
        </button>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text, #fff)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Megaphone size={16} /> Afficher le bouton myKado
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3, rgba(255,255,255,.4))', lineHeight: '1.5' }}>
            Un petit bouton discret s'affiche en bas de la page.
            <br />
            <span style={{ color: 'var(--brand)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Offre une réduction en échange ! <Gift size={14} />
            </span>
          </div>
        </div>
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '8px' }}>
          Texte du bouton
        </label>
        <input
          type="text" value={text} onChange={e => onTextChange(e.target.value)}
          placeholder={DEFAULT_TEXT} maxLength={60}
          style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = 'var(--brand)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {show && (
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 12px', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'rgba(0,0,0,.2)' }}>
            Aperçu du bouton
          </div>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,.03)' }}>
            <span style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '50px', padding: '8px 18px', fontSize: '0.72rem', fontWeight: '600', color: '#444', boxShadow: '0 4px 16px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {displayText} <Sparkles size={14} />
            </span>
          </div>
        </div>
      )}

      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '8px' }}>
          Lien de destination <span title="URL vers laquelle le bouton myKado redirigera"><Info size={14} /></span>
        </label>
        <input
          type="url" value={url} onChange={e => onUrlChange(e.target.value)} placeholder={DEFAULT_URL}
          style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = 'var(--brand)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '6px', lineHeight: '1.5' }}>
          Ton WhatsApp : <code style={{ color: 'var(--brand)' }}>https://wa.me/+229...</code>
        </p>
      </div>
    </div>
  );
}

/* KadoExtras: version simplifiee du KadoStep du card-editor, packagee pour
   vivre dans un AccordionCard des extras. Persiste sous data.gift via onChange.
   La revelation visuelle (carte a gratter doree) est rendue cote visiteur
   par ww-engine.js via window.__WW_DATA__.gift.
   Post-publication : si le gift a ete augmente depuis le dernier paiement
   (paidGiftFcfa), on affiche un CTA "Payer X FCFA" qui declenche onPayTopUp
   (handlePublish) : le serveur repond 402 avec le delta et le front ouvre
   FeexPay pour cette portion seulement. */
function KadoExtras({ gift, onChange, recipientName, paidGiftFcfa = 0, isPublished = false, onPayTopUp, publishing = false }) {
  const cfg = findCurrency(gift.currency);
  const amount = Number(gift.amount) || 0;
  const canEnable = amount >= (cfg?.min || 0);
  const label = ['Symbolique', 'Sympathique', 'Généreux', 'Grand jour', 'Wow'];
  const recipient = (recipientName || '').trim() || 'ton proche';
  const currentXof = (gift.enabled && gift.currency === 'XOF') ? Math.floor(amount) : 0;
  const owedFcfa   = Math.max(0, currentXof - Number(paidGiftFcfa || 0));
  const showTopUp  = isPublished && owedFcfa > 0;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero interne : donne du poids au Kado pour ne pas passer inapercu. */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(247,222,132,0.22) 0%, rgba(201,168,76,0.15) 100%)',
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 14, padding: '12px 14px',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: 'radial-gradient(circle at 30% 30%, #F7DE84 0%, #E0B94A 55%, #B58A2A 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 -3px 6px rgba(0,0,0,.15), 0 4px 12px rgba(184,139,42,.35)',
          fontSize: 22,
        }}>🎁</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', letterSpacing: '.01em' }}>
            Le petit geste qui rend la carte inoubliable
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.4 }}>
            {recipient} grattera une carte dorée pour révéler ton montant. Effet garanti.
          </div>
        </div>
      </div>

      {/* Top-up CTA : la carte est deja en ligne mais le nouveau montant Kado
         n'a pas encore ete provisionne cote FeexPay. */}
      {showTopUp && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF7DE 0%, #FDE7A5 100%)',
          border: '1.5px solid #C29A3E',
          borderRadius: 14, padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 10,
          boxShadow: '0 6px 20px rgba(184,139,42,.18)',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Sparkles size={20} style={{ color: '#B58A2A', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#5A4318' }}>
                {paidGiftFcfa > 0 ? 'Nouveau montant à provisionner' : 'Cadeau à provisionner'}
              </div>
              <div style={{ fontSize: 12, color: '#7A5C24', marginTop: 3, lineHeight: 1.45 }}>
                Ta carte est déjà en ligne. Pour que {recipient} découvre&nbsp;
                <strong>{formatAmount(currentXof, 'XOF')}</strong>, il faut provisionner&nbsp;
                <strong>{owedFcfa.toLocaleString('fr-FR')} FCFA</strong>
                {paidGiftFcfa > 0 && <> supplémentaire (déjà provisionné&nbsp;: {paidGiftFcfa.toLocaleString('fr-FR')} FCFA)</>}.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onPayTopUp}
            disabled={publishing}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 16px', borderRadius: 12,
              background: 'linear-gradient(135deg, #E0B94A 0%, #B58A2A 100%)',
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 800,
              cursor: publishing ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(184,139,42,.4)',
              opacity: publishing ? 0.7 : 1,
            }}
          >
            {publishing
              ? <>Chargement…</>
              : <><Sparkles size={16} /> Payer {owedFcfa.toLocaleString('fr-FR')} FCFA maintenant</>}
          </button>
        </div>
      )}

      {/* Indicateur "déjà provisionné" quand tout est réglé */}
      {isPublished && paidGiftFcfa > 0 && owedFcfa === 0 && gift.enabled && (
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          background: 'rgba(62,207,142,0.10)', border: '1px solid rgba(62,207,142,0.35)',
          borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'var(--text-2)',
        }}>
          <Check size={14} style={{ color: '#3ecf8e', flexShrink: 0 }} />
          <span>Cadeau provisionné&nbsp;: <strong>{paidGiftFcfa.toLocaleString('fr-FR')} FCFA</strong></span>
        </div>
      )}

      {/* On/Off */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          type="button"
          onClick={() => onChange({ enabled: false })}
          style={{
            padding: '12px 14px', borderRadius: 12,
            border: !gift.enabled ? '1.5px solid #c9a84c' : '1px solid var(--border)',
            background: !gift.enabled ? 'rgba(201,168,76,0.10)' : 'var(--surface2)',
            color: 'var(--text)', cursor: 'pointer', textAlign: 'left',
            fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 2,
          }}
        >
          <span>Sans cadeau</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>Juste la carte</span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ enabled: true })}
          style={{
            padding: '12px 14px', borderRadius: 12,
            border: gift.enabled ? '1.5px solid #c9a84c' : '1px solid var(--border)',
            background: gift.enabled ? 'rgba(201,168,76,0.12)' : 'var(--surface2)',
            color: 'var(--text)', cursor: 'pointer', textAlign: 'left',
            fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 2,
            position: 'relative',
          }}
        >
          <span>Avec surprise</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>Argent à gratter</span>
          <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 9, fontWeight: 800, color: '#c9a84c', background: 'rgba(201,168,76,0.15)', padding: '2px 6px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Recommandé
          </span>
        </button>
      </div>

      {gift.enabled && (
        <>
          {/* Devise */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 8 }}>
              Devise
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CURRENCIES.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => onChange({ currency: c.key })}
                  style={{
                    padding: '8px 14px', borderRadius: 999,
                    border: gift.currency === c.key ? '1.5px solid #c9a84c' : '1px solid var(--border)',
                    background: gift.currency === c.key ? 'rgba(201,168,76,0.12)' : 'var(--surface2)',
                    color: 'var(--text)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span style={{ color: '#c9a84c', fontWeight: 800 }}>{c.symbol}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Montant */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 8 }}>
              Montant
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px' }}>
              <input
                type="number"
                value={gift.amount || ''}
                onChange={e => onChange({ amount: Number(e.target.value) || 0 })}
                step={cfg?.step}
                min={0}
                max={cfg?.max}
                placeholder="0"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 18, fontWeight: 700 }}
              />
              <span style={{ color: '#c9a84c', fontWeight: 800, fontSize: 16 }}>{cfg?.symbol}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 6, marginTop: 8 }}>
              {(cfg?.presets || []).map((p, i) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({ amount: p })}
                  style={{
                    padding: '8px 6px', borderRadius: 10,
                    border: gift.amount === p ? '1.5px solid #c9a84c' : '1px solid var(--border)',
                    background: gift.amount === p ? 'rgba(201,168,76,0.10)' : 'var(--surface2)',
                    color: 'var(--text)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{formatAmount(p, gift.currency)}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{label[i]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Petit mot */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 8 }}>
              Petit mot <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--text-3)', fontWeight: 500 }}>— sous la carte à gratter</span>
            </label>
            <textarea
              rows={2}
              value={gift.message || ''}
              onChange={e => onChange({ message: e.target.value })}
              placeholder="Ex : Pour te faire plaisir"
              maxLength={140}
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: 13, resize: 'vertical', outline: 'none' }}
            />
          </div>

          {/* Confirmation */}
          {canEnable && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 12, padding: '10px 12px' }}>
              <Sparkles size={18} style={{ color: '#c9a84c' }} />
              <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.4 }}>
                <strong>{recipient}</strong> grattera cette carte pour découvrir <strong style={{ color: '#c9a84c' }}>{formatAmount(gift.amount, gift.currency)}</strong>.
              </div>
            </div>
          )}
          {amount > 0 && !canEnable && (
            <div style={{ fontSize: 12, color: 'var(--red, #e05757)', background: 'rgba(224,87,87,0.08)', padding: '8px 10px', borderRadius: 8 }}>
              Minimum {formatAmount(cfg?.min || 0, gift.currency)} pour attacher un cadeau.
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* AccordionCard (extras step)
   - badge : petit chip a droite du titre (ex: "Recommande")
   - highlight : fond legerement teinte + bordure marquee, pour sortir du lot */
function AccordionCard({ icon: Icon, title, sub, color, children, defaultOpen = false, badge, highlight = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const cardStyle = {
    borderColor: highlight ? color + '80' : (open ? color + '50' : undefined),
    borderWidth: highlight ? 1.5 : undefined,
    background: highlight ? `linear-gradient(135deg, ${color}0f 0%, transparent 60%)` : undefined,
    boxShadow: highlight ? `0 4px 18px ${color}22` : undefined,
  };
  return (
    <div className={styles.extraCard} style={cardStyle}>
      <button className={styles.extraCardHeader} onClick={() => setOpen(o => !o)}>
        <span className={styles.extraCardIcon} style={{ background: color + '18', color }}>
          {Icon && <Icon size={16} />}
        </span>
        <div className={styles.extraCardInfo}>
          <div className={styles.extraCardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{title}</span>
            {badge && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
                color: '#fff', background: color, padding: '2px 6px', borderRadius: 999,
              }}>{badge}</span>
            )}
          </div>
          <div className={styles.extraCardSub}>{sub}</div>
        </div>
        <ChevronRight size={16} className={styles.extraCardChevron} style={{ transform: open ? 'rotate(90deg)' : 'none', color }} />
      </button>
      {open && <div className={styles.extraCardBody}>{children}</div>}
    </div>
  );
}

/* ─── Editor ──────────────────────────────────────────────────── */
export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [pub, setPub]                     = useState(null);
  const [template, setTemplate]           = useState(null);
  const [linkedOrder, setLinkedOrder]     = useState(null);
  const [data, setData]                   = useState({});
  const [style, setStyle]                 = useState({});
  const [backgrounds, setBackgrounds]     = useState({});
  const [decorations, setDecorations]     = useState([]);
  const [jarConfig, setJarConfig]         = useState(null);
  const [widgets, setWidgets]             = useState([]);
  const [photoTransforms, setPhotoTransforms] = useState({});
  const [confettiType, setConfettiType]   = useState('default');

  /* step state */
  const [activeStep, setActiveStep]   = useState('Message');
  const [lookSubTab, setLookSubTab]   = useState('couleur');

  const [saveStatus, setSaveStatus]         = useState('saved');
  const [publishing, setPublishing]         = useState(false);
  const [publishedUrl, setPublishedUrl]     = useState('');
  /* Code promo appliqué au publish courant. Reset après publish réussi.
     Le serveur consomme le code seulement si le paiement réussit. */
  const [appliedPromo, setAppliedPromo]     = useState(null); // { code, discount, finalPrice }
  const [showBranding, setShowBranding]     = useState(false);
  const [brandingUrl, setBrandingUrl]       = useState('');
  const [brandingText, setBrandingText]     = useState('');
  const [shortCode, setShortCode]           = useState('');
  const [slugDraft, setSlugDraft]           = useState('');
  const [slugStatus, setSlugStatus]         = useState('');
  const [linkCopied, setLinkCopied]         = useState(false);

  const [isPanelOpen, setIsPanelOpen]           = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [showQrModal, setShowQrModal]           = useState(false);
  const { openCheckout, feexpayModal } = useFeexPay();
  const [cagnotte, setCagnotte]               = useState(false);
  const [cagnotteGoal, setCagnotteGoal]       = useState(250000);
  const [cagnotteName, setCagnotteName]       = useState('');
  const [cagnotteImage, setCagnotteImage]     = useState('');
  const [cagnotteDeadline, setCagnotteDeadline] = useState('');
  const [cagnotteImgUploading, setCagnotteImgUploading] = useState(false);
  const [wishesEnabled, setWishesEnabled]     = useState(true);
  const [collectTitle, setCollectTitle]       = useState('');
  const [collectSubtitle, setCollectSubtitle] = useState('');
  const [collectCover, setCollectCover]       = useState('');
  const [collectAccentColor, setCollectAccentColor] = useState('');
  const [collectCoverUploading, setCollectCoverUploading] = useState(false);
  const [showCollectCustom, setShowCollectCustom] = useState(false);
  const [showQrCollect, setShowQrCollect]     = useState(false);
  const [showKyc, setShowKyc]                 = useState(false);
  const kycDone = user?.kycStatus === 'approved';
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [showAdvancedLook, setShowAdvancedLook] = useState(false);
  const [minContribution, setMinContribution]   = useState(0);
  const [maxContribution, setMaxContribution]   = useState(0);
  const [isPrivate, setIsPrivate]               = useState(false);
  const [accessCode, setAccessCode]             = useState('');
  const [requireModeration, setRequireModeration] = useState(false);
  const [invitationConfig, setInvitationConfig]   = useState(null);

  const iframeRef  = useRef(null);
  const saveTimer  = useRef(null);
  const [activeSection, setActiveSection] = useState(null);

  /* sync slugDraft when shortCode changes */
  useEffect(() => { if (shortCode) setSlugDraft(shortCode); }, [shortCode]);

  /* load publication */
  useEffect(() => {
    const load = async () => {
      try {
        if (id === 'draft') {
          const draftJson = localStorage.getItem('ewish_draft');
          if (!draftJson) { navigate('/'); return; }
          const found = JSON.parse(draftJson);
          found._id = 'draft';

          if (user) {
            // Re-entry: User just logged in, create the publication automatically
            try {
              const res = await createPublication({
                templateName: found.templateName,
                customName: found.customName,
                title: found.title,
                data: found.data,
                style: found.style,
                decorations: found.decorations,
                widgets: found.widgets,
                photoTransforms: found.photoTransforms,
                jarConfig: found.jarConfig,
                cagnotteConfig: found.cagnotteConfig,
              });
              localStorage.removeItem('ewish_draft');
              const intent = localStorage.getItem('ewish_intent');
              localStorage.removeItem('ewish_intent');
              navigate(`/ewish-admin/ewish/edit/${res.data._id}${intent === 'publish_draft' ? '?autoPublish=1' : ''}`, { replace: true });
            } catch (e) {
              alert('Erreur lors de la sauvegarde du brouillon');
            }
            return;
          }

          setPub(found);
          setData(found.data || {});
          const st = found.style || {};
          setStyle(st);
          setBackgrounds(st.backgrounds || {});
          setDecorations(found.decorations || []);
          setJarConfig(found.jarConfig || null);
          setWidgets(found.widgets || []);
          setPhotoTransforms(found.photoTransforms || {});
          setShowBranding(found.showBranding || false);
          setBrandingUrl(found.brandingUrl || '');
          setBrandingText(found.brandingText || '');
          setConfettiType(st.confettiType || 'default');

          const cc = found.cagnotteConfig || {};
          setCagnotte(cc.enabled || false);
          setCagnotteGoal(cc.goal || 250000);
          setCagnotteName(cc.description || '');
          setCagnotteImage(cc.image || '');
          setCagnotteDeadline(cc.deadline ? cc.deadline.slice(0, 10) : '');
          setWishesEnabled(cc.wishesEnabled !== false);
          setCollectTitle(cc.collectTitle || '');
          setCollectSubtitle(cc.collectSubtitle || '');
          setCollectCover(cc.collectCover || '');
          setCollectAccentColor(cc.collectAccentColor || '');
          setMinContribution(cc.minContribution || 0);
          setMaxContribution(cc.maxContribution || 0);
          setIsPrivate(cc.isPrivate || false);
          setAccessCode(cc.accessCode || '');
          setRequireModeration(cc.requireModeration || false);
          setInvitationConfig(found.invitationConfig || null);
          
          try {
            const tr = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${found.templateName}`);
            if (tr.ok) setTemplate(await tr.json());
          } catch {}
          return;
        }

        /* Fetch direct par ID — évite de télécharger toutes les publications. */
        let found = null;
        try {
          const r = await getPublicationById(id);
          found = r.data;
        } catch {
          /* Fallback : ancien comportement au cas où l'endpoint /id/:id
             refuserait (auth expirée, etc.). Log utile en dev. */
          try {
            const r2 = await getPublications({ limit: 1000 });
            found = r2.data.find(p => p._id === id);
          } catch {}
        }
        if (!found) { navigate('/'); return; }

        setPub(found);
        setData(found.data || {});
        const st = found.style || {};
        setStyle(st);
        setBackgrounds(st.backgrounds || {});
        setDecorations(found.decorations || []);
        setJarConfig(found.jarConfig || null);
        setWidgets(found.widgets || []);
        setPhotoTransforms(found.photoTransforms || {});
        setShowBranding(found.showBranding || false);
        setBrandingUrl(found.brandingUrl || '');
        setBrandingText(found.brandingText || '');
        setConfettiType(st.confettiType || 'default');

        const cc = found.cagnotteConfig || {};
        setCagnotte(cc.enabled || false);
        setCagnotteGoal(cc.goal || 250000);
        setCagnotteName(cc.description || '');
        setCagnotteImage(cc.image || '');
        setCagnotteDeadline(cc.deadline ? cc.deadline.slice(0, 10) : '');
        setWishesEnabled(cc.wishesEnabled !== false);
        setCollectTitle(cc.collectTitle || '');
        setCollectSubtitle(cc.collectSubtitle || '');
        setCollectCover(cc.collectCover || '');
        setCollectAccentColor(cc.collectAccentColor || '');
        setMinContribution(cc.minContribution || 0);
        setMaxContribution(cc.maxContribution || 0);
        setIsPrivate(cc.isPrivate || false);
        setAccessCode(cc.accessCode || '');
        setRequireModeration(cc.requireModeration || false);

        setInvitationConfig(found.invitationConfig || null);

        if (found.published) {
          setPublishedUrl(`/site/${found.templateName}/${found.customName}`);
          try { const sl = await getShortLink(id); setShortCode(sl.data.shortCode); } catch {}
        }

        try {
          const tr = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${found.templateName}`);
          if (tr.ok) setTemplate(await tr.json());
        } catch {}

        try {
          const orderRes = await import('../utils/api').then(m => m.getOrderByPublication(id));
          setLinkedOrder(orderRes.data);
        } catch { setLinkedOrder(null); }
      } catch { navigate('/ewish-admin/ewish'); }
    };
    load();
  }, [id, navigate]);

  /* auto-save */
  const autoSave = useCallback(async (newData, newStyle, newBgs, newDecos, newJar, newWidgets, newPhotoTransforms) => {
    clearTimeout(saveTimer.current);
    setSaveStatus('unsaved');
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      
      if (id === 'draft') {
         const currentDraft = JSON.parse(localStorage.getItem('ewish_draft') || '{}');
         const updatedDraft = {
            ...currentDraft,
            data: newData,
            style: { ...newStyle, backgrounds: newBgs },
            decorations: newDecos, jarConfig: newJar,
            widgets: newWidgets, photoTransforms: newPhotoTransforms,
         };
         localStorage.setItem('ewish_draft', JSON.stringify(updatedDraft));
         setSaveStatus('saved');
         return;
      }

      try {
        await updatePublication(id, {
          data: newData,
          style: { ...newStyle, backgrounds: newBgs },
          decorations: newDecos, jarConfig: newJar,
          widgets: newWidgets, photoTransforms: newPhotoTransforms,
        });
        setSaveStatus('saved');
      } catch { setSaveStatus('unsaved'); }
    }, 1000);
  }, [id]);

  /* cagnotte autosave */
  const cagnotteTimer = useRef(null);
  useEffect(() => {
    if (!id) return;
    clearTimeout(cagnotteTimer.current);
    cagnotteTimer.current = setTimeout(() => {
      const cagnotteConfig = {
        enabled: cagnotte,
        description: cagnotteName,
        goal: cagnotteGoal,
        image: cagnotteImage,
        deadline: cagnotteDeadline || null,
        wishesEnabled,
        minContribution,
        maxContribution,
        collectTitle,
        collectSubtitle,
        collectCover,
        collectAccentColor,
        isPrivate,
        accessCode,
        requireModeration,
      };

      if (id === 'draft') {
        const currentDraft = JSON.parse(localStorage.getItem('ewish_draft') || '{}');
        currentDraft.cagnotteConfig = cagnotteConfig;
        localStorage.setItem('ewish_draft', JSON.stringify(currentDraft));
        return;
      }

      updatePublication(id, { cagnotteConfig }).catch(() => {});
    }, 800);
  }, [id, cagnotte, cagnotteName, cagnotteGoal, cagnotteImage, cagnotteDeadline, wishesEnabled, minContribution, maxContribution, collectTitle, collectSubtitle, collectCover, collectAccentColor, isPrivate, accessCode, requireModeration]);

  /* real-time cagnotte preview */
  useEffect(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'WW_CAGNOTTE_UPDATE',
        cagnotteConfig: {
          enabled: cagnotte,
          description: cagnotteName,
          goal: cagnotteGoal,
          image: cagnotteImage,
          deadline: cagnotteDeadline || null,
          minContribution,
          maxContribution,
          collectTitle,
          collectSubtitle,
          collectCover,
          collectAccentColor,
        }
      }, '*');
    } catch {}
  }, [cagnotte, cagnotteName, cagnotteGoal, cagnotteImage, cagnotteDeadline, minContribution, maxContribution, collectTitle, collectSubtitle, collectCover, collectAccentColor]);

  /* invitation config autosave */
  const invitationTimer = useRef(null);
  const handleInvitationChange = useCallback((next) => {
    setInvitationConfig(next);
    setSaveStatus('unsaved');
    clearTimeout(invitationTimer.current);
    invitationTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      
      if (id === 'draft') {
        const currentDraft = JSON.parse(localStorage.getItem('ewish_draft') || '{}');
        currentDraft.invitationConfig = next;
        localStorage.setItem('ewish_draft', JSON.stringify(currentDraft));
        setSaveStatus('saved');
        return;
      }

      try {
        await updatePublication(id, { invitationConfig: next });
        setSaveStatus('saved');
      } catch { setSaveStatus('unsaved'); }
    }, 700);
  }, [id]);

  /* section jump */
  const jumpToSection = useCallback((sectionId) => {
    setActiveSection(sectionId);
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'WW_JUMP_SECTION', section: sectionId }, '*');
    } catch {}
  }, []);

  /* live preview */
  const refreshPreview = useCallback((d, st, bgs, decos, wids, photoT) => {
    try {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'WW_UPDATE',
        data: { ...d, photoTransforms: photoT },
        style: { ...st, backgrounds: bgs },
        decorations: decos, widgets: wids,
      }, '*');
    } catch {}
  }, []);

  /* change handlers */
  const handleDataChange = (key, value) => {
    const next = { ...data, [key]: value };
    setData(next);
    autoSave(next, style, backgrounds, decorations, jarConfig, widgets, photoTransforms);
    refreshPreview(next, style, backgrounds, decorations, widgets, photoTransforms);
  };

  const handleImportClientData = (templateData) => {
    if (!templateData) return;
    const next = { ...data, ...templateData };
    setData(next);
    autoSave(next, style, backgrounds, decorations, jarConfig, widgets, photoTransforms);
    refreshPreview(next, style, backgrounds, decorations, widgets, photoTransforms);
    alert('Les données du client ont été importées dans le contenu !');
  };

  const handleStyleChange = (keyOrObj, value) => {
    const updates = typeof keyOrObj === 'object' && keyOrObj !== null
      ? keyOrObj : { [keyOrObj]: value };
    const next = { ...style, ...updates };
    setStyle(next);
    autoSave(data, next, backgrounds, decorations, jarConfig, widgets);
    refreshPreview(data, next, backgrounds, decorations, widgets);
  };

  const handleConfettiChange = (type) => {
    setConfettiType(type);
    const next = { ...style, confettiType: type };
    setStyle(next);
    autoSave(data, next, backgrounds, decorations, jarConfig, widgets);
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'WW_CONFETTI', effectType: type }, '*');
      iframeRef.current?.contentWindow?.postMessage({ type: 'WW_UPDATE', style: { ...next, backgrounds } }, '*');
    } catch {}
  };

  const handleBackgroundsChange = (newBgs) => {
    setBackgrounds(newBgs);
    autoSave(data, style, newBgs, decorations, jarConfig, widgets);
    refreshPreview(data, style, newBgs, decorations, widgets);
  };

  const handleDecorationsChange = (newDecos) => {
    setDecorations(newDecos);
    autoSave(data, style, backgrounds, newDecos, jarConfig, widgets);
    refreshPreview(data, style, backgrounds, newDecos, widgets);
  };

  const handlePhotoTransformsChange = (newT) => {
    setPhotoTransforms(newT);
    autoSave(data, style, backgrounds, decorations, jarConfig, widgets, newT);
    refreshPreview(data, style, backgrounds, decorations, widgets, newT);
  };

  const handleWidgetsChange = (newWids) => {
    setWidgets(newWids);
    autoSave(data, style, backgrounds, decorations, jarConfig, newWids);
    refreshPreview(data, style, backgrounds, decorations, newWids);
  };

  const handleJarChange = (newJar) => {
    setJarConfig(newJar);
    autoSave(data, style, backgrounds, decorations, newJar, widgets);
    try { iframeRef.current?.contentWindow?.postMessage({ type: 'WW_UPDATE', data: { ...data, jarConfig: newJar }, style }, '*'); } catch {}
  };

  // Wall-of-wishes: allow activating even with pending KYC
  const handleCagnotteToggleWall = (on) => {
    if (on && user?.kycStatus === 'none') { setShowKyc(true); return; }
    setCagnotte(on);
  };

  const handleWishesEnabledChange = (val) => {
    setWishesEnabled(val);
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'WW_CONFIG', wishesEnabled: val }, '*');
    } catch {}
  };

  const handleUpload = async (file, fieldKey) => {
    try {
      const r = await uploadFile(file);
      handleDataChange(fieldKey, r.data.url);
      return r.data.url;
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.error || e.message));
      return null;
    }
  };

  /* publish : deux étapes séparées pour permettre la re-entrée avec
     un feexpayReference après paiement, sans re-sauvegarder les data. */
  const savePublicationDraft = () => {
    const draftPayload = {
      data, style: { ...style, backgrounds }, decorations, jarConfig, widgets,
      cagnotteConfig: {
        enabled: cagnotte,
        description: cagnotteName,
        goal: cagnotteGoal,
        image: cagnotteImage,
        deadline: cagnotteDeadline || null,
        wishesEnabled,
        minContribution,
        maxContribution,
        collectTitle,
        collectSubtitle,
        collectCover,
        collectAccentColor,
        isPrivate,
        accessCode,
        requireModeration,
      },
    };
    if (id === 'draft') {
      const currentDraft = JSON.parse(localStorage.getItem('ewish_draft') || '{}');
      localStorage.setItem('ewish_draft', JSON.stringify({ ...currentDraft, ...draftPayload }));
      return Promise.resolve();
    }
    return updatePublication(id, draftPayload);
  };

  const doPublishRequest = async (feexpayReference) => {
    if (id === 'draft') return; // Should not happen directly for unauthenticated drafts
    const body = {};
    if (feexpayReference) body.feexpayReference = feexpayReference;
    if (appliedPromo?.code) body.promoCode = appliedPromo.code;
    const r = await publishPublication(id, body);
    setPublishedUrl(r.data.url);
    /* On merge tout ce que renvoie le serveur pour que paidGiftFcfa (utile au
       CTA top-up Kado) et publishedAt soient à jour côté client sans re-fetch. */
    setPub(p => ({ ...p, ...r.data, published: true, isPaid: true }));
    // Le code a été consommé côté serveur — on nettoie l'état local.
    setAppliedPromo(null);
    try { const sl = await getShortLink(id); setShortCode(sl.data.shortCode); } catch {}
  };

  useEffect(() => {
    if (new URLSearchParams(location.search).get('autoPublish') === '1' && pub && pub._id !== 'draft' && user) {
      handlePublish();
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, pub, user]);

  const handlePublish = async () => {
    if (!user) {
      await savePublicationDraft();
      localStorage.setItem('ewish_intent', 'publish_draft');
      navigate('/ewish-admin/register?next=/ewish-admin/ewish/edit/draft');
      return;
    }

    setPublishing(true);
    try {
      await savePublicationDraft();
      await doPublishRequest();
      setPublishing(false);
    } catch (e) {
      /* 402 avec priceFCFA → checkout FeexPay puis retry publish avec la ref.
         On garde publishing:true tant que le checkout est ouvert. */
      if (e.response?.status === 402 && e.response.data?.priceFCFA) {
        const { priceFCFA } = e.response.data;
        openCheckout({
          amount:      priceFCFA,
          description: `myKado  ${pub?.title || 'Publication'}`,
          customId:    `pub:${id}`,
          onSuccess: async ({ reference }) => {
            try { await doPublishRequest(reference); }
            catch (err) { alert(err.response?.data?.error || 'Publish failed après paiement'); }
            finally { setPublishing(false); }
          },
          onFailure: () => setPublishing(false),
        });
        return;
      }
      alert(e.response?.data?.error || 'Publish failed');
      setPublishing(false);
    }
  };

  /* Gift (Kado) : configuré dans les extras du classic Editor pour les cartes
     non-mur / non-invitation. Persistance sous data.gift pour partager le shape
     avec le card-editor et le serveur (server/routes/publication.js). */
  const gift = data?.gift || { enabled: false, amount: 0, currency: 'XOF', message: '' };
  const giftCfg = findCurrency(gift.currency);
  const giftIncluded = gift.enabled && gift.currency === 'XOF' && Number(gift.amount) >= (giftCfg?.min || 0);
  const giftFcfa = giftIncluded ? Math.floor(Number(gift.amount)) : 0;
  /* Base à laquelle s'applique un éventuel code promo : socle 1500 pour
     l'enveloppe, template.priceFCFA pour une carte legacy.
     Le gift n'est jamais remisé, aligné avec la règle serveur. */
  const basePublishFee = pub?.templateName === 'myenvelope'
    ? CARD_PUBLISH_FEE_FCFA
    : (template?.priceFCFA ?? CARD_PUBLISH_FEE_FCFA);
  const promoDiscount = appliedPromo?.discount || 0;
  const baseAfterPromo = Math.max(0, basePublishFee - promoDiscount);
  const publishPriceFcfa = baseAfterPromo + giftFcfa;
  const handleGiftChange = (patch) => {
    const nextGift = { ...gift, ...patch };
    handleDataChange('gift', nextGift);
  };

  /* visibility helpers */
  const visibleTabs = TABS.filter(tab => {
    const name = pub?.templateName || '';
    if (tab.templates        && !tab.templates.includes(name))                                          return false;
    if (tab.excludeTemplates && tab.excludeTemplates.includes(name))                                    return false;
    if (tab.templatePrefixes && !tab.templatePrefixes.some(p => name === p || name.startsWith(p)))     return false;
    return true;
  });

  const showJar      = visibleTabs.some(t => t.key === 'jar');
  const showWishes   = visibleTabs.some(t => t.key === 'wishes');
  const showWidgets  = visibleTabs.some(t => t.key === 'widgets');
  const showConfetti = visibleTabs.some(t => t.key === 'confetti');
  const showDeco     = visibleTabs.some(t => t.key === 'decorations');
  const showPhotos   = visibleTabs.some(t => t.key === 'photos');

  const previewSections = pub ? (TEMPLATE_SECTIONS[pub.templateName] || null) : null;

  /* step helpers */
  const isWall  = pub?.templateName?.startsWith('wall-of-wishes');
  const isMixed = ['collective-family', 'collective-pro'].includes(pub?.templateName);
  const isInvitation = template?.kind === 'invitation';

  const wallStepTheme = (() => {
    switch (pub?.templateName) {
      case 'wall-of-wishes':        return { color: '#E11D48', soft: '#FFF1F4', accent: '#FBCFE0' };
      case 'wall-of-wishes-modern': return { color: '#7C5CC9', soft: '#F4EEFB', accent: '#D7C5F2' };
      case 'wall-of-wishes-3d':     return { color: '#c9a84c', soft: '#FBF5E5', accent: '#F0DDA0' };
      case 'wall-of-wishes-space':  return { color: '#F2643D', soft: '#FFF1EC', accent: '#FED4C2' };
      default:                      return { color: '#E11D48', soft: '#FFF1F4', accent: '#FBCFE0' };
    }
  })();

  const displaySteps = STEPS.map(s => {
    if (s.id === 'Message' && isInvitation)
      return { ...s, title: 'Invitation', sub: 'Texte, photos', Icon: MailOpen, color: '#7C5CC9', soft: '#F4EEFB', accent: '#D7C5F2' };
    if (s.id === 'Cadeau' && isInvitation)
      return { ...s, title: 'RSVP', sub: 'Date, invités, réponses', Icon: ClipboardList, color: '#7C5CC9', soft: '#F4EEFB', accent: '#D7C5F2' };
    if (s.id === 'Share' && isInvitation)
      return { ...s, color: '#7C5CC9', soft: '#F4EEFB', accent: '#D7C5F2' };
    if (s.id === 'Message' && isWall)
      return { ...s, title: 'Mur', sub: 'Titre, accès & mots', Icon: LayoutTemplate, ...wallStepTheme };
    if (s.id === 'Share' && isWall)
      return { ...s, ...wallStepTheme };
    if (s.id === 'Cadeau' && !isWall)
      return { ...s, title: 'Extra', sub: 'Outils & options', Icon: Sparkles, color: '#047857', soft: '#ECFDF5', accent: '#A7F3D0' };
    return s;
  });
  const currentStepIndex = displaySteps.findIndex(s => s.id === activeStep);
  const currentStep      = displaySteps[currentStepIndex];

  /* look sub-tabs (filtered by template) */
  const lookSubTabs = [
    { id: 'couleur', label: 'Couleurs' },
    { id: 'fond',    label: 'Fond' },
    ...(showDeco || showConfetti ? [{ id: 'anim', label: 'Déco' }] : []),
    ...(showPhotos               ? [{ id: 'photos', label: 'Photos' }] : []),
  ];

  const previewSrc = pub
    ? `${import.meta.env.VITE_API_URL}/site/${pub.templateName}/${pub.customName}?preview=1`
    : '';

  /* ── step content ────────────────────────────────────────────── */
  const renderStepContent = () => {
    switch (activeStep) {
      case 'Message':
        if (isWall) {
          return (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className={styles.cagnotteField}>
                <label className={styles.cagnotteFieldLabel}>BADGE DORÉ (EYEBROW)</label>
                <input
                  className={styles.cagnotteInput}
                  value={data.eyebrow || ''}
                  onChange={e => handleDataChange('eyebrow', e.target.value)}
                  placeholder="✦ Mur de mots"
                  maxLength={60}
                />
                <span className={styles.cagnotteFieldHint}>Affiché en badge en haut du mur (ex: ✦ Retraite de Marie)</span>
              </div>
              <div className={styles.cagnotteField}>
                <label className={styles.cagnotteFieldLabel}>PRÉNOM / NOM À L'HONNEUR</label>
                <input
                  className={styles.cagnotteInput}
                  value={data.titleName || ''}
                  onChange={e => handleDataChange('titleName', e.target.value)}
                  placeholder="Sophie"
                  maxLength={50}
                />
                <span className={styles.cagnotteFieldHint}>Apparaît dans « Pour <em style={{ fontStyle: 'italic' }}>Sophie</em> »</span>
              </div>
              <div className={styles.cagnotteField}>
                <label className={styles.cagnotteFieldLabel}>SOUS-TITRE</label>
                <textarea
                  className={styles.cagnotteInput}
                  value={data.subtitle || ''}
                  onChange={e => handleDataChange('subtitle', e.target.value)}
                  placeholder="Partagez ce lien  chacun peut laisser son mot sur ce mur."
                  maxLength={200}
                  rows={3}
                  style={{ resize: 'vertical', minHeight: 72 }}
                />
              </div>
              {/* ── Accès & modération ── */}
              <div className={styles.wallAccessSection}>
                <div className={styles.wallAccessSectionTitle}>
                  <Shield size={14} /> Accès &amp; modération
                </div>

                {/* Public / Privé */}
                <div className={styles.wallAccessLabel}>QUI PEUT VOIR LE MUR ?</div>
                <div className={styles.wallAccessGrid}>
                  <button
                    className={`${styles.wallAccessBtn} ${!isPrivate ? styles.wallAccessBtnActive : ''}`}
                    onClick={() => setIsPrivate(false)}
                  >
                    <span className={styles.wallAccessBtnIcon}>🌐</span>
                    <div>
                      <div className={styles.wallAccessBtnTitle}>Public</div>
                      <div className={styles.wallAccessBtnSub}>Toute personne avec le lien peut voir et participer.</div>
                    </div>
                  </button>
                  <button
                    className={`${styles.wallAccessBtn} ${isPrivate ? styles.wallAccessBtnActive : ''}`}
                    onClick={() => setIsPrivate(true)}
                  >
                    <span className={styles.wallAccessBtnIcon}>🔒</span>
                    <div>
                      <div className={styles.wallAccessBtnTitle}>Privé</div>
                      <div className={styles.wallAccessBtnSub}>Code d'accès requis pour ouvrir le mur.</div>
                    </div>
                  </button>
                </div>
                {isPrivate && (
                  <input
                    className={styles.cagnotteInput}
                    value={accessCode}
                    onChange={e => setAccessCode(e.target.value)}
                    placeholder="Code d'accès (ex: sophie2025)"
                    maxLength={30}
                    style={{ marginTop: 10 }}
                  />
                )}

                {/* Recevoir de nouveaux vœux */}
                <div className={styles.cagnotteToggleRow} style={{ marginTop: 12 }}>
                  <button
                    className={styles.cagnotteToggleBtn}
                    style={{ background: wishesEnabled ? '#9B7EE2' : 'rgba(120,120,128,.2)' }}
                    onClick={() => handleWishesEnabledChange(!wishesEnabled)}
                  >
                    <span className={styles.cagnotteToggleKnob} style={{ left: wishesEnabled ? '22px' : '3px' }} />
                  </button>
                  <div>
                    <div className={styles.cagnotteToggleLabel}>Recevoir de nouveaux vœux</div>
                    <div className={styles.cagnotteToggleSub}>
                      {wishesEnabled ? 'Le bouton « Laisser un mot » est visible.' : 'Mur en lecture seule  aucun ajout possible.'}
                    </div>
                  </div>
                </div>

                {/* Valider avant publication */}
                <div className={styles.cagnotteToggleRow} style={{ marginTop: 8 }}>
                  <button
                    className={styles.cagnotteToggleBtn}
                    style={{ background: requireModeration ? '#9B7EE2' : 'rgba(120,120,128,.2)' }}
                    onClick={() => setRequireModeration(v => !v)}
                  >
                    <span className={styles.cagnotteToggleKnob} style={{ left: requireModeration ? '22px' : '3px' }} />
                  </button>
                  <div>
                    <div className={styles.cagnotteToggleLabel}>Valider avant publication</div>
                    <div className={styles.cagnotteToggleSub}>
                      {requireModeration ? 'Tu approuves chaque vœu avant qu\'il apparaisse sur le mur.' : 'Les vœux s\'affichent instantanément.'}
                    </div>
                  </div>
                </div>

                {/* Capacités invités */}
                <div className={styles.wallCapabilitiesBox}>
                  <div className={styles.wallCapTitle}>
                    <span>💎</span> Ce que tes invités peuvent déposer
                  </div>
                  <div className={styles.wallCapRow}>
                    <span className={styles.wallCapCheck}>✓</span>
                    <span className={styles.wallCapLabel}>10 premiers vœux texte</span>
                    <span className={styles.wallCapFree}>Gratuit</span>
                  </div>
                  <div className={styles.wallCapRow} style={{ opacity: pub?.isPaid ? 1 : 0.55 }}>
                    <span className={styles.wallCapCheck} style={{ color: pub?.isPaid ? '#9B7EE2' : '#aaa' }}>{pub?.isPaid ? '✓' : '□'}</span>
                    <span className={styles.wallCapLabel}>Vœux suivants &amp; photos/vidéos/audio</span>
                    <span className={styles.wallCapCredit}>💎 crédits</span>
                  </div>
                  <div className={styles.wallCapRow} style={{ opacity: cagnotte ? 1 : 0.55 }}>
                    <span className={styles.wallCapCheck} style={{ color: cagnotte ? '#9B7EE2' : '#aaa' }}>{cagnotte ? '✓' : '🎁'}</span>
                    <span className={styles.wallCapLabel}>Cagnotte cadeau</span>
                    <span className={styles.wallCapKyc}>💎 +KYC</span>
                  </div>
                  <div className={styles.wallCapNote}>
                    C'est toi qui débloque avec tes crédits  tes invités n'ont jamais à payer pour participer.
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return (
          <ContentTab
            fields={template?.fields || []}
            data={data}
            onChange={handleDataChange}
            onUpload={handleUpload}
            templateName={template?.name || ''}
          />
        );

      case 'Look':
        return (
          <div className={styles.lookScroll}>
            {/* Palettes + typographie */}
            <StyleTab style={style} onChange={handleStyleChange} />

            {/* Effet de fond */}
            {showConfetti && (
              <div className={styles.lookGroup}>
                <div className={styles.lookGroupLabel}>EFFET DE FOND</div>
                <div className={styles.effectGrid}>
                  {[
                    { id: 'default',     label: 'Confettis', emoji: '🎊' },
                    { id: 'hearts',      label: 'Cœurs',     emoji: '❤️' },
                    { id: 'stars',       label: 'Étoiles',   emoji: '⭐' },
                    { id: 'gold_rain',   label: 'Paillettes',emoji: '✨' },
                    { id: 'snow',        label: 'Flocons',   emoji: '❄️' },
                    { id: 'none',        label: 'Aucun',     emoji: '⚪' },
                  ].map(e => (
                    <button
                      key={e.id}
                      className={`${styles.effectBtn} ${confettiType === e.id ? styles.effectBtnActive : ''}`}
                      onClick={() => handleConfettiChange(e.id)}
                    >
                      <span className={styles.effectEmoji}>{e.emoji}</span>
                      <span className={styles.effectLabel}>{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fond & décors avancés */}
            <div className={styles.lookGroup}>
              <button className={styles.advancedLookToggle} onClick={() => setShowAdvancedLook(o => !o)}>
                <ChevronRight size={14} style={{ transform: showAdvancedLook ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}/>
                Fond & décors avancés
              </button>
              {showAdvancedLook && (
                <div className={styles.advancedLookContent}>
                  <div className={styles.advSec}>
                    <div className={styles.advSecHeader}><span>🖼️</span> Fond par section</div>
                    <div className={styles.advSecDivider} />
                    <BackgroundTab templateName={pub.templateName} backgrounds={backgrounds} onChange={handleBackgroundsChange} />
                  </div>
                  {showDeco && (
                    <div className={styles.advSec}>
                      <div className={styles.advSecHeader}><span>✨</span> Décorations</div>
                      <div className={styles.advSecDivider} />
                      <DecoTab decorations={decorations} onChange={handleDecorationsChange} />
                    </div>
                  )}
                  {showPhotos && (
                    <div className={styles.advSec}>
                      <div className={styles.advSecHeader}><span>📷</span> Mise en page photos</div>
                      <div className={styles.advSecDivider} />
                      <PhotoLayoutTab transforms={photoTransforms} onChange={handlePhotoTransformsChange} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'Cadeau': {
        // ── Invitation : config RSVP + tableau des réponses ──────
        if (isInvitation) {
          const publicUrl = pub
            ? `${import.meta.env.VITE_API_URL || ''}/site/${pub.templateName}/${pub.customName}`
            : '';
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <InvitationTab
                publicationId={pub?._id}
                invitationConfig={invitationConfig}
                onChange={handleInvitationChange}
                publicUrl={publicUrl}
              />
              <div style={{
                margin: '8px 16px 0', padding: '12px 14px',
                background: '#F4EEFB', border: '1px solid #D7C5F2',
                borderRadius: 12, fontSize: 12.5, color: '#6E4FBA', fontWeight: 600,
              }}>
                Réponses reçues
              </div>
              {pub?._id && <RsvpManager publicationId={pub._id} />}
            </div>
          );
        }

        // ── Simple / Mixte : pas de cagnotte ──────────────────────
        if (!isWall) {
          return (
            <div className={styles.extrasList}>
              {isMixed && showWishes && (
                <AccordionCard icon={MailOpen} title="Vœux collectifs" sub="Gérer les messages reçus" color="#047857">
                  <WishesManager publicationId={pub._id} templateName={pub.templateName} customName={pub.customName} />
                </AccordionCard>
              )}
              {showJar && (
                <AccordionCard icon={Coffee} title="Jarre de Vœux" sub="Messages audio & écrits" color="#047857">
                  <JarTab jarConfig={jarConfig} onChange={handleJarChange} templateName={pub.templateName} />
                </AccordionCard>
              )}
              {/* Kado : mis en avant en tête d'extras + accordion ouvert par défaut,
                  parce que noyé dans la liste il passait inaperçu. Le badge doré et
                  le hero interne le vendent comme feature à part entière. */}
              <AccordionCard
                icon={Gift}
                title="Kado à gratter"
                sub="Ajoute une surprise que ton proche va gratter"
                color="#c9a84c"
                badge="Recommandé"
                highlight
                defaultOpen
              >
                <KadoExtras
                  gift={gift}
                  onChange={handleGiftChange}
                  recipientName={data.name || data.titleName || ''}
                  paidGiftFcfa={Number(pub?.paidGiftFcfa) || 0}
                  isPublished={!!pub?.published}
                  onPayTopUp={handlePublish}
                  publishing={publishing}
                />
              </AccordionCard>
              <AccordionCard icon={Megaphone} title="Lien de promotion" sub="Bouton myKado discret" color="#047857">
                <BrandingTab
                  show={showBranding} url={brandingUrl} text={brandingText}
                  onToggle={v  => { setShowBranding(v);  updatePublication(id, { showBranding: v, brandingUrl, brandingText }).catch(() => {}); }}
                  onUrlChange={v => { setBrandingUrl(v);  updatePublication(id, { showBranding, brandingUrl: v, brandingText }).catch(() => {}); }}
                  onTextChange={v => { setBrandingText(v); updatePublication(id, { showBranding, brandingUrl, brandingText: v }).catch(() => {}); }}
                />
              </AccordionCard>
            </div>
          );
        }

        // ── Wall-of-Wishes : onglet Cagnotte ──────────────────────
        const kycStatus = user?.kycStatus || 'none';
        return (
          <div className={styles.extrasList}>

            {/* ─ Cagnotte pas encore activée ─ */}
            {!cagnotte ? (
              <>
                {/* État KYC */}
                {kycStatus === 'pending' && (
                  <div className={styles.kycPendingBadge}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>⏳</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--mk-ink)' }}>Vérification en cours</div>
                      <div style={{ fontSize: 11.5, color: 'var(--mk-ink-2)', marginTop: 2, lineHeight: 1.4 }}>
                        Identité en cours de validation (24-48h). Tu peux déjà activer la cagnotte.
                      </div>
                    </div>
                  </div>
                )}
                {(kycStatus === 'none' || kycStatus === 'rejected') && (
                  <div className={styles.kycNoneBadge}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--mk-ink)' }}>🔒 Vérification d'identité</div>
                      <div style={{ fontSize: 11.5, color: 'var(--mk-ink-2)', marginTop: 2, lineHeight: 1.4 }}>
                        Pour recevoir les contributions, vérifie ton identité.{kycStatus === 'rejected' && ' (Précédente demande refusée)'}
                      </div>
                    </div>
                    <button className={styles.kycVerifyBtn} onClick={() => setShowKyc(true)}>
                      Vérifier
                    </button>
                  </div>
                )}

                {/* Pitch */}
                <div className={styles.cadeauBanner}>
                  <span className={styles.cadeauBannerEmoji}>🎁</span>
                  <div>
                    <div className={styles.cadeauBannerTitle}>Transforme ce mur en collecte cadeau</div>
                    <div className={styles.cadeauBannerDesc}>
                      Active la <strong>cagnotte</strong>. Tes invités voient l'objectif, participent au cadeau commun. Tu reçois directement sur Mobile Money ou virement.
                    </div>
                  </div>
                </div>

                {/* Toggle activation */}
                <div className={styles.cagnotteToggleRow}>
                  <button
                    className={styles.cagnotteToggleBtn}
                    style={{ background: 'rgba(120,120,128,.2)' }}
                    onClick={() => handleCagnotteToggleWall(true)}
                  >
                    <span className={styles.cagnotteToggleKnob} style={{ left: '3px' }} />
                  </button>
                  <div>
                    <div className={styles.cagnotteToggleLabel}>Activer la cagnotte cadeau</div>
                    <div className={styles.cagnotteToggleSub}>
                      {kycStatus === 'approved' ? 'Identité vérifiée  prêt à activer ✓' :
                       kycStatus === 'pending'  ? 'Disponible  vérification en attente' :
                       'Vérification d\'identité recommandée pour recevoir'}
                    </div>
                  </div>
                </div>
                <div className={styles.cagnotteHowTo}>
                  <strong>Comment ça marche ?</strong><br />
                  Tes invités voient le Mur classique + un objectif cadeau. Chacun peut contribuer librement. Une barre de progression collective s'affiche en direct.
                </div>
              </>
            ) : (
              // ─ Cagnotte déjà activée : formulaire direct, sans pitch KYC ─
              <div className={styles.cagnotteForm}>
                <div className={styles.cagnotteField}>
                  <label className={styles.cagnotteFieldLabel}>QUEL CADEAU ?</label>
                  <input className={styles.cagnotteInput} value={cagnotteName} onChange={e => setCagnotteName(e.target.value)} placeholder="Une PS5, un voyage, un appareil photo..." />
                </div>
                <div className={styles.cagnotteField}>
                  <label className={styles.cagnotteFieldLabel}>OBJECTIF (FCFA)</label>
                  <input className={styles.cagnotteInput} type="number" value={cagnotteGoal} onChange={e => setCagnotteGoal(Number(e.target.value))} />
                  <span className={styles.cagnotteFieldHint}>Soit environ {Math.ceil(cagnotteGoal / 656).toLocaleString('fr-FR')} EUR</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className={styles.cagnotteField} style={{ flex: 1 }}>
                    <label className={styles.cagnotteFieldLabel}>MINIMUM (FCFA)</label>
                    <input
                      className={styles.cagnotteInput}
                      type="number" min={0}
                      value={minContribution}
                      onChange={e => setMinContribution(Number(e.target.value))}
                      placeholder="0"
                    />
                    <span className={styles.cagnotteFieldHint}>{minContribution > 0 ? `Min ${minContribution.toLocaleString('fr-FR')} FCFA` : 'Aucun minimum'}</span>
                  </div>
                  <div className={styles.cagnotteField} style={{ flex: 1 }}>
                    <label className={styles.cagnotteFieldLabel}>MAXIMUM (FCFA)</label>
                    <input
                      className={styles.cagnotteInput}
                      type="number" min={0}
                      value={maxContribution}
                      onChange={e => setMaxContribution(Number(e.target.value))}
                      placeholder="0"
                    />
                    <span className={styles.cagnotteFieldHint}>{maxContribution > 0 ? `Max ${maxContribution.toLocaleString('fr-FR')} FCFA` : 'Aucun maximum'}</span>
                  </div>
                </div>
                <div className={styles.cagnotteField}>
                  <label className={styles.cagnotteFieldLabel}>MÉTHODES DE RÉCEPTION</label>
                  <div className={styles.cagnottePills}>
                    <span className={styles.cagnottePill}>✓ MTN MoMo</span>
                    <span className={styles.cagnottePill}>✓ Moov Money</span>
                    <span className={styles.cagnottePill}>+ Virement</span>
                  </div>
                </div>
                <div className={styles.cagnotteField}>
                  <label className={styles.cagnotteFieldLabel}>IMAGE DU CADEAU (optionnel)</label>
                  {cagnotteImage
                    ? (
                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 100 }}>
                        <img src={cagnotteImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => setCagnotteImage('')} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                      </div>
                    )
                    : (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1.5px dashed var(--mk-line-2)', cursor: 'pointer', fontSize: 13, color: 'var(--mk-ink-2)', background: 'var(--mk-cream)' }}>
                        {cagnotteImgUploading ? '⏳ Upload…' : '📷 Ajouter une image'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} disabled={cagnotteImgUploading} onChange={async e => {
                          const f = e.target.files[0]; if (!f) return;
                          setCagnotteImgUploading(true);
                          try { const r = await uploadFile(f); setCagnotteImage(r.data.url); }
                          catch {}
                          finally { setCagnotteImgUploading(false); e.target.value = ''; }
                        }} />
                      </label>
                    )
                  }
                </div>
                <div className={styles.cagnotteField}>
                  <label className={styles.cagnotteFieldLabel}>DATE LIMITE (optionnel)</label>
                  <input className={styles.cagnotteInput} type="date" value={cagnotteDeadline} onChange={e => setCagnotteDeadline(e.target.value)} />
                </div>
                <div className={styles.cagnotteFees}>
                  <Shield size={13} /> myKado prend <strong>5%</strong> sur les contributions. Plafond : 2 000 000 FCFA/mois.
                </div>

                {/* Désactiver la cagnotte */}
                <div className={styles.cagnotteField} style={{ borderTop: '1px solid var(--mk-line)', paddingTop: 14, marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    className={styles.cagnotteToggleBtn}
                    style={{ background: '#9B7EE2' }}
                    onClick={() => setCagnotte(false)}
                  >
                    <span className={styles.cagnotteToggleKnob} style={{ left: '22px' }} />
                  </button>
                  <div>
                    <div className={styles.cagnotteToggleLabel}>Cagnotte active</div>
                    <div className={styles.cagnotteToggleSub}>Désactiver pour suspendre la collecte.</div>
                  </div>
                </div>

                {/* Collect page customization */}
                <div className={styles.cagnotteField} style={{ borderTop: '1px solid var(--mk-line)', paddingTop: 14, marginTop: 4 }}>
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mk-body)', fontWeight: 700, fontSize: 13, color: 'var(--mk-ink-2)', padding: '4px 0' }}
                    onClick={() => setShowCollectCustom(v => !v)}
                  >
                    <span style={{ fontSize: 16 }}>🎨</span>
                    Personnaliser la page de collecte
                    <ChevronRight size={14} style={{ transform: showCollectCustom ? 'rotate(90deg)' : 'none', transition: 'transform .2s', marginLeft: 'auto' }} />
                  </button>
                  {showCollectCustom && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                      <div>
                        <label className={styles.cagnotteFieldLabel}>TITRE DE LA PAGE</label>
                        <input className={styles.cagnotteInput} value={collectTitle} onChange={e => setCollectTitle(e.target.value)} placeholder="c'est l'anniversaire de" />
                      </div>
                      <div>
                        <label className={styles.cagnotteFieldLabel}>SOUS-TITRE</label>
                        <input className={styles.cagnotteInput} value={collectSubtitle} onChange={e => setCollectSubtitle(e.target.value)} placeholder="Laisse un mot et rejoins la cagnotte !" />
                      </div>
                      <div>
                        <label className={styles.cagnotteFieldLabel}>IMAGE DE COUVERTURE</label>
                        {collectCover ? (
                          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 80 }}>
                            <img src={collectCover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button onClick={() => setCollectCover('')} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                          </div>
                        ) : (
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1.5px dashed var(--mk-line-2)', cursor: 'pointer', fontSize: 13, color: 'var(--mk-ink-2)', background: 'var(--mk-cream)' }}>
                            {collectCoverUploading ? '⏳ Upload…' : '🖼️ Ajouter une image de fond'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={collectCoverUploading} onChange={async e => {
                              const f = e.target.files[0]; if (!f) return;
                              setCollectCoverUploading(true);
                              try { const r = await uploadFile(f); setCollectCover(r.data.url); }
                              catch {}
                              finally { setCollectCoverUploading(false); e.target.value = ''; }
                            }} />
                          </label>
                        )}
                      </div>
                      <div>
                        <label className={styles.cagnotteFieldLabel}>COULEUR D'ACCENT</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input type="color" value={collectAccentColor || '#E11D48'} onChange={e => setCollectAccentColor(e.target.value)} style={{ width: 40, height: 40, padding: 2, border: '1.5px solid var(--mk-line-2)', borderRadius: 8, cursor: 'pointer', background: 'var(--mk-cream)' }} />
                          <span style={{ fontSize: 12, color: 'var(--mk-ink-2)' }}>{collectAccentColor || '#E11D48 (défaut)'}</span>
                          {collectAccentColor && <button onClick={() => setCollectAccentColor('')} style={{ fontSize: 11, color: 'var(--mk-rose)', background: 'none', border: 'none', cursor: 'pointer' }}>Réinitialiser</button>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lien de promotion */}
            <AccordionCard icon={Megaphone} title="Lien de promotion" sub="Bouton myKado discret" color="#047857">
              <BrandingTab
                show={showBranding} url={brandingUrl} text={brandingText}
                onToggle={v  => { setShowBranding(v);  updatePublication(id, { showBranding: v, brandingUrl, brandingText }).catch(() => {}); }}
                onUrlChange={v => { setBrandingUrl(v);  updatePublication(id, { showBranding, brandingUrl: v, brandingText }).catch(() => {}); }}
                onTextChange={v => { setBrandingText(v); updatePublication(id, { showBranding, brandingUrl, brandingText: v }).catch(() => {}); }}
              />
            </AccordionCard>
          </div>
        );
      }

      case 'Share':
        return (
          <div className={styles.shareStep}>
            {!pub?.published ? (
              <>
                <div className={styles.partageBanner}>
                  <div className={styles.partageBannerEmoji}>🎉</div>
                  <div className={styles.partageBannerTitle}>Prêt(e) à partager ?</div>
                  <div className={styles.partageBannerSub}>Publie pour obtenir ton lien magique + QR Code personnalisable</div>
                </div>
                <button className={styles.sharePublishBtn} onClick={handlePublish} disabled={publishing}>
                  {publishing
                    ? <><RefreshCw size={16} className={styles.spinIcon} /> Publication…</>
                    : <><Sparkles size={15} /> {user?.canBypassPaywall ? 'Publier (Testeur)' : `Publier — ${(template?.priceFCFA ?? 500).toLocaleString('fr-FR')} FCFA`}</>}
                </button>
                <div className={styles.partageLockedList}>
                  {[
                    { emoji: '🖼️', label: 'QR Code personnalisé', sub: 'Cœur, cercle, myKado…' },
                    { emoji: '🔗', label: 'Lien court magique',   sub: 'mykado.store/s/sophie-25' },
                    { emoji: '💬', label: 'Partager sur WhatsApp', sub: 'Avec aperçu auto' },
                    { emoji: '📧', label: 'Envoyer par email',    sub: 'Liste de contacts' },
                  ].map((item, i) => (
                    <div key={i} className={styles.partageLockedRow}>
                      <div className={styles.partageLockedIcon}>{item.emoji}</div>
                      <div className={styles.partageLockedInfo}>
                        <div className={styles.partageLockedLabel}>{item.label}</div>
                        <div className={styles.partageLockedSub}>{item.sub}</div>
                      </div>
                      <Lock size={14} className={styles.partageLockedLock} />
                    </div>
                  ))}
                </div>
                <div className={styles.partageNote}>Ces options s'activent une fois la création publiée.</div>
              </>
            ) : (
              <div className={styles.shareInlineWrap}>
                {/* Cagnotte collect link  shown when cagnotte is enabled */}
                {cagnotte && (
                  <div className={styles.shareCagnotteBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                      <Gift size={14} style={{ color: '#E11D48' }} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#E11D48', letterSpacing: '.06em', textTransform: 'uppercase' }}>Lien de collecte vœux & cagnotte</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10, padding: '8px 12px', border: '1px solid #FFD0D8' }}>
                      <span style={{ flex: 1, fontSize: 12, color: '#6D5C70', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {import.meta.env.VITE_API_URL}/collect/{id}
                      </span>
                      <button
                        style={{ flexShrink: 0, background: '#E11D48', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                        onClick={() => { navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/collect/${id}`); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
                      >
                        {linkCopied ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
                      </button>
                    </div>
                    <p style={{ fontSize: 11.5, color: '#9B7EE2', marginTop: 8, lineHeight: 1.4 }}>
                      Ce lien unique sert à la fois à collecter les vœux et les contributions à la cagnotte.
                    </p>
                    <button
                      style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '10px 14px', background: '#fff', border: '1.5px solid #FFB3C1', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#E11D48', justifyContent: 'center' }}
                      onClick={() => setShowQrCollect(true)}
                    >
                      <QrCode size={15} /> Générer l'image à partager (QR)
                    </button>
                  </div>
                )}

                {/* Full share UI inline (QR card, link, short code, networks, download) */}
                <ShareView
                  pub={pub}
                  shortCode={shortCode}
                  setShortCode={setShortCode}
                  shareUrl={shortCode
                    ? `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/s/${shortCode}`
                    : `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/site/${pub.templateName}/${pub.customName}`}
                  isWall={isWall}
                />
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  /* ─────────────────────────────────────────────────────────────── */
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
          <button className={styles.btnBack} onClick={() => navigate('/ewish-admin/ewish')}>
            <ArrowLeft size={18} />
          </button>
          <span className={styles.pubTitle}>Personnalisation</span>
        </div>
        <div className={styles.topbarCenter}>
          <span className={`${styles.saveStatus} ${styles[saveStatus]}`}>
            {saveStatus === 'saving'  && <><RefreshCw size={14} className={styles.spinIcon} /> Sauvegarde…</>}
            {saveStatus === 'saved'   && <><Check size={14} /> Sauvegardé</>}
            {saveStatus === 'unsaved' && 'Non sauvegardé'}
          </span>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.btnGhost} onClick={() => setRunTour(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={16} /> Aide
          </button>
          {/*  */}
          <button
            className={`${styles.btnPublish} tour-step-publish`}
            onClick={() => {
              /* Publié → on renvoie vers l'étape Partage (QR, lien, réseaux) plutôt que
                 rouvrir la modal de publication.
                 Pas publié → on ouvre la modal comme gate de paiement, SANS déclencher
                 handlePublish tant que l'utilisateur n'a pas cliqué "Payer & publier". */
              if (pub?.published) {
                setActiveStep('Share');
              } else {
                setIsPublishModalOpen(true);
              }
            }}
          >
            {pub?.published ? 'Partager' : 'Publier'}
          </button>
        </div>
      </header>

      {/* ── Progress strip ── */}
      <div className={styles.progressStrip}>
        <span className={styles.progressLabel}>Étape {currentStepIndex + 1} / {displaySteps.length}</span>
        <div className={styles.progressBarWrap}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${(currentStepIndex + 1) * 25}%`, background: currentStep.color }}
          />
        </div>
        <span className={styles.progressPct} style={{ color: currentStep.color }}>
          {(currentStepIndex + 1) * 25}%
        </span>
      </div>

      {/* ── Publish Modal ─────────────────────────────────────────────
         Pré-paiement : breakdown du prix (base + Kado) + bouton "Payer & publier".
         Le clic déclenche handlePublish qui, si le server répond 402
         PAYMENT_REQUIRED, ouvre le checkout FeexPay. Une fois publié, on affiche
         le lien / QR classique (utile aussi quand on rouvre depuis Share step). */}
      {isPublishModalOpen && (
        <div className={styles.publishModalOverlay} onClick={() => setIsPublishModalOpen(false)}>
          <div className={styles.publishModal} onClick={e => e.stopPropagation()}>
            <div className={styles.dragPill} />
            <div className={styles.publishModalHeader}>
              <h2>{pub?.published ? 'Partager ma création' : 'Publier la création'}</h2>
              <button className={styles.publishModalClose} onClick={() => setIsPublishModalOpen(false)}><X size={18} /></button>
            </div>
            <div className={styles.publishStatusBadge}>
              {pub?.published
                ? <span className={styles.badgePublished}>● Publiée</span>
                : <span className={styles.badgeDraft}>● Brouillon</span>}
            </div>

            {!pub?.published ? (
              <div className={styles.publishModalSection}>
                {publishing ? (
                  <div className={styles.publishingStatus}>
                    <div className={styles.spinnerSmall} />
                    <span>Publication…</span>
                  </div>
                ) : (
                  <>
                    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
                        <span>Publication de la carte</span>
                        <span>
                          {promoDiscount > 0 && (
                            <span style={{ textDecoration: 'line-through', opacity: .5, marginRight: 6 }}>
                              {basePublishFee.toLocaleString('fr-FR')}
                            </span>
                          )}
                          {baseAfterPromo.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      {giftIncluded && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
                          <span><Gift size={12} style={{ verticalAlign: -1, marginRight: 4 }} />Cadeau à gratter</span>
                          <span>{giftFcfa.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: 'var(--text)', paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                        <span>Total</span>
                        <strong>{publishPriceFcfa.toLocaleString('fr-FR')} FCFA</strong>
                      </div>
                      {gift?.enabled && !giftIncluded && (
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                          Paiement en FCFA — les cadeaux en {gift.currency} restent symboliques pour l'instant.
                        </div>
                      )}
                    </div>
                    {!user?.canBypassPaywall && (
                      <PromoInput
                        templateName={pub?.templateName}
                        baseAmount={basePublishFee}
                        applied={appliedPromo}
                        onApplied={setAppliedPromo}
                        onCleared={() => setAppliedPromo(null)}
                        disabled={publishing}
                      />
                    )}
                    <button
                      className={styles.modalConfirm}
                      style={{ padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
                      onClick={handlePublish}
                      disabled={publishing}
                    >
                      <Sparkles size={16} />
                      {user?.canBypassPaywall && !giftIncluded
                        ? 'Publier gratuitement (Testeur)'
                        : publishPriceFcfa === 0
                          ? 'Publier gratuitement'
                          : `Payer ${(user?.canBypassPaywall ? giftFcfa : publishPriceFcfa).toLocaleString('fr-FR')} FCFA & publier`}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.publishModalSection}>
                {publishing ? (
                  <div className={styles.publishingStatus}>
                    <div className={styles.spinnerSmall} />
                    <span>Mise à jour…</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.publishLinkLabel}>Lien de publication</div>
                    <div className={styles.publishLinkRow}>
                      <span className={styles.publishUrlText}>
                        {shortCode
                          ? `${import.meta.env.VITE_API_URL}/s/${shortCode}`
                          : <span className={styles.publishUrlPlaceholder}>Sera généré à la publication</span>}
                      </span>
                      {shortCode && (
                        <button
                          className={`${styles.copyBtn} ${linkCopied ? styles.copyBtnDone : ''}`}
                          onClick={() => {
                            navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/s/${shortCode}`);
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2000);
                          }}
                        >
                          {linkCopied ? <><Check size={16} /> Copié !</> : <><Copy size={16} /> Copier le lien</>}
                        </button>
                      )}
                    </div>
                    {shortCode && (
                      <div className={styles.slugSection}>
                        <div className={styles.slugLabel}>Personnaliser l'adresse (URL)</div>
                        <div className={styles.publishUrlBoxEdit}>
                          <span className={styles.shortUrlPrefix}>/s/</span>
                          <input
                            className={styles.slugInput}
                            value={slugDraft}
                            onChange={e => setSlugDraft(e.target.value)}
                            onBlur={async () => {
                              if (slugDraft === shortCode) return;
                              setSlugStatus('saving');
                              try {
                                const r = await setCustomSlug(id, slugDraft);
                                setShortCode(r.data.shortCode);
                                setSlugStatus('saved');
                              } catch (err) { setSlugStatus(err.response?.data?.error || 'Erreur'); }
                            }}
                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setSlugDraft(shortCode); }}
                            placeholder="mon-lien-custom"
                          />
                          {slugStatus === 'saving' && <RefreshCw size={14} className={styles.spinIcon} />}
                          {slugStatus && slugStatus !== 'saving' && (
                            <span className={`${styles.slugMsg} ${slugStatus === 'saved' ? styles.slugOk : styles.slugErr}`}>
                              {slugStatus === 'saved' ? <><Check size={13} /> Sauvegardé</> : slugStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className={styles.publishModalActions}>
              <button className={styles.modalConfirm} onClick={() => setIsPublishModalOpen(false)}>Terminer</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.workspace}>
        {/* ── Panel ── */}
        <aside className={`${styles.panel} ${isPanelOpen ? styles.panelOpen : styles.panelClosed}`}>

          {/* Mobile handle */}
          <div className={styles.mobilePanelHeader} onClick={() => setIsPanelOpen(o => !o)}>
            <div className={styles.dragPill} />
            <div className={styles.mobilePanelTitleBar}>
              <span className={styles.mobilePanelTitle}>{currentStep.title}</span>
              <span className={styles.mobilePanelToggleIcon}>
                {isPanelOpen
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>}
              </span>
            </div>
          </div>

          {/* Step nav */}
          <div className={`${styles.stepNav} tour-step-nav`}>
            {displaySteps.map((step, i) => {
              const isActive = activeStep === step.id;
              const isDone   = currentStepIndex > i;
              return (
                <button
                  key={step.id}
                  className={`${styles.stepNavBtn} ${isActive ? styles.stepNavBtnActive : ''} ${isDone ? styles.stepNavBtnDone : ''}`}
                  onClick={() => setActiveStep(step.id)}
                  style={isActive ? { borderBottomColor: step.color, color: step.color, background: step.soft } : {}}
                >
                  <span className={styles.stepNavIcon}>
                    {isDone ? <Check size={18} /> : <step.Icon size={18} />}
                  </span>
                  <span className={styles.stepNavLabel}>{step.title.split(' ').slice(-1)[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Panel main */}
          <div className={styles.panelMain}>
            {/* Step header */}
            <div className={styles.stepHeader} style={{ background: currentStep.soft, borderBottom: `2px solid ${currentStep.accent}` }}>
              <span className={styles.stepHeaderNum} style={{ background: currentStep.color }}>{currentStep.n}</span>
              <div>
                <div className={styles.stepHeaderTitle} style={{ color: currentStep.color }}>{currentStep.title}</div>
                <div className={styles.stepHeaderSub}>{currentStep.sub}</div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className={styles.stepContent}>
              {renderStepContent()}
            </div>

            {/* Footer nav */}
            <div className={styles.stepFooter}>
              <button
                className={styles.btnPrev}
                onClick={() => { const p = displaySteps[currentStepIndex - 1]; if (p) setActiveStep(p.id); }}
                disabled={currentStepIndex === 0}
              >
                ← Précédent
              </button>
              {currentStepIndex < displaySteps.length - 1 ? (
                <button
                  className={styles.btnNext}
                  onClick={() => { const n = displaySteps[currentStepIndex + 1]; if (n) setActiveStep(n.id); }}
                  style={{ background: currentStep.color }}
                >
                  Suivant →
                </button>
              ) : (
                <button
                  className={styles.btnNext}
                  onClick={handlePublish}
                  disabled={publishing}
                  style={{ background: currentStep.color }}
                >
                  {pub?.published ? 'Mettre à jour' : '✨ Publier'}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Preview ── */}
        <div className={styles.previewArea}>
          <div className={styles.previewBar}>
            <span className={styles.previewLabel}>Aperçu</span>
            <span className={styles.previewLiveChip}><span className={styles.liveDot} /> En direct</span>
            <div className={styles.previewNav}>
              <button
                className={styles.previewBtn}
                onClick={() => { const f = iframeRef.current; if (f) { const s = f.src; f.src = ''; f.src = s; setActiveSection(null); } }}
              ><RefreshCw size={16} /></button>
            </div>
            {previewSections && (<>
              <select
                className={styles.sectionSelect}
                value={activeSection || ''}
                onChange={e => e.target.value && jumpToSection(e.target.value)}
              >
                <option value="">Aller à…</option>
                {previewSections.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.emoji} {sec.label}</option>
                ))}
              </select>
              <div className={styles.sectionPicker}>
                {previewSections.map(sec => (
                  <button
                    key={sec.id}
                    className={`${styles.sectionBtn} ${activeSection === sec.id ? styles.sectionBtnActive : ''}`}
                    onClick={() => jumpToSection(sec.id)}
                    title={sec.label}
                  >
                    <span className={styles.sectionEmoji}>{sec.emoji}</span>
                    <span className={styles.sectionLabel}>{sec.label}</span>
                  </button>
                ))}
              </div>
            </>)}
            <span className={styles.previewUrl}>/site/{pub.templateName}/{pub.customName}</span>
          </div>
          <div className={`${styles.previewFrame} tour-step-preview`}>
            <iframe ref={iframeRef} src={previewSrc} title="Preview" className={styles.iframe} key={pub._id} />
          </div>
        </div>
      </div>

      {showQrModal && pub.published && shortCode && (
        <QRCodeModal url={`${import.meta.env.VITE_API_URL}/s/${shortCode}`} onClose={() => setShowQrModal(false)} />
      )}

      {showQrCollect && pub.published && (
        <QRCodeModal url={`${import.meta.env.VITE_API_URL}/collect/${id}`} onClose={() => setShowQrCollect(false)} />
      )}

      {feexpayModal}

      {showKyc && (
        <KycModal
          open={showKyc}
          onClose={() => setShowKyc(false)}
          onDone={() => {
            setShowKyc(false);
            setCagnotte(true);
          }}
        />
      )}

      {/* ── Mobile bottom dock ── */}
      <div className={styles.mobileDock}>
        {displaySteps.map(step => (
          <button
            key={step.id}
            className={`${styles.mobileDockBtn} ${activeStep === step.id ? styles.mobileDockBtnActive : ''}`}
            style={activeStep === step.id ? { background: step.soft, color: step.color } : {}}
            onClick={() => { setActiveStep(step.id); setMobileSheetOpen(true); }}
          >
            <span className={styles.mobileDockIcon}><step.Icon size={17} /></span>
            <span className={styles.mobileDockLabel}>{step.title.split(' ').slice(-1)[0]}</span>
          </button>
        ))}
      </div>

      {/* ── Mobile sheet ── */}
      <MSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        title={currentStep?.title}
      >
        <div className={styles.mobileSheetContent}>
          {renderStepContent()}
          <div className={styles.mobileSheetFooter}>
            {currentStepIndex < displaySteps.length - 1 ? (
              <button
                className={styles.mobileSheetNext}
                style={{ background: currentStep.color }}
                onClick={() => { setActiveStep(displaySteps[currentStepIndex + 1].id); }}
              >
                Suivant  {displaySteps[currentStepIndex + 1]?.title}
              </button>
            ) : (
              <button
                className={styles.mobileSheetNext}
                style={{ background: currentStep.color }}
                onClick={() => { setMobileSheetOpen(false); handlePublish(); }}
                disabled={publishing}
              >
                {pub?.published ? '✨ Mettre à jour' : `✨ Publier — ${(template?.priceFCFA ?? 500).toLocaleString('fr-FR')} FCFA`}
              </button>
            )}
          </div>
        </div>
      </MSheet>
    </div>
  );
}
