import { useState } from 'react';
import s from './FAQ.module.css';

const FAQS = [
  {
    q: 'Comment fonctionne une carte de groupe ?',
    a: 'C\'est très simple : vous choisissez un modèle, puis vous partagez un lien d\'invitation unique à vos amis, votre famille ou vos collègues. Chacun peut ajouter son message, des photos ou même des vidéos depuis son téléphone, sans avoir besoin de créer de compte. Une fois terminée, vous offrez la carte au destinataire !'
  },
  {
    q: 'Est-ce vraiment gratuit ?',
    a: 'Oui, la création d\'une carte de groupe de base et l\'ajout de messages textes ou photos sont 100% gratuits. Nous proposons également des options Premium pour ceux qui souhaitent ajouter des vidéos plus longues, des musiques personnalisées ou conserver la carte à vie sans limite.'
  },
  {
    q: 'Puis-je joindre une cagnotte à ma carte ?',
    a: 'Absolument ! Lors de la création de votre carte, vous pouvez activer l\'option Cagnotte. Vos invités pourront ainsi participer financièrement au cadeau commun en même temps qu\'ils laissent leur mot. C\'est 100% sécurisé.'
  },
  {
    q: 'Les invités ont-ils besoin de s\'inscrire ?',
    a: 'Pas du tout. Les participants n\'ont qu\'à cliquer sur votre lien d\'invitation pour signer la carte. C\'est pensé pour être le plus rapide et accessible possible, même pour les moins technophiles.'
  },
  {
    q: 'Le destinataire peut-il voir les messages avant le jour J ?',
    a: 'Non ! Tant que vous (le créateur) ne lui avez pas envoyé le lien final de la carte terminée, tout reste confidentiel. Vous gardez un contrôle total et pouvez même modérer ou réorganiser les messages avant d\'offrir la carte.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={s.section} id="faq">
      <div className={`mk-container ${s.container}`}>
        <h2 className={s.title}>Questions fréquentes</h2>
        <div className={s.list}>
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className={`${s.item} ${isOpen ? s.open : ''}`}
                onClick={() => toggleFAQ(i)}
              >
                <div className={s.questionRow}>
                  <h3 className={s.q}>{faq.q}</h3>
                  <button className={s.toggleBtn} aria-label="Toggle">
                    {isOpen ? '−' : '+'}
                  </button>
                </div>
                <div className={s.answerWrap} style={{ maxHeight: isOpen ? '500px' : '0' }}>
                  <p className={s.a}>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

