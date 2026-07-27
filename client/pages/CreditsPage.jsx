import { useState } from 'react';
import { Check, Loader, Tag, Info } from 'lucide-react';
import { useAuth } from '../admin/context/AuthContext';
import { applyPromoCode } from '../utils/api';

/* ================================================================
   CreditsPage — historiquement page d'achat de crédits KKiaPay.
   ---------------------------------------------------------------
   Depuis le passage à FeexPay, les crédits ne sont plus vendus. La
   page affiche désormais :
     - Le solde restant (utilisable jusqu'à épuisement)
     - Un input code promo (offert / gift) — seul canal restant pour
       ajouter des crédits
     - Un message explicatif : les publications se payent maintenant
       directement au moment du publish (checkout Mobile Money / carte)
   ================================================================ */

export default function CreditsPage() {
  const { user, setUser } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [promoErr,  setPromoErr]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(null);

  const currentCredits = user?.credits ?? 0;

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
        setPromoErr('Ce code promo est une réduction sur checkout, pas un cadeau de crédits.');
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
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div style={{ fontSize: 13, color: 'var(--mk-ink-3)', fontWeight: 700, marginBottom: 4 }}>Tes crédits</div>
          <h1 className="ph-title">
            Tu en as <span style={{ color: 'var(--mk-accent)' }}>{currentCredits}</span>
          </h1>
          <p className="ph-sub">Utilisables jusqu'à épuisement · 1 crédit = 1 publication</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'var(--mk-butter-soft)', borderRadius: 'var(--mk-r-sm)', fontSize: 32, flexShrink: 0 }}>
          💎
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: 'var(--d-gap)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Info size={18} style={{ color: 'var(--mk-lilac)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, color: 'var(--mk-ink-2)', lineHeight: 1.5 }}>
          Les crédits ne sont plus vendus séparément. Pour publier une nouvelle carte ou un mur payant,
          le paiement se fait directement Mobile Money ou par carte au moment du <strong>Publier</strong>.
          Tes crédits actuels restent utilisables en priorité — tu ne payes que si ton solde est insuffisant.
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--mk-ink-2)', marginBottom: 10 }}>Tu as un code cadeau ?</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tag size={14} style={{ color: 'var(--mk-ink-2)', flexShrink: 0 }} />
          <input
            className="mk-input"
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '4px 0', fontWeight: 700, letterSpacing: '.06em' }}
            value={promoCode}
            onChange={e => setPromoCode(e.target.value.toUpperCase())}
            placeholder="CODE CADEAU"
            onKeyDown={e => e.key === 'Enter' && handlePromo()}
          />
          <button className="btn btn-ghost btn-sm" onClick={handlePromo} disabled={loading || !promoCode.trim()}>
            {loading ? <Loader size={14} style={{ animation: 'mk-spin .75s linear infinite' }} /> : 'Appliquer'}
          </button>
        </div>
        {promoErr && <p style={{ fontSize: 12, color: 'var(--mk-accent)', marginTop: 8, fontWeight: 600 }}>{promoErr}</p>}
      </div>
    </div>
  );
}
