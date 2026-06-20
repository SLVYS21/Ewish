import { useInView } from '../hooks/useInView';
import s from './Testimonials.module.css';

const STORIES = [
  {
    id: 'fatou',
    initial: 'F',
    grad: 'a',
    name: 'Fatou',
    where: '34 ans · Dakar',
    role: 'pour ses 60 ans de maman',
    quote:
      "Quand maman a ouvert le lien le matin de son anniversaire, elle a appelé toute la famille. Trois mois après, elle me le montre encore sur son téléphone.",
  },
  {
    id: 'christian',
    initial: 'C',
    grad: 'b',
    name: 'Christian',
    where: 'RH chez Atlantis Bank · Cotonou',
    role: "pour le départ d'une collègue",
    quote:
      "On a fait un mur collectif pour Mariama, 12 ans dans la boîte. 40 collègues ont laissé un mot. Ça a déclenché quelque chose qu'un bouquet de fleurs n'aurait pas eu.",
  },
  {
    id: 'amadou',
    initial: 'A',
    grad: 'c',
    name: 'Amadou',
    where: '41 ans · Abidjan',
    role: 'pour les 70 ans de papa',
    quote:
      "Mon père a beaucoup voyagé, sa famille est éparpillée entre 4 pays. Avec un mur + cagnotte, tout le monde a pu écrire un mot. La cagnotte a tourné toute seule.",
  },
];

export default function Testimonials() {
  const [ref, inView] = useInView();

  return (
    <section className={s.section} id="testimonials" ref={ref}>
      <div className={s.wrap}>
        <div className={s.head}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot} /> Ce que ça change
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Trois personnes,<br/>
            trois <em className="it rose">moments</em>.
          </h2>
          <p className={`${s.sub} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.16s' }}>
            Pas de notes 5 étoiles. Juste ce que les gens ont fait avec myKado,
            et ce que ça a déclenché autour d'eux.
          </p>
        </div>

        <div className={s.grid}>
          {STORIES.map((t, i) => (
            <article
              key={t.id}
              className={`${s.card} ${inView ? s.revealed : s.reveal}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <svg className={s.quoteMark} viewBox="0 0 32 32" fill="currentColor" aria-hidden>
                <path d="M9 22V14c0-3.3 2.7-6 6-6v3c-1.7 0-3 1.3-3 3v8H9zm10 0V14c0-3.3 2.7-6 6-6v3c-1.7 0-3 1.3-3 3v8h-3z"/>
              </svg>

              <p className={s.quote}>{t.quote}</p>

              <div className={s.author}>
                <div className={`${s.avatar} ${s[`grad-${t.grad}`]}`}>{t.initial}</div>
                <div className={s.authorMeta}>
                  <div className={s.authorName}>{t.name} <span className={s.authorWhere}>· {t.where}</span></div>
                  <div className={s.authorRole}>{t.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={s.bar}>
          <div className={s.barLine} aria-hidden />
          <span className={s.barText}>
            <strong>340+</strong> familles, équipes et amoureux ont déjà créé leur moment.
          </span>
          <div className={s.barLine} aria-hidden />
        </div>
      </div>
    </section>
  );
}
