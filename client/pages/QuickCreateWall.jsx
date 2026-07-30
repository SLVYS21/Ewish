import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { createPublication } from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import styles from './QuickCreate.module.css';

/* Mêmes occasions que TemplatesGallery */
const WALL_EVENTS = [
  { id: 'anniversary', label: 'Anniversaire',        emoji: '🎂', festive: true,
    title: (n) => `Joyeux anniversaire, ${n}`,
    subtitle: () => 'Laisse un mot doux pour cet anniversaire.',
    eyebrow: '✦ Anniversaire', color: '#FFB3C1' },
  { id: 'wedding',     label: 'Mariage',             emoji: '💍', festive: true,
    title: (n) => `Le mariage de ${n}`,
    subtitle: () => 'Un mot pour les jeunes mariés.',
    eyebrow: '✦ Mariage', color: '#F8C8DC' },
  { id: 'birth',       label: 'Naissance',           emoji: '👶', festive: true,
    title: (n) => `Bienvenue à ${n}`,
    subtitle: () => 'Un mot doux pour son arrivée.',
    eyebrow: '✦ Naissance', color: '#D7C5F2' },
  { id: 'farewell',    label: 'Pot de départ',       emoji: '🥂', festive: true,
    title: (n) => `Bon départ, ${n}`,
    subtitle: () => 'Un mot pour son nouveau chapitre.',
    eyebrow: '✦ Pot de départ', color: '#C9EEDF' },
  { id: 'welcome',     label: "Bienvenue équipe",     emoji: '👋', festive: true,
    title: (n) => `Bienvenue, ${n}`,
    subtitle: () => 'Un mot chaleureux pour son arrivée.',
    eyebrow: '✦ Bienvenue', color: '#FFD7C2' },
  { id: 'thanks',      label: 'Remerciement',        emoji: '❤️', festive: false,
    title: (n) => `Merci, ${n}`,
    subtitle: () => 'Un mot pour dire merci.',
    eyebrow: '✦ Remerciement', color: '#FFC95A' },
  { id: 'tribute',     label: 'Hommage',             emoji: '🕊️', festive: false,
    title: (n) => `En mémoire de ${n}`,
    subtitle: () => 'Un mot doux, un souvenir partagé.',
    eyebrow: '✦ Hommage', color: '#D9E5F4' },
  { id: 'other',       label: 'Autre',               emoji: '✨', festive: false,
    title: (n) => `Pour ${n}`,
    subtitle: () => 'Un mot pour cette personne.',
    eyebrow: '✦ Mur de mots', color: '#FFE7AD' },
];

export default function QuickCreateWall() {
  const navigate = useNavigate();
  const [step, setStep]   = useState(0);
  const [occ, setOcc]     = useState(null);
  const [name, setName]   = useState('');
  const [creating, setCreating] = useState(false);

  const { user } = useAuth();

  const canNext = () => {
    if (step === 0) return !!occ;
    if (step === 1) return name.trim().length >= 2;
    return true;
  };

  const handleDone = async () => {
    setCreating(true);
    
    const recipient = name.trim();
    const title = occ.title(recipient);
    const data = {
      eyebrow: occ.eyebrow,
      titleName: recipient,
      subtitle: occ.subtitle(recipient),
      occasion: occ.id,
      occasionLabel: occ.label,
      recipient,
      festive: occ.festive,
      wishesEnabled: true,
    };

    if (!user) {
      // Offline mode
      const draft = {
        templateName: 'wall-of-wishes', // Default template
        customName: `wall-${Date.now()}`,
        title,
        data,
        style: {},
        decorations: [],
        widgets: [],
        cagnotteConfig: null,
      };
      localStorage.setItem('ewish_wall_draft', JSON.stringify(draft));
      navigate(`/ewish-admin/wall/draft`);
      return;
    }

    try {
      const res = await createPublication({
        templateName: 'wall-of-wishes',
        customName: `wall-${Date.now()}`,
        title,
        data,
      });
      navigate(`/ewish-admin/wall/${res.data._id}`);
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur lors de la création');
      setCreating(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Top progress bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => step === 0 ? window.history.back() : setStep(s => s - 1)}>
          <ArrowLeft size={16}/> {step === 0 ? 'Retour' : 'Précédent'}
        </button>
        <div className={styles.progress}>
          {[0,1,2].map(i => (
            <span key={i} className={styles.progressDot} style={{ background: step >= i ? 'var(--mk-rose)' : 'var(--mk-line-strong)', transition: 'background .3s' }}/>
          ))}
        </div>
        <span className={styles.stepLabel}>Étape {step + 1} / 3</span>
      </div>

      <div className={styles.content}>
        {/* STEP 0  Occasion */}
        {step === 0 && (
          <div className={styles.stepWrap} style={{ animation: 'mk-pop .3s' }}>
            <div className={styles.stepHeader}>
              <div className={styles.stepHand}>Quelle est l'occasion ?</div>
              <h1 className={styles.stepTitle}>On fête quoi aujourd'hui ?</h1>
              <p className={styles.stepSub}>Choisis l'événement, on adaptera le mur de mots pour toi.</p>
            </div>
            <div className={styles.occasionGrid}>
              {WALL_EVENTS.map(p => {
                const active = occ?.id === p.id;
                return (
                  <button
                    key={p.id}
                    className={styles.occasionCard}
                    style={{
                      background: active ? p.color : '#fff',
                      border: `2px solid ${active ? 'var(--mk-ink)' : 'var(--mk-line-2)'}`,
                    }}
                    onClick={() => setOcc(p)}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.background = p.color + '44'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--mk-line-2)'; e.currentTarget.style.background = '#fff'; } }}
                  >
                    <div className={styles.occasionEmoji}>{p.emoji}</div>
                    <div className={styles.occasionName}>{p.label}</div>
                    {active && (
                      <span className={styles.checkMark}><Check size={12}/></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1  Nom */}
        {step === 1 && (
          <div className={styles.stepWrapCenter} style={{ animation: 'mk-pop .3s' }}>
            <div className={styles.stepEmojiLarge}>{occ?.emoji}</div>
            <div className={styles.stepHand}>C'est pour qui ?</div>
            <h1 className={styles.stepTitle}>Le héros du jour</h1>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              placeholder="Sarah, Léa & Karim, Marc..."
              className={styles.bigInput}
              onFocus={e => { e.target.style.borderColor = 'var(--mk-rose-soft)'; e.target.style.boxShadow = '0 0 0 8px var(--mk-rose-pale)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--mk-line-2)'; e.target.style.boxShadow = 'none'; }}
              onKeyDown={e => { if (e.key === 'Enter' && canNext()) setStep(2); }}
            />
            <p className={styles.inputHint}>Tu pourras changer ce titre à tout moment depuis l'éditeur.</p>
          </div>
        )}

        {/* STEP 2  Confirmation */}
        {step === 2 && (
          <div className={styles.stepWrapCenter} style={{ animation: 'mk-pop .3s', maxWidth: 680 }}>
            <div className={styles.stepEmojiLarge}>{occ?.emoji}</div>
            <div className={styles.stepHand}>C'est prêt !</div>
            <h1 className={styles.stepTitle}>
              On crée le mur pour <span style={{ color: 'var(--mk-rose)' }}>{name || 'cette personne'}</span>
            </h1>
            <p className={styles.stepSub} style={{ marginBottom: 28 }}>
              Ton mur de mots collaboratif va s'ouvrir. Tu pourras ensuite le personnaliser, ajouter une cagnotte, et inviter tes proches !
            </p>

            <button
              className={styles.btnDone}
              onClick={handleDone}
              disabled={creating}
            >
              {creating ? '⏳ Création…' : <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 13.5 9.5 21 11 13.5 12.5 12 20 10.5 12.5 3 11 10.5 9.5Z"/></svg>
                Ouvrir mon mur
                <ArrowRight size={16}/>
              </>}
            </button>
            <div className={styles.creditNote}>Rien ne sera publié avant que tu sois prêt.</div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      {step < 2 && (
        <div className={styles.footer}>
          <button className={styles.btnQuiet} disabled={step === 0} onClick={() => setStep(s => s - 1)}>
            <ArrowLeft size={15}/> Précédent
          </button>
          <button
            className={styles.btnNext}
            disabled={!canNext()}
            onClick={() => setStep(s => s + 1)}
          >
            Continuer
            <ArrowRight size={15}/>
          </button>
        </div>
      )}
    </div>
  );
}
