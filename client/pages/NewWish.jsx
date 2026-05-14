import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTemplates, createPublication } from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import PaymentModal from '../admin/components/PaymentModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import styles from './NewWish.module.css';

const TEMPLATE_ICONS = {
  birthday: '🎂', special: '✨', 'collective-family': '👨‍👩‍👧',
  'collective-pro': '🏢', forever: '❤️', sanctuary: '🌸', 'notre-film': '🎬',
};
const TEMPLATE_COLORS = {
  birthday: 'linear-gradient(135deg,#ff6b9d,#ff8e53)',
  special:  'linear-gradient(135deg,#a78bfa,#60a5fa)',
  'collective-family': 'linear-gradient(135deg,#34d399,#06b6d4)',
  'collective-pro':    'linear-gradient(135deg,#c9a84c,#e8c86a)',
  forever:  'linear-gradient(135deg,#f472b6,#ec4899)',
  sanctuary:'linear-gradient(135deg,#818cf8,#c084fc)',
  'notre-film': 'linear-gradient(135deg,#475569,#0ea5e9)',
};

export default function NewWish() {
  const [templates, setTemplates] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [dropOpen,  setDropOpen]  = useState(false);
  const [tplSearch, setTplSearch] = useState('');
  const [form, setForm]           = useState({ title: '', customName: '', recipientName: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const dropRef  = useRef(null);

  useEffect(() => {
    getTemplates()
      .then(r => {
        setTemplates(r.data);
        if (r.data.length > 0) setSelected(r.data[0]);
      })
      .catch(() => {
        const fb = [{ name: 'birthday', label: 'Birthday Wish', description: 'Animated birthday card with music, confetti & more.' }];
        setTemplates(fb); setSelected(fb[0]);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toSlug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true); setError('');
    try {
      const slug = toSlug(form.customName || form.title || form.recipientName || 'wish');
      const res = await createPublication({
        templateName: selected.name, customName: slug,
        title: form.title || `${form.recipientName}'s Birthday`,
        data: { ...(selected.defaultData || {}), name: form.recipientName, waName: form.recipientName, waAvatar: form.recipientName?.charAt(0)?.toUpperCase() || 'A' },
        style: selected.defaultStyle || {},
      });
      if (user?.role === 'merchant') {
        setUser({ ...user, credits: Math.max(0, user.credits - (selected.creditsRequired || 1)) });
      }
      navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
      setLoading(false);
    }
  };

  const filtered = templates.filter(t =>
    !tplSearch || t.label?.toLowerCase().includes(tplSearch.toLowerCase()) || t.name?.toLowerCase().includes(tplSearch.toLowerCase())
  );


  const VITE_API = import.meta.env.VITE_API_URL || '';

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link to="/ewish-admin/ewish" className={styles.back}>← Retour</Link>
        <div className={styles.logo}>🎂 myKado</div>
        <div />
      </header>

      <div className={styles.body}>
        <div className={styles.left}>
          <h1>Créer une publication</h1>
          <p className={styles.sub}>Choisissez un template et personnalisez-le en quelques clics.</p>

          {/* ── Template Dropdown ── */}
          <h2 className={styles.stepLabel}>1. Choisissez un template</h2>
          <div className={styles.dropWrapper} ref={dropRef}>
            <button
              type="button"
              className={styles.dropTrigger}
              onClick={() => setDropOpen(o => !o)}
            >
              {selected ? (
                <span className={styles.dropSelected}>
                  <span 
                    className={styles.dropThumb} 
                    style={{
                      background: selected.thumbnail ? `url(${selected.thumbnail}) center/cover no-repeat` : (TEMPLATE_COLORS[selected.name] || '#667eea')
                    }}
                  >
                    {!selected.thumbnail && (TEMPLATE_ICONS[selected.name] || '✨')}
                  </span>
                  <span className={styles.dropInfo}>
                    <strong>{selected.label}</strong>
                    <span>💎 {selected.creditsRequired || 1} crédit{(selected.creditsRequired||1) > 1 ? 's' : ''}</span>
                  </span>
                </span>
              ) : (
                <span className={styles.dropPlaceholder}>Sélectionner un template…</span>
              )}
              <span className={`${styles.dropChevron} ${dropOpen ? styles.dropChevronOpen : ''}`}>▼</span>
            </button>

            {dropOpen && (
              <div className={styles.dropMenu}>
                <div className={styles.dropSearch}>
                  <span className={styles.dropSearchIcon}>🔍</span>
                  <input
                    autoFocus
                    className={styles.dropSearchInput}
                    placeholder="Rechercher un template…"
                    value={tplSearch}
                    onChange={e => setTplSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
                <div className={styles.dropList}>
                  {filtered.length === 0 && <div className={styles.dropEmpty}>Aucun template trouvé</div>}
                  {filtered.map(t => (
                    <button
                      key={t.name}
                      type="button"
                      className={`${styles.dropItem} ${selected?.name === t.name ? styles.dropItemActive : ''}`}
                      onClick={() => { setSelected(t); setDropOpen(false); setTplSearch(''); }}
                    >
                      <span 
                        className={styles.dropItemThumb} 
                        style={{
                          background: t.thumbnail ? `url(${t.thumbnail}) center/cover no-repeat` : (TEMPLATE_COLORS[t.name] || '#667eea')
                        }}
                      >
                        {!t.thumbnail && (TEMPLATE_ICONS[t.name] || '✨')}
                      </span>
                      <span className={styles.dropItemInfo}>
                        <strong>{t.label}</strong>
                        <span>{t.description}</span>
                      </span>
                      <span className={styles.dropItemCredit}>💎 {t.creditsRequired || 1}</span>
                      {selected?.name === t.name && <span className={styles.dropItemCheck}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Form ── */}
          <h2 className={styles.stepLabel}>2. Configurer</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Nom du destinataire *</label>
              <input type="text" required placeholder="Lydia" value={form.recipientName}
                onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label>Titre de la publication</label>
              <input type="text" placeholder="Anniversaire de Lydia" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label>Lien personnalisé</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputPrefix}>/{selected?.name || 'template'}/</span>
                <input type="text" placeholder="lydia-25" value={form.customName}
                  onChange={e => setForm(f => ({ ...f, customName: toSlug(e.target.value) }))} />
              </div>
              <span className={styles.hint}>
                Lien final: <code>/site/{selected?.name || 'template'}/{toSlug(form.customName || form.title || form.recipientName || 'wish')}</code>
              </span>
            </div>

            {error && <p className={styles.error}>{error}</p>}


            <button type="submit" className={styles.submit} disabled={loading || !selected}>
              {loading ? 'Création...' : 'Créer & personnaliser →'}
            </button>
          </form>
        </div>

        {paymentModalOpen && (
          <PaymentModal onClose={() => setPaymentModalOpen(false)} onSuccess={() => {}} />
        )}

        {/* ── Preview panel ── */}
        <div className={styles.right}>
          <div className={styles.previewCard}>
            <div 
              className={styles.previewThumb} 
              style={{
                background: selected?.thumbnail ? `url(${selected.thumbnail}) center/cover no-repeat` : (selected ? (TEMPLATE_COLORS[selected.name]||'linear-gradient(135deg,#667eea,#764ba2)') : '#1e293b')
              }}
            >
              {!selected?.thumbnail && (
                <span className={styles.previewEmoji}>{TEMPLATE_ICONS[selected?.name] || '🎂'}</span>
              )}
            </div>
            <h3>{selected?.label || 'Birthday Wish'}</h3>
            <p>{selected?.description}</p>
            <div className={styles.creditInfo}>💎 {selected?.creditsRequired || 1} crédit{(selected?.creditsRequired||1)>1?'s':''}</div>
            {selected && (
              <a
                href={`${VITE_API}/preview/${selected.name}`}
                target="_blank"
                rel="noreferrer"
                className={styles.previewBtn}
              >
                👁 Voir l'aperçu
              </a>
            )}
            <div className={styles.features}>
              {selected?.highlights?.length ? selected.highlights.map((h,i) => <span key={i}>✨ {h}</span>) : (
                <>
                  <span>🎵 Musique de fond</span>
                  <span>💬 Message interactif</span>
                  <span>🎉 Animations & confettis</span>
                  <span>💌 Vœux personnalisés</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <WhatsAppFAB />
    </div>
  );
}