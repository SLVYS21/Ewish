import { useInView } from '../hooks/useInView';
import s from './FAQ.module.css';

const FAQS = [
  {
    q: 'Comment fonctionnent les crédits ?',
    a: "Le crédit est l’unité de paiement de myKado. <strong>1 crédit = 500 XOF.</strong> Chaque création consomme un nombre de crédits selon sa complexité : un vœu standard coûte 5 à 10 crédits, un vœu collectif jusqu’à 40 crédits. En achetant un pack, vous bénéficiez de crédits bonus offerts (jusqu’à +25%). Les crédits n’expirent jamais.",
  },
  {
    q: 'Combien de temps pour recevoir mon animation ?',
    a: "La livraison standard est garantie en moins de <strong>24 heures</strong>. Pour les projets collectifs avec contributions externes, le délai démarre à la clôture des participations. Si nous dépassons 24h, vos crédits vous sont intégralement remboursés.",
  },
  {
    q: 'Puis-je payer par Mobile Money ou virement bancaire ?',
    a: "Oui — myKado accepte Orange Money, MTN MoMo, Moov Money, Wave, virement bancaire et carte bancaire. Les paiements sont sécurisés et conformes aux standards PCI-DSS.",
  },
  {
    q: 'Mes contenus et photos sont-ils protégés ?',
    a: "Chaque animation est hébergée sur un lien privé non indexé. Vous restez propriétaire de vos contenus à 100%, et nous ne les utilisons jamais à des fins commerciales. myKado est conforme RGPD et au cadre légal de l’UEMOA.",
  },
  {
    q: 'Existe-t-il une formule pour les entreprises avec gros volume ?',
    a: "Oui. Au-delà de 100 crédits par mois, nous proposons des tarifs négociés, un accompagnement dédié, et une API pour intégrer myKado à vos workflows RH ou marketing. <a href=\"mailto:contact@mykado.app\">Contactez l’équipe commerciale</a>.",
  },
];

export default function FAQ() {
  const [ref, inView] = useInView();

  return (
    <section className={s.faq} id="faq" ref={ref}>
      <div className={s.wrap}>
        <div className={s.secHead}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot}></span> Questions fréquentes
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Tout ce que vous voulez savoir.
          </h2>
        </div>

        <div className={s.faqGrid}>
          {FAQS.map((item, i) => (
            <details
              key={i}
              className={`${s.faqItem} ${inView ? s.revealed : s.reveal}`}
              style={{ transitionDelay: `${i * 0.05}s` }}
              open={i === 0}
            >
              <summary>
                {item.q}
                <span className={s.faqIcon}>+</span>
              </summary>
              <div className={s.faqBody} dangerouslySetInnerHTML={{ __html: item.a }} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
