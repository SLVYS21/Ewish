import { useInView } from '../hooks/useInView';
import s from './HowItWorks.module.css';

const STEPS = [
  {
    n: '01',
    title: 'Tu choisis le format',
    body: "Une carte animée pour une personne, ou un mur où toute la famille / l'équipe écrit. Choisis ton occasion : anniversaire, mariage, départ, hommage…",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <rect x="5" y="6" width="10" height="20" rx="2"/>
        <rect x="18" y="6" width="9" height="9" rx="1.6"/>
        <rect x="18" y="17" width="9" height="9" rx="1.6"/>
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Tu personnalises gratuit',
    body: "Prénom, photos, musique, mot manuscrit, palette, cagnotte. L'éditeur est gratuit. Tu joues, tu testes, tu revois autant de fois que tu veux.",
    pill: { tone: 'rose', text: 'Aucun centime jusqu\'ici' },
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M5 27l5-1 14-14-4-4L6 22l-1 5z" strokeLinejoin="round"/>
        <path d="M19 8l4 4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Tu partages, le moment commence',
    body: "Lien court + QR en forme de cœur + boutons WhatsApp, Instagram, story. Tu paies les crédits uniquement à ce moment-là — et c'est en ligne.",
    pill: { tone: 'gold', text: 'Le seul moment où tu paies' },
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="8" cy="16" r="3"/>
        <circle cx="24" cy="8" r="3"/>
        <circle cx="24" cy="24" r="3"/>
        <path d="M11 14l10-5M11 18l10 5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const [ref, inView] = useInView();

  return (
    <section className={s.section} id="how" ref={ref}>
      <div className={s.wrap}>
        <div className={s.head}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot} /> En 3 étapes
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Tu personnalises d'abord.<br/>
            Tu paies <em className="it gold">seulement</em> pour publier.
          </h2>
          <p className={`${s.sub} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.16s' }}>
            Pas d'abonnement, pas de mauvaise surprise. Tu vois exactement
            ce que coûte ton vœu avant d'engager un centime.
          </p>
        </div>

        <div className={s.steps}>
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`${s.step} ${inView ? s.revealed : s.reveal}`}
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <div className={s.stepNum}>{step.n}</div>
              <div className={s.stepIco}>{step.icon}</div>
              <h3 className={s.stepTitle}>{step.title}</h3>
              <p className={s.stepBody}>{step.body}</p>
              {step.pill && (
                <span className={`${s.stepPill} ${s[`pill-${step.pill.tone}`]}`}>
                  <span className={s.pillDot} /> {step.pill.text}
                </span>
              )}
            </div>
          ))}

          <div className={s.connector} aria-hidden />
        </div>
      </div>
    </section>
  );
}
