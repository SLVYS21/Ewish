import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Heart, Users, Gift, Sparkles } from 'lucide-react';
import s from './Pricing.module.css';

const PRICES = {
  XOF: { carte: { price: '1 500', unit: 'XOF' }, mur: { price: '3 000', unit: 'XOF' }, cadeau: { price: 'Variable', unit: '' } },
  EUR: { carte: { price: '2,50', unit: '€' },   mur: { price: '4,90', unit: '€' },   cadeau: { price: 'Variable', unit: '' } },
  USD: { carte: { price: '2.99', unit: 'USD' }, mur: { price: '5.99', unit: 'USD' }, cadeau: { price: 'Variable', unit: '' } },
};

const CURRENCIES = [
  { id: 'XOF', label: 'XOF' },
  { id: 'EUR', label: 'EUR' },
  { id: 'USD', label: 'USD' },
];

const PLANS = [
  {
    id: 'carte',
    name: 'Carte',
    Icon: Heart,
    tint: 'clay',
    desc: 'Une carte animée, un destinataire.',
    features: ['Musique intégrée', "Jusqu'à 3 photos", 'Export QR & lien'],
    ctaLabel: 'Créer une carte',
    featured: false,
  },
  {
    id: 'mur',
    name: 'Mur Collaboratif',
    Icon: Users,
    tint: 'indigo',
    desc: 'Un mur illimité, toute une famille ou une équipe.',
    features: ['Contributeurs illimités', 'Photos, GIFs, audios', 'Cagnotte intégrée', '4 vues de projection'],
    ctaLabel: 'Créer un mur',
    featured: true,
  },
  {
    id: 'cadeau',
    name: 'Cadeaux',
    Icon: Gift,
    tint: 'gold',
    desc: 'Le montant de ton choix, commission fixe.',
    features: ['Mobile Money local', 'Cartes partenaires', 'Retrait cash sécurisé'],
    ctaLabel: 'Envoyer un cadeau',
    featured: false,
  },
];

const PAYMENTS = [
  { src: '/logos/mtn.svg',        name: 'MTN MoMo' },
  { src: '/logos/wave.svg',       name: 'Wave' },
  { src: '/logos/moov.svg',       name: 'Moov Money' },
  { src: '/logos/celtiis.svg',    name: 'Celtiis Cash' },
  { src: '/logos/airtel.svg',     name: 'Airtel Money' },
  { src: '/logos/visa.svg',       name: 'Visa' },
  { src: '/logos/mastercard.svg', name: 'Mastercard' },
];

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function Pricing({ onCreate }) {
  const [currency, setCurrency] = useState('XOF');

  return (
    <section id="tarifs" className={s.section}>
      <div className="mk-container">
        <div className={s.head}>
          <span className="eyebrow">Tarifs sans surprise</span>
          <h2 className={s.title}>
            Créer gratuit.<br />
            <em className={s.titleAccent}>Publier</em> quand tu veux.
          </h2>
          <p className={s.sub}>Pas d'abonnement. Un tarif unique par publication.</p>

          <div className={s.tabs} role="tablist" aria-label="Devise">
            {CURRENCIES.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={currency === c.id}
                className={`${s.tab} ${currency === c.id ? s.tabActive : ''}`}
                onClick={() => setCurrency(c.id)}
              >
                {currency === c.id && (
                  <motion.div layoutId="pricingTabPill" className={s.tabPill} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <span className={s.tabLabel}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div
          className={s.grid}
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {PLANS.map((plan) => {
            const p = PRICES[currency][plan.id];
            const { Icon } = plan;
            return (
              <motion.article
                key={plan.id}
                variants={cardVariants}
                className={`${s.plan} ${s[`tint_${plan.tint}`]} ${plan.featured ? s.featured : ''}`}
              >
                {plan.featured && (
                  <span className={s.badge}>
                    <Sparkles size={12} strokeWidth={2.5} />
                    Populaire
                  </span>
                )}

                <div className={s.planHead}>
                  <div className={s.iconChip}>
                    <Icon size={20} strokeWidth={2.2} />
                  </div>
                  <h3 className={s.planName}>{plan.name}</h3>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${plan.id}-${currency}`}
                    className={s.price}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={s.priceValue}>{p.price}</span>
                    {p.unit && <span className={s.priceUnit}>{p.unit}</span>}
                  </motion.div>
                </AnimatePresence>

                <p className={s.desc}>{plan.desc}</p>

                <ul className={s.list}>
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} strokeWidth={2.6} className={s.checkIcon} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`${s.cta} ${plan.featured ? s.ctaPrimary : s.ctaOutline}`}
                  onClick={onCreate}
                >
                  <span className={s.ctaText}>{plan.ctaLabel}</span>
                </button>
              </motion.article>
            );
          })}
        </motion.div>

        <motion.div
          className={s.trust}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className={s.trustLeft}>
            <div className={s.shield}>
              <ShieldCheck size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className={s.trustTitle}>Paiements 100% sécurisés</div>
              <div className={s.trustSub}>Chiffré de bout en bout · Mobile Money & carte bancaire</div>
            </div>
          </div>
          <div className={s.paymentTiles} aria-label="Moyens de paiement acceptés">
            {PAYMENTS.map((p) => (
              <div key={p.src} className={s.paymentTile} title={p.name}>
                <img src={p.src} alt={p.name} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
