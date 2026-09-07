import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Calendar, Link2, QrCode, MessageCircle, Image as ImageIcon, Mic, Play, Check } from 'lucide-react';
import s from './CaseStudy.module.css';
import NotoEmoji from './NotoEmoji';

/* ══════════════════════════════════════════════════════════════════
   CaseStudy — étude de cas multi-histoires en 5 étapes
   ──────────────────────────────────────────────────────────────────
   L'utilisateur choisit une histoire (Anniversaire · Mariage ·
   Départ). Le parcours est le même (5 étapes) mais persona, wording
   et visuels s'adaptent. Sur mobile : stacking cards physiques via
   position:sticky. Sur desktop : timeline verticale alternée.
   ══════════════════════════════════════════════════════════════════ */

const reveal = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      delay: i * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const revealVisual = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── VISUAL 01 — L'idée surgit dans la tête ─────────────────────
   Une carte "rappel" façon iOS avec le contexte (date, groupe). */
function VisualIdea({ intro }) {
  return (
    <div className={s.canvas}>
      <div className={s.canvasGrid} aria-hidden />
      <motion.div
        className={s.ideaCard}
        initial={{ opacity: 0, y: 12, rotate: -3 }}
        whileInView={{ opacity: 1, y: 0, rotate: -2 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={s.ideaHead}>
          <div className={s.ideaAvatar}>
            <NotoEmoji name={intro.occasionEmoji} size={22} />
          </div>
          <div>
            <div className={s.ideaTitle}>{intro.name}</div>
            <div className={s.ideaMeta}>{intro.meta}</div>
          </div>
          <span className={s.ideaBell} aria-hidden>
            <Calendar size={13} strokeWidth={2.4} />
          </span>
        </div>
        <div className={s.ideaThought}>
          {intro.thought.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        className={s.ideaBubble}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5, ease: 'backOut' }}
        aria-hidden
      >
        <NotoEmoji name="sparkles" size={22} />
      </motion.div>

      <motion.div
        className={s.ideaAvatarsRow}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {intro.avatars.map((a, i) => (
          <span
            key={i}
            className={s.ideaAvatarSmall}
            style={{ background: a.bg, zIndex: 10 - i }}
          >
            {a.letter}
          </span>
        ))}
        <span className={s.ideaAvatarsLabel}>{intro.groupLabel}</span>
      </motion.div>
    </div>
  );
}

/* ── VISUAL 02 — Créer le mur en 30 secondes ─────────────────────
   Wizard step-2 stylisé avec l'occasion sélectionnée. */
function VisualCreate({ create }) {
  return (
    <div className={s.canvas}>
      <div className={s.canvasGrid} aria-hidden />
      <motion.div
        className={s.createFrame}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={s.createTop}>
          <div className={s.createProgress}>
            <span className={`${s.createStep} ${s.createStepDone}`}><Check size={10} strokeWidth={3} /></span>
            <span className={s.createLine} />
            <span className={`${s.createStep} ${s.createStepCurrent}`}>2</span>
            <span className={s.createLine} />
            <span className={s.createStep}>3</span>
          </div>
          <div className={s.createLabel}>Nouveau mur</div>
        </div>

        <div className={s.createBody}>
          <div className={s.createEyebrow}>Étape 2 · L'occasion</div>
          <div className={s.createH}>Pour quoi ?</div>

          <div className={s.createChoices}>
            {create.choices.map((c, i) => (
              <motion.div
                key={c.label}
                className={`${s.createChoice} ${c.on ? s.createChoiceActive : ''}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
              >
                <NotoEmoji name={c.name} size={22} static={!c.on} />
                <span>{c.label}</span>
                {c.on && <span className={s.createDot} aria-hidden />}
              </motion.div>
            ))}
          </div>

          <motion.button
            className={s.createNext}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.4 }}
            tabIndex={-1}
            aria-hidden
          >
            Continuer <ArrowRight size={14} strokeWidth={2.6} />
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        className={s.createTimer}
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7, duration: 0.5, ease: 'backOut' }}
      >
        <span className={s.createTimerDot} />
        <span>30s</span>
      </motion.div>
    </div>
  );
}

/* ── VISUAL 03 — Partager sur le groupe WhatsApp ────────────────── */
function VisualShare({ share }) {
  return (
    <div className={s.canvas}>
      <div className={s.canvasGrid} aria-hidden />

      <motion.div
        className={s.shareLink}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link2 size={16} strokeWidth={2.4} className={s.shareLinkIcon} />
        <span className={s.shareLinkText}>{share.link}</span>
        <button className={s.shareCopy} tabIndex={-1} aria-hidden>Copier</button>
      </motion.div>

      <motion.div
        className={s.shareQr}
        initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={s.shareQrGrid} aria-hidden>
          {Array.from({ length: 49 }).map((_, i) => (
            <span key={i} className={s.shareQrCell} style={{ opacity: (i * 7 % 3 === 0 ? 1 : 0.15) }} />
          ))}
        </div>
        <div className={s.shareQrCorner} data-c="tl" />
        <div className={s.shareQrCorner} data-c="tr" />
        <div className={s.shareQrCorner} data-c="bl" />
        <div className={s.shareQrLogo}>
          <NotoEmoji name="sparkling-heart" size={22} />
        </div>
      </motion.div>

      <motion.div
        className={s.shareWa}
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={s.shareWaHead}>
          <span className={s.shareWaAvatar}>{share.groupInitial}</span>
          <div>
            <div className={s.shareWaName}>{share.groupName}</div>
            <div className={s.shareWaSub}>{share.groupSub}</div>
          </div>
        </div>
        <div className={s.shareWaBubble}>
          <div className={s.shareWaBubbleTitle}>{share.wallTitle}</div>
          <div className={s.shareWaBubbleDesc}>{share.wallDesc}</div>
          <div className={s.shareWaBubbleHost}>{share.wallHost}</div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── VISUAL 04 — Le mur se remplit ──────────────────────────────── */
function VisualContribute({ contribute }) {
  const { wallTitle, coverEmoji, cards, contribLabel } = contribute;
  return (
    <div className={s.canvas}>
      <div className={s.canvasGrid} aria-hidden />

      <div className={s.wallHead}>
        <div className={s.wallHeadCover}>
          <NotoEmoji name={coverEmoji} size={26} />
        </div>
        <div>
          <div className={s.wallHeadTitle}>{wallTitle}</div>
          <div className={s.wallHeadMeta}>
            <span className={s.wallDot} />
            {cards.length} {contribLabel}
          </div>
        </div>
      </div>

      <div className={s.wallGrid}>
        {cards.map((c, i) => (
          <motion.div
            key={i}
            className={`${s.wallCard} ${s[`wc_${c.kind}`]}`}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {c.kind === 'photo' && (
              <>
                <div className={s.wcPhotoImg}><NotoEmoji name={c.emoji} size={30} /></div>
                <div className={s.wcAuthor}><ImageIcon size={11} strokeWidth={2.6} /> {c.author}</div>
              </>
            )}
            {c.kind === 'text' && (
              <>
                <div className={s.wcText}>“{c.text}”</div>
                <div className={s.wcAuthor}><MessageCircle size={11} strokeWidth={2.6} /> {c.author}</div>
              </>
            )}
            {c.kind === 'voice' && (
              <>
                <div className={s.wcVoice}>
                  <span className={s.wcVoicePlay}><Play size={10} fill="currentColor" strokeWidth={0} /></span>
                  <div className={s.wcVoiceWave}>
                    {Array.from({ length: 18 }).map((_, j) => (
                      <span key={j} style={{ height: `${18 + Math.abs(Math.sin(j * 1.7)) * 22}px` }} />
                    ))}
                  </div>
                  <span className={s.wcVoiceDur}>{c.duration}</span>
                </div>
                <div className={s.wcAuthor}><Mic size={11} strokeWidth={2.6} /> {c.author}</div>
              </>
            )}
            {c.kind === 'video' && (
              <>
                <div className={s.wcVideo}>
                  <NotoEmoji name={c.emoji} size={30} />
                  <span className={s.wcVideoPlay}><Play size={12} fill="currentColor" strokeWidth={0} /></span>
                </div>
                <div className={s.wcAuthor}><Play size={11} strokeWidth={2.6} /> {c.author}</div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        className={s.wallPulse}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <span className={s.wallPulseDot} />
        Nouveau mot · à l'instant
      </motion.div>
    </div>
  );
}

/* ── VISUAL 05 — La révélation ──────────────────────────────────── */
function VisualReveal({ reveal: r, onDemoClick }) {
  return (
    <div className={s.canvas}>
      <div className={s.canvasGrid} aria-hidden />

      <motion.div
        className={s.revealBurst}
        aria-hidden
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.9, ease: 'backOut' }}
      >
        {['sparkles', 'party-popper', 'confetti-ball', 'balloon', 'sparkling-heart', 'star'].map((n, i) => (
          <span key={n} className={s.revealFloat} style={{ '--i': i }}>
            <NotoEmoji name={n} size={32} />
          </span>
        ))}
      </motion.div>

      <motion.div
        className={s.revealMain}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={s.revealFace}>
          <NotoEmoji name={r.face} size={72} />
        </div>
        <div className={s.revealQuote}>{r.quote}</div>
        <div className={s.revealSig}>{r.sig}</div>
      </motion.div>

      <motion.div
        className={s.revealStat}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <span className={s.revealStatNum}>{r.statNum}</span>
        <span className={s.revealStatLabel}>{r.statLabel}</span>
      </motion.div>

      <motion.button
        type="button"
        className={s.revealCta}
        onClick={onDemoClick}
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <span>Voir la démo en vrai</span>
        <span className={s.revealCtaArrow} aria-hidden>
          <ArrowRight size={16} strokeWidth={2.6} />
        </span>
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   REVEAL TEXT — word-by-word grey → plum-800 en scroll-linked
   ──────────────────────────────────────────────────────────────────
   Chaque mot est un motion.span dont la couleur interpole entre
   #B0A6AD (gris lisible) et #201524 (plum-800). La progression est
   pilotée par la position de la card dans le viewport (useScroll).
   ══════════════════════════════════════════════════════════════════ */

function RevealWord({ progress, range, children }) {
  const color = useTransform(progress, range, ['#B0A6AD', '#201524']);
  return (
    <motion.span className={s.revealWord} style={{ color }}>
      {children}
    </motion.span>
  );
}

function StepDescReveal({ text, cardRef }) {
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start 0.85', 'start 0.2'],
  });
  const words = text.split(' ');
  /* On étale le reveal sur 0..0.75 du range de scroll pour que les
     derniers mots finissent d'apparaître avant que la card soit
     recouverte par la suivante. */
  const REVEAL_END = 0.75;
  return (
    <span className={s.revealPara}>
      {words.map((word, i) => {
        const start = (i / words.length) * REVEAL_END;
        const end = Math.min(start + REVEAL_END / words.length + 0.06, 1);
        return (
          <RevealWord key={i} progress={scrollYProgress} range={[start, end]}>
            {word + (i < words.length - 1 ? ' ' : '')}
          </RevealWord>
        );
      })}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STEP CARD — extrait pour porter son propre ref (useScroll par card)
   ══════════════════════════════════════════════════════════════════ */

function StepCard({ step, i, Visual, visualKey, visualData, onDemoClick }) {
  const cardRef = useRef(null);
  const isEven = i % 2 === 1;
  const isFinal = !!step.final;

  return (
    <article
      ref={cardRef}
      className={`${s.step} ${isEven ? s.stepReverse : ''} ${isFinal ? s.stepFinal : ''}`}
    >
      <motion.div
        className={s.timelineDot}
        aria-hidden
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-120px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className={s.timelineDotInner} />
      </motion.div>

      <div className={s.stepText}>
        <motion.div
          className={s.stepNumChip}
          custom={0}
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <span className={s.stepNum}>{step.n}</span>
          <span className={s.stepSep} />
          <span className={s.stepEyebrow}>{step.eyebrow}</span>
        </motion.div>

        <motion.h3
          className={s.stepTitle}
          custom={1}
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {step.title}
        </motion.h3>

        <p className={s.stepDesc}>
          <StepDescReveal text={step.desc} cardRef={cardRef} />
        </p>

        {step.detail && (
          <motion.div
            className={s.stepDetail}
            custom={3}
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <span className={s.stepDetailIcon}>{step.detail.icon}</span>
            <span>{step.detail.text}</span>
          </motion.div>
        )}
      </div>

      <motion.div
        className={s.stepVisual}
        variants={revealVisual}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {isFinal ? (
          <Visual reveal={visualData} onDemoClick={onDemoClick} />
        ) : (
          <Visual {...{ [visualKey]: visualData }} />
        )}
      </motion.div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STORIES — trois personas, même mécanique
   ══════════════════════════════════════════════════════════════════ */

const CARDS_ANNIV = [
  { kind: 'photo',   author: 'Amina',   emoji: 'sparkling-heart' },
  { kind: 'text',    author: 'Marc',    text: 'Ma sœur préférée. Un rayon de soleil.' },
  { kind: 'voice',   author: 'Papa',    duration: '0:47' },
  { kind: 'photo',   author: 'Kofi',    emoji: 'party-popper' },
  { kind: 'text',    author: 'Léa',     text: '10 ans qu\'on rigole ensemble. Merci.' },
  { kind: 'video',   author: 'Yassine', emoji: 'balloon' },
];

const CARDS_MARIAGE = [
  { kind: 'photo',   author: 'Léa',       emoji: 'sparkling-heart' },
  { kind: 'text',    author: 'Papa',      text: 'Que votre vie soit à la hauteur de ce jour.' },
  { kind: 'voice',   author: 'Grand-mère',duration: '1:12' },
  { kind: 'photo',   author: 'Nadia',     emoji: 'ribbon' },
  { kind: 'text',    author: 'Julien',    text: 'Le plus beau duo qu\'on connaisse. Vraiment.' },
  { kind: 'video',   author: 'Mehdi',     emoji: 'party-popper' },
];

const CARDS_NAISSANCE = [
  { kind: 'photo',   author: 'Sarah',    emoji: 'sparkling-heart' },
  { kind: 'text',    author: 'David',    text: 'Félicitations ! Reposez-vous, on tient la boutique.' },
  { kind: 'voice',   author: 'Manager',  duration: '0:38' },
  { kind: 'photo',   author: 'Léa',      emoji: 'balloon' },
  { kind: 'text',    author: 'Anna',     text: 'Un conseil : profitez de chaque sieste !' },
  { kind: 'video',   author: 'L\'équipe',emoji: 'growing-heart' },
];

const STORIES = [
  /* ─────────────── HISTOIRE 1 · ANNIVERSAIRE ──────────────
     Angle : la bande de potes monte une enveloppe digitale
     pour Sarah, à ouvrir le jour J. */
  {
    id: 'anniversaire',
    tab: { label: 'Anniversaire', icon: 'birthday-cake' },
    intro: {
      name: 'Sarah',
      meta: 'Anniversaire · dans 12 jours',
      occasionEmoji: 'birthday-cake',
      thought: '« Une enveloppe digitale.\nDe toute la bande. »',
      avatars: [
        { bg: '#F19A87', letter: 'A' },
        { bg: '#F8BE68', letter: 'M' },
        { bg: '#A18893', letter: 'K' },
        { bg: '#F0AC4C', letter: 'S' },
        { bg: '#C8B5BE', letter: '+' },
      ],
      groupLabel: 'La bande',
    },
    create: {
      choices: [
        { name: 'birthday-cake',   label: 'Anniversaire', on: true },
        { name: 'sparkling-heart', label: 'Mariage' },
        { name: 'baby',            label: 'Naissance' },
        { name: 'trophy',          label: 'Départ' },
      ],
    },
    share: {
      link: 'mykado.co/pour-sarah',
      groupInitial: 'B',
      groupName: 'La bande · Anniv Sarah',
      groupSub: '14 potes',
      wallTitle: 'Une enveloppe pour Sarah',
      wallDesc: 'Un mot, une photo, un vocal. Elle ouvrira le jour J.',
      wallHost: 'mykado.co/pour-sarah',
    },
    contribute: {
      wallTitle: 'Enveloppe pour Sarah',
      coverEmoji: 'birthday-cake',
      contribLabel: 'contributions · en secret',
      cards: CARDS_ANNIV,
    },
    reveal: {
      face: 'smiling-face-hearts',
      quote: '« J\'ai pleuré. Je m\'y attendais tellement pas. »',
      sig: '— Sarah, le jour J',
      statNum: 14,
      statLabel: 'potes ont contribué',
    },
    steps: [
      {
        n: '01',
        eyebrow: 'L\'occasion approche',
        title: <>Sortir du « joyeux<br />anniv » WhatsApp.</>,
        desc: 'On veut lui monter une enveloppe digitale — de toute la bande, à ouvrir le jour J.',
        detail: { icon: <Calendar size={13} strokeWidth={2.4} />, text: 'Une bande, un pote spécial' },
      },
      {
        n: '02',
        eyebrow: 'Créer l\'enveloppe',
        title: <>30 secondes,<br />pas une de plus.</>,
        desc: 'L\'occasion, son prénom, un thème. L\'enveloppe est prête à recevoir.',
        detail: { icon: <Check size={13} strokeWidth={2.8} />, text: 'Aucun compte à créer' },
      },
      {
        n: '03',
        eyebrow: 'Partager en douce',
        title: <>Un lien, sur le<br />groupe des potes.</>,
        desc: 'On envoie le lien sur WhatsApp. Chacun clique, découvre, contribue.',
        detail: { icon: <QrCode size={13} strokeWidth={2.4} />, text: 'Lien · QR · WhatsApp · SMS' },
      },
      {
        n: '04',
        eyebrow: 'La bande dépose',
        title: <>Photos, vocaux,<br />vidéos, souvenirs.</>,
        desc: 'Chacun laisse son morceau, à son rythme, en secret, jusqu\'au jour J.',
        detail: { icon: <MessageCircle size={13} strokeWidth={2.4} />, text: 'Modération auto · privé jusqu\'au jour J' },
      },
      {
        n: '05',
        eyebrow: 'Le moment de vérité',
        title: <>Elle ouvre.<br />Elle en revient pas.</>,
        desc: 'Le jour J, Sarah reçoit l\'enveloppe. Elle défile, elle rit, elle pleure.',
        detail: { icon: <Check size={13} strokeWidth={2.8} />, text: 'Export PDF · souvenir à vie' },
        final: true,
      },
    ],
  },

  /* ─────────────── HISTOIRE 2 · MARIAGE ──────────────
     Angle : les invités déposent leur mot pendant la soirée,
     à la fin le couple récupère un livre d'or digital. */
  {
    id: 'mariage',
    tab: { label: 'Mariage', icon: 'sparkling-heart' },
    intro: {
      name: 'Amélie & Karim',
      meta: 'Mariage · dans 21 jours',
      occasionEmoji: 'sparkling-heart',
      thought: '« Un livre d\'or digital.\nÉcrit par tous les invités. »',
      avatars: [
        { bg: '#E8A5A5', letter: 'L' },
        { bg: '#F8BE68', letter: 'C' },
        { bg: '#A5C8B5', letter: 'N' },
        { bg: '#C8B5BE', letter: 'J' },
        { bg: '#F0AC4C', letter: '+' },
      ],
      groupLabel: 'Les témoins',
    },
    create: {
      choices: [
        { name: 'birthday-cake',   label: 'Anniversaire' },
        { name: 'sparkling-heart', label: 'Mariage', on: true },
        { name: 'baby',            label: 'Naissance' },
        { name: 'trophy',          label: 'Départ' },
      ],
    },
    share: {
      link: 'mykado.co/amelie-karim',
      groupInitial: 'M',
      groupName: 'Invités · Mariage A. & K.',
      groupSub: '62 membres',
      wallTitle: 'Livre d\'or · Amélie & Karim',
      wallDesc: 'Un mot, une photo, une vidéo. On leur offre un livre d\'or digital.',
      wallHost: 'mykado.co/amelie-karim',
    },
    contribute: {
      wallTitle: 'Livre d\'or · A. & K.',
      coverEmoji: 'sparkling-heart',
      contribLabel: 'contributions · en direct',
      cards: CARDS_MARIAGE,
    },
    reveal: {
      face: 'heart-eyes',
      quote: '« À la fin de la soirée, un livre d\'or digital nous attendait. »',
      sig: '— Amélie, le jour J',
      statNum: 62,
      statLabel: 'invités ont contribué',
    },
    steps: [
      {
        n: '01',
        eyebrow: 'Le grand jour approche',
        title: <>Un mariage,<br />ça se prépare.</>,
        desc: 'On veut plus qu\'un cadeau : un livre d\'or digital, écrit par tous les invités.',
        detail: { icon: <Calendar size={13} strokeWidth={2.4} />, text: 'Ceux qui viennent, ceux qui n\'ont pas pu' },
      },
      {
        n: '02',
        eyebrow: 'Créer le livre d\'or',
        title: <>Un mur commun,<br />en 30 secondes.</>,
        desc: 'Mariage, les prénoms, un thème doux. Prêt à recevoir les mots des invités.',
        detail: { icon: <Check size={13} strokeWidth={2.8} />, text: 'Aucun compte à créer' },
      },
      {
        n: '03',
        eyebrow: 'Activer les invités',
        title: <>Un QR sur les<br />faire-parts.</>,
        desc: 'Chaque invité scanne, découvre le mur, dépose son mot. Depuis la table.',
        detail: { icon: <QrCode size={13} strokeWidth={2.4} />, text: 'QR · lien · WhatsApp · mail' },
      },
      {
        n: '04',
        eyebrow: 'Pendant la soirée',
        title: <>Les mots<br />pleuvent.</>,
        desc: 'Vidéos entre les danses, vocaux au bar, photos volées par les témoins.',
        detail: { icon: <MessageCircle size={13} strokeWidth={2.4} />, text: 'Modération auto · surprise préservée' },
      },
      {
        n: '05',
        eyebrow: 'Le moment de vérité',
        title: <>Un livre d'or<br />à vie.</>,
        desc: 'Tous les souvenirs des invités, réunis. Exportables en PDF, à revoir chaque anniversaire.',
        detail: { icon: <Check size={13} strokeWidth={2.8} />, text: 'Livre d\'or · export PDF · souvenir à vie' },
        final: true,
      },
    ],
  },

  /* ─────────────── HISTOIRE 3 · NAISSANCE ──────────────
     Angle : au bureau, une collègue vient d'accoucher. L'équipe
     lui monte un mur de bienvenue bébé pour son retour. */
  {
    id: 'naissance',
    tab: { label: 'Naissance', icon: 'baby' },
    intro: {
      name: 'Julie & bébé',
      meta: 'Retour de congé · dans 3 semaines',
      occasionEmoji: 'baby',
      thought: '« Elle rentre bientôt.\nAu bureau, on prépare tout. »',
      avatars: [
        { bg: '#A5C8B5', letter: 'D' },
        { bg: '#F8BE68', letter: 'S' },
        { bg: '#C8B5BE', letter: 'M' },
        { bg: '#F0AC4C', letter: 'L' },
        { bg: '#B5A5C8', letter: '+' },
      ],
      groupLabel: 'Le bureau',
    },
    create: {
      choices: [
        { name: 'birthday-cake',   label: 'Anniversaire' },
        { name: 'sparkling-heart', label: 'Mariage' },
        { name: 'baby',            label: 'Naissance', on: true },
        { name: 'trophy',          label: 'Départ' },
      ],
    },
    share: {
      link: 'mykado.co/bienvenue-julie',
      groupInitial: 'B',
      groupName: 'Bureau · Bienvenue bébé',
      groupSub: '24 collègues',
      wallTitle: 'Pour Julie & bébé',
      wallDesc: 'Un mot, un conseil, une photo. Elle découvrira à son retour.',
      wallHost: 'mykado.co/bienvenue-julie',
    },
    contribute: {
      wallTitle: 'Pour Julie & bébé',
      coverEmoji: 'baby',
      contribLabel: 'messages · en direct',
      cards: CARDS_NAISSANCE,
    },
    reveal: {
      face: 'smiling-face-hearts',
      quote: '« À mon retour, tout ça m\'attendait sur l\'écran. J\'ai fondu. »',
      sig: '— Julie, retour de congé',
      statNum: 24,
      statLabel: 'collègues ont contribué',
    },
    steps: [
      {
        n: '01',
        eyebrow: 'Une bonne nouvelle',
        title: <>Une collègue<br />vient d'accoucher.</>,
        desc: 'Au bureau, on veut lui offrir plus qu\'un mail RH — un vrai truc, de toute l\'équipe.',
        detail: { icon: <Calendar size={13} strokeWidth={2.4} />, text: 'Collègues, direction, familles' },
      },
      {
        n: '02',
        eyebrow: 'Créer le mur',
        title: <>Prêt en<br />30 secondes.</>,
        desc: 'Naissance, le prénom du bébé, un thème doux. Aucun compte à créer.',
        detail: { icon: <Check size={13} strokeWidth={2.8} />, text: 'Thèmes bienvenue bébé inclus' },
      },
      {
        n: '03',
        eyebrow: 'Prévenir l\'équipe',
        title: <>Un lien sur Slack,<br />ça suffit.</>,
        desc: 'Chacun contribue quand il veut, entre deux réunions. Aucune app à installer.',
        detail: { icon: <QrCode size={13} strokeWidth={2.4} />, text: 'Slack · mail · WhatsApp' },
      },
      {
        n: '04',
        eyebrow: 'Le mur se remplit',
        title: <>Mots, conseils,<br />photos de bébés.</>,
        desc: 'Chaque collègue laisse un mot, parfois une photo de son propre bébé, un conseil de parent.',
        detail: { icon: <MessageCircle size={13} strokeWidth={2.4} />, text: 'Modération auto · surprise préservée' },
      },
      {
        n: '05',
        eyebrow: 'Le moment de vérité',
        title: <>Elle découvre<br />à son retour.</>,
        desc: 'Julie rentre de congé. Sur son écran, le mur l\'attend. Elle défile, elle sourit, elle pleure.',
        detail: { icon: <Check size={13} strokeWidth={2.8} />, text: 'Livre d\'or · export PDF · souvenir à vie' },
        final: true,
      },
    ],
  },
];

const VISUALS_BY_INDEX = [VisualIdea, VisualCreate, VisualShare, VisualContribute, VisualReveal];
const VISUAL_KEYS = ['intro', 'create', 'share', 'contribute', 'reveal'];

export default function CaseStudy({ onCreate }) {
  const [storyIdx, setStoryIdx] = useState(0);
  const tabsRef = useRef(null);
  const currentStory = STORIES[storyIdx];

  const scrollToDemo = () => {
    const el = document.getElementById('inspirations');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectStory = (idx) => {
    if (idx === storyIdx) return;
    setStoryIdx(idx);
    requestAnimationFrame(() => {
      if (tabsRef.current) {
        tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  return (
    <section className={s.section} id="case-study">
      {/* Halo décoratif fond */}
      <div className={s.bgHalo} aria-hidden />

      <div className={`mk-container ${s.container}`}>

        {/* ═══ EN-TÊTE DE SECTION ═══ */}
        <motion.div
          className={s.head}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} />
            En pratique · trois histoires
          </span>
          <p className={s.headHint}>Choisissez ce qui vous parle :</p>
        </motion.div>

        {/* ═══ TABS · sélecteur d'histoire ═══ */}
        <div ref={tabsRef} className={s.tabsWrap}>
          <div className={s.tabs} role="tablist" aria-label="Choisir une histoire">
            {STORIES.map((story, i) => {
              const active = i === storyIdx;
              return (
                <button
                  key={story.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`${s.tab} ${active ? s.tabActive : ''}`}
                  onClick={() => handleSelectStory(i)}
                >
                  <span className={s.tabIcon} aria-hidden>
                    <NotoEmoji name={story.tab.icon} size={20} static={!active} />
                  </span>
                  <span className={s.tabLabel}>{story.tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ TIMELINE + ÉTAPES ═══
             key={currentStory.id} → remount à chaque switch d'histoire :
             les animations whileInView se re-déclenchent, l'utilisateur
             voit le nouveau parcours arriver frais. */}
        <div className={s.stack} key={currentStory.id}>
          <div className={s.timeline} aria-hidden>
            <div className={s.timelineTrack} />
          </div>

          {currentStory.steps.map((step, i) => {
            const Visual = VISUALS_BY_INDEX[i];
            const visualKey = VISUAL_KEYS[i];
            const visualData = currentStory[visualKey];
            return (
              <StepCard
                key={step.n}
                step={step}
                i={i}
                Visual={Visual}
                visualKey={visualKey}
                visualData={visualData}
                onDemoClick={scrollToDemo}
              />
            );
          })}
        </div>

        {/* ═══ TRANSITION VERS LA DÉMO ═══ */}
        <motion.div
          className={s.outro}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={s.outroLine} aria-hidden />
          <div className={s.outroText}>
            Vous voulez toucher du doigt ?<br />
            <button type="button" className={s.outroLink} onClick={scrollToDemo}>
              Ouvrez une démo réelle
              <ArrowRight size={14} strokeWidth={2.6} />
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
