import { useInView } from '../hooks/useInView';
import s from './UseCases.module.css';

export default function UseCases() {
  const [ref, inView] = useInView();

  return (
    <section className={s.usecases} id="usecases" ref={ref}>
      <div className={s.wrap}>
        <div className={s.secHead}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot}></span> Pour qui
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Un outil, <em>trois publics</em>.
          </h2>
          <p className={`${s.sub} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.16s' }}>
            Que vous célébriez en famille ou que vous engagiez 500 collaborateurs, myKado adapte ses fonctionnalités à votre échelle.
          </p>
        </div>

        <div className={s.ucGrid}>
          <article className={`${s.ucCard} ${s.u1} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.ucTag}>Particuliers</span>
            <h3>Pour offrir un <em>vrai souvenir</em></h3>
            <p>Anniversaires, fiançailles, naissances — créez une carte animée qui se conserve, se rejoue et se partage en famille.</p>
            <div className={s.ucStats}>
              <div className={s.ucStat}>
                <div className={s.v}>5 min</div>
                <div className={s.l}>temps moyen<br />de création</div>
              </div>
              <div className={s.ucStat}>
                <div className={s.v}>∞</div>
                <div className={s.l}>vues<br />illimitées</div>
              </div>
            </div>
          </article>

          <article className={`${s.ucCard} ${s.u2} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.1s' }}>
            <span className={s.ucTag}>Équipes RH</span>
            <h3>Pour <em>fédérer</em> et marquer les esprits</h3>
            <p>Anniversaires de service, départs en retraite, fêtes de fin d'année — un format qui dépasse l'email collectif et touche vraiment.</p>
            <div className={s.ucStats}>
              <div className={s.ucStat}>
                <div className={s.v}>500</div>
                <div className={s.l}>contributeurs<br />par animation</div>
              </div>
              <div className={s.ucStat}>
                <div className={s.v}>100%</div>
                <div className={s.l}>RGPD<br />conforme</div>
              </div>
            </div>
          </article>

          <article className={`${s.ucCard} ${s.u3} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.2s' }}>
            <span className={s.ucTag}>Marques &amp; agences</span>
            <h3>Pour <em>activer</em> votre audience</h3>
            <p>Campagnes saisonnières, fidélisation client, opérations white-label — intégrez votre branding et un lien promo dans chaque vœu envoyé.</p>
            <div className={s.ucStats}>
              <div className={s.ucStat}>
                <div className={s.v}>+38%</div>
                <div className={s.l}>taux de clic<br />moyen</div>
              </div>
              <div className={s.ucStat}>
                <div className={s.v}>API</div>
                <div className={s.l}>disponible<br />sur demande</div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
