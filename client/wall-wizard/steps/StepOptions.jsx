import { ShieldCheck, CalendarDays, Sparkles, Lock } from 'lucide-react';
import s from '../WizardWall.module.css';
import { CONFETTI_EFFECTS } from '../constants';

/* ══════════════════════════════════════════════════════════
   Étape 5 — Options
   Applique :
     - Loss Aversion (les copy insistent sur ce que l'utilisateur
       évite de perdre en activant modération / privé)
     - Smart Defaults (deadline J+30, confetti emoji_party)
   ══════════════════════════════════════════════════════════ */
export default function StepOptions({ state, update }) {
  return (
    <>
      <div className={s.stepHeader}>
        <div className={s.stepEyebrow}>Étape 5 — Options</div>
        <h1 className={s.stepTitle}>Les derniers réglages</h1>
        <p className={s.stepSubtitle}>
          Les valeurs par défaut fonctionnent pour la plupart des murs. Personnalise seulement
          si tu veux un contrôle spécifique.
        </p>
      </div>

      <div className={s.optionsGrid}>
        {/* Modération — Loss Aversion */}
        <div className={s.optionRow} data-active={state.requireModeration}>
          <span className={s.optionIcon} aria-hidden><ShieldCheck size={18} /></span>
          <div className={s.optionBody}>
            <div className={s.optionTitle}>Valider chaque mot avant publication</div>
            <div className={s.optionDesc}>
              Évite les mauvaises surprises (blagues gênantes, spam) — chaque mot passe
              par toi avant d'être collé au mur.
            </div>
          </div>
          <button
            type="button"
            className={s.toggle}
            data-on={state.requireModeration}
            role="switch"
            aria-checked={state.requireModeration}
            onClick={() => update({ requireModeration: !state.requireModeration })}
            aria-label="Activer la modération"
          />
        </div>

        {/* Deadline — Smart Default J+30 */}
        <div className={s.optionRow} data-active>
          <span className={s.optionIcon} aria-hidden><CalendarDays size={18} /></span>
          <div className={s.optionBody}>
            <div className={s.optionTitle}>Date limite du mur</div>
            <div className={s.optionDesc}>
              Le mur se ferme automatiquement à cette date. On a mis J+30 par défaut —
              tu peux ajuster ou laisser vide pour ne pas mettre de limite.
            </div>
            <div className={s.optionExtra}>
              <input
                type="date"
                className={s.select}
                value={state.deadline || ''}
                onChange={(e) => update({ deadline: e.target.value })}
                style={{ maxWidth: 220 }}
              />
            </div>
          </div>
        </div>

        {/* Confetti — Smart Default emoji_party */}
        <div className={s.optionRow} data-active>
          <span className={s.optionIcon} aria-hidden><Sparkles size={18} /></span>
          <div className={s.optionBody}>
            <div className={s.optionTitle}>Type de confettis à l'ouverture</div>
            <div className={s.optionDesc}>
              Effet joué quand le destinataire déballe son mur. Tu peux tester la sensation
              à l'étape 6 (aperçu).
            </div>
            <div className={s.optionExtra}>
              <select
                className={s.select}
                value={state.confettiType}
                onChange={(e) => update({ confettiType: e.target.value })}
                aria-label="Type de confettis"
              >
                {CONFETTI_EFFECTS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} — {c.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mur privé — Loss Aversion */}
        <div className={s.optionRow} data-active={state.isPrivate}>
          <span className={s.optionIcon} aria-hidden><Lock size={18} /></span>
          <div className={s.optionBody}>
            <div className={s.optionTitle}>Rendre le mur privé (par code)</div>
            <div className={s.optionDesc}>
              Sans le code, personne ne peut ouvrir le mur — même avec le lien.
              N'active que si tu veux vraiment restreindre l'accès (sinon tes proches
              risquent d'être bloqués).
            </div>
            {state.isPrivate && (
              <div className={s.optionExtra}>
                <input
                  className={s.select}
                  value={state.accessCode}
                  onChange={(e) => update({ accessCode: e.target.value.toUpperCase() })}
                  placeholder="EX : SARAH25"
                  maxLength={12}
                  style={{
                    maxWidth: 220,
                    fontFamily: 'var(--mk-font-mono, DM Mono, monospace)',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                  }}
                  aria-label="Code d'accès du mur"
                />
              </div>
            )}
          </div>
          <button
            type="button"
            className={s.toggle}
            data-on={state.isPrivate}
            role="switch"
            aria-checked={state.isPrivate}
            onClick={() => update({ isPrivate: !state.isPrivate })}
            aria-label="Rendre le mur privé"
          />
        </div>
      </div>
    </>
  );
}
