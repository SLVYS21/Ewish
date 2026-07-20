import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, X, Sparkles, MessageSquare, MailOpen,
  Cake, Heart, Baby, Waves, Hand, Feather,
} from 'lucide-react';
import { getTemplates, createPublication } from '../utils/api';

/* ─────────────────────────────────────────────────────────── */
/* Wall event catalog                                          */
/* Utilisé pour générer titre, sous-titre et confettis */
/* ─────────────────────────────────────────────────────────── */
const WALL_EVENTS = [
  { id: 'anniversary', label: 'Anniversaire',        Icon: Cake,           festive: true,
    title: (n) => `Joyeux anniversaire, ${n}`,
    subtitle: () => 'Laisse un mot doux pour cet anniversaire.',
    eyebrow: '✦ Anniversaire' },
  { id: 'wedding',     label: 'Mariage',             Icon: Heart, festive: true,
    title: (n) => `Le mariage de ${n}`,
    subtitle: () => 'Un mot pour les jeunes mariés.',
    eyebrow: '✦ Mariage' },
  { id: 'birth',       label: 'Naissance',           Icon: Baby,           festive: true,
    title: (n) => `Bienvenue à ${n}`,
    subtitle: () => 'Un mot doux pour son arrivée.',
    eyebrow: '✦ Naissance' },
  { id: 'farewell',    label: 'Pot de départ',       Icon: Waves,          festive: true,
    title: (n) => `Bon départ, ${n}`,
    subtitle: () => 'Un mot pour son nouveau chapitre.',
    eyebrow: '✦ Pot de départ' },
  { id: 'welcome',     label: "Bienvenue équipe",     Icon: Hand,           festive: true,
    title: (n) => `Bienvenue, ${n}`,
    subtitle: () => 'Un mot chaleureux pour son arrivée.',
    eyebrow: '✦ Bienvenue' },
  { id: 'thanks',      label: 'Remerciement',        Icon: Heart,          festive: false,
    title: (n) => `Merci, ${n}`,
    subtitle: () => 'Un mot pour dire merci.',
    eyebrow: '✦ Remerciement' },
  { id: 'tribute',     label: 'Hommage',             Icon: Feather,        festive: false,
    title: (n) => `En mémoire de ${n}`,
    subtitle: () => 'Un mot doux, un souvenir partagé.',
    eyebrow: '✦ Hommage' },
  { id: 'other',       label: 'Autre',               Icon: Sparkles,       festive: false,
    title: (n) => `Pour ${n}`,
    subtitle: () => 'Un mot pour cette personne.',
    eyebrow: '✦ Mur de mots' },
];

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

const WALL_DESCS = {
  'wall-of-wishes':        'Les mots apparaissent comme de petites cartes pastel. Chaleureux et festif.',
  'wall-of-wishes-3d':     'Les mots flottent en profondeur dans un espace 3D spectaculaire.',
  'wall-of-wishes-modern': 'Glassmorphisme épuré : cartes translucides. Élégant et contemporain.',
  'wall-of-wishes-space':  "Chaque mot est une étoile dans une galaxie que l'on explore.",
};

/* Deux murs actifs : classique + moderne. Les variantes 3d/space ont été
   supprimées de la DB (voir memory/project_walls_flow.md). */
const WALL_TEMPLATES = new Set(['wall-of-wishes','wall-of-wishes-modern']);

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
  const modeParam = searchParams.get('mode');
  const initialMode = modeParam === 'wall' ? 'wall' : modeParam === 'invitation' ? 'invitation' : 'wish';
  const [mode, setMode] = useState(initialMode);
  const [cat, setCat] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Wall preview sheet (bottom drawer) */
  const [wallSheet, setWallSheet]   = useState(null); // tpl being previewed

  /* Wall naming modal */
  const [wallModal, setWallModal]     = useState(null);
  const [wallEventId, setWallEventId] = useState('anniversary');
  const [wallRecipient, setWallRecipient] = useState('');
  const [wallTitle, setWallTitle]     = useState(''); // used only for invitation flow
  const [wallError, setWallError]     = useState('');
  const [wallLoading, setWallLoading] = useState(false);
  const wallRef = useRef(null);

  const currentEvent = useMemo(
    () => WALL_EVENTS.find(e => e.id === wallEventId) || WALL_EVENTS[0],
    [wallEventId]
  );
  const previewTitle = wallRecipient.trim()
    ? currentEvent.title(wallRecipient.trim())
    : '';

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
  const wishTemplates = templates
    .filter(t => !WALL_TEMPLATES.has(t.name) && !isInvitationTpl(t))
    .filter(t => cat === 'all' || TEMPLATE_CAT[t.name] === cat);
  const wallTemplates = templates.filter(t => WALL_TEMPLATES.has(t.name));
  const invitationTemplates = templates.filter(isInvitationTpl);

  /* Open wall naming modal */
  const openWallModal = (tpl) => {
    setWallModal(tpl);
    setWallTitle('');
    setWallRecipient('');
    setWallEventId('anniversary');
    setWallError('');
    setTimeout(() => wallRef.current?.focus(), 80);
  };

  const confirmWall = async () => {
    const isInvitation = wallModal.kind === 'invitation';

    let title, data;
    if (isInvitation) {
      title = wallTitle.trim();
      if (!title) { setWallError('Donne un nom à cette création'); return; }
      data = { titleName: title, subtitle: wallModal.defaultData?.subtitle || '' };
    } else {
      const recipient = wallRecipient.trim();
      if (!recipient) { setWallError('Indique le prénom du destinataire.'); return; }
      title = currentEvent.title(recipient);
      data = {
        eyebrow:   currentEvent.eyebrow,
        titleName: recipient,
        subtitle:  currentEvent.subtitle(recipient),
        occasion:  currentEvent.id,
        occasionLabel: currentEvent.label,
        recipient,
        festive:   currentEvent.festive,
        wishesEnabled: true,
      };
    }

    setWallLoading(true); setWallError('');
    try {
      const slugPrefix = isInvitation ? 'invit' : 'wall';
      const res = await createPublication({
        templateName: wallModal.name,
        customName:   `${slugPrefix}-${Date.now()}`,
        title,
        data,
      });
      const destination = isInvitation
        ? `/ewish-admin/ewish/edit/${res.data._id}`
        : `/ewish-admin/wall/${res.data._id}`;
      navigate(destination);
    } catch (err) { setWallError(err.response?.data?.error || 'Erreur'); }
    finally { setWallLoading(false); }
  };

  return (
    <div className="page">

      {/* Wall preview sheet */}
      {wallSheet && (
        <div className="wall-sheet-veil" onMouseDown={e => { if (e.target === e.currentTarget) setWallSheet(null); }}>
          <div className="wall-sheet">
            <div className="wall-sheet-grip" />
            <div className="wall-sheet-head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="wall-sheet-title">{wallSheet.label || wallSheet.name}</div>
                <div className="wall-sheet-desc">{WALL_DESCS[wallSheet.name] || wallSheet.description || ''}</div>
              </div>
              <button className="btn-icon" onClick={() => setWallSheet(null)}><X size={18} /></button>
            </div>
            <div className="wall-sheet-preview">
              <iframe
                src={`${import.meta.env.VITE_API_URL}/preview/${wallSheet.name}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                title={wallSheet.label || wallSheet.name}
                allow="autoplay"
              />
            </div>
            <div className="wall-sheet-foot">
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setWallSheet(null)}>
                Voir les autres
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setWallSheet(null); openWallModal(wallSheet); }}
              >
                Créer ce mur <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wall naming modal */}
      {wallModal && (
        <div className="modal-veil" onMouseDown={e => { if (e.target === e.currentTarget) setWallModal(null); }}>
          <div className="mk-modal" style={wallModal.kind === 'invitation' ? {} : { width: 520 }}>
            <div className="mk-modal-head">
              <div>
                <div className="mk-modal-title">
                  {wallModal.kind === 'invitation' ? 'Nomme ta création' : 'Pour qui et quelle occasion ?'}
                </div>
                <div className="mk-modal-sub">
                  {wallModal.kind === 'invitation'
                    ? 'Pour la retrouver facilement dans tes créations.'
                    : 'On génère le titre du mur et l’intro pour toi.'}
                </div>
              </div>
              <button className="btn-icon" onClick={() => setWallModal(null)}><X size={18} /></button>
            </div>
            <div className="mk-modal-body">
              {wallModal.kind === 'invitation' ? (
                <div className="field">
                  <label className="field-label">Titre</label>
                  <input
                    ref={wallRef}
                    className="mk-input"
                    value={wallTitle}
                    onChange={e => { setWallTitle(e.target.value); setWallError(''); }}
                    onKeyDown={e => e.key === 'Enter' && !wallLoading && confirmWall()}
                    placeholder="ex : Anniversaire de Sarah, Pot de départ Marc…"
                  />
                </div>
              ) : (
                <>
                  <div className="field">
                    <label className="field-label">L’occasion</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {WALL_EVENTS.map(ev => {
                        const on = ev.id === wallEventId;
                        const Ico = ev.Icon;
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            className={`pill${on ? ' on' : ''}`}
                            onClick={() => { setWallEventId(ev.id); setWallError(''); }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            <Ico size={14} />
                            {ev.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Pour qui ce mur ?</label>
                    <div className="field-hint" style={{ marginBottom: 4 }}>Prénom ou nom du destinataire — apparaîtra dans le titre.</div>
                    <input
                      ref={wallRef}
                      className="mk-input"
                      value={wallRecipient}
                      onChange={e => { setWallRecipient(e.target.value); setWallError(''); }}
                      onKeyDown={e => e.key === 'Enter' && !wallLoading && confirmWall()}
                      placeholder="Sarah, Léa & Karim, l’équipe RH…"
                    />
                  </div>

                  {previewTitle && (
                    <div style={{
                      background: 'var(--mk-blush)', border: '1px solid var(--mk-line-2)',
                      borderRadius: 'var(--mk-r-sm)', padding: '14px 16px',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--mk-ink-3)', marginBottom: 6 }}>
                        Aperçu du mur
                      </div>
                      <div style={{ fontFamily: 'var(--mk-display)', fontSize: 22, lineHeight: 1.2, letterSpacing: '-.01em' }}>
                        {previewTitle}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--mk-ink-2)', marginTop: 4 }}>
                        {currentEvent.subtitle(wallRecipient.trim())}
                      </div>
                    </div>
                  )}
                </>
              )}

              {wallError && <div className="field-error">{wallError}</div>}

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
              ? "Chaque template est une petite expérience animée et musicale. Clique pour voir l'aperçu avant de te lancer."
              : mode === 'wall'
                ? 'Une page où chacun laisse un mot. Les 10 premiers mots sont gratuits  tu débloqueras ensuite pour aller plus loin.'
                : 'Tes invités répondent en un clic, leurs mots se posent sur un mur intégré, et tu suis tout en temps réel.'}
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
        <button
          className={`pill${mode === 'invitation' ? ' on' : ''}`}
          onClick={() => switchMode('invitation')}
          style={mode === 'invitation' ? { background: '#7C5CC9', borderColor: '#7C5CC9', color: '#fff' } : {}}
        >
          <MailOpen size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />
          Invitations
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
                  onClick={() => openWallModal(tpl)}
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
      ) : mode === 'wish' ? (
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
                  onClick={() => setWallSheet(tpl)}
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
