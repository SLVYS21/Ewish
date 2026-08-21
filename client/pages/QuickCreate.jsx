import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Users,
  User,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { createPublication } from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import NotoEmoji from '../components/NotoEmoji';
import styles from './QuickCreate.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* Occasions — même liste que le wall wizard (WALL_EVENTS) pour cohérence.
   `tpl` = template solo auto-sélectionné quand l'utilisateur choisit "Solo".
   `titleFor` = titre par défaut pré-rempli dans le champ Titre. */
const OCCASIONS = [
  { id: 'anniversary', label: 'Anniversaire',   noto: 'birthday-cake',    tpl: 'birthday',
    titleFor: (n) => `Joyeux anniversaire, ${n} 🎂`,
    defaultMsg: 'Joyeux anniversaire ! Que cette nouvelle année t\'apporte bonheur, santé et réussite.' },
  { id: 'wedding',     label: 'Mariage',        noto: 'ring',             tpl: 'forever',
    titleFor: (n) => `Heureux Mariage ${n} 💍`,
    defaultMsg: 'Tous nos vœux de bonheur pour cette merveilleuse union.' },
  { id: 'birth',       label: 'Baptême',      noto: 'baby',             tpl: 'collective-family',
    titleFor: (n) => `Bienvenue à ${n} 👶`,
    defaultMsg: 'Bienvenue dans notre monde petit trésor ! Félicitations aux heureux parents.' },
  { id: 'farewell',    label: 'Pot de départ',  noto: 'clinking-glasses', tpl: 'collective-pro',
    titleFor: (n) => `Bon départ, ${n} 🥂`,
    defaultMsg: 'Merci pour toutes ces belles années. Plein de réussite pour la suite !' },
  { id: 'welcome',     label: 'Bienvenue équipe', noto: 'waving-hand',    tpl: 'special',
    titleFor: (n) => `Bienvenue, ${n} 👋`,
    defaultMsg: 'Bienvenue dans l\'équipe ! On est ravis de te compter parmi nous.' },
  { id: 'thanks',      label: 'Remerciement',   noto: 'red-heart',        tpl: 'envelope',
    titleFor: (n) => `Merci, ${n} ❤️`,
    defaultMsg: 'Un immense merci du fond du cœur.' },
  { id: 'tribute',     label: 'Hommage',        noto: 'dove',             tpl: 'sanctuary',
    titleFor: (n) => `En mémoire de ${n} 🕊️`,
    defaultMsg: 'En souvenir d\'une personne exceptionnelle qui restera pour toujours dans nos cœurs.' },
  { id: 'other',       label: 'Autre',          noto: 'sparkles',         tpl: 'booklet',
    titleFor: (n) => `Pour ${n} ✨`,
    defaultMsg: 'Un petit mot rien que pour toi.' },
];
const OCC_BY_ID = Object.fromEntries(OCCASIONS.map((o) => [o.id, o]));

const TEMPLATES_BY_ID = {
  booklet:            { id: 'booklet',            name: 'Carte Dépliante',        emoji: '📖' },
  envelope:           { id: 'envelope',           name: 'Surprise sous Enveloppe', emoji: '✉️' },
  birthday:           { id: 'birthday',           name: 'Anniversaire Confetti',   emoji: '🎂' },
  forever:            { id: 'forever',            name: 'Mariage & Amour Bloom',   emoji: '💍' },
  'collective-pro':   { id: 'collective-pro',     name: 'Pot de Départ & Pro',     emoji: '🥂' },
  'collective-family':{ id: 'collective-family',  name: 'Bienvenue Bébé',           emoji: '👶' },
  special:            { id: 'special',            name: 'Félicitations & Succès',  emoji: '✨' },
  sanctuary:          { id: 'sanctuary',          name: 'Hommage & Mémoire',       emoji: '🕊️' },
};

const BACKGROUND_PACKS = [
  { id: 'luxury_paper', name: 'Papier de Luxe', url: '/backgrounds/luxury_paper.jpg' },
  { id: 'elegant_dark', name: 'Nuit Élégante', url: '/backgrounds/elegant_dark.jpg' },
  { id: 'premium_balloons', name: 'Ballons Premium', url: '/backgrounds/premium_balloons.jpg' },
  { id: 'festi', name: 'Fêtes & Confettis', url: '/backgrounds/Festi.jpg' },
  { id: 'hearts', name: 'Cœurs Romantiques', url: '/backgrounds/hearts.png' },
  { id: 'paper', name: 'Papier Noble', url: '/backgrounds/Paper.jpg' },
  { id: 'fun-hearts', name: 'Love Pop', url: '/backgrounds/Fun-hearts.png' },
  { id: 'valentine', name: 'Doux Pastel', url: '/backgrounds/Valentine.jpg' },
];

const EFFECTS = [
  { id: 'confetti', name: '🎉 Confettis dorés' },
  { id: 'hearts', name: '💖 Cœurs flottants' },
  { id: 'stars', name: '✨ Étoiles magiques' },
  { id: 'balloons', name: '🎈 Ballons festifs' },
];

const SUGGESTIONS = {
  anniversary: [
    { label: '🎂 Émotion', text: 'Joyeux anniversaire à une personne exceptionnelle ! Que cette journée soit aussi lumineuse que ton sourire.' },
    { label: '🥂 Festif & Drôle', text: 'Un an de plus, un an de plus de sagesse... enfin presque ! On trinque à ta santé ce soir !' },
    { label: '❤️ Court & Doux', text: 'Très bel anniversaire ! Que tous tes souhaits les plus chers se réalisent aujourd\'hui.' },
  ],
  wedding: [
    { label: '💍 Romantique', text: 'Félicitations aux mariés ! Que votre vie commune soit une magnifique aventure remplie d\'amour.' },
    { label: '✨ Chaleureux', text: 'Un mariage inoubliable pour un couple parfait. Vive les mariés !' },
  ],
  farewell: [
    { label: '🚀 Encouragement', text: 'Un immense merci pour tout ce que tu as apporté à l\'équipe. Bon vent pour ta nouvelle aventure !' },
    { label: '👏 Chaleureux', text: 'Tu vas laisser un grand vide au bureau. Reste en contact et plein de succès !' },
  ],
};

/* ──────────────────────────────────────────────────────────────────
   OccasionDropdown — dropdown accessible avec NotoEmoji par option.
   Kept inline: seul cas d'usage, pas la peine d'ajouter une lib.
   ────────────────────────────────────────────────────────────────── */
function OccasionDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      const idx = Math.max(0, OCCASIONS.findIndex((e) => e.id === value?.id));
      setActiveIdx(idx);
    }
  }, [open, value]);

  const onKey = (e) => {
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => (i + 1) % OCCASIONS.length); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => (i - 1 + OCCASIONS.length) % OCCASIONS.length); }
    if (e.key === 'Enter')     { e.preventDefault(); onChange(OCCASIONS[activeIdx]); setOpen(false); }
  };

  return (
    <div className={styles.ddRoot} ref={rootRef}>
      <button
        type="button"
        className={styles.ddTrigger}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.ddTriggerLeft}>
          {value ? (
            <>
              <span className={styles.ddEmoji}><NotoEmoji name={value.noto} size={22} /></span>
              <span className={styles.ddLabel}>{value.label}</span>
            </>
          ) : (
            <span className={styles.ddPlaceholder}>Choisis l'occasion…</span>
          )}
        </span>
        <ChevronDown size={18} className={`${styles.ddChevron} ${open ? styles.ddChevronOpen : ''}`} />
      </button>

      {open && (
        <ul className={styles.ddPanel} role="listbox">
          {OCCASIONS.map((ev, i) => {
            const selected = value?.id === ev.id;
            const active = i === activeIdx;
            return (
              <li
                key={ev.id}
                role="option"
                aria-selected={selected}
                className={`${styles.ddOption} ${active ? styles.ddOptionActive : ''} ${selected ? styles.ddOptionSelected : ''}`}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => { onChange(ev); setOpen(false); }}
              >
                <span className={styles.ddEmoji}><NotoEmoji name={ev.noto} size={22} /></span>
                <span className={styles.ddLabel}>{ev.label}</span>
                {selected && <Check size={14} className={styles.ddCheck} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function QuickCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialName    = searchParams.get('name') || '';
  const initialOccId   = searchParams.get('occ') || '';
  const initialTitle   = searchParams.get('title') || '';
  const initialOcc     = initialOccId ? (OCC_BY_ID[initialOccId] || null) : null;

  // Wizard state
  const [step, setStep]           = useState(0); // 0..4
  const [occ, setOcc]             = useState(initialOcc);
  const [name, setName]           = useState(initialName);
  const [title, setTitle]         = useState(initialTitle);
  const [titleTouched, setTitleTouched] = useState(!!initialTitle);
  const [format, setFormat]       = useState(null); // 'solo' | 'collective'
  const [message, setMessage]     = useState(initialOcc?.defaultMsg || '');
  const [sender, setSender]       = useState('');
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_PACKS[0]);
  const [selectedEffect, setSelectedEffect] = useState('confetti');
  const [creating, setCreating]   = useState(false);

  const iframeRef = useRef(null);

  /* Template solo auto-sélectionné depuis l'occasion. */
  const selectedTpl = useMemo(
    () => (occ ? TEMPLATES_BY_ID[occ.tpl] || TEMPLATES_BY_ID.booklet : TEMPLATES_BY_ID.booklet),
    [occ]
  );

  /* Auto-fill titre depuis occ + name, sauf si utilisateur l'a édité. */
  const suggestedTitle = useMemo(() => {
    if (!occ || !name.trim()) return '';
    return occ.titleFor(name.trim());
  }, [occ, name]);

  useEffect(() => {
    if (!titleTouched) setTitle(suggestedTitle);
  }, [suggestedTitle, titleTouched]);

  /* Auto-fill message quand occ change, sauf si utilisateur a déjà tapé. */
  useEffect(() => {
    if (occ && !message.trim()) setMessage(occ.defaultMsg);
  }, [occ]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Sync state → iframe preview via postMessage. */
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        iframeRef.current?.contentWindow?.postMessage({
          type: 'WW_UPDATE',
          data: {
            recipient: name || 'Prénom',
            titleName: name || 'Prénom',
            title: title || suggestedTitle || `Pour ${name || 'Prénom'}`,
            message: message || selectedTpl?.emoji || '',
            sender: sender || 'De tes proches',
            bgKey: selectedBg.id,
          },
          style: { backgroundImg: selectedBg.url },
        }, '*');
      } catch (e) {}
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedTpl, name, title, suggestedTitle, message, sender, selectedBg, selectedEffect]);

  const canNext = () => {
    if (step === 0) return !!occ && name.trim().length >= 2;
    if (step === 1) return !!format;
    if (step === 2) return message.trim().length >= 5;
    return true;
  };

  const finalTitle = (title && title.trim()) || suggestedTitle || `Pour ${name}`;

  const handleFinishAndPublish = async () => {
    setCreating(true);

    const cardPayload = {
      templateName: selectedTpl.id,
      customName: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}-${Date.now().toString().slice(-4)}`,
      title: finalTitle,
      data: {
        recipient: name,
        titleName: name,
        title: finalTitle,
        occasion: occ?.id,
        occasionLabel: occ?.label,
        message,
        sender,
        bgKey: selectedBg.id,
      },
      style: { backgroundImg: selectedBg.url },
      decorations: [selectedEffect],
      widgets: [],
    };

    if (!user) {
      localStorage.setItem('ewish_draft', JSON.stringify(cardPayload));
      navigate('/ewish-admin/ewish/edit/draft');
      return;
    }

    try {
      const res = await createPublication(cardPayload);
      navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur lors de la création');
      setCreating(false);
    }
  };

  /* Format = collective → on redirige vers le wall wizard avec les infos déjà saisies. */
  const goCollective = () => {
    const qs = new URLSearchParams();
    if (occ?.id)             qs.set('occ', occ.id);
    if (name)                qs.set('name', name);
    if (titleTouched && title) qs.set('title', title);
    qs.set('step', '2'); // Le wall wizard confirme à step 2 (occ + name déjà validés)
    navigate(`/ewish-admin/wall/new?${qs.toString()}`);
  };

  const previewSrc = `${API_URL}/preview/${selectedTpl.id}`;

  return (
    <div className={styles.root}>
      {/* Top Header with step progress */}
      <header className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={() => step === 0 ? navigate('/ewish-admin') : setStep((s) => s - 1)}
        >
          <ArrowLeft size={16} />
          <span>{step === 0 ? 'Accueil' : 'Précédent'}</span>
        </button>

        <div className={styles.progressTrack}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`${styles.progressPill} ${step >= i ? styles.progressPillActive : ''}`}
            />
          ))}
        </div>

        <span className={styles.stepCounter}>Étape {step + 1} / 5</span>
      </header>

      {/* Main Split Layout */}
      <main className={styles.wizardLayout}>
        {/* Left Form Section */}
        <section className={styles.formSection}>
          {/* SECTION 1 — Contexte : occasion (dropdown) + destinataire + titre */}
          {step === 0 && (
            <div className={styles.sectionInner}>
              <div className={styles.stepHeader}>
                <span className={styles.stepTag}>
                  <Sparkles size={13} /> Étape 1 · Le contexte
                </span>
                <h1 className={styles.stepTitle}>C'est pour quoi, pour qui ?</h1>
                <p className={styles.stepSub}>Trois infos rapides et on continue.</p>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Occasion</label>
                <OccasionDropdown value={occ} onChange={setOcc} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Destinataire</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah, Léa & Karim, l'équipe RH…"
                  autoFocus
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Titre <span className={styles.fieldHint}>(auto-rempli, modifiable)</span>
                </label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setTitleTouched(true); }}
                  placeholder={suggestedTitle || 'Ex: Joyeux anniversaire, Sarah'}
                />
              </div>
            </div>
          )}

          {/* SECTION 2 — Format : collective vs solo */}
          {step === 1 && (
            <div className={styles.sectionInner}>
              <div className={styles.stepHeader}>
                <span className={styles.stepTag}>
                  <Sparkles size={13} /> Étape 2 · Le format
                </span>
                <h1 className={styles.stepTitle}>Une carte à plusieurs, ou solo ?</h1>
                <p className={styles.stepSub}>
                  Tu peux inviter tout un groupe à contribuer, ou envoyer une carte animée en ton nom.
                </p>
              </div>

              <div className={styles.typeGrid}>
                {/* Collective — route vers le wall wizard */}
                <button
                  type="button"
                  className={`${styles.typeCard} ${styles.typeCollective} ${format === 'collective' ? styles.typeCardActive : ''}`}
                  onClick={() => { setFormat('collective'); goCollective(); }}
                >
                  <div className={styles.typeIconRow}>
                    <div className={`${styles.typeAvatar} ${styles.typeAvA}`}>M</div>
                    <div className={`${styles.typeAvatar} ${styles.typeAvB}`}>K</div>
                    <div className={`${styles.typeAvatar} ${styles.typeAvC}`}>+</div>
                  </div>
                  <div className={styles.typeBadge}><Users size={12} /> Collaboratif</div>
                  <h3 className={styles.typeTitle}>Carte collective</h3>
                  <p className={styles.typeDesc}>
                    Un mur de mots. Tes proches ajoutent leurs messages, photos, vidéos via un lien.
                  </p>
                  <ul className={styles.typeList}>
                    <li><Check size={14} /> Contributeurs illimités</li>
                    <li><Check size={14} /> Cagnotte intégrée (optionnel)</li>
                    <li><Check size={14} /> 4 vues de projection</li>
                  </ul>
                  <div className={styles.typeCta}>
                    Créer le mur
                    <ArrowRight size={16} />
                  </div>
                </button>

                {/* Solo — continue le wizard carte */}
                <button
                  type="button"
                  className={`${styles.typeCard} ${styles.typeSolo} ${format === 'solo' ? styles.typeCardActive : ''}`}
                  onClick={() => { setFormat('solo'); setStep(2); }}
                >
                  <div className={styles.typeSoloIcon}>
                    <User size={22} />
                  </div>
                  <div className={styles.typeBadge}><User size={12} /> Solo</div>
                  <h3 className={styles.typeTitle}>Carte perso</h3>
                  <p className={styles.typeDesc}>
                    Une carte animée 3D signée de ta part. Musique, photos, message personnalisé.
                  </p>
                  <ul className={styles.typeList}>
                    <li><Check size={14} /> Animation 3D unique</li>
                    <li><Check size={14} /> Musique intégrée</li>
                    <li><Check size={14} /> Envoi direct par lien / QR</li>
                  </ul>
                  <div className={styles.typeCta}>
                    Continuer
                    <ArrowRight size={16} />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Message & Suggestions */}
          {step === 2 && (
            <div className={styles.sectionInner}>
              <div className={styles.stepHeader}>
                <span className={styles.stepTag}>
                  <Sparkles size={13} /> Étape 3 · Le Message
                </span>
                <h1 className={styles.stepTitle}>Ton mot doux personnalisé</h1>
                <p className={styles.stepSub}>
                  Écris ton message ou pioche dans nos suggestions prérédigées en 1 clic.
                </p>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Ton message *</label>
                <textarea
                  className={styles.textArea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écris ton mot ici..."
                />
                <div className={styles.suggestionsRow}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#78716C', alignSelf: 'center' }}>
                    Idées rapides :
                  </span>
                  {(SUGGESTIONS[occ?.id] || SUGGESTIONS.anniversary).map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={styles.suggestionBtn}
                      onClick={() => setMessage(sug.text)}
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Ta signature / De la part de (optionnel)</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="ex : Ton collègue préféré, Toute la famille, Sarah..."
                />
              </div>
            </div>
          )}

          {/* STEP 3: Fond (Background) & Décorations */}
          {step === 3 && (
            <div className={styles.sectionInner}>
              <div className={styles.stepHeader}>
                <span className={styles.stepTag}>
                  <Sparkles size={13} /> Étape 4 · Ambiance & Décors
                </span>
                <h1 className={styles.stepTitle}>Choisis le fond et l'effet festif</h1>
                <p className={styles.stepSub}>
                  Personnalise l'habillage visuel et les animations de confettis.
                </p>
              </div>

              <label className={styles.fieldLabel}>Pack d'arrière-plan</label>
              <div className={styles.bgPackGrid}>
                {BACKGROUND_PACKS.map((bg) => {
                  const active = selectedBg.id === bg.id;
                  return (
                    <div
                      key={bg.id}
                      className={`${styles.bgPackCard} ${active ? styles.bgPackCardActive : ''}`}
                      onClick={() => setSelectedBg(bg)}
                    >
                      <div
                        className={styles.bgPreviewSquare}
                        style={{ backgroundImage: `url(${bg.url})` }}
                      />
                      <div className={styles.bgPackName}>{bg.name}</div>
                    </div>
                  );
                })}
              </div>

              <label className={styles.fieldLabel}>Animation de fête</label>
              <div className={styles.effectsRow}>
                {EFFECTS.map((eff) => {
                  const active = selectedEffect === eff.id;
                  return (
                    <button
                      key={eff.id}
                      type="button"
                      className={`${styles.effectBtn} ${active ? styles.effectBtnActive : ''}`}
                      onClick={() => setSelectedEffect(eff.id)}
                    >
                      {eff.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Résultat Final & Publication */}
          {step === 4 && (
            <div className={styles.sectionInner}>
              <div className={styles.stepHeader}>
                <span className={styles.stepTag}>
                  <Sparkles size={13} /> Étape 5 · Résultat Final
                </span>
                <h1 className={styles.stepTitle}>Ta carte est prête pour {name} !</h1>
                <p className={styles.stepSub}>
                  Vérifie le résultat final sur le smartphone ci-contre. Dès que c'est bon, publie et récupère ton lien de partage instantané.
                </p>
              </div>

              <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #E8E5E1', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>{selectedTpl.emoji}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{finalTitle}</h3>
                    <span style={{ fontSize: 13, color: '#78716C' }}>
                      {selectedTpl.name} · Fond : {selectedBg.name}
                    </span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#4A4540', fontStyle: 'italic', background: '#FAF7F4', padding: '10px 14px', borderRadius: 10 }}>
                  "{message}"
                </p>
              </div>

              <button
                className={styles.btnPublish}
                onClick={handleFinishAndPublish}
                disabled={creating}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Zap size={18} />
                <span>{creating ? 'Création en cours…' : 'Publier ma carte (Lien & QR Code)'}</span>
              </button>
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12.5, color: '#78716C' }}>
                Tu pourras modifier ta carte à tout moment même après publication.
              </div>
            </div>
          )}

          {/* Wizard Navigation Buttons */}
          <footer className={styles.wizardFooter}>
            {step > 0 ? (
              <button
                className={styles.btnPrev}
                onClick={() => setStep((s) => s - 1)}
              >
                <ArrowLeft size={15} />
                <span>Précédent</span>
              </button>
            ) : <div />}

            {step < 4 && step !== 1 ? (
              <button
                className={styles.btnNext}
                disabled={!canNext()}
                onClick={() => setStep((s) => s + 1)}
              >
                <span>Étape suivante</span>
                <ArrowRight size={16} />
              </button>
            ) : null}
          </footer>
        </section>

        {/* Right Smartphone Frame Live Stage */}
        <aside className={styles.previewStage}>
          <div className={styles.previewPhone}>
            <div className={styles.previewNotch} />
            <iframe
              ref={iframeRef}
              src={previewSrc}
              className={styles.previewIframe}
              title="Aperçu en direct"
              allow="autoplay"
            />
          </div>
          <div className={styles.previewStageCaption}>
            📱 Aperçu en direct réactif (iPhone mockup)
          </div>
        </aside>
      </main>
    </div>
  );
}
