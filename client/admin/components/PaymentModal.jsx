import { useState, useEffect } from 'react';
import { useKKiaPay } from 'kkiapay-react';
import { verifyKkiapayTransaction, buyCredits } from '../../utils/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, X, AlertCircle, CheckCircle2, Ticket, Gift, Sparkles } from 'lucide-react';
import s from './PaymentModal.module.css';

const CREDIT_PRICE_FCFA = 500;
const PACKS = {
  5: 2500,
  10: 4500,
  20: 8000
};

export default function PaymentModal({ onClose, onSuccess }) {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState(10); // Default 10 credits
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [method, setMethod] = useState('kkiapay');
  
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setError('');
    try {
      const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
      const r = await axios.post(`${BASE}/billing/apply-promo`, { code: promoCode }, { withCredentials: true });
      if (r.data.isGift) {
        setUser(prev => ({ ...prev, credits: r.data.credits }));
        setSuccess(r.data.message);
        if (onSuccess) onSuccess(r.data.credits);
        setTimeout(onClose, 3000);
      } else {
        setAppliedPromo(r.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Code promo invalide");
    } finally {
      setPromoLoading(false);
    }
  };

  const getBasePrice = (qty) => {
    return PACKS[qty] || qty * CREDIT_PRICE_FCFA;
  };

  const getDiscountedPrice = () => {
    const base = getBasePrice(amount);
    if (!appliedPromo) return base;
    if (appliedPromo.type === 'percent') return Math.max(0, base - Math.round(base * appliedPromo.value / 100));
    return Math.max(0, base - appliedPromo.value);
  };

  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();

  useEffect(() => {
    function successHandler(response) {
      console.log('Kkiapay Success:', response);
      setLoading(true);
      setError('');
      
      verifyKkiapayTransaction(response.transactionId)
        .then(res => {
           if (res.data.success) {
             setUser(prev => ({ ...prev, credits: res.data.credits }));
             setSuccess(`Paiement réussi ! ${res.data.transaction.credits} crédits ajoutés.`);
             if (onSuccess) onSuccess(res.data.credits);
             setTimeout(onClose, 3000);
           }
        })
        .catch(err => {
           console.error('Verification error:', err);
           setError(err.response?.data?.error || "Erreur lors de la vérification du paiement.");
        })
        .finally(() => {
           setLoading(false);
        });
    }

    function failureHandler(error) {
      console.log('Kkiapay Failed:', error);
      setError("Le paiement a échoué ou a été annulé.");
      setLoading(false);
    }

    addKkiapayListener('success', successHandler);
    addKkiapayListener('failed', failureHandler);

    return () => {
      removeKkiapayListener('success', successHandler);
      removeKkiapayListener('failed', failureHandler);
    };
  }, [addKkiapayListener, removeKkiapayListener, setUser, onClose, onSuccess]);

  const handlePay = () => {
    if (amount <= 0) {
      setError("Le montant doit être supérieur à 0");
      return;
    }
    setError('');
    
    if (method === 'kkiapay') {
      const amountFCFA = getDiscountedPrice();
      openKkiapayWidget({
        amount: amountFCFA,
        api_key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || 'votre_cle_publique_ici',
        sandbox: import.meta.env.VITE_KKIAPAY_SANDBOX === 'true' || true,
        email: user?.email || '',
        name: user?.name || '',
        theme: "#c8963e"
      });
    }
  };

  const handlePackSelect = (qty) => {
    setAmount(qty);
    setIsCustomAmount(false);
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <h2>Acheter des crédits</h2>
          <button className={s.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={s.body}>
          {success ? (
            <div className={s.successBox}>
              <CheckCircle2 size={48} color="var(--green)" />
              <p>{success}</p>
            </div>
          ) : (
            <>
              {/* Packs Selection */}
              <div className={s.packsGrid}>
                {[5, 10, 20].map(qty => (
                  <div 
                    key={qty} 
                    className={`${s.packCard} ${amount === qty && !isCustomAmount ? s.packActive : ''}`}
                    onClick={() => handlePackSelect(qty)}
                  >
                    <div className={s.packQty}>{qty}</div>
                    <div className={s.packLabel}>crédits</div>
                    <div className={s.packPrice}>
                      {PACKS[qty].toLocaleString('fr-FR')} FCFA
                    </div>
                    {qty === 10 && <div className={s.packBadge}>-10%</div>}
                    {qty === 20 && <div className={s.packBadge} style={{background: 'var(--green)'}}>-20%</div>}
                  </div>
                ))}
              </div>

              {/* Custom Amount Toggle */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                {!isCustomAmount ? (
                  <button className={s.btnGhost} onClick={() => setIsCustomAmount(true)}>
                    Saisir un autre montant
                  </button>
                ) : (
                  <div className={s.field}>
                    <label>Montant personnalisé (1 crédit = {CREDIT_PRICE_FCFA} FCFA)</label>
                    <div className={s.amountWrap}>
                      <input 
                        type="number" 
                        min="1" 
                        max="1000" 
                        value={amount} 
                        onChange={e => setAmount(parseInt(e.target.value) || 0)}
                        className={s.input}
                        autoFocus
                      />
                      <span className={s.creditsSuffix}>crédits</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className={s.priceHint} style={{ textAlign: 'center', marginBottom: '20px', padding: '12px', background: 'var(--surface2)', borderRadius: '8px' }}>
                Total à payer : <strong style={{ fontSize: '1.2rem', color: 'var(--brand)' }}>{getDiscountedPrice().toLocaleString('fr-FR')} FCFA</strong> 
                {appliedPromo && <div className={s.discountTag}>Réduction appliquée : -{appliedPromo.type === 'percent' ? appliedPromo.value + '%' : appliedPromo.value + ' FCFA'}</div>}
              </div>

              <div className={s.field}>
                <label>Code Promo / Carte Cadeau</label>
                <div className={s.promoInputWrap}>
                  <Ticket size={18} className={s.promoIcon} />
                  <input 
                    type="text" 
                    value={promoCode} 
                    onChange={e => setPromoCode(e.target.value.toUpperCase())} 
                    placeholder="Entrez votre code"
                    className={s.promoInput}
                    disabled={promoLoading || appliedPromo}
                  />
                  <button 
                    onClick={handleApplyPromo} 
                    disabled={promoLoading || !promoCode || appliedPromo}
                    className={s.promoBtn}
                  >
                    {promoLoading ? '...' : appliedPromo ? 'Appliqué' : 'Appliquer'}
                  </button>
                </div>
              </div>

              <div className={s.field}>
                <label>Moyen de paiement</label>
                <div className={s.methods}>
                  <label className={`${s.method} ${method === 'kkiapay' ? s.active : ''}`}>
                    <input 
                      type="radio" 
                      name="method" 
                      value="kkiapay" 
                      checked={method === 'kkiapay'} 
                      onChange={() => setMethod('kkiapay')} 
                    />
                    <div className={s.methodInfo}>
                      <CreditCard size={20} />
                      <span>Mobile Money / Carte (KKiaPay)</span>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className={s.errorContainer}>
                  <div className={s.errorBox}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button 
                className={s.payBtn} 
                onClick={handlePay} 
                disabled={loading || amount <= 0}
              >
                {loading ? 'Traitement en cours...' : `Payer ${getDiscountedPrice().toLocaleString('fr-FR')} FCFA`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
