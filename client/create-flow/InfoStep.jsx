import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Check } from 'lucide-react';
import NotoEmoji from '../components/NotoEmoji';
import { OCCASIONS, OCC_BY_ID } from './occasions';
import { loadContext } from './context';
import s from './InfoStep.module.css';

const TYPE_LABELS = {
  wish: 'Une carte',
  wall: 'Un mur',
  envelope: 'Une enveloppe',
  kado: 'Un kado',
};

const TYPE_NOTO = {
  wish: 'sparkling-heart',
  wall: 'speech-balloon',
  envelope: 'love-letter',
  kado: 'wrapped-gift',
};

/* Placeholders animés pour le champ destinataire, comme sur FinalCTA du landing. */
const RECIPIENT_PLACEHOLDERS = ['Maman', 'Marie', "l'équipe RH", 'Aminata', 'tes mariés', 'Alex'];

export default function InfoStep({ type, initialName = '', onBack, onSubmit }) {
  /* Pré-remplissage depuis sessionStorage si l'utilisateur revient sur cette étape
     après en être ressorti (ex. back browser). On ne récupère que si le type
     correspond — sinon on repart proprement. */
  const stored = useMemo(() => {
    const ctx = loadContext();
    return ctx && ctx.type === type ? ctx : null;
  }, [type]);

  const [occasionId, setOccasionId] = useState(stored?.occasion || '');
  const [recipient, setRecipient] = useState(stored?.recipient || initialName || '');
  const [title, setTitle] = useState(stored?.title || '');
  const [titleDirty, setTitleDirty] = useState(Boolean(stored?.title));
  const [placeholder, setPlaceholder] = useState(RECIPIENT_PLACEHOLDERS[0]);
  const [occDropdownOpen, setOccDropdownOpen] = useState(false);
  const recipientRef = useRef(null);
  const occDropdownRef = useRef(null);

  const occasion = occasionId ? OCC_BY_ID[occasionId] : null;

  /* Fermeture du dropdown occasion sur clic extérieur ou Escape. */
  useEffect(() => {
    if (!occDropdownOpen) return;
    const onClick = (e) => {
      if (occDropdownRef.current && !occDropdownRef.current.contains(e.target)) {
        setOccDropdownOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setOccDropdownOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [occDropdownOpen]);

  /* Auto-suggestion du titre depuis occasion + destinataire (sauf si l'utilisateur
     a manuellement édité le titre — dans ce cas on ne touche plus). */
  useEffect(() => {
    if (titleDirty) return;
    if (occasion && recipient.trim()) {
      setTitle(occasion.titleFor(recipient.trim()));
    } else {
      setTitle('');
    }
  }, [occasion, recipient, titleDirty]);

  /* Rotation du placeholder du champ destinataire (indice visuel : plusieurs
     types de destinataires possibles). Pause si l'utilisateur tape. */
  useEffect(() => {
    if (recipient) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % RECIPIENT_PLACEHOLDERS.length;
      setPlaceholder(RECIPIENT_PLACEHOLDERS[i]);
    }, 2400);
    return () => clearInterval(id);
  }, [recipient]);

  const canSubmit = Boolean(occasion) && recipient.trim().length >= 2;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    const finalTitle = (title.trim() || occasion.titleFor(recipient.trim())).trim();
    onSubmit?.({
      type,
      occasion: occasion.id,
      recipient: recipient.trim(),
      title: finalTitle,
    });
  };

  return (
    <div className={s.page}>
      {onBack && (
        <button className={s.back} onClick={onBack} type="button" aria-label="Retour">
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>
      )}

      <form className={s.form} onSubmit={handleSubmit}>
        {/* Type chip — rappel du choix étape 1 */}
        <div className={s.typeChip}>
          <NotoEmoji name={TYPE_NOTO[type] || 'sparkles'} size={22} />
          <span>{TYPE_LABELS[type] || 'Une création'}</span>
        </div>

        <div className={s.header}>
          <h1 className={s.title}>Pour qui, pour quoi ?</h1>
          <p className={s.subtitle}>On pré-remplit le reste depuis ces infos.</p>
        </div>

        {/* Section 1 — Occasion (dropdown) */}
        <div className={s.section}>
          <label className={s.label} id="mk-occasion-label">Quelle occasion ?</label>
          <div className={s.dropdown} ref={occDropdownRef}>
            <button
              type="button"
              className={s.dropdownTrigger}
              onClick={() => setOccDropdownOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={occDropdownOpen}
              aria-labelledby="mk-occasion-label"
            >
              {occasion ? (
                <span className={s.dropdownSelected}>
                  <NotoEmoji name={occasion.noto} size={22} />
                  <span>{occasion.label}</span>
                </span>
              ) : (
                <span className={s.dropdownPlaceholder}>Choisis une occasion</span>
              )}
              <ChevronDown
                size={18}
                className={`${s.dropdownCaret} ${occDropdownOpen ? s.dropdownCaretOpen : ''}`}
              />
            </button>
            {occDropdownOpen && (
              <ul className={s.dropdownMenu} role="listbox" aria-labelledby="mk-occasion-label">
                {OCCASIONS.map((occ) => {
                  const selected = occ.id === occasionId;
                  return (
                    <li
                      key={occ.id}
                      role="option"
                      aria-selected={selected}
                      className={`${s.dropdownOption} ${selected ? s.dropdownOptionActive : ''}`}
                      onClick={() => {
                        setOccasionId(occ.id);
                        setOccDropdownOpen(false);
                      }}
                    >
                      <NotoEmoji name={occ.noto} size={22} />
                      <span className={s.dropdownOptionLabel}>{occ.label}</span>
                      {selected && <Check size={16} className={s.dropdownCheck} />}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Section 2 — Destinataire */}
        <div className={s.section}>
          <label className={s.label} htmlFor="mk-recipient">Pour qui c'est ?</label>
          <input
            id="mk-recipient"
            ref={recipientRef}
            type="text"
            className={s.input}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            autoCapitalize="words"
            aria-label="Prénom du destinataire"
          />
        </div>

        {/* Section 3 — Titre (auto-généré, éditable) */}
        <div className={s.section}>
          <label className={s.label} htmlFor="mk-title">
            Titre <span className={s.labelHint}>(pré-rempli, à ta guise)</span>
          </label>
          <input
            id="mk-title"
            type="text"
            className={s.input}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleDirty(true);
            }}
            placeholder="Ex : Joyeux anniversaire, Sarah"
            autoComplete="off"
            aria-label="Titre de la création"
          />
        </div>

        {/* CTA continuer */}
        <button
          type="submit"
          className={s.submit}
          disabled={!canSubmit}
        >
          <span>Continuer</span>
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
