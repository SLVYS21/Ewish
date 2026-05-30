import { useState, useEffect } from 'react';
import { Shield, Check, Loader, Tag, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKKiaPay } from 'kkiapay-react';
import { useAuth } from '../admin/context/AuthContext';
import { verifyKkiapayTransaction, applyPromoCode } from '../utils/api';
import styles from './CreditsPage.module.css';

const PACKS = [
  { id: 'p1',   credits: 1,   price: 500,   perCredit: 500, save: 0 },
  { id: 'p5',   credits: 5,   price: 2400,  perCredit: 480, save: 4 },
  { id: 'p10',  credits: 10,  price: 4500,  perCredit: 450, save: 10, popular: true },
  { id: 'p25',  credits: 25,  price: 10500, perCredit: 420, save: 16 },
  { id: 'p50',  credits: 50,  price: 19500, perCredit: 390, save: 22 },
  { id: 'p100', credits: 100, price: 36000, perCredit: 360, save: 28 },
];

const PAYMENT_METHODS = [
  { id: 'mtn',  label: 'MTN',   emoji: '📱', color: '#FFC95A' },
  { id: 'moov', label: 'Moov',  emoji: '📲', color: '#9FE3CB' },
  { id: 'or',   label: 'Orange',emoji: '🟠', color: '#FFAE82' },
  { id: 'card', label: 'Carte', emoji: '💳', color: '#B59CF0' },
];

export default function CreditsPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [selected,  setSelected]  = useState('p10');
  const [method,    setMethod]    = useState('mtn');
  const [promoCode, setPromoCode] = useState('');
  const [promoInfo, setPromoInfo] = useState(null);  // { value, type, isGift, added }
  const [promoErr,  setPromoErr]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(null);  // { credits, added }
  const [err,       setErr]       = useState('');

  const kkiapay = useKKiaPay();

  const currentCredits = user?.credits ?? 0;
  const selectedPack   = PACKS.find(p => p.id === selected);
  const finalPrice     = promoInfo && !promoInfo.isGift
    ? promoInfo.type === 'percent'
      ? Math.round(selectedPack.price * (1 - promoInfo.value / 100))
      : Math.max(0, selectedPack.price - promoInfo.value)
    : selectedPack?.price ?? 0;

  // Listen for KKiaPay success callback
  useEffect(() => {
    if (!kkiapay?.addSuccessListener) return;
    const onSuccess = async (response) => {
      setLoading(true);
      setErr('');
      try {
        const { data } = await verifyKkiapayTransaction(response.transactionId);
        setSuccess({ credits: data.credits, added: data.credits - currentCredits });
        if (setUser) setUser(prev => ({ ...prev, credits: data.credits }));
      } catch (e) {
        setErr(e.response?.data?.error || 'Erreur de vérification. Contacte le support.');
      } finally {
        setLoading(false);
      }
    };
    kkiapay.addSuccessListener(onSuccess);
  }, [kkiapay, currentCredits, setUser]);

  const handlePay = () => {
    if (!selectedPack || !kkiapay?.openKkiapayWidget) return;
    setErr('');
    kkiapay.openKkiapayWidget({
      amount:  finalPrice,
      key:     import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || '',
      sandbox: import.meta.env.VITE_KKIAPAY_SANDBOX === 'true',
      name:    user?.name || '',
      email:   user?.email || '',
      data:    JSON.stringify({ packId: selected, credits: selectedPack.credits }),
    });
  };

  const handlePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoErr('');
    setLoading(true);
    try {
      const { data } = await applyPromoCode(promoCode.trim());
      if (data.isGift) {
        setSuccess({ credits: currentCredits + data.added, added: data.added });
        if (setUser) setUser(prev => ({ ...prev, credits: prev.credits + data.added }));
        setPromoCode('');
      } else {
        setPromoInfo({ value: data.value, type: data.type, isGift: false });
        setPromoCode('');
      }
    } catch (e) {
      setPromoErr(e.response?.data?.error || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.root}>
        <div className={styles.successBox}>
          <div className={styles.successCircle}><Check size={40}/></div>
          <div className={styles.successTitle}>+{success.added} crédit{success.added > 1 ? 's' : ''} ajouté{success.added > 1 ? 's' : ''} !</div>
          <p className={styles.successSub}>Tu as maintenant <strong>{success.credits}</strong> crédit{success.credits > 1 ? 's' : ''} sur ton compte.</p>
          <button className={styles.btnPay} onClick={() => setSuccess(null)}>Acheter encore</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* Back */}
      <button className={styles.back} onClick={() => navigate(-1)}>
        <ChevronLeft size={18} /> Retour
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.diamondBox}>💎</div>
        <div>
          <div className={styles.headerHand}>Tes crédits</div>
          <h1 className={styles.headerTitle}>
            Tu en as <span style={{ color: 'var(--mk-rose)' }}>{currentCredits}</span>
          </h1>
          <p className={styles.headerSub}>1 crédit = 1 publi = 500 FCFA</p>
        </div>
      </div>

      {/* Packs grid */}
      <div className={styles.packsGrid}>
        {PACKS.map(p => (
          <button
            key={p.id}
            className={`${styles.packCard} ${selected === p.id ? styles.packCardActive : ''}`}
            style={{ border: `2px solid ${selected === p.id ? 'var(--mk-ink)' : (p.popular ? 'var(--mk-rose)' : 'var(--mk-line-2)')}` }}
            onClick={() => { setSelected(p.id); setPromoInfo(null); }}
          >
            {p.popular && <span className={styles.popularBadge}>POPULAIRE</span>}
            {p.save > 0 && (
              <span className={`${styles.saveBadge} ${selected === p.id ? styles.saveBadgeActive : ''}`}>−{p.save}%</span>
            )}
            <div className={styles.packCredits}>{p.credits} crédit{p.credits > 1 ? 's' : ''}</div>
            <div className={styles.packPrice}>{p.price.toLocaleString('fr-FR')}</div>
            <div className={styles.packPerCredit}>FCFA · {p.perCredit} FCFA/crédit</div>
          </button>
        ))}
      </div>

      {/* Promo code */}
      <div className={styles.promoBox}>
        <div className={styles.promoRow}>
          <Tag size={14} style={{ color: 'var(--mk-ink-2)', flexShrink: 0 }}/>
          <input
            className={styles.promoInput}
            value={promoCode}
            onChange={e => setPromoCode(e.target.value.toUpperCase())}
            placeholder="CODE PROMO"
            onKeyDown={e => e.key === 'Enter' && handlePromo()}
          />
          <button className={styles.promoBtn} onClick={handlePromo} disabled={loading || !promoCode.trim()}>
            Appliquer
          </button>
        </div>
        {promoErr && <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 6 }}>{promoErr}</p>}
        {promoInfo && !promoInfo.isGift && (
          <p style={{ fontSize: 12, color: '#1F6E55', marginTop: 6, fontWeight: 600 }}>
            Code appliqué — {promoInfo.type === 'percent' ? `−${promoInfo.value}%` : `−${promoInfo.value.toLocaleString('fr-FR')} FCFA`}
          </p>
        )}
      </div>

      {/* Payment */}
      <div className={styles.paymentBox}>
        <div className={styles.paymentTitle}>Méthode de paiement</div>
        <div className={styles.methodGrid}>
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.id}
              className={`${styles.methodCard} ${method === m.id ? styles.methodCardActive : ''}`}
              style={{
                background: method === m.id ? m.color + '40' : '#fff',
                border: `2px solid ${method === m.id ? m.color : 'var(--mk-line-2)'}`,
              }}
              onClick={() => setMethod(m.id)}
            >
              <div className={styles.methodEmoji}>{m.emoji}</div>
              <div className={styles.methodLabel}>{m.label}</div>
            </button>
          ))}
        </div>

        {err && <p style={{ fontSize: 13, color: '#e74c3c', marginBottom: 10, fontWeight: 600 }}>{err}</p>}

        <button className={styles.btnPay} onClick={handlePay} disabled={loading}>
          {loading
            ? <><Loader size={14} className={styles.spin}/> Vérification…</>
            : <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 13.5 9.5 21 11 13.5 12.5 12 20 10.5 12.5 3 11 10.5 9.5Z"/></svg>
                Payer {finalPrice.toLocaleString('fr-FR')} FCFA
              </>
          }
        </button>

        <div className={styles.secureNote}>
          <Shield size={13}/> Paiement sécurisé via Kkiapay · Tu reçois un SMS de confirmation
        </div>
      </div>
    </div>
  );
}
