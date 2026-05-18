import { useInView } from '../hooks/useInView';
import s from './FinalCTA.module.css';

export default function FinalCTA({ onOrder }) {
  const [ref, inView] = useInView();

  return (
    <section className={s.finalCta} ref={ref}>
      <div className={s.finalCtaInner}>
        <div>
          <h2 className={`${inView ? s.revealed : s.reveal}`}>
            Et si votre prochain vœu <em>laissait une trace ?</em>
          </h2>
          <p className={`${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Créez votre compte gratuit et recevez <strong>1 crédit offert</strong> pour
            construire votre premier brouillon. Sans engagement.
          </p>
          <div className={`${s.ctaActions} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.16s' }}>
            <button className={s.btnGold} onClick={onOrder}>
              Commencer gratuitement <span className={s.arr}>→</span>
            </button>
            <a href="#pricing" className={s.btnGhost}>Voir les tarifs</a>
          </div>
        </div>

        <div className={`${s.finalCtaCard} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.24s' }}>
          <h4>Inclus, dans tous les plans</h4>
          {[
            'Stockage illimité de vos créations',
            'Lien privé partageable à vie',
            'Mobile Money & virement acceptés',
            'Livraison 24h ou remboursé',
          ].map((item, i) => (
            <div key={i} className={s.item}>
              <span className={s.ic}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
