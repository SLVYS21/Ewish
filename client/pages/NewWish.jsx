import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTemplates, createPublication } from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import styles from './NewWish.module.css';

export default function NewWish() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', customName: '', recipientName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getTemplates()
      .then(r => {
        setTemplates(r.data);
        if (r.data.length > 0) setSelected(r.data[0]);
      })
      .catch(() => {
        // Fallback if no DB
        const fallback = [{ name: 'birthday', label: 'Birthday Wish', description: 'Animated birthday card with music, confetti & more.' }];
        setTemplates(fallback);
        setSelected(fallback[0]);
      });
  }, []);

  const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true); setError('');
    try {
      const slug = toSlug(form.customName || form.title || form.recipientName || 'wish');
      const res = await createPublication({
        templateName: selected.name,
        customName: slug,
        title: form.title || `${form.recipientName}'s Birthday`,
        data: {
          ...(selected.defaultData || {}),
          name: form.recipientName,
          waName: form.recipientName,
          waAvatar: form.recipientName?.charAt(0)?.toUpperCase() || 'A',
        },
        style: selected.defaultStyle || {},
      });
      // Update local user credits if they are a merchant
      if (user?.role === 'merchant') {
        setUser({ ...user, credits: Math.max(0, user.credits - (selected.creditsRequired || 1)) });
      }
      navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link to="/ewish-admin/ewish" className={styles.back}>← Back</Link>
        <div className={styles.logo}>🎂 myKado</div>
        <div />
      </header>

      <div className={styles.body}>
        <div className={styles.left}>
          <h1>Create a new wish</h1>
          <p className={styles.sub}>Choose a template and personalize it.</p>

          <h2 className={styles.stepLabel}>1. Choose a template</h2>
          <div className={styles.templateGrid}>
            {templates.map(t => (
              <div
                key={t.name}
                className={`${styles.templateCard} ${selected?.name === t.name ? styles.active : ''}`}
                onClick={() => setSelected(t)}
              >
                <div className={styles.templateThumb}>🎂</div>
                <div className={styles.templateInfo}>
                  <strong>{t.label}</strong>
                  <span>{t.description}</span>
                  <div className={styles.templateCredits}>💎 {t.creditsRequired || 1} Crédit(s)</div>
                </div>
                {selected?.name === t.name && <span className={styles.check}>✓</span>}
              </div>
            ))}
          </div>

          <h2 className={styles.stepLabel}>2. Set it up</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Recipient's name *</label>
              <input
                type="text" required placeholder="Lydia"
                value={form.recipientName}
                onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Wish title</label>
              <input
                type="text" placeholder="Lydia's 25th Birthday"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Custom URL name</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputPrefix}>/birthday/</span>
                <input
                  type="text" placeholder="lydia-25"
                  value={form.customName}
                  onChange={e => setForm(f => ({ ...f, customName: toSlug(e.target.value) }))}
                />
              </div>
              <span className={styles.hint}>
                Leave empty to auto-generate from the title.
                Final URL: <code>/site/birthday/{toSlug(form.customName || form.title || form.recipientName || 'wish')}</code>
              </span>
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {user?.role === 'merchant' && selected && user.credits < (selected.creditsRequired || 1) && (
              <p className={styles.error}>Vous n'avez pas assez de crédits (Solde: {user.credits}).</p>
            )}

            <button type="submit" className={styles.submit} disabled={loading || !selected || (user?.role === 'merchant' && user.credits < (selected?.creditsRequired || 1))}>
              {loading ? 'Création...' : 'Créer & personnaliser →'}
            </button>
          </form>
        </div>

        <div className={styles.right}>
          <div className={styles.previewCard}>
            <div className={styles.previewThumb}>🎂</div>
            <h3>{selected?.label || 'Birthday Wish'}</h3>
            <p>{selected?.description}</p>
            <div className={styles.features}>
              <span>🎵 Music player</span>
              <span>💬 WhatsApp style message</span>
              <span>🎉 Confetti & fireworks</span>
              <span>💌 Personal wishes</span>
              <span>🎈 Balloons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}