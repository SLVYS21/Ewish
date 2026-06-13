import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X, Sparkles, MessageSquare } from 'lucide-react';
import { getTemplates, createPublication } from '../utils/api';

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
};

const WALL_DESCS = {
  'wall-of-wishes':        'Les mots apparaissent comme de petites cartes pastel. Chaleureux et festif.',
  'wall-of-wishes-3d':     'Les mots flottent en profondeur dans un espace 3D spectaculaire.',
  'wall-of-wishes-modern': 'Glassmorphisme épuré : cartes translucides. Élégant et contemporain.',
  'wall-of-wishes-space':  "Chaque mot est une étoile dans une galaxie que l'on explore.",
};

const WALL_TEMPLATES = new Set(['wall-of-wishes','wall-of-wishes-3d','wall-of-wishes-modern','wall-of-wishes-space']);

const WISH_CATS = [
  { id: 'all',      label: 'Tous' },
  { id: 'birthday', label: 'Anniversaire' },
  { id: 'love',     label: 'Amour' },
  { id: 'pro',      label: 'Pro / RH' },
  { id: 'special',  label: 'Spécial' },
];

const TEMPLATE_CAT = {
  birthday: 'birthday', forever: 'love', 'notre-film': 'love',
  'collective-pro': 'pro', 'collective-family': 'pro',
  special: 'special', sanctuary: 'special',
};

export default function TemplatesGallery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'wall' ? 'wall' : 'wish';
  const [mode, setMode] = useState(initialMode);
  const [cat, setCat] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Wall naming modal */
  const [wallModal, setWallModal]   = useState(null);
  const [wallTitle, setWallTitle]   = useState('');
  const [wallError, setWallError]   = useState('');
  const [wallLoading, setWallLoading] = useState(false);
  const wallRef = useRef(null);

  useEffect(() => {
    getTemplates()
      .then(r => setTemplates(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const switchMode = (m) => {
    setMode(m); setCat('all');
    setSearchParams(m === 'wall' ? { mode: 'wall' } : {}, { replace: true });
  };

  const wishTemplates = templates
    .filter(t => !WALL_TEMPLATES.has(t.name))
    .filter(t => cat === 'all' || TEMPLATE_CAT[t.name] === cat);
  const wallTemplates = templates.filter(t => WALL_TEMPLATES.has(t.name));

  /* Open wall naming modal */
  const openWallModal = (tpl) => {
    setWallModal(tpl); setWallTitle(''); setWallError('');
    setTimeout(() => wallRef.current?.focus(), 80);
  };

  const confirmWall = async () => {
    const title = wallTitle.trim();
    if (!title) { setWallError('Donne un nom à ce mur'); return; }
    setWallLoading(true); setWallError('');
    try {
      const res = await createPublication({
        templateName: wallModal.name,
        customName: `wall-${Date.now()}`,
        title,
        data: { eyebrow: '✦ Mur de mots', wishesEnabled: true },
      });
      navigate(`/ewish-admin/wall/${res.data._id}`);
    } catch (err) { setWallError(err.response?.data?.error || 'Erreur'); }
    finally { setWallLoading(false); }
  };

  return (
    <div className="page">

      {/* Wall naming modal */}
      {wallModal && (
        <div className="modal-veil" onMouseDown={e => { if (e.target === e.currentTarget) setWallModal(null); }}>
          <div className="mk-modal">
            <div className="mk-modal-head">
              <div>
                <div className="mk-modal-title">Nomme ta création</div>
                <div className="mk-modal-sub">Pour la retrouver facilement dans tes créations.</div>
              </div>
              <button className="btn-icon" onClick={() => setWallModal(null)}><X size={18} /></button>
            </div>
            <div className="mk-modal-body">
              <div className="field">
                <label className="field-label">Titre</label>
                <input
                  ref={wallRef}
                  className="mk-input"
                  value={wallTitle}
                  onChange={e => { setWallTitle(e.target.value); setWallError(''); }}
                  onKeyDown={e => e.key === 'Enter' && !wallLoading && confirmWall()}
                  placeholder="ex : Mur pour Sarah, Pot de départ Marc…"
                />
                {wallError && <div className="field-error">{wallError}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setWallModal(null)}>Annuler</button>
                <button className="btn btn-primary" onClick={confirmWall} disabled={wallLoading}>
                  {wallLoading ? 'Création…' : <>Configurer le mur <ArrowRight size={15} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-hand">
            {mode === 'wish' ? 'Étape 1 — choisis ton ambiance' : 'Étape 1 — choisis ton mur'}
          </div>
          <h1 className="ph-title">
            {mode === 'wish' ? 'Crée un vœu animé' : 'Crée un mur de mots'}
          </h1>
          <p className="ph-sub">
            {mode === 'wish'
              ? "Chaque template est une petite expérience animée et musicale. Clique pour voir l'aperçu avant de te lancer."
              : `Une page où chacun laisse un mot. Les 5 premiers mots sont gratuits — tu débloqueras ensuite pour aller plus loin.`}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/ewish-admin')}>
          <ArrowLeft size={15} /> Accueil
        </button>
      </div>

      {/* Mode switch pills */}
      <div className="pills" style={{ marginBottom: 'calc(var(--d-gap) + 4px)' }}>
        <button
          className={`pill${mode === 'wish' ? ' on' : ''}`}
          onClick={() => switchMode('wish')}
          style={mode === 'wish' ? { background: 'var(--mk-accent)', borderColor: 'var(--mk-accent)', color: '#fff' } : {}}
        >
          <Sparkles size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />
          Vœux animés
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

      {mode === 'wish' ? (
        <>
          {/* Category pills */}
          <div className="pills" style={{ marginBottom: 'calc(var(--d-gap) + 4px)' }}>
            {WISH_CATS.map(c => (
              <button key={c.id} className={`pill${cat === c.id ? ' on' : ''}`} onClick={() => setCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--mk-line)', borderTopColor: 'var(--mk-accent)', animation: 'mk-spin .75s linear infinite', margin: '0 auto' }} />
            </div>
          ) : wishTemplates.length === 0 ? (
            <div className="empty-state"><div className="e-title">Aucun template</div></div>
          ) : (
            <div className="tpl-grid">
              {wishTemplates.map(tpl => {
                const bg = tpl.thumbnail
                  ? `url(${tpl.thumbnail}) center/cover no-repeat`
                  : (TEMPLATE_COLORS[tpl.name] || 'linear-gradient(145deg,#FFB3C1,#E11D48)');
                return (
                  <button
                    key={tpl._id}
                    className="card card-hover tpl-card"
                    onClick={() => navigate(`/ewish-admin/template/${tpl.name}`)}
                  >
                    <div className="tpl-thumb" style={{ background: bg }}>
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
                          {tpl.creditsRequired ?? 1} crédit{(tpl.creditsRequired ?? 1) > 1 ? 's' : ''}
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
              const bg = tpl.thumbnail
                ? `url(${tpl.thumbnail}) center/cover no-repeat`
                : (TEMPLATE_COLORS[tpl.name] || 'linear-gradient(145deg,#FFB3C1,#E11D48)');
              const desc = WALL_DESCS[tpl.name] || tpl.description || '';
              return (
                <div
                  key={tpl._id}
                  className="card card-hover tpl-card"
                  onClick={() => openWallModal(tpl)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="tpl-thumb" style={{ height: 158, background: bg }} />
                  <div className="tpl-body">
                    <div className="tpl-name">{tpl.label || tpl.name}</div>
                    <div className="tpl-desc">{desc}</div>
                    <div className="tpl-meta">
                      <span className="badge badge-cost">
                        {tpl.creditsRequired ?? 1} crédit{(tpl.creditsRequired ?? 1) > 1 ? 's' : ''}
                      </span>
                      <button className="btn btn-soft btn-sm" onClick={e => { e.stopPropagation(); openWallModal(tpl); }}>
                        Choisir <ArrowRight size={13} />
                      </button>
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
