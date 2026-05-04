import { useState, useEffect } from 'react';
import { useKKiaPay } from 'kkiapay-react';
import { verifyKkiapayTransaction } from '../../utils/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import s from './PaymentModal.module.css';

const CREDIT_PRICE_FCFA = 100;

export default function PaymentModal({ onClose, onSuccess }) {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState(10); // Default 10 credits
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [method, setMethod] = useState('kkiapay');

  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();

  useEffect(() => {
    function successHandler(response) {
      console.log('Kkiapay Success:', response);
      setLoading(true);
      setError('');
      
      // Verify transaction on backend
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
      const amountFCFA = amount * CREDIT_PRICE_FCFA;
      // You should replace api_key with the actual public key from your env variables.
      // In a real scenario, you might want to fetch it from the server, but Kkiapay allows using public key on client.
      openKkiapayWidget({
        amount: amountFCFA,
        api_key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || 'votre_cle_publique_ici',
        sandbox: import.meta.env.VITE_KKIAPAY_SANDBOX === 'true' || true,
        email: user?.email || '',
        name: user?.name || '',
        theme: "#000000"
      });
    }
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
              <div className={s.field}>
                <label>Combien de crédits souhaitez-vous ?</label>
                <div className={s.amountWrap}>
                  <input 
                    type="number" 
                    min="1" 
                    max="1000" 
                    value={amount} 
                    onChange={e => setAmount(parseInt(e.target.value) || 0)}
                    className={s.input}
                  />
                  <span className={s.creditsSuffix}>crédits</span>
                </div>
                <div className={s.priceHint}>
                  Total à payer : <strong>{amount * CREDIT_PRICE_FCFA} FCFA</strong> (1 crédit = {CREDIT_PRICE_FCFA} FCFA)
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
                  <label className={`${s.method} ${s.disabled}`} title="Bientôt disponible">
                    <input 
                      type="radio" 
                      name="method" 
                      value="stripe" 
                      disabled
                    />
                    <div className={s.methodInfo}>
                      <CreditCard size={20} />
                      <span>Carte Bancaire (Stripe - Bientôt)</span>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className={s.errorBox}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                className={s.payBtn} 
                onClick={handlePay} 
                disabled={loading || amount <= 0}
              >
                {loading ? 'Traitement en cours...' : `Payer ${amount * CREDIT_PRICE_FCFA} FCFA`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
