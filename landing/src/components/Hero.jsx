import s from './Hero.module.css';
import NotoEmoji from './NotoEmoji';
import Kado from './Kado/Kado';

export default function Hero({ onCreate }) {
  return (
    <section className={s.hero}>
      <div className="mk-container">
        <div className={s.grid}>
          <div>
            <span className={`eyebrow ${s.eyebrow}`}>
              <NotoEmoji name="love-letter"  size={18} />
              <span>Cartes</span>
              <span className={s.eyebrowDot}>·</span>
              <NotoEmoji name="party-popper" size={18} />
              <span>Murs</span>
              <span className={s.eyebrowDot}>·</span>
              <NotoEmoji name="wrapped-gift" size={18} />
              <span>Cadeaux</span>
            </span>
            <h1 className={s.h1}>
              Vous voulez faire <em className={`serif ${s.gold}`}>mieux</em>
              <NotoEmoji name="sparkles" size={44} className={s.h1Sparkle} />
              <br />
              qu'un <span className={s.strike}>"Joyeux anniv"</span><br />
              sur WhatsApp&nbsp;?
            </h1>
            <p className={s.sub}>
              Une carte animée pour une personne, un mur où tout le monde laisse un mot,
              un cadeau qui arrive avec le message. Gratuit jusqu'à la publication.
            </p>
            <div className={s.actions}>
              <button className="mk-btn mk-btn-primary mk-btn-lg" onClick={onCreate}>
                Célébrer quelqu'un
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </button>
              <a href="#comment" className="mk-btn mk-btn-ghost mk-btn-lg">Voir comment ça marche</a>
            </div>
            <div className={s.trust}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mk-forest-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Gratuit jusqu'à la publication · Aucune carte bancaire requise
            </div>
          </div>

          <div className={s.cluster}>
            <Kado
              size={140}
              className={s.heroKado}
              cycle={['jump', 'wink', 'confetti', 'love', 'drop']}
              cycleInterval={4200}
              ambient
            />
            <NotoEmoji name="party-popper"    size={56} className={`${s.floatEmoji} ${s.floatEmoji1}`} />
            <NotoEmoji name="sparkling-heart" size={44} className={`${s.floatEmoji} ${s.floatEmoji2}`} />
            <NotoEmoji name="balloon"         size={48} className={`${s.floatEmoji} ${s.floatEmoji3}`} />
            <NotoEmoji name="confetti-ball"   size={40} className={`${s.floatEmoji} ${s.floatEmoji4}`} />
            <div className={`${s.card} ${s.card1}`}>
              <div className={s.cPhoto} />
              <div className={s.cTitle}>Bon anniv Amina&nbsp;!</div>
              <div className={s.cMsg}>30 ans, ça se fête. Je pense à toi ma sœur.</div>
              <div className={s.cSig}>— Fatou</div>
            </div>
            <div className={`${s.card} ${s.card2}`}>
              <div className={s.cTitle}>Bienvenue Yannick&nbsp;!</div>
              <div className={s.cMsg}>Toute l'équipe est ravie de t'accueillir. On va bien s'amuser.</div>
              <div className={s.cSig}>— Les collègues</div>
            </div>
            <div className={`${s.card} ${s.card3}`}>
              <span className={s.badge}>+ CADEAU</span>
              <div className={s.cTitle} style={{ marginTop: 8 }}>Merci Kwame</div>
              <div className={s.cMsg}>Pour ces 5 années. Bonne suite avec ta famille.</div>
              <div className={s.cSig}>— Toute la boîte</div>
            </div>
            <div className={`${s.card} ${s.card4}`}>
              <div className={s.cTitle}>On t'aime, maman</div>
              <div className={s.cMsg}>De la part de tous les enfants et petits-enfants.</div>
              <div className={s.cSig}>— La famille</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
