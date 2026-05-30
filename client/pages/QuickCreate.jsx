import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { createPublication } from '../utils/api';
import styles from './QuickCreate.module.css';

const OCCASIONS = [
  { id: 'anniv-25',   occasion: 'Anniversaire',       detail: '25 ans',          emoji: '🎂', template: 'birthday',         color: '#FFB3C1' },
  { id: 'anniv-kid',  occasion: 'Anniv enfant',        detail: '4-10 ans',        emoji: '🎈', template: 'birthday',         color: '#FFC95A' },
  { id: 'anniv-50',   occasion: 'Anniversaire',        detail: '50 / 60 ans',     emoji: '🥂', template: 'birthday',         color: '#FFE7AD' },
  { id: 'mariage',    occasion: 'Mariage',             detail: 'Faire-part',      emoji: '💍', template: 'forever',          color: '#F8C8DC' },
  { id: 'naissance',  occasion: 'Naissance',           detail: 'Annoncer bébé',   emoji: '👶', template: 'collective-family',color: '#D7C5F2' },
  { id: 'pot-depart', occasion: 'Pot de départ',       detail: 'Collègue',        emoji: '🥂', template: 'collective-pro',   color: '#C9EEDF' },
  { id: 'welcome',    occasion: "Bienvenue à l'équipe",detail: 'Nouvel arrivant', emoji: '👋', template: 'collective-pro',   color: '#FFD7C2' },
  { id: 'hommage',    occasion: 'Hommage',             detail: 'En mémoire',      emoji: '🕊️', template: 'special',          color: '#D9E5F4' },
];

const TEMPLATE_LABELS = {
  birthday: "L'Anniv' Confetti",
  forever: 'Forever Bloom',
  'collective-family': 'Collectif Famille',
  'collective-pro': 'Pot de Départ',
  special: 'Occasion Spéciale',
};

export default function QuickCreate() {
  const navigate = useNavigate();
  const [step, setStep]   = useState(0);
  const [occ, setOcc]     = useState(null);
  const [name, setName]   = useState('');
  const [when, setWhen]   = useState('');
  const [creating, setCreating] = useState(false);

  const canNext = () => {
    if (step === 0) return !!occ;
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return !!when;
    return true;
  };

  const handleDone = async () => {
    setCreating(true);
    try {
      const res = await createPublication({
        templateName: occ.template,
        customName: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}-${Date.now()}`,
        title: `${occ.occasion} ${name}`,
      });
      navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur lors de la création');
      setCreating(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Top progress bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => step === 0 ? navigate('/ewish-admin') : setStep(s => s - 1)}>
          <ArrowLeft size={16}/> {step === 0 ? 'Accueil' : 'Précédent'}
        </button>
        <div className={styles.progress}>
          {[0,1,2,3].map(i => (
            <span key={i} className={styles.progressDot} style={{ background: step >= i ? 'var(--mk-rose)' : 'var(--mk-line-strong)', transition: 'background .3s' }}/>
          ))}
        </div>
        <span className={styles.stepLabel}>Étape {step + 1} / 4</span>
      </div>

      <div className={styles.content}>
        {/* STEP 0 — Occasion */}
        {step === 0 && (
          <div className={styles.stepWrap} style={{ animation: 'mk-pop .3s' }}>
            <div className={styles.stepHeader}>
              <div className={styles.stepHand}>Quelle est l'occasion ?</div>
              <h1 className={styles.stepTitle}>Pour quoi on s'active aujourd'hui ?</h1>
              <p className={styles.stepSub}>Choisis le moment — on te proposera un template prêt à remplir.</p>
            </div>
            <div className={styles.occasionGrid}>
              {OCCASIONS.map(p => {
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
                    <div className={styles.occasionName}>{p.occasion}</div>
                    <div className={styles.occasionDetail}>{p.detail}</div>
                    {active && (
                      <span className={styles.checkMark}><Check size={12}/></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1 — Nom */}
        {step === 1 && (
          <div className={styles.stepWrapCenter} style={{ animation: 'mk-pop .3s' }}>
            <div className={styles.stepEmojiLarge}>{occ?.emoji}</div>
            <div className={styles.stepHand}>Et c'est pour qui ?</div>
            <h1 className={styles.stepTitle}>Dis-moi son prénom</h1>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              placeholder="Sophie, Théo, Léa & Karim..."
              className={styles.bigInput}
              onFocus={e => { e.target.style.borderColor = 'var(--mk-rose-soft)'; e.target.style.boxShadow = '0 0 0 8px var(--mk-rose-pale)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--mk-line-2)'; e.target.style.boxShadow = 'none'; }}
            />
            <p className={styles.inputHint}>Tu pourras le changer plus tard. Ça apparaît dans l'URL de partage.</p>
          </div>
        )}

        {/* STEP 2 — Quand */}
        {step === 2 && (
          <div className={styles.stepWrapCenter} style={{ animation: 'mk-pop .3s' }}>
            <div className={styles.stepHand}>C'est pour quand ?</div>
            <h1 className={styles.stepTitle}>La grande date pour {name || '…'}</h1>
            <p className={styles.stepSub} style={{ marginBottom: 28 }}>On affichera un compte à rebours si tu le souhaites.</p>
            <div className={styles.whenGrid}>
              {[
                { id: 'today', label: "Aujourd'hui", sub: 'urgent !' },
                { id: 'week',  label: 'Cette semaine', sub: 'dans 3-7j' },
                { id: 'soon',  label: 'Plus tard', sub: 'date précise' },
              ].map(o => (
                <button
                  key={o.id}
                  className={styles.whenCard}
                  style={{
                    background: when === o.id ? 'var(--mk-rose-pale)' : '#fff',
                    border: `2px solid ${when === o.id ? 'var(--mk-rose)' : 'var(--mk-line-2)'}`,
                  }}
                  onClick={() => setWhen(o.id)}
                >
                  <div className={styles.whenLabel}>{o.label}</div>
                  <div className={styles.whenSub}>{o.sub}</div>
                </button>
              ))}
            </div>
            {when === 'soon' && (
              <input type="date" className={styles.dateInput} />
            )}
          </div>
        )}

        {/* STEP 3 — Recommandation */}
        {step === 3 && (
          <div className={styles.stepWrapCenter} style={{ animation: 'mk-pop .3s', maxWidth: 680 }}>
            <div className={styles.stepEmojiLarge}>{occ?.emoji}</div>
            <div className={styles.stepHand}>On a une suggestion 🎯</div>
            <h1 className={styles.stepTitle}>
              "{occ?.detail}" pour <span style={{ color: 'var(--mk-rose)' }}>{name || 'cette personne'}</span>
            </h1>
            <p className={styles.stepSub} style={{ marginBottom: 28 }}>
              On a pré-rempli le template <strong>{TEMPLATE_LABELS[occ?.template] || occ?.template}</strong>. Tu peux le personnaliser ensuite.
            </p>

            <div className={styles.reco}>
              <div className={styles.recoCard} style={{ border: '2px solid var(--mk-rose)', boxShadow: 'var(--mk-sh-rose)' }}>
                <span className={styles.recoBadge}>RECOMMANDÉ</span>
                <div className={styles.recoThumb} style={{ background: occ?.color }}>
                  <span style={{ fontSize: 56 }}>{occ?.emoji}</span>
                </div>
                <div className={styles.recoBody}>
                  <div className={styles.recoName}>{TEMPLATE_LABELS[occ?.template] || occ?.template}</div>
                  <div className={styles.recoCredits}>💎 3 crédits</div>
                </div>
              </div>
            </div>

            <button
              className={styles.btnDone}
              onClick={handleDone}
              disabled={creating}
            >
              {creating ? '⏳ Création…' : <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 13.5 9.5 21 11 13.5 12.5 12 20 10.5 12.5 3 11 10.5 9.5Z"/></svg>
                C'est parti, on personnalise
                <ArrowRight size={16}/>
              </>}
            </button>
            <div className={styles.creditNote}>💎 3 crédits seront débités à la publication, pas avant.</div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      {step < 3 && (
        <div className={styles.footer}>
          <button className={styles.btnQuiet} disabled={step === 0} onClick={() => setStep(s => s - 1)}>
            <ArrowLeft size={15}/> Précédent
          </button>
          <button
            className={styles.btnNext}
            disabled={!canNext()}
            onClick={() => setStep(s => s + 1)}
          >
            {step === 2 ? 'Voir la suggestion' : 'Continuer'}
            <ArrowRight size={15}/>
          </button>
        </div>
      )}
    </div>
  );
}
