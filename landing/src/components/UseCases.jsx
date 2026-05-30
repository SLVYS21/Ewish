import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';

function CagnotteTeaser() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div className="cagnotte" id="cagnotte">
      <div className="cagnotte-left">
        <span className="pill pill-em">⊕ &nbsp;Bientôt sur myKado</span>
        <h3 className="serif italic">Le vœu, et le cadeau commun.</h3>
        <p>
          Sur les vœux collectifs — mariage, départ en retraite, anniversaire — chaque
          contributeur pourra participer à un cadeau commun. Une PS5, un voyage, une
          montre. Le bénéficiaire reçoit le montant directement, sans intermédiaire.
        </p>
        <p className="cagnotte-fine">
          On y travaille avec soin : sécurité, transparence sur les frais, retrait
          rapide. Laissez votre email pour être prévenu en premier.
        </p>
      </div>

      <div className="cagnotte-right">
        <div className="cagnotte-demo">
          <div className="cagnotte-demo-h">
            <span className="cd-tag">Mariama · départ en retraite</span>
            <span className="cd-pct serif italic">78%</span>
          </div>
          <div className="cagnotte-progress">
            <div className="cagnotte-progress-fill" style={{ width: '78%' }}></div>
          </div>
          <div className="cagnotte-demo-meta">
            <span><strong>234 000</strong> / 300 000 FCFA</span>
            <span className="cd-contrib">42 contributeurs</span>
          </div>
          <div className="cagnotte-demo-gift">
            <div className="cd-gift-ic">🎁</div>
            <div>
              <div className="cd-gift-t">Objectif cadeau</div>
              <div className="cd-gift-s">Montre Festina · or rosé</div>
            </div>
          </div>
        </div>

        <form className="cagnotte-form" onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }}>
          {sent ? (
            <div className="cagnotte-sent">
              <span className="ck">✓</span> Vous serez prévenu·e en premier. Merci.
            </div>
          ) : (
            <>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">
                Me prévenir <span className="arr">→</span>
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default function UseCases() {
  const [ref, seen] = useReveal();
  return (
    <section className="section section-uc" id="usecases" ref={ref}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span> Pour qui</span>
          <h2>Un outil,<br/><em>trois publics</em>.</h2>
          <p>
            Que vous célébriez en famille, fédériez une équipe ou activiez une audience,
            myKado adapte son échelle.
          </p>
        </div>

        <div className="uc-grid">
          <article className={`uc-card uc1 ${seen ? 'revealed' : 'reveal'}`}>
            <span className="pill pill-rose">Particuliers</span>
            <h3 className="serif italic">Pour offrir un vrai souvenir.</h3>
            <p>
              Anniversaires, mariages, naissances, hommages, fêtes religieuses.
              Une carte animée qui se conserve et se rejoue, partagée par WhatsApp ou QR.
            </p>
            <div className="uc-stats">
              <div><div className="uc-v serif italic">5 min</div><div className="uc-l">création moyenne</div></div>
              <div><div className="uc-v serif italic">∞</div><div className="uc-l">vues à vie</div></div>
            </div>
          </article>

          <article className={`uc-card uc2 ${seen ? 'revealed' : 'reveal'}`} style={{ transitionDelay: '.1s' }}>
            <span className="pill pill-gold">Équipes &amp; RH</span>
            <h3 className="serif italic">Pour fédérer et marquer.</h3>
            <p>
              Anniversaires de service, départs en retraite, fêtes de fin d'année.
              Un format qui dépasse l'email collectif et touche vraiment vos collaborateurs.
            </p>
            <div className="uc-stats">
              <div><div className="uc-v serif italic">100+</div><div className="uc-l">contributeurs / vœu</div></div>
              <div><div className="uc-v serif italic">RGPD</div><div className="uc-l">conforme</div></div>
            </div>
          </article>

          <article className={`uc-card uc3 ${seen ? 'revealed' : 'reveal'}`} style={{ transitionDelay: '.2s' }}>
            <span className="pill pill-em">Marques &amp; agences</span>
            <h3 className="serif italic">Pour activer votre audience.</h3>
            <p>
              Campagnes saisonnières, fidélisation client, white-label.
              Branding complet, bouton CTA vers votre site ou WhatsApp, tracking.
            </p>
            <div className="uc-stats">
              <div><div className="uc-v serif italic">Branding</div><div className="uc-l">logo &amp; couleurs</div></div>
              <div><div className="uc-v serif italic">API</div><div className="uc-l">sur demande</div></div>
            </div>
          </article>
        </div>

        <CagnotteTeaser/>
      </div>
    </section>
  );
}
