import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, Music, Plus, Smartphone, Monitor, Zap } from 'lucide-react';
import { getTemplate, getPremadePublications, createPublication, duplicatePublication } from '../utils/api';
import { loadContext, clearContext } from '../create-flow/context';

const WALL_TEMPLATES = new Set(['wall-of-wishes','wall-of-wishes-3d','wall-of-wishes-modern','wall-of-wishes-craft','wall-of-wishes-space']);

const TEMPLATE_COLORS = {
  birthday:               'linear-gradient(145deg,#FFB3C1 0%,#FF8DAA 100%)',
  special:                'linear-gradient(145deg,#D7C5F2 0%,#B59CF0 100%)',
  'collective-family':    'linear-gradient(145deg,#C9EEDF 0%,#9FE3CB 100%)',
  'collective-pro':       'linear-gradient(145deg,#FFE7AD 0%,#FFC95A 100%)',
  forever:                'linear-gradient(145deg,#EDD5F5 0%,#C9A0E0 100%)',
  sanctuary:              'linear-gradient(145deg,#D7C5F2 0%,#9B7EE2 100%)',
  'notre-film':           'linear-gradient(145deg,#FDBCCA 0%,#E88FA8 100%)',
};

const TEMPLATE_CATS = {
  birthday: 'Anniversaire', forever: 'Amour', 'notre-film': 'Amour',
  'collective-pro': 'Pro / RH', 'collective-family': 'Pro / RH',
  special: 'Spécial', sanctuary: 'Spécial',
};

const TEMPLATE_FEATURES = {
  birthday:            ['Animation confettis', 'Musique incluse', 'Message personnalisé'],
  special:             ['Ambiance unique', 'Musique incluse', 'Effets visuels'],
  'collective-family': ['Multi-contributeurs', 'Partage facile', 'Accessible'],
  'collective-pro':    ['Ton pro', 'Multi-contributeurs', 'Partage facile'],
  forever:             ['Romantique', 'Musique incluse', 'Effets visuels'],
  sanctuary:           ['Poétique', 'Musique incluse', 'Effets doux'],
  'notre-film':        ['Cinématique', 'Musique incluse', 'Effets spéciaux'],
};

export default function TemplateDetailPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tpl, setTpl]           = useState(null);
  const [premades, setPremades] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [picked, setPicked]     = useState(null); // null | 'zero' | premadeId
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile' | 'desktop'

  /* Naming modal — le titre est pré-rempli depuis /create (query params ou
     sessionStorage) si l'utilisateur arrive du wizard front-door. */
  const prefillTitle = useMemo(() => {
    const fromQuery = searchParams.get('title');
    if (fromQuery) return fromQuery;
    const ctx = loadContext();
    if (ctx && ctx.type === 'wish') return ctx.title || '';
    return '';
  }, [searchParams]);

  const [naming, setNaming]     = useState(false);
  const [title, setTitle]       = useState(prefillTitle);
  const [titleErr, setTitleErr] = useState('');
  const [creating, setCreating] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tplRes, pRes] = await Promise.all([
          getTemplate(name),
          getPremadePublications(),
        ]);
        setTpl(tplRes.data);
        const filtered = (pRes.data || []).filter(p => p.templateName === name);
        setPremades(filtered);
      } catch {
        navigate('/ewish-admin/templates');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [name, navigate]);

  const isWall = WALL_TEMPLATES.has(name);

  const previewSrc = useMemo(() => {
    if (picked && picked !== 'zero') {
      const p = premades.find(x => x._id === picked);
      if (p) return `${import.meta.env.VITE_API_URL}/site/${p.templateName}/${p.customName}?preview=1`;
    }
    return `${import.meta.env.VITE_API_URL}/preview/${name}`;
  }, [picked, premades, name]);

  const openNaming = () => {
    if (!isWall && !picked) return;
    setNaming(true);
    /* Ne pas écraser le titre pré-rempli depuis /create (garde la valeur
       actuelle si l'utilisateur ne l'a pas encore modifiée). */
    setTitleErr('');
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const confirmCreate = async () => {
    const t = title.trim();
    if (!t) { setTitleErr('Donne un nom à ta création'); return; }
    setCreating(true); setTitleErr('');
    try {
      if (isWall || picked === 'zero' || !premades.length) {
        const res = await createPublication({
          templateName: name,
          customName: isWall ? `wall-${Date.now()}` : `draft-${Date.now()}`,
          title: t,
          ...(isWall ? { data: { eyebrow: '✦ Mur de mots', wishesEnabled: true } } : {}),
        });
        clearContext();
        navigate(isWall ? `/ewish-admin/wall/${res.data._id}` : `/ewish-admin/ewish/edit/${res.data._id}`);
      } else {
        const premade = premades.find(p => p._id === picked);
        const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) + '-' + Date.now();
        const res = await duplicatePublication(premade._id, { title: t, customName: slug });
        clearContext();
        navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
      }
    } catch (e) { setTitleErr(e.response?.data?.error || 'Erreur'); }
    finally { setCreating(false); }
  };

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--mk-line)', borderTopColor: 'var(--mk-accent)', animation: 'mk-spin .75s linear infinite' }} />
    </div>
  );

  if (!tpl) return (
    <div className="page">
      <div className="empty-state"><div className="e-title">Template introuvable</div></div>
    </div>
  );

  const cat = TEMPLATE_CATS[tpl.name] || 'Vœu animé';
  const features = TEMPLATE_FEATURES[tpl.name] || ['Animation', 'Musique incluse', 'Personnalisable'];

  return (
    <div className="page">

      {/* Naming modal */}
      {naming && (
        <div className="modal-veil" onMouseDown={e => { if (e.target === e.currentTarget) { setNaming(false); } }}>
          <div className="mk-modal">
            <div className="mk-modal-head">
              <div>
                <div className="mk-modal-title">Qui est l'heureux(se) ?</div>
                <div className="mk-modal-sub">Pour la retrouver facilement dans tes créations.</div>
              </div>
              <button className="btn-icon" onClick={() => setNaming(false)}><X size={18} /></button>
            </div>
            <div className="mk-modal-body">
              <div className="field">
                <label className="field-label">Titre</label>
                <input
                  ref={inputRef}
                  className="mk-input"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setTitleErr(''); }}
                  onKeyDown={e => e.key === 'Enter' && !creating && confirmCreate()}
                  placeholder="ex : Anniversaire de Sarah, Pot de départ Alex…"
                />
                {titleErr && <div className="field-error">{titleErr}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setNaming(false)}>Annuler</button>
                <button className="btn btn-primary" onClick={confirmCreate} disabled={creating}>
                  {creating ? 'Création…' : isWall ? <>Configurer le mur <ArrowRight size={15} /></> : <>Ouvrir l'éditeur <ArrowRight size={15} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-hand">{cat}</div>
          <h1 className="ph-title">{tpl.label || tpl.name}</h1>
          <p className="ph-sub">{tpl.description || ''}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/ewish-admin/templates')}>
          <ArrowLeft size={15} /> Tous les templates
        </button>
      </div>

      {/* Two-column layout */}
      <div className="tplv" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: 32, alignItems: 'start' }}>

        {/* Left: live preview stage with device frame switcher */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--mk-ink-2)' }}>Aperçu du rendu</span>
            <div style={{ display: 'inline-flex', background: 'var(--mk-bg-subtle, #F3F1ED)', padding: 3, borderRadius: 10, gap: 2 }}>
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 7,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: viewMode === 'mobile' ? '#fff' : 'transparent',
                  color: viewMode === 'mobile' ? 'var(--mk-ink)' : 'var(--mk-ink-3)',
                  boxShadow: viewMode === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Smartphone size={13} /> Mobile
              </button>
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 7,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: viewMode === 'desktop' ? '#fff' : 'transparent',
                  color: viewMode === 'desktop' ? 'var(--mk-ink)' : 'var(--mk-ink-3)',
                  boxShadow: viewMode === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Monitor size={13} /> Bureau
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #F8F7F5 0%, #EDE9E3 100%)',
            padding: viewMode === 'mobile' ? '28px 16px' : '16px',
            borderRadius: 24,
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            {viewMode === 'mobile' ? (
              <div style={{
                width: '100%',
                maxWidth: 320,
                height: 560,
                background: '#000',
                borderRadius: 36,
                border: '6px solid #222',
                boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 90,
                  height: 16,
                  background: '#222',
                  borderRadius: 10,
                  zIndex: 10
                }} />
                <iframe
                  src={previewSrc}
                  style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                  title={tpl.label || tpl.name}
                  allow="autoplay"
                />
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: 480,
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #D5D0C7',
                boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  height: 28,
                  background: '#F3F1ED',
                  borderBottom: '1px solid #E5E0D8',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  gap: 6
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F56' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFBD2E' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27C93F' }} />
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#888' }}>mykado.store</span>
                </div>
                <iframe
                  src={previewSrc}
                  style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
                  title={tpl.label || tpl.name}
                  allow="autoplay"
                />
              </div>
            )}
          </div>

          {/* Feature badges */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 13 }}>
            {features.map(f => (
              <span key={f} className="badge" style={{ background: 'var(--mk-blush)', color: 'var(--mk-ink-2)', fontWeight: 700 }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div>
          {isWall ? (
            <div>
              <div className="section-label" style={{ marginBottom: 14 }}>À propos de ce mur</div>
              <p style={{ fontSize: 13.5, color: 'var(--mk-ink-2)', lineHeight: 1.6, marginBottom: 18 }}>
                {tpl.description || "Une page où chacun peut laisser un message. Partage le lien et les mots s'accumulent en temps réel."}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => { setNaming(true); setTitle(''); setTitleErr(''); setTimeout(() => inputRef.current?.focus(), 80); }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Configurer ce mur <ArrowRight size={16} />
                </button>
                <p style={{ fontSize: 11.5, color: 'var(--mk-ink-3)', textAlign: 'center', lineHeight: 1.5 }}>
                  Les 10 premiers mots sont gratuits. Tu débloqueras ensuite pour aller plus loin.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Wizard Fast-Track Box */}
              <div style={{
                background: '#FFF5F6',
                border: '1.5px solid rgba(225, 29, 72, 0.25)',
                borderRadius: 18,
                padding: 18,
                marginBottom: 20,
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--mk-rose, #E11D48)', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  <Zap size={15} /> Le plus rapide
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: 'var(--mk-ink)' }}>Création Express pas à pas</h3>
                <p style={{ margin: '0 0 14px 0', fontSize: 13, color: 'var(--mk-ink-2)', lineHeight: 1.4 }}>
                  Remplis le prénom, ton mot doux et choisis le fond en 1 minute.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/ewish-admin/ewish/new?occ=${name}`)}
                  style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                >
                  <span>Créer en 5 étapes simples</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="section-label" style={{ marginBottom: 14 }}>Ou démarrer avec l'éditeur avancé</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {/* Premade options */}
                {premades.map(p => {
                  const swatchBg = p.thumbnail
                    ? `url(${p.thumbnail}) center/cover no-repeat`
                    : (TEMPLATE_COLORS[p.templateName] || 'linear-gradient(145deg,#FFB3C1,#FF8DAA)');
                  return (
                    <button
                      key={p._id}
                      className={`premade-row${picked === p._id ? ' on' : ''}`}
                      onClick={() => setPicked(p._id)}
                    >
                      <span className="premade-swatch" style={{ background: swatchBg }} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 800 }}>
                          {p.premadeLabel || p.title}
                          <span className="badge" style={{ background: 'var(--mk-mint-soft)', color: 'var(--mk-mint)' }}>Préfait</span>
                        </span>
                        {p.premadeDescription && (
                          <span style={{ display: 'block', fontSize: 12, color: 'var(--mk-ink-2)', marginTop: 2 }}>{p.premadeDescription}</span>
                        )}
                        {p.data?.music && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--mk-ink-3)', marginTop: 4 }}>
                            <Music size={12} /> {p.data.music}
                          </span>
                        )}
                      </span>
                      {picked === p._id && <Check size={18} style={{ color: 'var(--mk-accent)', flexShrink: 0 }} />}
                    </button>
                  );
                })}

                {/* Partir de zéro */}
                <button
                  className={`premade-row${picked === 'zero' ? ' on' : ''}`}
                  onClick={() => setPicked('zero')}
                >
                  <span className="premade-swatch" style={{
                    border: '1.5px dashed var(--mk-line-strong)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--mk-ink-3)', background: 'none',
                  }}>
                    <Plus size={18} />
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800 }}>Partir de zéro</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--mk-ink-2)', marginTop: 2 }}>
                      Tu choisis toi-même le fond, les décorations et la musique.
                    </span>
                  </span>
                  {picked === 'zero' && <Check size={18} style={{ color: 'var(--mk-accent)', flexShrink: 0 }} />}
                </button>
              </div>

              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  className="btn btn-ghost btn-lg"
                  disabled={!picked}
                  onClick={openNaming}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Ouvrir l'éditeur complet <ArrowRight size={16} />
                </button>
                <p style={{ fontSize: 11.5, color: 'var(--mk-ink-3)', textAlign: 'center', lineHeight: 1.5 }}>
                  Création et édition gratuites. La publication se débloque pour {(tpl.priceFCFA ?? 500).toLocaleString('fr-FR')} FCFA.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
