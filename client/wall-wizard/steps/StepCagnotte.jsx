import { useRef, useState } from 'react';
import { Gift, ShieldCheck, Upload, X, Loader2 } from 'lucide-react';
import s from '../WizardWall.module.css';
import { uploadFile } from '../../utils/api';
import { CAGNOTTE_PRESETS } from '../constants';

/* ══════════════════════════════════════════════════════════
   Étape 4 — Cagnotte (optionnelle)
   Applique :
     - Réciprocité (encart "100% des fonds au créateur" AVANT
       la demande d'engagement financier)
     - Contrast Effect (3 presets d'objectif — le médian paraît
       raisonnable comparé au petit et au XL)
     - Smart Defaults (titre auto = "Cadeau pour {recipient}")
   ══════════════════════════════════════════════════════════ */
export default function StepCagnotte({ state, update }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const enabled = state.cagnotteEnabled;

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, { background: false });
      update({ cagnotteCover: res.data.url });
    } catch { /* silence — le user peut réessayer */ }
    finally { setUploading(false); }
  };

  const activePresetId = CAGNOTTE_PRESETS.find((p) => p.amount === Number(state.cagnotteGoal))?.id;

  return (
    <>
      <div className={s.stepHeader}>
        <div className={s.stepEyebrow}>Étape 4 — Cagnotte</div>
        <h1 className={s.stepTitle}>Une cagnotte pour offrir ensemble ?</h1>
        <p className={s.stepSubtitle}>
          Optionnel. Active si tu veux que tes proches puissent participer à un cadeau
          collectif via Kkiapay. Tu peux aussi ne garder que les mots.
        </p>
      </div>

      {/* Réciprocité — on donne de la valeur avant de demander l'engagement */}
      <div className={s.reciprocityBanner}>
        <span className={s.reciprocityIcon} aria-hidden><ShieldCheck size={17} /></span>
        <div className={s.reciprocityBody}>
          <div className={s.reciprocityTitle}>Tu reçois 100% des fonds collectés</div>
          <div className={s.reciprocityText}>
            Seuls les frais Kkiapay (~2%) sont retenus. Aucun prélèvement myKado. Retrait
            après une vérification d'identité rapide.
          </div>
        </div>
      </div>

      <div className={s.optionRow} data-active={enabled}>
        <span className={s.optionIcon} aria-hidden><Gift size={18} /></span>
        <div className={s.optionBody}>
          <div className={s.optionTitle}>Activer une cagnotte</div>
          <div className={s.optionDesc}>
            Les visiteurs verront une jauge de progression, pas les montants individuels.
          </div>
        </div>
        <button
          type="button"
          className={s.toggle}
          data-on={enabled}
          role="switch"
          aria-checked={enabled}
          onClick={() => update({ cagnotteEnabled: !enabled })}
          aria-label="Activer la cagnotte"
        />
      </div>

      {enabled && (
        <div style={{ marginTop: 20 }}>
          {/* Contrast Effect — 3 presets, l'utilisateur ancre son estimation dessus */}
          <div className={s.field}>
            <label className={s.fieldLabel}>Objectif suggéré</label>
            <div className={s.presetRow}>
              {CAGNOTTE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={s.preset}
                  data-active={activePresetId === p.id}
                  onClick={() => update({ cagnotteGoal: p.amount })}
                >
                  {p.recommended && <span className={s.presetRibbon}>Recommandé</span>}
                  <div className={s.presetAmount}>
                    {p.amount.toLocaleString('fr-FR')} F
                  </div>
                  <div className={s.presetLabel}>{p.label}</div>
                  <div className={s.presetHint}>{p.hint}</div>
                </button>
              ))}
            </div>
            <div className={s.fieldHint}>
              Tu peux aussi entrer un montant custom ci-dessous.
            </div>
          </div>

          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="cagnotte-title">Titre de la cagnotte</label>
            <input
              id="cagnotte-title"
              className={s.input}
              value={state.cagnotteTitle}
              placeholder={state.recipient ? `Cadeau pour ${state.recipient}` : 'Le vélo de Marc'}
              maxLength={100}
              onChange={(e) => update({ cagnotteTitle: e.target.value })}
            />
          </div>

          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="cagnotte-desc">Une phrase pour expliquer</label>
            <textarea
              id="cagnotte-desc"
              className={s.textarea}
              rows={3}
              value={state.cagnotteDescription}
              placeholder="On offre à Marc son premier vélo pour ses trajets…"
              maxLength={280}
              onChange={(e) => update({ cagnotteDescription: e.target.value })}
            />
          </div>

          <div className={s.field}>
            <label className={s.fieldLabel}>Image du cadeau (optionnel)</label>
            {state.cagnotteCover ? (
              <div style={{
                position: 'relative', width: 220, height: 140,
                borderRadius: 12, overflow: 'hidden',
                border: '1.5px solid #EEEBF3',
              }}>
                <img
                  src={state.cagnotteCover}
                  alt="Image du cadeau"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => update({ cagnotteCover: '' })}
                  aria-label="Retirer l'image"
                  style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 26, height: 26, borderRadius: 999,
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 12,
                  background: '#fff',
                  border: '1.5px dashed #DAD5E3',
                  color: '#55506B', fontFamily: 'inherit',
                  fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                }}
              >
                {uploading
                  ? <><Loader2 size={14} style={{ animation: 'mk-spin .75s linear infinite' }} /> Chargement…</>
                  : <><Upload size={14} /> Ajouter une image</>}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = '';
              }}
            />
            <div className={s.fieldHint}>
              Une belle photo du cadeau donne envie de participer.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className={s.field} style={{ marginBottom: 0 }}>
              <label className={s.fieldLabel}>Objectif (F CFA)</label>
              <input
                className={s.input}
                type="number"
                min={0}
                step={1000}
                value={state.cagnotteGoal}
                onChange={(e) => update({ cagnotteGoal: Number(e.target.value) })}
              />
            </div>
            <div className={s.field} style={{ marginBottom: 0 }}>
              <label className={s.fieldLabel}>Contribution min.</label>
              <input
                className={s.input}
                type="number"
                min={0}
                step={500}
                value={state.cagnotteMin}
                placeholder="500"
                onChange={(e) => update({ cagnotteMin: Number(e.target.value) })}
              />
            </div>
            <div className={s.field} style={{ marginBottom: 0 }}>
              <label className={s.fieldLabel}>Contribution max.</label>
              <input
                className={s.input}
                type="number"
                min={0}
                step={1000}
                value={state.cagnotteMax}
                placeholder="0 = illimité"
                onChange={(e) => update({ cagnotteMax: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
