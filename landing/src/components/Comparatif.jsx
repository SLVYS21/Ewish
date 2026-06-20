import s from './Comparatif.module.css';

/*
  Comparatif WhatsApp gratuit / Carte papier 5000+ FCFA / myKado 500 FCFA
  Inspired by Digital Invite's Paper vs Digital pricing comparison.
*/

const ROWS = [
  { label: 'Personnalisable',          wa: false, paper: 'partial', mk: true  },
  { label: 'Photos & vidéos',          wa: false, paper: false,     mk: true  },
  { label: 'Musique d\'ambiance',      wa: false, paper: false,     mk: true  },
  { label: 'Mots de plusieurs proches', wa: false, paper: false,     mk: true  },
  { label: 'Cagnotte pour le cadeau',   wa: false, paper: false,     mk: true  },
  { label: 'Livraison instantanée',     wa: true,  paper: false,     mk: true  },
  { label: 'Restera dans 10 ans',       wa: false, paper: 'partial', mk: true  },
];

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-label="oui">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const Cross = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-label="non">
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
  </svg>
);
const Half = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-label="partiel">
    <path d="M5 12h14" strokeLinecap="round"/>
  </svg>
);

function Cell({ value }) {
  if (value === true)      return <span className={`${s.mark} ${s.markYes}`}><Check/></span>;
  if (value === false)     return <span className={`${s.mark} ${s.markNo}`}><Cross/></span>;
  if (value === 'partial') return <span className={`${s.mark} ${s.markMid}`}><Half/></span>;
  return null;
}

export default function Comparatif({ onOrder }) {
  return (
    <section className={s.section} id="comparatif">
      <div className={s.wrap}>

        <div className={s.head}>
          <span className={s.eyebrow}>
            <span className={s.eyeDot} /> Comparons honnêtement
          </span>
          <h2 className={s.title}>
            Le message <em className="it">parfait</em>,<br/>
            au prix d'un <em className="it gold">croissant</em>.
          </h2>
          <p className={s.sub}>
            On n'a rien contre WhatsApp — mais à 500 FCFA, on peut faire infiniment mieux
            qu'un emoji gâteau envoyé entre deux notifs.
          </p>
        </div>

        <div className={s.cards}>

          {/* WhatsApp */}
          <div className={s.col}>
            <div className={s.colHead}>
              <div className={s.colName}>WhatsApp</div>
              <div className={s.colPrice}>0 FCFA</div>
              <div className={s.colTag}>Gratuit, mais oubliable</div>
            </div>
            <ul className={s.rows}>
              {ROWS.map((r, i) => (
                <li key={i} className={s.row}>
                  <Cell value={r.wa} />
                  <span className={s.rowLbl}>{r.label}</span>
                </li>
              ))}
            </ul>
            <div className={s.colFoot}>
              <span className={s.footNote}>Lu en 2s, oublié en 5 minutes.</span>
            </div>
          </div>

          {/* Carte papier */}
          <div className={s.col}>
            <div className={s.colHead}>
              <div className={s.colName}>Carte papier</div>
              <div className={s.colPrice}>5 000+ FCFA</div>
              <div className={s.colTag}>Jolie, mais lente</div>
            </div>
            <ul className={s.rows}>
              {ROWS.map((r, i) => (
                <li key={i} className={s.row}>
                  <Cell value={r.paper} />
                  <span className={s.rowLbl}>{r.label}</span>
                </li>
              ))}
            </ul>
            <div className={s.colFoot}>
              <span className={s.footNote}>Une seule personne signe. Livraison en jours.</span>
            </div>
          </div>

          {/* myKado — highlight */}
          <div className={`${s.col} ${s.colHero}`}>
            <div className={s.badge}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z"/>
              </svg>
              Recommandé
            </div>
            <div className={s.colHead}>
              <div className={s.colName}>
                <span>my</span><em className="it rose">Kado</em>
              </div>
              <div className={s.colPrice}>500 FCFA<span className={s.priceSm}>/1 crédit</span></div>
              <div className={s.colTag}>Le bon équilibre</div>
            </div>
            <ul className={s.rows}>
              {ROWS.map((r, i) => (
                <li key={i} className={s.row}>
                  <Cell value={r.mk} />
                  <span className={s.rowLbl}>{r.label}</span>
                </li>
              ))}
            </ul>
            <button type="button" className={s.cta} onClick={() => onOrder?.()}>
              Créer mon vœu
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={s.colFoot}>
              <span className={s.footNoteRose}>Gratuit jusqu'à la publication.</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
