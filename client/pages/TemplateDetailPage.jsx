import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, Music, Plus } from 'lucide-react';
import { getTemplate, getPremadePublications, createPublication, duplicatePublication } from '../utils/api';

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

  const [tpl, setTpl]           = useState(null);
  const [premades, setPremades] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [picked, setPicked]     = useState(null); // null | 'zero' | premadeId

  /* Naming modal */
  const [naming, setNaming]     = useState(false);
  const [title, setTitle]       = useState('');
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

  const openNaming = () => {
    if (!picked) return;
    setNaming(true); setTitle(''); setTitleErr('');
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const confirmCreate = async () => {
    const t = title.trim();
    if (!t) { setTitleErr('Donne un nom à ta création'); return; }
    setCreating(true); setTitleErr('');
    try {
      if (picked === 'zero' || !premades.length) {
        const res = await createPublication({
          templateName: name,
          customName: `draft-${Date.now()}`,
          title: t,
        });
        navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
      } else {
        const premade = premades.find(p => p._id === picked);
        const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) + '-' + Date.now();
        const res = await duplicatePublication(premade._id, { title: t, customName: slug });
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

  const bg = tpl.thumbnail
    ? `url(${tpl.thumbnail}) center/cover no-repeat`
    : (TEMPLATE_COLORS[tpl.name] || 'linear-gradient(145deg,#FFB3C1,#E11D48)');
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
                <div className="mk-modal-title">Nomme ta création</div>
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
                  {creating ? 'Création…' : <>Ouvrir l'éditeur <ArrowRight size={15} /></>}
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
      <div className="tplv">

        {/* Left: live preview stage */}
        <div>
          <div className="tplv-stage">
            <div style={{ position: 'absolute', inset: 0, background: bg }} />
            {/* Animated scene overlay */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              background: 'rgba(0,0,0,.08)',
            }}>
              <span style={{ fontFamily: 'var(--mk-hand)', fontSize: 22, color: '#fff', opacity: .9 }}>Pour toi,</span>
              <span style={{ fontFamily: 'var(--mk-display)', fontSize: 34, color: '#fff', letterSpacing: '-.01em', textAlign: 'center', padding: '0 24px' }}>
                {tpl.label || tpl.name}
              </span>
              <span style={{ width: 54, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.5)' }} />
            </div>
            {/* "Aperçu animé" pill */}
            <div style={{
              position: 'absolute', left: 16, bottom: 14, display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(4px)',
              borderRadius: 'var(--mk-r-pill)', padding: '7px 14px', fontSize: 12, fontWeight: 700, color: 'var(--mk-ink)',
            }}>
              ▶ Aperçu animé
            </div>
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

        {/* Right: premades + zero + CTA */}
        <div>
          <div className="section-label" style={{ marginBottom: 14 }}>Comment veux-tu démarrer ?</div>

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
              className="btn btn-primary btn-lg"
              disabled={!picked}
              onClick={openNaming}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Créer à partir de ce template <ArrowRight size={16} />
            </button>
            <p style={{ fontSize: 11.5, color: 'var(--mk-ink-3)', textAlign: 'center', lineHeight: 1.5 }}>
              Création et édition gratuites. La publication se débloque avec {tpl.creditsRequired ?? 1} crédit{(tpl.creditsRequired ?? 1) > 1 ? 's' : ''}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
