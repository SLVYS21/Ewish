import { useState, useEffect } from 'react';
import { TEMPLATES, fmtFCFA, fmtEUR } from '../data';

const SIZE_ASPECT = {
  sq:   '1 / 1',
  tall: '3 / 4.4',
  wide: '4 / 2.6',
};

function PrevBirthday() {
  return (
    <div className="tpl-prev tpl-birthday">
      <div className="confetti">
        {[...Array(10)].map((_, i) => <i key={i} style={{ left: (i*9+5)+'%', animationDelay: (i*0.4)+'s' }}/>)}
      </div>
      <div className="cake">
        <div className="flame"></div>
        <div className="candle"></div>
        <div className="top"></div>
        <div className="base"></div>
      </div>
      <div className="tpl-title serif italic">Joyeux<br/>Anniversaire</div>
      <div className="tpl-sub">Aminata · 32 ans</div>
    </div>
  );
}

function PrevWall() {
  const notes = [
    { c: 'gold', t: '♥', txt: 'Bon\nanniv !' },
    { c: 'rose', t: '✦', txt: 'On t’aime' },
    { c: 'em',   t: '★', txt: 'Bravo' },
    { c: 'peach',t: '♪', txt: 'À toi' },
    { c: 'gold', t: '✿', txt: 'Joyeux' },
    { c: 'rose', t: '●', txt: 'Câlin' },
  ];
  return (
    <div className="tpl-prev tpl-wall">
      <div className="wall-grid">
        {notes.map((n, i) => (
          <div key={i} className={`note note-${n.c}`} style={{ transform: `rotate(${(i%2?1:-1)*(2+i%4)}deg)` }}>
            <div className="note-mark">{n.t}</div>
            <div className="note-txt">{n.txt}</div>
          </div>
        ))}
      </div>
      <div className="tpl-title serif italic">Mur de vœux</div>
    </div>
  );
}

function PrevMariage() {
  return (
    <div className="tpl-prev tpl-mariage">
      <svg className="floral tl" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M30 5 Q35 20 30 30 Q25 20 30 5 Z"/>
        <path d="M30 30 Q45 25 55 30 Q45 35 30 30 Z"/>
        <path d="M30 30 Q15 25 5 30 Q15 35 30 30 Z"/>
        <path d="M30 30 Q35 45 30 55 Q25 45 30 30 Z"/>
        <circle cx="30" cy="30" r="2" fill="currentColor"/>
      </svg>
      <svg className="floral br" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M30 5 Q35 20 30 30 Q25 20 30 5 Z"/>
        <path d="M30 30 Q45 25 55 30 Q45 35 30 30 Z"/>
        <path d="M30 30 Q15 25 5 30 Q15 35 30 30 Z"/>
        <path d="M30 30 Q35 45 30 55 Q25 45 30 30 Z"/>
        <circle cx="30" cy="30" r="2" fill="currentColor"/>
      </svg>
      <div className="mariage-frame">
        <div className="mariage-sm serif italic">le mariage de</div>
        <div className="mariage-mono serif">M <span>&amp;</span> A</div>
        <div className="mariage-date">14 · juin · 2025</div>
      </div>
    </div>
  );
}

function PrevBaby() {
  return (
    <div className="tpl-prev tpl-baby">
      <div className="baby-blob b1"></div>
      <div className="baby-blob b2"></div>
      <div className="baby-blob b3"></div>
      <div className="baby-content">
        <div className="baby-eye"></div>
        <div className="tpl-title serif italic">Bienvenue<br/>petite Léa</div>
        <div className="tpl-sub">3,2 kg · 12 mai</div>
      </div>
    </div>
  );
}

function PrevRetraite() {
  return (
    <div className="tpl-prev tpl-retraite">
      <div className="retraite-stars">
        <span style={{ top:'12%', left:'10%' }}>✦</span>
        <span style={{ top:'24%', right:'18%' }}>·</span>
        <span style={{ top:'8%', right:'8%' }}>✦</span>
        <span style={{ bottom:'24%', left:'14%' }}>·</span>
      </div>
      <div className="retraite-content">
        <div className="retraite-sm">25 ans avec nous</div>
        <div className="retraite-big serif italic">Merci<br/>Mariama.</div>
        <div className="retraite-signatures">
          <span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
}

function PrevTabaski() {
  return (
    <div className="tpl-prev tpl-tabaski">
      <svg className="tabaski-pattern" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="tk-p" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
            <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#tk-p)"/>
      </svg>
      <div className="tabaski-crescent">
        <svg viewBox="0 0 40 40">
          <path d="M30 8 A14 14 0 1 0 30 32 A11 11 0 1 1 30 8 Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="tpl-title serif italic">Bonne fête</div>
      <div className="tpl-sub">à toute la famille</div>
    </div>
  );
}

function PrevHommage() {
  return (
    <div className="tpl-prev tpl-hommage">
      <div className="hommage-frame">
        <div className="hommage-inner">
          <div className="hommage-portrait">
            <svg viewBox="0 0 40 40" fill="currentColor" opacity="0.35">
              <circle cx="20" cy="15" r="6"/>
              <path d="M8 38 Q8 24 20 24 Q32 24 32 38 Z"/>
            </svg>
          </div>
          <div className="hommage-name serif italic">Mamadou</div>
          <div className="hommage-dates">1948 — 2024</div>
          <div className="hommage-quote serif italic">« Un homme bon ne meurt jamais. »</div>
        </div>
      </div>
    </div>
  );
}

function PrevBrand() {
  return (
    <div className="tpl-prev tpl-brand">
      <div className="brand-logo">
        <div className="brand-logomark">★</div>
        <div className="brand-logoname">YALA</div>
      </div>
      <div className="brand-main">
        <div className="brand-eyebrow">Pour la nouvelle année</div>
        <div className="brand-headline serif italic">Que 2025<br/>vous comble.</div>
      </div>
      <div className="brand-cta">
        Découvrir l'offre <span>→</span>
      </div>
    </div>
  );
}

function PrevFilm() {
  return (
    <div className="tpl-prev tpl-film">
      <div className="film-bars t"></div>
      <div className="film-bars b"></div>
      <div className="film-frame">
        <div className="film-play">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div className="film-meta">
        <span>NOTRE FILM</span>
        <span>·</span>
        <span>04:12</span>
      </div>
    </div>
  );
}

const PREVIEWS = {
  'birthday-classic': PrevBirthday,
  'wall-of-wishes':   PrevWall,
  'mariage-floral':   PrevMariage,
  'baby':             PrevBaby,
  'pro-retraite':     PrevRetraite,
  'tabaski':          PrevTabaski,
  'hommage':          PrevHommage,
  'brand-launch':     PrevBrand,
  'notre-film':       PrevFilm,
};

function TemplateCard({ tpl, onOpen }) {
  const Prev = PREVIEWS[tpl.id] || PrevBirthday;
  const pillColor = tpl.color === 'gold' ? 'gold' : tpl.color === 'rose' ? 'rose' : tpl.color === 'em' ? 'em' : tpl.color === 'peach' ? 'peach' : '';
  return (
    <article
      className={`tpl-card tone-${tpl.color}`}
      style={{ aspectRatio: SIZE_ASPECT[tpl.size] || '1 / 1' }}
      onClick={() => onOpen(tpl)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(tpl)}
    >
      <Prev/>
      <div className="tpl-meta">
        <div className="tpl-cat">
          <span className={`pill pill-${pillColor}`}>{tpl.cat}</span>
          {tpl.badge && <span className="pill pill-em">{tpl.badge}</span>}
        </div>
        <div className="tpl-name-row">
          <h3 className="tpl-name serif italic">{tpl.name}</h3>
          <div className="tpl-cost"><span className="coin"/>{tpl.credits}</div>
        </div>
        <div className="tpl-foot">
          <span className="tpl-subt">{tpl.sub}</span>
          <span className="tpl-open">Aperçu →</span>
        </div>
      </div>
    </article>
  );
}

function TemplateModal({ tpl, onClose, onCreate }) {
  const Prev = PREVIEWS[tpl.id] || PrevBirthday;
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Fermer">×</button>

        <div className={`modal-prev tone-${tpl.color}`}>
          <div className="modal-prev-inner">
            <Prev/>
          </div>
          <div className="modal-prev-foot">
            <span className="pill pill-gold"><span className="coin"/>{tpl.credits} crédits pour publier</span>
            <span className="modal-prev-eq">≈ {fmtFCFA(tpl.credits * 500)} · {fmtEUR(tpl.credits * 500)}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-tag">{tpl.cat}</div>
          <h3 className="serif italic modal-name">{tpl.name}</h3>
          <p className="modal-desc">{tpl.desc}</p>

          <div className="modal-feats">
            <div><span className="ck">✓</span> Personnalisation 100% gratuite (photos, musique, textes)</div>
            <div><span className="ck">✓</span> Partage par lien privé + QR code stylisé</div>
            <div><span className="ck">✓</span> Bouton de redirection (site, WhatsApp, offre)</div>
            <div><span className="ck">✓</span> Vues illimitées, conservé à vie</div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Continuer à explorer</button>
            <button className="btn btn-primary" onClick={() => { onClose(); onCreate(); }}>
              Personnaliser ce template <span className="arr">→</span>
            </button>
          </div>

          <div className="modal-note">
            <span className="coin"/>
            <span><strong>Vous ne payez qu'à la publication.</strong> Créez votre compte, personnalisez,
            puis achetez exactement les crédits qu'il vous faut. Pas d'abonnement.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Templates({ onOrder }) {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <section className="section section-templates" id="templates">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span> Bibliothèque de templates</span>
          <h2>Un template <em>pour chaque occasion</em>.</h2>
          <p>
            Anniversaires, mariages, naissances, hommages, fêtes religieuses, célébrations
            d'équipe et campagnes de marque. L'éditeur est gratuit — vous achetez des crédits
            uniquement pour publier.
          </p>
        </div>

        <div className="tpl-mosaic">
          {TEMPLATES.map(t => (
            <TemplateCard key={t.id} tpl={t} onOpen={setOpen}/>
          ))}
        </div>

        <div className="tpl-foot-note">
          <span className="pill pill-gold">⊕ &nbsp;Et bien d'autres</span>
          <span>Nouveaux templates ajoutés chaque mois. Suggestions bienvenues.</span>
        </div>
      </div>

      {open && <TemplateModal tpl={open} onClose={() => setOpen(null)} onCreate={onOrder}/>}
    </section>
  );
}
