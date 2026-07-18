import { Eye, AlertTriangle } from 'lucide-react';
import s from '../WizardWall.module.css';
import WallRecipientPreview from '../WallRecipientPreview';

/* ══════════════════════════════════════════════════════════
   Étape 6 — Preview destinataire
   Applique :
     - IKEA (le créateur ajuste jusqu'au bout — c'est "son" mur)
     - Goal Gradient (progress 100% dès l'entrée = dopamine finale)
   Le WallRecipientPreview embarqué déroule tout le flow visiteur :
   intro → ouverture → mur → stories.
   ══════════════════════════════════════════════════════════ */
export default function StepPreview({ state, publishError }) {
  return (
    <>
      <div className={s.stepHeader}>
        <div className={s.stepEyebrow}>Étape 6 — Aperçu destinataire</div>
        <h1 className={s.stepTitle}>Voilà ce que verra {state.recipient.trim() || 'ton destinataire'}</h1>
        <p className={s.stepSubtitle}>
          Touche « Ouvrir les Kados » pour vivre le déballage exactement comme le
          destinataire le vivra. Si tout te plaît, publie le mur en bas.
        </p>
      </div>

      <div className={s.previewLegendWrap}>
        <span className={s.previewLegend}>
          <Eye size={13} /> Aperçu en direct — 100% interactif
        </span>
      </div>

      <div className={s.previewFrame}>
        <WallRecipientPreview
          event={state.eventId}
          recipient={state.recipient}
          title={state.title}
          phrase={state.phrase}
          backgroundId={state.backgroundId}
          cagnotteEnabled={state.cagnotteEnabled}
          cagnotteTitle={state.cagnotteTitle}
          cagnotteGoal={state.cagnotteGoal}
        />
      </div>

      {publishError && (
        <div
          role="alert"
          style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 12,
            background: '#FFE9EE',
            border: '1px solid #FFB3C0',
            color: '#D82048',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontSize: 13.5,
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Publication impossible</div>
            <div>{publishError}</div>
          </div>
        </div>
      )}

      <div style={{
        textAlign: 'center', marginTop: 20,
        fontSize: 12.5, color: '#A29CB4',
      }}>
        En publiant, ton mur devient accessible via un lien court myKado.
        Tu pourras encore ajuster titres, mots reçus et cagnotte ensuite.
      </div>
    </>
  );
}
