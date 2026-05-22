import { useInView } from '../hooks/useInView';
import s from './HowItWorks.module.css';

const STEPS = [
  { n: '01', title: 'Créez votre compte',       desc: 'Inscription gratuite, en 2 minutes. Accès immédiat à l\'éditeur.' },
  { n: '02', title: 'Personnalisez librement',   desc: "Photos, musique, décors, QR code — depuis l'éditeur visuel. Sans payer." },
  { n: '03', title: 'Achetez vos crédits',       desc: 'Seulement avant de publier. À la carte ou en pack avec crédits bonus.' },
  { n: '04', title: 'Publiez & partagez',        desc: 'Lien privé, QR code, WhatsApp ou email. Vu, rejoué, conservé.' },
];

export default function HowItWorks() {
  const [ref, inView] = useInView();

  return (
    <section className={s.how} id="how" ref={ref}>
      <div className={s.wrap}>
        <div className={s.secHead}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot}></span> Comment ça marche
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Du brief au partage, <em>en quatre étapes.</em>
          </h2>
        </div>

        <div className={s.howGrid}>
          <div className={s.howLine} aria-hidden="true"></div>
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`${s.howStep} ${inView ? s.revealed : s.reveal}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className={`${s.howNum} ${s[`step${i + 1}`]}`}>{step.n}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
