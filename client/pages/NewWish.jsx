import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTemplates, createPublication } from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import PaymentModal from '../admin/components/PaymentModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import styles from './NewWish.module.css';

const BG_COLORS = {
  birthday:          'linear-gradient(135deg, #fbcfe8, #f9a8d4)',
  special:           'linear-gradient(135deg, #dbeafe, #bfdbfe)',
  'collective-family':'linear-gradient(135deg, #d1fae5, #a7f3d0)',
  'collective-pro':  'linear-gradient(135deg, #fef3c7, #fde68a)',
  forever:           'linear-gradient(135deg, #fbcfe8, #f9a8d4)',
  sanctuary:         'linear-gradient(135deg, #dbeafe, #bfdbfe)',
  'notre-film':      'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
  'wall-of-wishes':  'linear-gradient(135deg, #fef3c7, #fde68a)',
};
const TEMPLATE_EMOJI = {
  birthday: '🎂', special: '✨', 'collective-family': '👨‍👩‍👧',
  'collective-pro': '🏢', forever: '💍', sanctuary: '🌸',
  'notre-film': '🎬', 'wall-of-wishes': '🌟',
};

export default function NewWish() {
  const [templates, setTemplates]         = useState([]);
  const [selected, setSelected]           = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const VITE_API = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    getTemplates()
      .then(r => { setTemplates(r.data); if (r.data.length > 0) setSelected(r.data[0]); })
      .catch(() => {
        const fb = [{ name: 'birthday', label: 'Anniversaire', creditsRequired: 1, desc: 'Pour fêter une nouvelle année.' }];
        setTemplates(fb); setSelected(fb[0]);
      });
  }, []);

  const toSlug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async () => {
    if (!selected) { setError('Choisissez un template.'); return; }
    if (!recipientName.trim()) { setError('Entrez le prénom du destinataire.'); return; }
    setLoading(true); setError('');
    try {
      const slug = toSlug(recipientName);
      const res = await createPublication({
        templateName: selected.name,
        customName:   slug + '-' + Date.now().toString(36),
        title:        `${recipientName}'s ${selected.label || 'Wish'}`,
        data: {
          ...(selected.defaultData || {}),
          name: recipientName, waName: recipientName,
          waAvatar: recipientName?.charAt(0)?.toUpperCase() || 'A',
        },
        style: selected.defaultStyle || {},
      });
      if (user?.role === 'merchant') {
        setUser({ ...user, credits: Math.max(0, (user.credits || 0) - (selected.creditsRequired || 1)) });
      }
      navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
    } catch (e) {
      const msg = e.response?.data?.error || 'Erreur';
      if (e.response?.status === 402) setPaymentModalOpen(true);
      else setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <Link to="/ewish-admin/ewish" className={styles.back}>
          <ArrowLeft size={16} /> Retour
        </Link>
        <div className={styles.logo}>my<span>Kado</span></div>
        {user?.role === 'merchant' && (
          <div className={styles.creditsChip}>💎 {user?.credits ?? 0} crédit{(user?.credits ?? 0) !== 1 ? 's' : ''}</div>
        )}
      </header>

      <div className={styles.body}>
        {/* ── Hero ── */}
        <div className={styles.hero}>
          <div className={styles.heroTag}>NOUVELLE CRÉATION</div>
          <h1 className={styles.heroTitle}>Quel genre de carte ?</h1>
          <p className={styles.heroSub}>Choisissez un template. Vous pourrez tout personnaliser ensuite.</p>
        </div>

        {/* ── Template gallery ── */}
        <div className={styles.gallery}>
          {templates.map(tpl => {
            const sel = selected?.name === tpl.name;
            return (
              <button
                key={tpl.name}
                className={`${styles.tplCard} ${sel ? styles.tplCardActive : ''}`}
                onClick={() => setSelected(tpl)}
              >
                <div
                  className={styles.tplThumb}
                  style={{
                    background: tpl.thumbnail
                      ? `url(${tpl.thumbnail}) center/cover no-repeat`
                      : (BG_COLORS[tpl.name] || 'linear-gradient(135deg, #fbcfe8, #f9a8d4)'),
                  }}
                >
                  {!tpl.thumbnail && (
                    <span className={styles.tplEmoji}>{TEMPLATE_EMOJI[tpl.name] || '✨'}</span>
                  )}
                  {/* Decorative dots */}
                  <svg style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} viewBox="0 0 200 200" preserveAspectRatio="none">
                    {[[20,30],[180,40],[30,170],[170,150]].map(([cx,cy],i) => (
                      <circle key={i} cx={cx} cy={cy} r="3" fill="#fff" />
                    ))}
                  </svg>
                  {sel && (
                    <div className={styles.checkBadge}><Check size={13} strokeWidth={3} /></div>
                  )}
                </div>
                <div className={styles.tplMeta}>
                  <div>
                    <div className={styles.tplName}>{tpl.label}</div>
                    {tpl.description && <div className={styles.tplDesc}>{tpl.description}</div>}
                  </div>
                  <span className={styles.tplCredits}>💎 {tpl.creditsRequired || 1}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Bottom action bar ── */}
        {selected && (
          <div className={styles.actionBar}>
            <div className={styles.actionThumb}
              style={{
                background: BG_COLORS[selected.name] || 'linear-gradient(135deg, #fbcfe8, #f9a8d4)',
              }}
            >
              <span style={{ fontSize: 28 }}>{TEMPLATE_EMOJI[selected.name] || '✨'}</span>
            </div>
            <div className={styles.actionContent}>
              <div className={styles.actionLabel}>ÉTAPE FINALE  POUR QUI ?</div>
              <div className={styles.actionRow}>
                <input
                  className={styles.recipientInput}
                  type="text"
                  placeholder="Prénom du destinataire"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                />
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={loading || !selected}
                >
                  {loading ? 'Création…' : <>Créer la carte <ChevronRight size={16} /></>}
                </button>
              </div>
              {recipientName && (
                <div className={styles.slugHint}>
                  Le lien sera <code>/s/{toSlug(recipientName)}</code> · vous pourrez le changer plus tard
                </div>
              )}
              {error && <div className={styles.errorMsg}>{error}</div>}
            </div>
          </div>
        )}

        {/* ── Tip ── */}
        <div className={styles.tip}>
          <span style={{ fontSize: 18 }}>💡</span>
          <div>
            <strong>Vous hésitez ?</strong> Chaque template est entièrement personnalisable.
            Couleurs, texte, photos  tout change en quelques clics.
          </div>
        </div>
      </div>

      {paymentModalOpen && (
        <PaymentModal onClose={() => setPaymentModalOpen(false)} onSuccess={handleSubmit} />
      )}
      <WhatsAppFAB />
    </div>
  );
}
