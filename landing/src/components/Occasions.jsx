import { useInView } from '../hooks/useInView';
import s from './Occasions.module.css';

const OCCASIONS = [
  {
    id: 'birthday',
    tone: 'rose',
    title: 'Anniversaire',
    sub: 'Maman, ton meilleur ami, ton manager.',
    teaser: 'Photo, musique, gâteau qui souffle, message qui reste.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M5 24v-7c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2v7" strokeLinecap="round"/>
        <path d="M3 24h26" strokeLinecap="round"/>
        <path d="M11 15v-3M16 15v-3M21 15v-3" strokeLinecap="round"/>
        <circle cx="11" cy="10" r="1.4" fill="currentColor" stroke="none"/>
        <circle cx="16" cy="10" r="1.4" fill="currentColor" stroke="none"/>
        <circle cx="21" cy="10" r="1.4" fill="currentColor" stroke="none"/>
        <path d="M11 8c0-1 .5-2 0-3M16 8c0-1 .5-2 0-3M21 8c0-1 .5-2 0-3" strokeLinecap="round" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: 'wedding',
    tone: 'peach',
    title: 'Mariage',
    sub: 'Demande, mariage, anniversaire de couple.',
    teaser: 'Élégant, doré, mouvements doux. Pour un moment qui se garde à vie.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="12" cy="18" r="6"/>
        <circle cx="20" cy="18" r="6"/>
        <path d="M12 9l2 3M20 9l-2 3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'departure',
    tone: 'gold',
    title: 'Départ / Retraite',
    sub: 'Quand un collègue part, marque le coup.',
    teaser: "Signatures de l'équipe, photos partagées, mot du dirigeant.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M16 4v18M16 4l-5 5M16 4l5 5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 22v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'birth',
    tone: 'mint',
    title: 'Naissance',
    sub: 'Annoncer un bébé avec autre chose qu\'un faire-part.',
    teaser: 'Pastel doux, illustrations rondes, vœux de toute la famille.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <ellipse cx="16" cy="14" rx="8" ry="9"/>
        <path d="M11 13.5h.5M20.5 13.5h.5" strokeLinecap="round"/>
        <path d="M13 17.5c1 1 2 1.5 3 1.5s2-.5 3-1.5" strokeLinecap="round"/>
        <path d="M8 8c-1 0-2 1-2 3" strokeLinecap="round" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: 'memorial',
    tone: 'lilac',
    title: 'Hommage',
    sub: 'Pour honorer un proche avec dignité.',
    teaser: 'Sobre, intemporel. Cadres et typographie classique. Jamais cheesy.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M16 4c-3 4-6 6-6 11a6 6 0 0 0 12 0c0-5-3-7-6-11z"/>
        <path d="M16 21v6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'team',
    tone: 'ink',
    title: "Mots d'équipe",
    sub: 'Bravo collectif, milestone, fin de projet.',
    teaser: 'Mur où chacun écrit, photo de groupe, QR sur slide Slack.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="10" cy="11" r="3.5"/>
        <circle cx="22" cy="11" r="3.5"/>
        <circle cx="16" cy="22" r="3.5"/>
        <path d="M13 13l3 6M19 13l-3 6" strokeLinecap="round" opacity=".5"/>
      </svg>
    ),
  },
];

export default function Occasions() {
  const [ref, inView] = useInView();

  return (
    <section className={s.section} id="occasions" ref={ref}>
      <div className={s.wrap}>
        <div className={s.head}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot} /> Tu fêtes quoi ?
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Choisis l'<em className="it rose">occasion</em>,<br/>
            on s'occupe du <em className="it">reste</em>.
          </h2>
          <p className={`${s.sub} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.16s' }}>
            Six grands moments. Pour chacun, un template fait pour l'émotion juste —
            ni cheesy, ni froid, ni générique.
          </p>
        </div>

        <div className={s.grid}>
          {OCCASIONS.map((o, i) => (
            <a
              key={o.id}
              href="#templates"
              className={`${s.tile} ${s[`tone-${o.tone}`]} ${inView ? s.revealed : s.reveal}`}
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className={s.tileIco}>{o.icon}</div>
              <div className={s.tileBody}>
                <h3 className={s.tileTitle}>{o.title}</h3>
                <p className={s.tileSub}>{o.sub}</p>
                <p className={s.tileTeaser}>{o.teaser}</p>
              </div>
              <div className={s.tileLink}>
                Voir des exemples
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={s.tileGlow} aria-hidden />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
