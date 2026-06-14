import { useInView } from '../hooks/useInView';
import s from './Testimonials.module.css';

const TESTIMONIALS = [
  { initial: 'A', name: 'Aminata K.',     role: 'Pour son mari',           text: "«J’ai commandé pour l’anniversaire de mon mari. Il a fondu en larmes. Les photos, la musique, tout était parfait.»" },
  { initial: 'C', name: 'Christian M.',   role: 'DRH · 80 personnes',      text: "«Le collectif pro pour notre directeur  40 collègues ont participé. Une expérience inoubliable, à recommander.»" },
  { initial: 'F', name: 'Fatou D.',       role: 'Pour sa mère',            text: "«Simple à commander, livré en 24h, vraiment beau. Ma mère l’a regardé trois fois de suite et l’a envoyé à toute la famille.»" },
  { initial: 'J', name: 'Jean-Pierre T.', role: 'Directeur marketing',     text: "«Notre campagne de fin d’année avec myKado a généré 38% de clics en plus sur notre site. Le QR code a fait la différence.»" },
];

export default function Testimonials() {
  const [ref, inView] = useInView();

  return (
    <section className={s.testimonials} ref={ref}>
      <div className={s.wrap}>
        <div className={s.secHead}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot}></span> Ils nous font confiance
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Des voeux qui <em>restent</em>.
          </h2>
          <p className={`${s.sub} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.16s' }}>
            {'★★★★★'} 4,9 / 5 &mdash; basé sur plus de 340 avis vérifiés.
          </p>
        </div>

        <div className={s.testGrid}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className={`${s.tCard} ${inView ? s.revealed : s.reveal}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className={s.tStars}>{'★★★★★'}</div>
              <p className={s.tQuote}>{t.text}</p>
              <div className={s.tAuthor}>
                <div className={s.tAvatar}>{t.initial}</div>
                <div>
                  <div className={s.tName}>{t.name}</div>
                  <div className={s.tRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
