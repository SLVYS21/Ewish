import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Sparkles, MessageSquare, Wallet, Edit2, Share2, Trash2, Copy } from 'lucide-react';
import {
  getPublications, deletePublication, duplicatePublication, createPublication,
} from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';

const TEMPLATE_COLORS = {
  birthday:               'linear-gradient(135deg,#FFB3C1,#FF8DAA)',
  special:                'linear-gradient(135deg,#D7C5F2,#B59CF0)',
  'collective-family':    'linear-gradient(135deg,#C9EEDF,#9FE3CB)',
  'collective-pro':       'linear-gradient(135deg,#FFE7AD,#FFC95A)',
  forever:                'linear-gradient(135deg,#F8C8DC,#E8B0CC)',
  sanctuary:              'linear-gradient(135deg,#D7C5F2,#9B7EE2)',
  'notre-film':           'linear-gradient(135deg,#C2D5F0,#8FB0D8)',
  'wall-of-wishes':       'linear-gradient(135deg,#FFB3C1,#E11D48)',
  'wall-of-wishes-3d':    'linear-gradient(135deg,#FFD7C2,#FF9F7A)',
  'wall-of-wishes-modern':'linear-gradient(135deg,#ccc0f5,#e8b0d8)',
  'wall-of-wishes-space': 'linear-gradient(135deg,#ff8060,#d83070)',
};

const WALL_TEMPLATES = new Set(['wall-of-wishes','wall-of-wishes-3d','wall-of-wishes-modern','wall-of-wishes-space']);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pubs, setPubs]           = useState([]);
  const [loading, setLoading]     = useState(true);

  /* Name modal state */
  const [nameModal, setNameModal]   = useState(null);
  const [nameInput, setNameInput]   = useState('');
  const [nameError, setNameError]   = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const nameRef = useRef(null);

  /* Dup modal state */
  const [dupModal, setDupModal]     = useState(null);
  const [dupTitle, setDupTitle]     = useState('');
  const [dupError, setDupError]     = useState('');
  const [dupLoading, setDupLoading] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bel après-midi';
    return 'Bonsoir';
  }, []);

  const displayName = user?.name || '';

  useEffect(() => {
    getPublications({ mine: 'true', limit: 4 })
      .then(r => setPubs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openNameModal = (templateName) => {
    setNameModal({ templateName });
    setNameInput(''); setNameError('');
    setTimeout(() => nameRef.current?.focus(), 80);
  };

  const confirmCreate = async () => {
    const title = nameInput.trim();
    if (!title) { setNameError('Donne un nom à ta création'); return; }
    setNameLoading(true); setNameError('');
    try {
      const res = await createPublication({ templateName: nameModal.templateName, customName: `draft-${Date.now()}`, title });
      setNameModal(null);
      navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
    } catch (e) { setNameError(e.response?.data?.error || 'Erreur'); }
    finally { setNameLoading(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette création définitivement ?')) return;
    await deletePublication(id);
    setPubs(p => p.filter(x => x._id !== id));
  };

  const openDup = (pub, e) => {
    e.stopPropagation();
    setDupModal(pub); setDupTitle(pub.title + ' (copie)'); setDupError('');
  };

  const confirmDup = async () => {
    if (!dupTitle.trim()) { setDupError('Titre requis'); return; }
    setDupLoading(true); setDupError('');
    try {
      const slug = dupTitle.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)+'-'+Date.now();
      const r = await duplicatePublication(dupModal._id, { title: dupTitle.trim(), customName: slug });
      setPubs(p => [r.data, ...p.slice(0,3)]); setDupModal(null);
      navigate(`/ewish-admin/ewish/edit/${r.data._id}`);
    } catch (e) { setDupError(e.response?.data?.error || 'Erreur'); }
    finally { setDupLoading(false); }
  };

  return (
    <div className="page">

      {/* ── Name modal ── */}
      {nameModal && (
        <div className="modal-veil" onMouseDown={(e) => { if (e.target === e.currentTarget) setNameModal(null); }}>
          <div className="mk-modal">
            <div className="mk-modal-head">
              <div>
                <div className="mk-modal-title">Nomme ta création</div>
                <div className="mk-modal-sub">Pour la retrouver facilement.</div>
              </div>
              <button className="btn-icon" onClick={() => setNameModal(null)}><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></button>
            </div>
            <div className="mk-modal-body">
              <div className="field">
                <label className="field-label">Titre</label>
                <input
                  ref={nameRef}
                  className="mk-input"
                  value={nameInput}
                  onChange={e => { setNameInput(e.target.value); setNameError(''); }}
                  onKeyDown={e => e.key === 'Enter' && !nameLoading && confirmCreate()}
                  placeholder="ex : Anniversaire de Sarah, Pot de départ Alex…"
                />
                {nameError && <div className="field-error">{nameError}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setNameModal(null)}>Annuler</button>
                <button className="btn btn-primary" onClick={confirmCreate} disabled={nameLoading}>
                  {nameLoading ? 'Création…' : <>Commencer <ArrowRight size={15} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Dup modal ── */}
      {dupModal && (
        <div className="modal-veil" onMouseDown={(e) => { if (e.target === e.currentTarget) setDupModal(null); }}>
          <div className="mk-modal">
            <div className="mk-modal-head">
              <div>
                <div className="mk-modal-title">Dupliquer la création</div>
                <div className="mk-modal-sub">Une copie brouillon sera créée.</div>
              </div>
              <button className="btn-icon" onClick={() => setDupModal(null)}><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></button>
            </div>
            <div className="mk-modal-body">
              <div className="field">
                <label className="field-label">Titre de la copie</label>
                <input className="mk-input" value={dupTitle} onChange={e => setDupTitle(e.target.value)} autoFocus />
                {dupError && <div className="field-error">{dupError}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setDupModal(null)}>Annuler</button>
                <button className="btn btn-primary" onClick={confirmDup} disabled={dupLoading}>
                  {dupLoading ? 'Duplication…' : <><Copy size={14} /> Dupliquer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="ph">
        <div>
          <div className="ph-hand">{greeting}{displayName ? `, ${displayName}` : ''}</div>
          <h1 className="ph-title">Prêt à créer quelque chose ?</h1>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/ewish-admin/credits')} style={{ gap: 7 }}>
          <Wallet size={14} style={{ color: 'var(--mk-butter)' }} />
          <strong>{user?.credits ?? 0}</strong>
          <span style={{ color: 'var(--mk-ink-3)', fontWeight: 600 }}>crédit{(user?.credits ?? 0) !== 1 ? 's' : ''}</span>
        </button>
      </div>

      {/* ── Two action cards ── */}
      <div className="home-duo">
        <button
          className="home-action"
          onClick={() => navigate('/ewish-admin/templates?mode=wish')}
          style={{ background: 'linear-gradient(135deg, #fff0f3 0%, #fff 60%)' }}
        >
          <span className="ha-go"><ArrowRight size={17} /></span>
          <span className="icon-bubble" style={{ background: 'var(--mk-accent-pale)', color: 'var(--mk-accent)', marginBottom: 6 }}>
            <Sparkles size={17} />
          </span>
          <div className="ha-title">Créer un vœu animé</div>
          <p className="ha-sub">Un message animé et musical pour une personne spéciale.</p>
        </button>

        <button
          className="home-action"
          onClick={() => navigate('/ewish-admin/templates?mode=wall')}
          style={{ background: 'linear-gradient(135deg, #f6eefb 0%, #fff 60%)' }}
        >
          <span className="ha-go" style={{ background: 'var(--mk-lilac)' }}><ArrowRight size={17} /></span>
          <span className="icon-bubble" style={{ background: 'var(--mk-lilac-soft)', color: 'var(--mk-lilac)', marginBottom: 6 }}>
            <MessageSquare size={17} />
          </span>
          <div className="ha-title">Créer un mur de mots</div>
          <p className="ha-sub">Une page où chacun laisse un mot. Les 5 premiers mots sont gratuits.</p>
        </button>
      </div>

      {/* ── Recent creations ── */}
      {!loading && pubs.length > 0 && (
        <div style={{ marginTop: 'calc(var(--d-gap) + 16px)' }}>
          <div className="section-label" style={{ justifyContent: 'space-between' }}>
            <span>Reprendre où tu en étais</span>
            <button
              className="btn btn-sm"
              style={{ color: 'var(--mk-accent)', padding: '2px 6px', letterSpacing: 0, textTransform: 'none', fontSize: 12 }}
              onClick={() => navigate('/ewish-admin/ewish')}
            >
              Tout voir <ArrowRight size={13} />
            </button>
          </div>

          <div className="crea-list">
            {pubs.map(pub => {
              const bg = TEMPLATE_COLORS[pub.templateName] || 'linear-gradient(135deg,#FFB3C1,#E11D48)';
              const isWall = WALL_TEMPLATES.has(pub.templateName);
              const isDraft = !pub.published;
              const editPath = isWall
                ? `/ewish-admin/wall/${pub._id}`
                : `/ewish-admin/ewish/edit/${pub._id}`;

              return (
                <div
                  key={pub._id}
                  className="card card-hover crea-row"
                  onClick={() => navigate(editPath)}
                >
                  <div className="crea-thumb" style={{ background: bg }} />
                  <div className="crea-main">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span className="crea-title">{pub.title || 'Sans titre'}</span>
                      {isDraft
                        ? <span className="badge badge-draft">Brouillon</span>
                        : <span className="badge badge-live">En ligne</span>}
                    </div>
                    <div className="crea-sub">
                      <span>{pub.templateName}</span>
                      {pub.customName && <><span style={{ opacity: .5 }}>·</span><span>{pub.customName}</span></>}
                    </div>
                  </div>
                  <div className="crea-actions" onClick={e => e.stopPropagation()}>
                    {pub.published && (
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/ewish-admin/share/${pub._id}`)}>
                        <Share2 size={13} /> Partager
                      </button>
                    )}
                    <button className="btn-icon" title="Modifier" onClick={() => navigate(editPath)}>
                      <Edit2 size={15} />
                    </button>
                    <button className="btn-icon" title="Dupliquer" onClick={e => openDup(pub, e)}>
                      <Copy size={15} />
                    </button>
                    <button className="btn-icon" title="Supprimer" style={{ color: 'var(--mk-accent)' }} onClick={e => handleDelete(pub._id, e)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && pubs.length === 0 && (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <div className="e-title">Rien encore par ici</div>
          <p style={{ fontSize: 13 }}>Crée ton premier vœu ou ton premier mur depuis les cartes ci-dessus.</p>
        </div>
      )}
    </div>
  );
}
