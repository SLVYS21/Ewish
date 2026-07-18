import { useEffect, useRef, useState } from 'react';
import { PenLine, RotateCcw } from 'lucide-react';
import s from '../WizardWall.module.css';
import { getEvent } from '../constants';

/* ══════════════════════════════════════════════════════════
   Étape 2 — Destinataire + titre + phrase d'accueil
   Applique : Smart Defaults (titre + phrase auto générés depuis
   le prénom) + IKEA (un chip "Modifier le titre" révèle le champ,
   petit investissement qui augmente l'attachement).
   ══════════════════════════════════════════════════════════ */
export default function StepRecipient({ state, update }) {
  const inputRef = useRef(null);
  const [showTitleEdit, setShowTitleEdit] = useState(state.titleTouched);
  const [showPhraseEdit, setShowPhraseEdit] = useState(state.phraseTouched);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const event = getEvent(state.eventId);
  const generatedTitle = event.title(state.recipient.trim() || '…');
  const generatedPhrase = event.subtitle(state.recipient.trim() || '');

  return (
    <>
      <div className={s.stepHeader}>
        <div className={s.stepEyebrow}>Étape 2 — Destinataire</div>
        <h1 className={s.stepTitle}>Pour qui ce mur ?</h1>
        <p className={s.stepSubtitle}>
          Son prénom (ou son surnom d'équipe) apparaîtra dans le titre.
          On génère un titre chaleureux automatiquement — tu peux le retoucher.
        </p>
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="recipient">
          Prénom ou nom du destinataire
        </label>
        <input
          ref={inputRef}
          id="recipient"
          className={s.input}
          value={state.recipient}
          maxLength={80}
          placeholder="Sarah, Léa & Karim, l'équipe RH…"
          onChange={(e) => update({ recipient: e.target.value })}
        />
        <div className={s.fieldHint}>
          Astuce : « Sarah », « Papa », « L'équipe design »…
        </div>
      </div>

      {/* Preview live du titre auto */}
      <div className={s.previewCard} aria-live="polite">
        <div className={s.previewEyebrow}>Aperçu du titre</div>
        <div className={s.previewTitle}>{generatedTitle}</div>
        <div className={s.previewSubtitle}>{generatedPhrase}</div>
      </div>

      {/* Chip IKEA — révèle l'édition manuelle */}
      {!showTitleEdit && !showPhraseEdit && (
        <button
          type="button"
          onClick={() => setShowTitleEdit(true)}
          style={{
            marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 999,
            background: '#fff', border: '1.5px solid #EEEBF3',
            color: '#55506B', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <PenLine size={13} /> Personnaliser le titre
        </button>
      )}

      {showTitleEdit && (
        <div className={s.field} style={{ marginTop: 18 }}>
          <label className={s.fieldLabel} htmlFor="title">
            Titre du mur
            <button
              type="button"
              onClick={() => {
                update({ title: generatedTitle, titleTouched: false });
                setShowTitleEdit(false);
              }}
              style={{
                marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'transparent', border: 'none',
                color: '#A29CB4', fontSize: 11,
                fontFamily: 'inherit', cursor: 'pointer',
              }}
              aria-label="Restaurer le titre automatique"
            >
              <RotateCcw size={11} /> Restaurer
            </button>
          </label>
          <input
            id="title"
            className={s.input}
            value={state.title || generatedTitle}
            maxLength={140}
            onChange={(e) => update({ title: e.target.value, titleTouched: true })}
          />
        </div>
      )}

      {showTitleEdit && !showPhraseEdit && (
        <button
          type="button"
          onClick={() => setShowPhraseEdit(true)}
          style={{
            marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 999,
            background: '#fff', border: '1.5px solid #EEEBF3',
            color: '#55506B', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <PenLine size={13} /> Personnaliser la phrase d'accueil
        </button>
      )}

      {showPhraseEdit && (
        <div className={s.field} style={{ marginTop: 18 }}>
          <label className={s.fieldLabel} htmlFor="phrase">
            Phrase d'accueil
            <button
              type="button"
              onClick={() => {
                update({ phrase: generatedPhrase, phraseTouched: false });
                setShowPhraseEdit(false);
              }}
              style={{
                marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'transparent', border: 'none',
                color: '#A29CB4', fontSize: 11,
                fontFamily: 'inherit', cursor: 'pointer',
              }}
              aria-label="Restaurer la phrase automatique"
            >
              <RotateCcw size={11} /> Restaurer
            </button>
          </label>
          <textarea
            id="phrase"
            className={s.textarea}
            rows={3}
            value={state.phrase || generatedPhrase}
            maxLength={220}
            onChange={(e) => update({ phrase: e.target.value, phraseTouched: true })}
          />
          <div className={s.fieldHint}>
            Affichée en grand sur la page d'accueil — c'est le premier mot vu par le destinataire.
          </div>
        </div>
      )}
    </>
  );
}
