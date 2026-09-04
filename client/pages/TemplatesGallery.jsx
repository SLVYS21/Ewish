import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Sparkles, MessageSquare, MailOpen,
} from 'lucide-react';
import { getTemplates } from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import { WallThemePreview } from '../components/WallPreviews';
import { TemplateIllustration, hasTemplateIllustration } from '../create-flow/templateIllustrations';
import {
  createFlowTypeFor, isEnvelopeTemplate, MYENVELOPE_TEMPLATE,
} from '../create-flow/syntheticTemplates';
import TemplatePickerFullscreen from '../components/TemplatePickerFullscreen';
import TemplateInfoModal from '../components/TemplateInfoModal';

const TEMPLATE_COLORS = {
  birthday:               'linear-gradient(145deg,#FFB3C1 0%,#FF8DAA 100%)',
  special:                'linear-gradient(145deg,#D7C5F2 0%,#B59CF0 100%)',
  'collective-family':    'linear-gradient(145deg,#C9EEDF 0%,#9FE3CB 100%)',
  'collective-pro':       'linear-gradient(145deg,#FFE7AD 0%,#FFC95A 100%)',
  forever:                'linear-gradient(145deg,#EDD5F5 0%,#C9A0E0 100%)',
  sanctuary:              'linear-gradient(145deg,#D7C5F2 0%,#9B7EE2 100%)',
  'notre-film':           'linear-gradient(145deg,#FDBCCA 0%,#E88FA8 100%)',
  'wall-of-wishes':       'linear-gradient(145deg,#FFB3C1 0%,#E11D48 100%)',
  'wall-of-wishes-3d':    'linear-gradient(145deg,#FFD7C2 0%,#FF9F7A 100%)',
  'wall-of-wishes-modern':'linear-gradient(145deg,#ccc0f5 0%,#e8b0d8 50%,#f5a8be 100%)',
  'wall-of-wishes-space': 'linear-gradient(145deg,#ff8060 0%,#ff4878 60%,#d83070 100%)',
  'wedding-invitation':       'linear-gradient(145deg,#FBF5EC,#FFE5D6,#FBCFE0)',
  'birthday-invitation':      'linear-gradient(145deg,#FFE5D6,#FBCFE0,#F1EAFB)',
  'party-invitation':         'linear-gradient(145deg,#1E1B4B,#7C5CC9,#E0598B)',
  'baby-shower-invitation':   'linear-gradient(145deg,#E3F5EE,#F1EAFB,#FFEDF1)',
};

/* Murs actifs : classique + moderne + craft (moodboard corail).
   Les variantes 3d/space ont été supprimées de la DB
   (voir memory/project_walls_flow.md). */
const WALL_TEMPLATES = new Set(['wall-of-wishes','wall-of-wishes-modern','wall-of-wishes-craft']);

const WISH_CATS = [];

const TEMPLATE_CAT = {
  birthday: 'birthday', forever: 'love', 'notre-film': 'love',
  'collective-pro': 'pro', 'collective-family': 'pro',
  special: 'special', sanctuary: 'special',
};

export default function TemplatesGallery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const initialMode = modeParam === 'wall' ? 'wall' : modeParam === 'invitation' ? 'invitation' : 'wish';
  const [mode, setMode] = useState(initialMode);
  const [cat, setCat] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  /* Picker fullscreen (preview + swipe/prev-next) et modale d'infos (occasion
     + destinataire + titre → createPublication → éditeur). Le flow est :
     click template → picker → CTA → modal info → éditeur. Pour l'enveloppe
     (myenvelope) on saute le picker (pas de preview iframe) et on ouvre
     directement la modale d'infos. */
  const [pickerState, setPickerState] = useState(null); // { templates, initialIndex } | null
  const [infoTpl, setInfoTpl] = useState(null);         // Template | null

  useEffect(() => {
    getTemplates()
      .then(r => setTemplates(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const switchMode = (m) => {
    setMode(m); setCat('all');
    const next = m === 'wall' ? { mode: 'wall' } : m === 'invitation' ? { mode: 'invitation' } : {};
    setSearchParams(next, { replace: true });
  };

  const isInvitationTpl = (t) => t.kind === 'invitation';
  const wishTemplates = [
    /* Enveloppe épinglée en tête de liste wish (flow spécial : pas de picker). */
    MYENVELOPE_TEMPLATE,
    ...templates
      .filter(t => !WALL_TEMPLATES.has(t.name) && !isInvitationTpl(t))
      .filter(t => cat === 'all' || TEMPLATE_CAT[t.name] === cat),
  ];
  const wallTemplates = templates.filter(t => WALL_TEMPLATES.has(t.name));
  const invitationTemplates = templates.filter(isInvitationTpl);

  /* Ouvre le picker : envelope shunte le picker et va directement à la modale
     d'infos (pas de preview iframe pour l'éditeur de cartes). */
  const openTemplate = (list, tpl) => {
    const idx = Math.max(0, list.findIndex((t) => t.name === tpl.name));
    setPickerState({ templates: list, initialIndex: idx });
  };

  const handlePickerPick = (tpl) => {
    setPickerState(null);
    setInfoTpl(tpl);
  };

  return (
    <div className="page">

      {/* Preview fullscreen avec swipe entre templates de la catégorie */}
      {pickerState && (
        <TemplatePickerFullscreen
          templates={pickerState.templates}
          initialIndex={pickerState.initialIndex}
          onClose={() => setPickerState(null)}
          onPick={handlePickerPick}
        />
      )}

      {/* Modale d'infos (occasion + destinataire + titre) → createPublication → éditeur */}
      <TemplateInfoModal
        open={!!infoTpl}
        template={infoTpl}
        onClose={() => setInfoTpl(null)}
      />

      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-hand">
            {mode === 'wish' ? 'Étape 1  choisis ton ambiance'
              : mode === 'wall' ? 'Étape 1  choisis ton mur'
              : 'Étape 1  choisis ton invitation'}
          </div>
          <h1 className="ph-title">
            {mode === 'wish' ? 'Crée un vœu animé'
              : mode === 'wall' ? 'Crée un mur de mots'
              : 'Crée une invitation'}
          </h1>
          <p className="ph-sub">
            {mode === 'wish'
              ? "Clique pour voir"
              : mode === 'wall'
                ? "Une page où chacun laisse un mot. Clique sur un modèle pour en voir l'aperçu et choisir celui que tu souhaites créer."
                : "Tes invités répondent en un clic. Clique sur un modèle pour en voir l'aperçu et choisir ce que tu veux créer."}
          </p>
        </div>
      </div>

      {/* Mode switch pills */}
      <div className="pills" style={{ marginBottom: 'calc(var(--d-gap) + 4px)' }}>
        <button
          className={`pill${mode === 'wish' ? ' on' : ''}`}
          onClick={() => switchMode('wish')}
          style={mode === 'wish' ? { background: 'var(--mk-accent)', borderColor: 'var(--mk-accent)', color: '#fff' } : {}}
        >
          <Sparkles size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />
          Cartes animées
        </button>
        <button
          className={`pill${mode === 'wall' ? ' on' : ''}`}
          onClick={() => switchMode('wall')}
          style={mode === 'wall' ? { background: 'var(--mk-lilac)', borderColor: 'var(--mk-lilac)', color: '#fff' } : {}}
        >
          <MessageSquare size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />
          Murs de mots
        </button>
      </div>

      {mode === 'invitation' ? (
        loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--mk-line)', borderTopColor: '#7C5CC9', animation: 'mk-spin .75s linear infinite', margin: '0 auto' }} />
          </div>
        ) : invitationTemplates.length === 0 ? (
          <div className="empty-state"><div className="e-title">Aucune invitation disponible</div></div>
        ) : (
          <div className="tpl-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))' }}>
            {invitationTemplates.map(tpl => {
              const bg = tpl.thumbnail
                ? `url(${tpl.thumbnail}) center/cover no-repeat`
                : (TEMPLATE_COLORS[tpl.name] || tpl.gradient || 'linear-gradient(145deg,#F4EEFB,#7C5CC9)');
              return (
                <div
                  key={tpl._id}
                  className="card card-hover tpl-card"
                  onClick={() => openTemplate(invitationTemplates, tpl)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="tpl-thumb" style={{ height: 158, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 42, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.15))' }}>{tpl.emoji || '✉️'}</span>
                  </div>
                  <div className="tpl-body">
                    <div className="tpl-name">{tpl.label || tpl.name}</div>
                    <div className="tpl-desc">{tpl.description || ''}</div>
                    <div className="tpl-meta">
                      <span className="badge badge-cost">
                        {(tpl.priceFCFA ?? 500).toLocaleString('fr-FR')} FCFA
                      </span>
                      <button className="btn btn-soft btn-sm" onClick={e => { e.stopPropagation(); openTemplate(invitationTemplates, tpl); }}>
                        Choisir <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : mode === 'wish' ? (
        <>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--mk-line)', borderTopColor: 'var(--mk-accent)', animation: 'mk-spin .75s linear infinite', margin: '0 auto' }} />
            </div>
          ) : wishTemplates.length === 0 ? (
            <div className="empty-state"><div className="e-title">Aucun template</div></div>
          ) : (
            <div className="tpl-grid">
              {wishTemplates.map(tpl => {
                /* SVG dédié en priorité — le thumbnail image ne s'affiche
                   que si aucune illustration n'existe pour ce template. */
                const showIllu = hasTemplateIllustration(tpl.name);
                const bg = !showIllu && tpl.thumbnail
                  ? `url(${tpl.thumbnail}) center/cover no-repeat`
                  : (TEMPLATE_COLORS[tpl.name] || 'linear-gradient(145deg,#FFB3C1,#E11D48)');
                return (
                  <button
                    key={tpl._id}
                    className="card card-hover tpl-card"
                    onClick={() => openTemplate(wishTemplates, tpl)}
                    style={tpl._isNew ? { position: 'relative' } : undefined}
                  >
                    {tpl._isNew && (
                      <span
                        style={{
                          position: 'absolute', top: 10, left: 10, zIndex: 2,
                          background: 'var(--mk-accent)', color: '#fff',
                          fontSize: 10, fontWeight: 800, letterSpacing: '.08em',
                          textTransform: 'uppercase', padding: '3px 8px',
                          borderRadius: 999, boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                      >
                        Nouveau
                      </span>
                    )}
                    <div className="tpl-thumb" style={{ background: bg, position: 'relative' }}>
                      {showIllu && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '10%',
                        }}>
                          <TemplateIllustration name={tpl.name} />
                        </div>
                      )}
                      <div className="tpl-scene">
                        <span className="ms-hand">Pour toi,</span>
                        <span className="ms-title">{tpl.label || tpl.name}</span>
                        <span className="ms-line" style={{ background: '#fff' }} />
                      </div>
                    </div>
                    <div className="tpl-body">
                      <div className="tpl-name">{tpl.label || tpl.name}</div>
                      <div className="tpl-desc">{tpl.description || ''}</div>
                      <div className="tpl-meta">
                        <span className="badge badge-cost">
                          {(tpl.priceFCFA ?? 500).toLocaleString('fr-FR')} FCFA
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mk-accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          Aperçu <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Wall mode */
        loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--mk-line)', borderTopColor: 'var(--mk-accent)', animation: 'mk-spin .75s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <div className="tpl-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))' }}>
            {wallTemplates.map(tpl => {
              const showIllu = hasTemplateIllustration(tpl.name);
              return (
                <div
                  key={tpl._id}
                  className="card card-hover"
                  onClick={() => openTemplate(wallTemplates, tpl)}
                  style={{ cursor: 'pointer', border: '1px solid var(--mk-line-2)', borderRadius: '18px', overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}
                >
                  {showIllu ? (
                    <div style={{
                      position: 'relative', aspectRatio: '1.14', overflow: 'hidden',
                      background: TEMPLATE_COLORS[tpl.name] || 'linear-gradient(145deg,#FFB3C1,#E11D48)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '12%',
                    }}>
                      <TemplateIllustration name={tpl.name} />
                    </div>
                  ) : tpl.thumbnail ? (
                    <div style={{ position: 'relative', aspectRatio: '1.14', overflow: 'hidden', background: `url(${tpl.thumbnail}) center/cover no-repeat` }} />
                  ) : (
                    <WallThemePreview templateName={tpl.name} />
                  )}
                  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--mk-ink)' }}>{tpl.label || tpl.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <span style={{ font: '800 11px Inter, sans-serif', background: 'var(--mk-line)', color: 'var(--mk-ink-2)', padding: '4px 10px', borderRadius: '999px' }}>
                        {(tpl.priceFCFA ?? 500).toLocaleString('fr-FR')} FCFA
                      </span>
                      <span style={{ font: '700 13px Inter, sans-serif', color: 'var(--mk-accent)' }}>Aperçu ›</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

export function TemplateCard({ tpl, onUse }) {
  const bg = tpl.thumbnail
    ? `url(${tpl.thumbnail}) center/cover no-repeat`
    : 'linear-gradient(145deg,#FFB3C1,#E11D48)';
  return (
    <div className="card card-hover tpl-card" onClick={onUse}>
      <div className="tpl-thumb" style={{ background: bg }} />
      <div className="tpl-body">
        <div className="tpl-name">{tpl.label || tpl.name}</div>
      </div>
    </div>
  );
}

export function PremadeCard({ premade, onUse }) {
  const bg = premade.thumbnail
    ? `url(${premade.thumbnail}) center/cover no-repeat`
    : 'linear-gradient(145deg,#FFB3C1,#E11D48)';
  return (
    <div className="card card-hover tpl-card" onClick={onUse}>
      <div className="tpl-thumb" style={{ background: bg }} />
      <div className="tpl-body">
        <div className="tpl-name">{premade.premadeLabel || premade.title}</div>
      </div>
    </div>
  );
}
