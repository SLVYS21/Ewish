import { useState } from 'react';
import { X, Check, Loader2, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import { useAuth } from '../admin/context/AuthContext';
import PaymentModal from '../admin/components/PaymentModal';
import s from './WallPublishModal.module.css';

export default function WallPublishModal({ onClose, onConfirm, loading }) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [showPayment, setShowPayment] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0 FCFA',
      credits: 0,
      features: [
        'Jusqu\'à 10 mots textuels',
        'Lien de partage',
        'Cagnotte intégrée'
      ],
      disabledFeatures: [
        'Messages avec photos/vidéos',
        'Exportation PDF du mur',
        'Exportation vidéo'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '2 500 FCFA',
      credits: 5,
      icon: <Sparkles size={16} />,
      features: [
        'Jusqu\'à 100 mots',
        'Photos, GIFs et vidéos',
        'Exportation PDF du mur',
        'Exportation vidéo'
      ],
      disabledFeatures: []
    },
    {
      id: 'infinite',
      name: 'Illimité',
      price: '10 000 FCFA',
      credits: 20,
      icon: <InfinityIcon size={16} />,
      features: [
        'Mots infinis',
        'Photos, GIFs et vidéos',
        'Exportation PDF du mur',
        'Exportation vidéo'
      ],
      disabledFeatures: []
    }
  ];

  const handleContinue = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan.credits > 0 && user?.credits < plan.credits) {
      setShowPayment(true);
      return;
    }
    onConfirm(selectedPlan);
  };

  return (
    <div className={s.overlay} onClick={!loading ? onClose : undefined}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <h2>Publier votre mur</h2>
          {!loading && <button className={s.closeBtn} onClick={onClose}><X size={20} /></button>}
        </div>

        <div className={s.body}>
          <p className={s.subtitle}>Choisissez un plan pour finaliser et partager votre mur.</p>
          
          <div className={s.plans}>
            {plans.map(plan => {
              const active = selectedPlan === plan.id;
              return (
                <div 
                  key={plan.id}
                  className={`${s.planCard} ${active ? s.active : ''} ${plan.id !== 'free' ? s.premium : ''}`}
                  onClick={() => !loading && setSelectedPlan(plan.id)}
                >
                  <div className={s.planHead}>
                    <div className={s.planName}>
                      {plan.icon} {plan.name}
                    </div>
                    <div className={s.planPrice}>{plan.price}</div>
                  </div>
                  
                  <ul className={s.featureList}>
                    {plan.features.map((f, i) => (
                      <li key={i}><Check size={14} className={s.check} /> {f}</li>
                    ))}
                    {plan.disabledFeatures.map((f, i) => (
                      <li key={i} className={s.disabled}><X size={14} className={s.xIcon} /> {f}</li>
                    ))}
                  </ul>

                  <div className={s.radio}>
                    <div className={`${s.radioDot} ${active ? s.radioDotActive : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={s.footer}>
            <div className={s.balance}>
              Mon solde : <strong>{user?.credits || 0} crédits</strong>
            </div>
            
            <button 
              className={s.submitBtn} 
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: 'mk-spin .75s linear infinite' }} /> Publication en cours...</>
              ) : (
                (() => {
                  const p = plans.find(x => x.id === selectedPlan);
                  if (p.credits > 0 && user?.credits < p.credits) {
                    return `Recharger ${p.credits - (user?.credits || 0)} crédits manquants`;
                  }
                  return `Publier en ${p.name}`;
                })()
              )}
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal 
          onClose={() => setShowPayment(false)} 
          onSuccess={() => setShowPayment(false)} 
        />
      )}
    </div>
  );
}
