import { useEffect, useRef } from 'react';
import { useInView } from '../hooks/useInView';
import s from './Features.module.css';

const FEATURES = [
  {
    title: 'Templates animés',
    desc: '15+ designs pour anniversaires, hommages, départs en retraite, fêtes religieuses et célébrations d\'équipe.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
  },
  {
    title: 'Décors & arrière-plans',
    desc: 'Confettis, ballons, motifs floraux, dégradés sur-mesure — adaptez chaque détail à l\'occasion.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
      </svg>
    ),
  },
  {
    title: 'QR codes stylisés',
    desc: 'Formes, couleurs et logos personnalisés. Un QR code aussi élégant que votre marque.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18v3M21 18h-1M21 21h-3v-2"/>
      </svg>
    ),
  },
  {
    title: 'Lien promo intégré',
    desc: 'Ajoutez l\'URL de votre boutique, votre site ou une offre. La visibilité de votre marque, garantie.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  {
    title: 'Vœux collectifs',
    desc: 'Invitez 5, 50 ou 500 contributeurs. Chacun ajoute son message et sa photo dans un souvenir partagé.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: 'Livraison garantie 24h',
    desc: 'Votre animation prête en moins de 24 heures, prête à partager. Sinon, vos crédits sont remboursés.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 Z"/>
      </svg>
    ),
  },
];

export default function Features() {
  const [ref, inView] = useInView();

  return (
    <section className={s.features} ref={ref}>
      <div className={s.wrap}>
        <div className={s.secHead}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot}></span> Pourquoi myKado
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Une plateforme <em>complète</em>,<br />pas un simple générateur de cartes.
          </h2>
          <p className={`${s.sub} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.16s' }}>
            Chaque détail compte. myKado réunit les outils d'un studio créatif, sans la complexité.
          </p>
        </div>

        <div className={s.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`${s.fCard} ${inView ? s.revealed : ''}`}
              style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
            >
              <div className={s.fIcon}>{f.svg}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
