import { useState, useEffect } from 'react';
import { Shield, Check, Loader, Tag } from 'lucide-react';
import { useKKiaPay } from 'kkiapay-react';
import { useAuth } from '../admin/context/AuthContext';
import { verifyKkiapayTransaction, applyPromoCode } from '../utils/api';

const PACKS = [
  { id: 'p1',   credits: 1,   price: 500,   perCredit: 500, save: 0 },
  { id: 'p5',   credits: 5,   price: 2400,  perCredit: 480, save: 4 },
  { id: 'p10',  credits: 10,  price: 4500,  perCredit: 450, save: 10, popular: true },
  { id: 'p25',  credits: 25,  price: 10500, perCredit: 420, save: 16 },
  { id: 'p50',  credits: 50,  price: 19500, perCredit: 390, save: 22 },
  { id: 'p100', credits: 100, price: 36000, perCredit: 360, save: 28 },
];

export default function CreditsPage() {
  const { user, setUser } = useAuth();
  const [selected,  setSelected]  = useState('p10');
  const [promoCode, setPromoCode] = useState('');
  const [promoInfo, setPromoInfo] = useState(null);
  const [promoErr,  setPromoErr]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(null);
  const [err,       setErr]       = useState('');

  const kkiapay = useKKiaPay();

  const currentCredits = user?.credits ?? 0;
  const selectedPack   = PACKS.find(p => p.id === selected);
  const finalPrice     = promoInfo && !promoInfo.isGift
    ? promoInfo.type === 'percent'
      ? Math.round(selectedPack.price * (1 - promoInfo.value / 100))
      : Math.max(0, selectedPack.price - promoInfo.value)
    : selectedPack?.price ?? 0;

  useEffect(() => {
    if (!kkiapay?.addSuccessListener) return;
    const onSuccess = async (response) => {
      setLoading(true); setErr('');
      try {
        const { data } = await verifyKkiapayTransaction(response.transactionId);
        setSuccess({ credits: data.credits, added: data.credits - currentCredits });
        if (setUser) setUser(prev => ({ ...prev, credits: data.credits }));
      } catch (e) {
        setErr(e.response?.data?.error || 'Erreur de vérification. Contacte le support.');
      } finally { setLoading(false); }
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
    setPromoErr(''); setLoading(true);
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
    } catch (e) { setPromoErr(e.response?.data?.error || 'Code invalide'); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="page">
        <div style={{ maxWidth: 480, margin: '10vh auto 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--mk-mint-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
            <Check size={38} color="var(--mk-mint)" />
          </div>
          <div style={{ fontFamily: 'var(--mk-display)', fontSize: 30, letterSpacing: '-.01em' }}>
            +{success.added} crédit{success.added > 1 ? 's' : ''} ajouté{success.added > 1 ? 's' : ''} !
          </div>
          <p style={{ fontSize: 14, color: 'var(--mk-ink-2)' }}>
            Tu as maintenant <strong>{success.credits}</strong> crédit{success.credits > 1 ? 's' : ''} sur ton compte.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 8, padding: '11px 28px' }} onClick={() => setSuccess(null)}>
            Acheter encore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">

      {/* Page header */}
      <div className="ph">
        <div>
          <div style={{ fontSize: 13, color: 'var(--mk-ink-3)', fontWeight: 700, marginBottom: 4 }}>Tes crédits</div>
          <h1 className="ph-title">
            Tu en as <span style={{ color: 'var(--mk-accent)' }}>{currentCredits}</span>
          </h1>
          <p className="ph-sub">1 crédit = 1 publi = 500 FCFA</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'var(--mk-butter-soft)', borderRadius: 'var(--mk-r-sm)', fontSize: 32, flexShrink: 0 }}>
          💎
        </div>
      </div>

      {/* Packs grid */}
      <div className="pack-grid" style={{ marginBottom: 'var(--d-gap)' }}>
        {PACKS.map(p => (
          <button
            key={p.id}
            className={`pack-card ${selected === p.id ? 'on' : ''}`}
            onClick={() => { setSelected(p.id); setPromoInfo(null); }}
          >
            {p.popular && <div className="pack-pop">POPULAIRE</div>}
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--mk-ink)', lineHeight: 1, marginTop: p.popular ? 10 : 0 }}>
              {p.credits}
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mk-ink-3)', marginLeft: 4 }}>
                crédit{p.credits > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--mk-accent)', marginTop: 6 }}>
              {p.price.toLocaleString('fr-FR')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--mk-ink-3)', fontWeight: 600 }}>
              FCFA · {p.perCredit} FCFA/crédit
            </div>
            {p.save > 0 && (
              <div style={{ marginTop: 8, display: 'inline-flex', background: selected === p.id ? 'var(--mk-accent)' : 'var(--mk-blush)', color: selected === p.id ? '#fff' : 'var(--mk-ink-2)', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, transition: 'all .15s' }}>
                −{p.save}%
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Promo code */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 'var(--d-gap)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tag size={14} style={{ color: 'var(--mk-ink-2)', flexShrink: 0 }} />
          <input
            className="mk-input"
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '4px 0', fontWeight: 700, letterSpacing: '.06em' }}
            value={promoCode}
            onChange={e => setPromoCode(e.target.value.toUpperCase())}
            placeholder="CODE PROMO"
            onKeyDown={e => e.key === 'Enter' && handlePromo()}
          />
          <button className="btn btn-ghost btn-sm" onClick={handlePromo} disabled={loading || !promoCode.trim()}>
            Appliquer
          </button>
        </div>
        {promoErr && <p style={{ fontSize: 12, color: 'var(--mk-accent)', marginTop: 8, fontWeight: 600 }}>{promoErr}</p>}
        {promoInfo && !promoInfo.isGift && (
          <p style={{ fontSize: 12, color: 'var(--mk-mint)', marginTop: 8, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={12} /> Code appliqué  {promoInfo.type === 'percent' ? `−${promoInfo.value}%` : `−${promoInfo.value.toLocaleString('fr-FR')} FCFA`}
          </p>
        )}
      </div>

      {/* Pay button */}
      {err && <p style={{ fontSize: 13, color: 'var(--mk-accent)', marginBottom: 12, fontWeight: 700 }}>{err}</p>}
      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '14px 20px', fontSize: 15, justifyContent: 'center' }}
        onClick={handlePay}
        disabled={loading}
      >
        {loading
          ? <><Loader size={16} style={{ animation: 'mk-spin .75s linear infinite' }} /> Vérification…</>
          : <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 13.5 9.5 21 11 13.5 12.5 12 20 10.5 12.5 3 11 10.5 9.5Z"/>
              </svg>
              Payer {finalPrice.toLocaleString('fr-FR')} FCFA
            </>
        }
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14, fontSize: 12, color: 'var(--mk-ink-3)', fontWeight: 600 }}>
        <Shield size={12} /> Paiement sécurisé via Kkiapay · Tu reçois un SMS de confirmation
      </div>
    </div>
  );
}
