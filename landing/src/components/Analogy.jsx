import { useEffect, useRef, useState } from 'react';
import s from './Analogy.module.css';
import NotoEmoji from './NotoEmoji';

/* ── Section "L'écart émotionnel" ─────────────────────────────
   Deux mockups WhatsApp côte à côte, cyclés à travers plusieurs
   scénarios pour montrer la différence entre un message classique
   et une carte myKado — la structure gauche/droite reste stable.
   ────────────────────────────────────────────────────────── */

const SCENARIOS = [
  {
    tag: 'Anniversaire',
    recipient: 'Maman',
    time: '14:03',
    plain: {
      out:      'Joyeux anniversaire maman ! Plein de bonheur et de santé',
      outEmoji: 'birthday-cake',
      inTime:   '14:47',
      in:       'Merci mon fils.',
    },
    kado: {
      cover:    'birthday-cake',
      title:    'Un vœu pour maman',
      desc:     'Une carte animée, un mot signé de toute la famille, et une cagnotte pour son cadeau.',
      host:     'mykado.co/pour-maman',
      reactions: ['partying-face', 'heart-eyes', 'growing-heart', 'star-struck'],
      inTime:   '14:04',
      in:       "OUFFF !!! C'est trop beau mon fils, j'ai pleuré",
      inEmoji1: 'smiling-face-hearts',
      inCont:   'Merci mille fois, je montre à tes tantes tout de suite',
      inEmoji2: 'sparkling-heart',
    },
  },
  {
    tag: 'Mariage',
    recipient: 'Aïcha & Lucas',
    time: '11:12',
    plain: {
      out:      'Félicitations pour votre mariage les amoureux !',
      outEmoji: 'sparkles',
      inTime:   '15:42',
      in:       'Merci beaucoup.',
    },
    kado: {
      cover:    'sparkling-heart',
      title:    'Bravo les mariés',
      desc:     "43 mots des invités qui n'ont pas pu venir, en photos et vidéos.",
      host:     'mykado.co/aicha-lucas',
      reactions: ['heart-eyes', 'partying-face', 'growing-heart', 'sparkles'],
      inTime:   '11:15',
      in:       "Nooon ! On regarde tout ensemble ce soir",
      inEmoji1: 'heart-eyes',
      inCont:   "Vous êtes les meilleurs, merci mille fois",
      inEmoji2: 'sparkling-heart',
    },
  },
  {
    tag: 'Naissance',
    recipient: 'Fatou & Kofi',
    time: '09:45',
    plain: {
      out:      'Bienvenue au bébé, félicitations à vous deux',
      outEmoji: 'sparkling-heart',
      inTime:   '13:20',
      in:       'Merci beaucoup !',
    },
    kado: {
      cover:    'growing-heart',
      title:    'Un mot pour bébé',
      desc:     'Une capsule à ouvrir dans 18 ans, avec les mots de la famille au jour 1.',
      host:     'mykado.co/bebe-kofi',
      reactions: ['heart-eyes', 'growing-heart', 'sparkling-heart', 'star-struck'],
      inTime:   '09:48',
      in:       "Waaaaw, c'est magnifique",
      inEmoji1: 'smiling-face-hearts',
      inCont:   'On lui montrera quand il sera grand. Merci !!',
      inEmoji2: 'sparkling-heart',
    },
  },
  {
    tag: 'Départ',
    recipient: 'Papa Youssou',
    time: '18:22',
    plain: {
      out:      "Bonne retraite papa, tu l'as bien méritée",
      outEmoji: 'folded-hands',
      inTime:   '20:15',
      in:       'Merci.',
    },
    kado: {
      cover:    'folded-hands',
      title:    '35 ans, un merci',
      desc:     'Un mur de messages de tous les collègues et amis, avec des photos souvenirs.',
      host:     'mykado.co/papa-retraite',
      reactions: ['folded-hands', 'heart-eyes', 'growing-heart', 'star-struck'],
      inTime:   '18:31',
      in:       "Mon fils, j'ai les larmes aux yeux",
      inEmoji1: 'smiling-face-hearts',
      inCont:   'Merci à toi et à tous. Je garde ça toute ma vie.',
      inEmoji2: 'sparkling-heart',
    },
  },
];

const CYCLE_MS = 6000;

/* ── Bar iOS-like au sommet de l'écran (heure, signal, wifi, batterie) ── */
function StatusBar({ time = '14:03', dark = false }) {
  const stroke = dark ? '#FFFFFF' : '#111111';
  return (
    <div className={s.statusBar} style={dark ? { color: '#FFFFFF' } : undefined}>
      <span className={s.statusTime}>{time}</span>
      <span className={s.statusPill} aria-hidden="true" />
      <div className={s.statusRight}>
        {/* Signal */}
        <svg width="17" height="10" viewBox="0 0 17 10" fill="none" aria-hidden="true">
          <rect x="0"  y="6" width="3" height="4" rx="0.6" fill={stroke} />
          <rect x="4.5" y="4" width="3" height="6" rx="0.6" fill={stroke} />
          <rect x="9"  y="2" width="3" height="8" rx="0.6" fill={stroke} />
          <rect x="13.5" y="0" width="3" height="10" rx="0.6" fill={stroke} />
        </svg>
        {/* Wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
          <path d="M1 3.6a10 10 0 0 1 13 0" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" fill="none" />
          <path d="M3.4 5.6a6.4 6.4 0 0 1 8.2 0" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" fill="none" />
          <path d="M5.6 7.7a3 3 0 0 1 3.8 0" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" fill="none" />
          <circle cx="7.5" cy="9.6" r="0.9" fill={stroke} />
        </svg>
        {/* Batterie */}
        <span className={s.battery} aria-hidden="true">
          <span className={s.batteryFill} style={{ background: stroke }} />
        </span>
      </div>
    </div>
  );
}

function PhoneHeader({ name = 'Maman', online = true }) {
  return (
    <div className={s.phoneHeader}>
      <button className={s.headerBack} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className={s.headerAvatar}>{name.charAt(0)}</div>
      <div className={s.headerText}>
        <div className={s.headerName}>{name}</div>
        <div className={s.headerStatus}>
          <span className={s.headerDot} />
          {online ? 'en ligne' : 'vu il y a 5 min'}
        </div>
      </div>
      <button className={s.headerIcon} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 10l5-5v14l-5-5H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
        </svg>
      </button>
    </div>
  );
}

/* ── Barre d'input WhatsApp en bas de l'écran (juste esthétique) ── */
function ChatInput() {
  return (
    <div className={s.chatInput} aria-hidden="true">
      <div className={s.inputField}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
        </svg>
        <span className={s.inputPlaceholder}>Message</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8696A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="12" rx="2"/>
          <circle cx="12" cy="13" r="3.5"/>
        </svg>
      </div>
      <button className={s.micBtn} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/>
        </svg>
      </button>
    </div>
  );
}

/* ── Coque de téléphone : bezel + dynamic island + boutons latéraux ── */
function PhoneFrame({ kado, children }) {
  return (
    <div className={`${s.phone} ${kado ? s.phoneKado : s.phonePlain}`}>
      <span className={`${s.sideBtn} ${s.sideMute}`}    aria-hidden="true" />
      <span className={`${s.sideBtn} ${s.sideVolUp}`}   aria-hidden="true" />
      <span className={`${s.sideBtn} ${s.sideVolDown}`} aria-hidden="true" />
      <span className={`${s.sideBtn} ${s.sidePower}`}   aria-hidden="true" />
      <div className={s.phoneScreen}>
        <div className={s.island} aria-hidden="true">
          <span className={s.islandCamera} />
        </div>
        {children}
      </div>
    </div>
  );
}

/* Coche double "vu" WhatsApp (extrait en composant : réutilisé partout). */
function Ticks() {
  return (
    <svg width="14" height="10" viewBox="0 0 16 11" fill="none" aria-hidden="true">
      <path d="M1 6l3.5 3L10.5 2M6 9l3.5-3M11 9l4-7" stroke="#53BDEB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Analogy() {
  const [idx, setIdx]         = useState(0);
  const [paused, setPaused]   = useState(false);
  const timerRef              = useRef(null);

  /* Auto-cycle. Se met en pause si l'user survole ou tab out. */
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setIdx(i => (i + 1) % SCENARIOS.length);
    }, CYCLE_MS);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  /* Pause auto quand l'onglet est en arrière-plan. */
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const scenario = SCENARIOS[idx];
  const P = scenario.plain;
  const K = scenario.kado;

  return (
    <section className={s.section} id="analogy">
      <div className="mk-container">
        <div className={s.head}>
          <span className={s.eyebrow}>
            <span className={s.eyeDot} /> L'écart émotionnel
          </span>
          <h2 className={s.title}>
            Le même vœu.<br/>
            <span className={s.titleAccent}>Deux mondes.</span>
          </h2>
          <p className={s.sub}>
            D'un côté, un message qu'on lit et qu'on oublie.
            De l'autre, un moment qu'on garde et qu'on montre à toute la famille.
          </p>
        </div>

        <div
          className={s.grid}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* ═══ GAUCHE : WhatsApp classique ═══ */}
          <article className={s.card}>
            <div className={s.cardLabel}>
              <span className={s.dotWa} /> Message WhatsApp
            </div>

            <PhoneFrame>
              <StatusBar time={scenario.time} dark />
              <PhoneHeader name={scenario.recipient} />
              <div className={s.chat} key={`p-${idx}`}>
                <div className={s.dateChip}>Aujourd'hui</div>

                <div className={`${s.bubble} ${s.bubbleOut}`}>
                  <div className={s.bubbleText}>
                    {P.out}
                    {P.outEmoji && (
                      <NotoEmoji name={P.outEmoji} size={16} className={s.inlineEmoji} />
                    )}
                  </div>
                  <div className={s.bubbleMeta}>{scenario.time}<Ticks /></div>
                </div>

                <div className={`${s.bubble} ${s.bubbleIn}`}>
                  <div className={s.bubbleText}>{P.in}</div>
                  <div className={s.bubbleMeta}>{P.inTime}</div>
                </div>
              </div>
              <ChatInput />
            </PhoneFrame>

            <div className={s.verdict}>
              <div className={s.verdictBadge}>
                <NotoEmoji name="folded-hands" size={22} />
              </div>
              <div>
                <div className={s.verdictTitle}>Lu, oublié.</div>
                <div className={s.verdictSub}>
                  Un message qui se noie dans les notifs.
                </div>
              </div>
            </div>
          </article>

          {/* ═══ MILIEU : VS ═══ */}
          <div className={s.vs} aria-hidden="true">
            <span className={s.vsRing}>
              <span className={s.vsText}>VS</span>
            </span>
          </div>

          {/* ═══ DROITE : Carte myKado ═══ */}
          <article className={`${s.card} ${s.cardKado}`}>
            <div className={`${s.cardLabel} ${s.cardLabelKado}`}>
              <span className={s.dotKado} /> Carte myKado
            </div>

            <PhoneFrame kado>
              <StatusBar time={scenario.time} dark />
              <PhoneHeader name={scenario.recipient} />
              <div className={s.chat} key={`k-${idx}`}>
                <div className={s.dateChip}>Aujourd'hui</div>

                <div className={`${s.bubble} ${s.bubbleOut} ${s.bubbleCard}`}>
                  <div className={s.linkCard}>
                    <div className={s.linkCover}>
                      <NotoEmoji name={K.cover} size={44} />
                      <div className={s.linkSparkles}>
                        <NotoEmoji name="sparkles" size={20} />
                      </div>
                    </div>
                    <div className={s.linkMeta}>
                      <div className={s.linkTitle}>{K.title}</div>
                      <div className={s.linkDesc}>{K.desc}</div>
                      <div className={s.linkHost}>{K.host}</div>
                    </div>
                  </div>
                  <div className={s.bubbleMeta}>{scenario.time}<Ticks /></div>
                </div>

                <div className={s.reactionsRow}>
                  {K.reactions.map((name, i) => (
                    <span key={`${idx}-${i}-${name}`} className={s.reactionChip}>
                      <NotoEmoji name={name} size={26} />
                    </span>
                  ))}
                </div>

                <div className={`${s.bubble} ${s.bubbleIn} ${s.bubbleWow}`}>
                  <div className={s.bubbleText}>
                    {K.in}
                    {K.inEmoji1 && (
                      <NotoEmoji name={K.inEmoji1} size={16} className={s.inlineEmoji} />
                    )}
                    {K.inCont && ` ${K.inCont}`}
                    {K.inEmoji2 && (
                      <NotoEmoji name={K.inEmoji2} size={16} className={s.inlineEmoji} />
                    )}
                  </div>
                  <div className={s.bubbleMeta}>{K.inTime}</div>
                </div>
              </div>
              <ChatInput />
            </PhoneFrame>

            <div className={`${s.verdict} ${s.verdictKado}`}>
              <div className={`${s.verdictBadge} ${s.verdictBadgeKado}`}>
                <NotoEmoji name="sparkling-heart" size={22} />
              </div>
              <div>
                <div className={s.verdictTitle}>Reçu, gardé, partagé.</div>
                <div className={s.verdictSub}>
                  Un moment que toute la famille va regarder ensemble.
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* ═══ Sélecteur de scénarios ═══ */}
        <div className={s.scenariosNav} role="tablist" aria-label="Scénarios">
          {SCENARIOS.map((sc, i) => {
            const active = i === idx;
            return (
              <button
                key={sc.tag}
                type="button"
                role="tab"
                aria-selected={active}
                className={`${s.scenarioBtn} ${active ? s.scenarioBtnActive : ''}`}
                onClick={() => setIdx(i)}
              >
                <span className={s.scenarioDot} />
                <span className={s.scenarioLabel}>{sc.tag}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
