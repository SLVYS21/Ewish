import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import s from './Pricing.module.css';
import NotoEmoji from './NotoEmoji';

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PRICES = {
  XOF: { carte: { price: '1 500', unit: 'XOF' }, mur: { price: '3 000', unit: 'XOF' }, cadeau: { price: 'Variable', unit: '' } },
  EUR: { carte: { price: '2,50', unit: '€' }, mur: { price: '4,90', unit: '€' }, cadeau: { price: 'Variable', unit: '' } },
  USD: { carte: { price: '2.99', unit: 'USD' }, mur: { price: '5.99', unit: 'USD' }, cadeau: { price: 'Variable', unit: '' } },
};

const CURRENCIES = [
  { id: 'XOF', label: 'XOF (Afrique)' },
  { id: 'EUR', label: 'EUR (Europe)' },
  { id: 'USD', label: 'USD (Inter)' },
];

const PLANS = [
  {
    id: 'carte',
    name: 'Carte',
    emoji: 'love-letter',
    desc: 'Une carte animée pour un destinataire. Musique, photos, texte, décorations.',
    features: ['Musique intégrée', "Jusqu'à 3 photos", 'Export QR, lien, partage'],
    ctaLabel: 'Créer une carte',
    featured: false,
  },
  {
    id: 'mur',
    name: 'Mur Collaboratif',
    emoji: 'party-popper',
    desc: 'Un mur illimité pour toute une famille ou une équipe avec cagnotte.',
    features: ['Contributeurs illimités', 'Photos, GIFs, audios', 'Cagnotte intégrée', '4 vues de projection'],
    ctaLabel: 'Créer un mur',
    featured: true,
  },
  {
    id: 'cadeau',
    name: 'Cadeaux',
    emoji: 'wrapped-gift',
    desc: 'Le montant de ton choix + une commission fixe très basse.',
    features: ['Mobile Money local', 'Cartes partenaires', 'Retrait cash sécurisé'],
    ctaLabel: 'Envoyer un cadeau',
    featured: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Pricing({ onCreate }) {
  const [currency, setCurrency] = useState('XOF');

  return (
    <section id="tarifs" className="mk-section mk-section-muted">
      <div className="mk-container">
        <div className="mk-sec-head">
          <span className="eyebrow">Tarifs Transparents</span>
          <h2 className="mk-sec-h2">Un tarif unique.<br />Pas d'abonnement.</h2>
          <p className="mk-sec-sub">
            La création est 100% gratuite. Vous payez uniquement lorsque vous décidez de partager votre création finale.
          </p>
        </div>

        <div className={s.tabs}>
          {CURRENCIES.map((c) => (
            <button
              key={c.id}
              className={`${s.tab} ${currency === c.id ? s.tabActive : ''}`}
              onClick={() => setCurrency(c.id)}
            >
              {currency === c.id && (
                <motion.div layoutId="activeTab" className={s.activeTabIndicator} />
              )}
              <span style={{ position: 'relative', zIndex: 2 }}>{c.label}</span>
            </button>
          ))}
        </div>

        <motion.div 
          className={s.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {PLANS.map((plan) => {
            const p = PRICES[currency][plan.id];
            return (
              <motion.div 
                key={plan.id} 
                variants={cardVariants}
                className={`${s.plan} ${plan.featured ? s.featured : ''}`}
              >
                <div className={s.name}>
                  <NotoEmoji name={plan.emoji} size={28} />
                  <span>{plan.name}</span>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={p.price + p.unit}
                    className={s.price}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {p.price} <small>{p.unit}</small>
                  </motion.div>
                </AnimatePresence>

                <div className={s.desc}>{plan.desc}</div>
                <ul className={s.list}>
                  {plan.features.map((f) => (
                    <li key={f}><Check />{f}</li>
                  ))}
                </ul>
                <button
                  className={`mk-btn ${plan.featured ? 'mk-btn-primary' : 'mk-btn-outline'}`}
                  onClick={onCreate}
                  style={{ width: '100%', marginTop: '24px' }}
                >
                  {plan.ctaLabel}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
