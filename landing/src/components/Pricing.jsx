import { useInView } from '../hooks/useInView';
import s from './Pricing.module.css';

const PLANS = [
  {
    name: 'Découverte',
    pitch: 'Pour tester avec un premier vœu personnel.',
    credits: 5, bonus: null,
    price: '2 500', priceNote: '· 500/crédit',
    cta: 'Acheter 5 crédits',
    perks: ['Templates standards', "Jusqu'à 12 photos / vœu", 'Musique de bibliothèque', 'Partage par lien & QR', 'Support par email'],
    featured: false,
  },
  {
    name: 'Essentiel',
    pitch: "L'équilibre idéal pour un projet familial.",
    credits: 12, bonus: '+2 crédits offerts',
    price: '6 000', priceNote: '· soit 429/crédit',
    cta: 'Acheter 12+2 crédits',
    perks: ['Tous les templates standards', "Jusqu'à 24 photos / vœu", 'Musique personnalisée (MP3)', '1 vœu collectif (jusqu\'à 20 pers.)', 'Livraison 24h garantie'],
    featured: false,
  },
  {
    name: 'Pro',
    pitch: 'Pour équipes RH, agences et créateurs réguliers.',
    credits: 30, bonus: '+6 crédits offerts',
    price: '15 000', priceNote: '· soit 417/crédit',
    cta: 'Acheter 30+6 crédits',
    perks: ['Templates premium & nouveautés', 'Photos & vidéos illimitées', "Vœux collectifs (jusqu'à 100 pers.)", 'QR code aux couleurs de marque', 'Lien promo & tracking de clics', 'Support prioritaire WhatsApp'],
    featured: true,
  },
  {
    name: 'Entreprise',
    pitch: 'Pour campagnes saisonnières & usages récurrents.',
    credits: 80, bonus: '+20 crédits offerts (+25%)',
    price: '40 000', priceNote: '· soit 400/crédit',
    cta: 'Acheter 80+20 crédits',
    perks: ['Tout du plan Pro', 'Vœux collectifs illimités', 'Branding complet & sous-domaine', 'Espace multi-utilisateurs', 'Facturation entreprise', 'Accompagnement dédié'],
    featured: false,
  },
];

export default function Pricing({ onOrder }) {
  const [ref, inView] = useInView();

  return (
    <section className={s.pricing} id="pricing" ref={ref}>
      <div className={s.wrap}>
        <div className={s.secHead}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot}></span> Tarification simple
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Payez en <em>crédits</em>,<br />économisez avec les packs.
          </h2>
          <p className={`${s.sub} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.16s' }}>
            Une seule unité, des paliers de bonus, aucun abonnement. Vos crédits ne s'expirent jamais.
          </p>
        </div>

        {/* Credit explainer */}
        <div className={`${s.pricingExplainer} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.2s' }}>
          <div className={s.peCoin}>1<small>cr</small></div>
          <div className={s.peContent}>
            <div className={s.peEq}>1 crédit = <em>500 XOF</em></div>
            <div className={s.peDesc}>
              Le crédit est l'unité universelle de myKado. Une animation simple coûte de 5 à 10 crédits, un projet collectif d'équipe entre 20 et 40 crédits.{' '}
              <strong style={{ color: 'var(--ivory)' }}>Achetez à la carte, sans surprise.</strong>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className={s.plans}>
          {PLANS.map((plan, i) => (
            <article
              key={plan.name}
              className={`${s.plan} ${plan.featured ? s.featured : ''} ${inView ? s.revealed : s.reveal}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              {plan.featured && <span className={s.planBadge}>★ Plus populaire</span>}
              <div className={s.planName}>{plan.name}</div>
              <div className={s.planPitch}>{plan.pitch}</div>
              <div className={s.planCredits}>
                <span className={s.num}>{plan.credits}</span>
                <span className={s.lab}>crédits</span>
              </div>
              <span className={`${s.planBonus} ${!plan.bonus ? s.none : ''}`}>
                {plan.bonus || '+0 bonus'}
              </span>
              <div className={s.planPrice}>
                <strong>{plan.price}</strong> XOF <small>{plan.priceNote}</small>
              </div>
              <div className={s.planDivider}></div>
              <ul className={s.planPerks}>
                {plan.perks.map((perk, j) => (
                  <li key={j}>
                    <span className={s.check}>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button className={s.planCta} onClick={onOrder}>{plan.cta}</button>
            </article>
          ))}
        </div>

        <p className={`${s.pricingFootnote} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.4s' }}>
          Besoin de plus de 100 crédits par mois ou d'un accès API ?{' '}
          <a href="mailto:contact@mykado.app">Parlons-en.</a>
        </p>
      </div>
    </section>
  );
}
