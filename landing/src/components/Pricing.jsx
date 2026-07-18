import { useState } from 'react';
import s from './Pricing.module.css';
import NotoEmoji from './NotoEmoji';

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PRICES = {
  XOF: {
    carte:  { price: '1 500', unit: 'XOF' },
    mur:    { price: '3 000', unit: 'XOF' },
    cadeau: { price: 'Variable', unit: '' },
  },
  EUR: {
    carte:  { price: '2,50', unit: '€' },
    mur:    { price: '4,90', unit: '€' },
    cadeau: { price: 'Variable', unit: '' },
  },
  USD: {
    carte:  { price: '2.99', unit: 'USD' },
    mur:    { price: '5.99', unit: 'USD' },
    cadeau: { price: 'Variable', unit: '' },
  },
};

const CURRENCIES = [
  { id: 'XOF', label: 'XOF (Afrique de l\'Ouest)' },
  { id: 'EUR', label: 'EUR (Europe)' },
  { id: 'USD', label: 'USD (International)' },
];

const PLANS = [
  {
    id: 'carte',
    name: 'Carte',
    emoji: 'love-letter',
    desc: 'Une carte animée pour un destinataire. Musique, photos, texte, décorations.',
    features: ['Musique intégrée', 'Jusqu\'à 3 photos', 'Export QR, lien, partage'],
    ctaLabel: 'Créer une carte',
    featured: false,
  },
  {
    id: 'mur',
    name: 'Mur',
    emoji: 'party-popper',
    desc: 'Un mur collaboratif illimité pour toute une famille ou une équipe.',
    features: [
      'Contributeurs illimités',
      'Photos, GIFs, audios, vidéos',
      'Cagnotte + modération',
      '4 vues (défilement, 3D, TikTok, projection)',
    ],
    ctaLabel: 'Créer un mur',
    featured: true,
  },
  {
    id: 'cadeau',
    name: 'Cadeau',
    emoji: 'wrapped-gift',
    desc: 'Le montant de ton choix + une commission fixe très basse. Attaché à une carte ou un mur.',
    features: ['Mobile Money local', 'Cartes cadeaux partenaires', 'Retrait cash ou utilisation'],
    ctaLabel: 'Envoyer un cadeau',
    featured: false,
  },
];

export default function Pricing({ onCreate }) {
  const [currency, setCurrency] = useState('XOF');

  return (
    <section id="tarifs" className="mk-section mk-section-muted">
      <div className="mk-container">
        <div className="mk-sec-head">
          <span className="eyebrow">Simple et transparent</span>
          <h2 className="mk-sec-h2">
            Un tarif par création.<br />Aucun abonnement.
          </h2>
          <p className="mk-sec-sub">
            Tu paies uniquement quand tu es prêt à envoyer. Prix ajustés à ta zone géographique.
          </p>
        </div>

        <div className={s.tabs}>
          {CURRENCIES.map((c) => (
            <button
              key={c.id}
              className={`${s.tab} ${currency === c.id ? s.tabActive : ''}`}
              onClick={() => setCurrency(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className={s.grid}>
          {PLANS.map((plan) => {
            const p = PRICES[currency][plan.id];
            return (
              <div key={plan.id} className={`${s.plan} ${plan.featured ? s.featured : ''}`}>
                <div className={s.name}>
                  <NotoEmoji name={plan.emoji} size={28} />
                  <span>{plan.name}</span>
                </div>
                <div className={s.price}>
                  {p.price} <small>{p.unit}</small>
                </div>
                <div className={s.desc}>{plan.desc}</div>
                <ul className={s.list}>
                  {plan.features.map((f) => (
                    <li key={f}><Check />{f}</li>
                  ))}
                </ul>
                <button
                  className={`mk-btn ${plan.featured ? 'mk-btn-primary' : 'mk-btn-outline'}`}
                  onClick={onCreate}
                >
                  {plan.ctaLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
