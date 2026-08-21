import { useState } from 'react';
import { X, Check, Loader2, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import { useAuth } from '../admin/context/AuthContext';
import useFeexPay from '../utils/useFeexPay';
import s from './WallPublishModal.module.css';

/* Doit rester aligné avec WALL_PLAN_PRICES côté serveur (publication.js). */
const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0 FCFA',
    priceFCFA: 0,
    credits: 0,
    features: [
      'Jusqu\'à 10 mots textuels',
      'Lien de partage',
      'Cagnotte intégrée',
    ],
    disabledFeatures: [
      'Messages avec photos/vidéos',
      'Exportation PDF du mur',
      'Exportation vidéo',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '2 500 FCFA',
    priceFCFA: 2500,
    credits: 5,
    icon: <Sparkles size={16} />,
    features: [
      'Jusqu\'à 100 mots',
      'Photos, GIFs et vidéos',
      'Exportation PDF du mur',
      'Exportation vidéo',
    ],
    disabledFeatures: [],
  },
  {
    id: 'infinite',
    name: 'Illimité',
    price: '10 000 FCFA',
    priceFCFA: 10000,
    credits: 20,
    icon: <InfinityIcon size={16} />,
    features: [
      'Mots infinis',
      'Photos, GIFs et vidéos',
      'Exportation PDF du mur',
      'Exportation vidéo',
    ],
    disabledFeatures: [],
  },
];

export default function WallPublishModal({ onClose, onConfirm, loading, pubId }) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('free');
  const { openCheckout, feexpayModal } = useFeexPay();

  const plan = PLANS.find(p => p.id === selectedPlan);
  const userCredits = user?.credits || 0;
  const canBypass = user?.canBypassPaywall === true;
  const hasEnoughCredits = plan.credits === 0 || userCredits >= plan.credits || canBypass;

  const handleContinue = () => {
    if (plan.credits === 0 || canBypass) {
      onConfirm(selectedPlan);
      return;
    }
    if (hasEnoughCredits) {
      /* Chemin crédits legacy — le serveur déduira. */
      onConfirm(selectedPlan);
      return;
    }
    /* Chemin FeexPay — checkout direct au montant du plan. */
    openCheckout({
      amount:      plan.priceFCFA,
      description: `myKado — Mur ${plan.name}`,
      customId:    pubId ? `wall:${pubId}` : `wall_${Date.now()}`,
      onSuccess: ({ reference }) => onConfirm(selectedPlan, reference),
    });
  };

  return (
    <>
      <div className={s.overlay} onClick={!loading ? onClose : undefined}>
        <div className={s.modal} onClick={e => e.stopPropagation()}>
          <div className={s.header}>
            <h2>Publier votre mur</h2>
            {!loading && <button className={s.closeBtn} onClick={onClose}><X size={20} /></button>}
          </div>

          <div className={s.body}>
            <p className={s.subtitle}>Choisissez un plan pour finaliser et partager votre mur.</p>

            <div className={s.plans}>
              {PLANS.map(p => {
                const active = selectedPlan === p.id;
                return (
                  <div
                    key={p.id}
                    className={`${s.planCard} ${active ? s.active : ''} ${p.id !== 'free' ? s.premium : ''}`}
                    onClick={() => !loading && setSelectedPlan(p.id)}
                  >
                    <div className={s.planHead}>
                      <div className={s.planName}>
                        {p.icon} {p.name}
                      </div>
                      <div className={s.planPrice}>{p.price}</div>
                    </div>

                    <ul className={s.featureList}>
                      {p.features.map((f, i) => (
                        <li key={i}><Check size={14} className={s.check} /> {f}</li>
                      ))}
                      {p.disabledFeatures.map((f, i) => (
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
          </div>

          {/* Footer sorti de .body pour rester sticky en bas quand la liste
              des plans est scrollée sur petits écrans. */}
          <div className={s.footer}>
            <div className={s.balance}>
              {userCredits > 0
                ? <>Solde crédits : <strong>{userCredits}</strong></>
                : <>Paiement Mobile Money ou carte</>}
            </div>

            <button
              className={s.submitBtn}
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: 'mk-spin .75s linear infinite' }} /> Publication en cours…</>
              ) : (
                plan.credits === 0
                  ? `Publier en ${plan.name}`
                  : canBypass
                    ? `Publier gratuitement (Mode testeur)`
                    : hasEnoughCredits
                      ? `Publier avec ${plan.credits} crédits`
                      : `Payer ${plan.priceFCFA.toLocaleString('fr-FR')} FCFA`
              )}
            </button>
          </div>
        </div>
      </div>
      {feexpayModal}
    </>
  );
}
