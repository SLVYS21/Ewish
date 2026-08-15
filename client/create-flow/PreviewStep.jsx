import TemplatePreviewFullscreen from '../components/TemplatePreviewFullscreen';
import EnvelopePreviewNative from './EnvelopePreviewNative';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CTA_LABELS = {
  envelope: 'Créer cette enveloppe',
  wall:     'Créer ce mur',
  wish:     'Créer cette carte',
};

/* PreviewStep — dernier écran avant createPublication. Fullscreen preview
   du template pré-rempli + close X + CTA "Créer ce mur/cette carte/…".

   Props :
   - type          : 'envelope' | 'wall' | 'wish'
   - templateName  : nom du template à prévisualiser
                     (wish : birthday/forever/notre-film ; wall : wall-of-wishes[-modern|-craft])
                     inutilisé pour envelope
   - title, recipient, occasion : infos étape 2 (affichées en overlay)
   - onClose       : croix (retour à l'étape précédente)
   - onConfirm     : clic CTA (déclenche createPublication amont)
   - loading       : bool — bouton en état "création en cours" */
export default function PreviewStep({
  type,
  templateName,
  title,
  recipient,
  occasion,
  onClose,
  onConfirm,
  loading,
}) {
  const ctaLabel = CTA_LABELS[type] || 'Continuer';

  /* Iframe preview pour wall + wish : on réutilise les routes serveur
     /preview/{templateName} qui rendent le template avec DEMO_DATA
     (voir server/routes/preview.js). Le user voit à quoi ressemble le
     template ; ses infos perso s'appliqueront à mount dans l'éditeur. */
  if ((type === 'wall' || type === 'wish') && templateName) {
    return (
      <TemplatePreviewFullscreen
        src={`${API_URL}/preview/${templateName}`}
        title={title || (type === 'wall' ? 'Aperçu du mur' : 'Aperçu de la carte')}
        onClose={onClose}
        primaryAction={{ label: ctaLabel, onClick: onConfirm, loading }}
      />
    );
  }

  /* Envelope : pas de route serveur /preview/myenvelope. On monte le vrai
     rendu de l'éditeur (UnboxingView + CardStateProvider hydraté) — le user
     voit exactement ce que l'éditeur produira. */
  if (type === 'envelope') {
    return (
      <EnvelopePreviewNative
        title={title}
        recipient={recipient}
        occasion={occasion}
        onClose={onClose}
        onConfirm={onConfirm}
        loading={loading}
        ctaLabel={ctaLabel}
      />
    );
  }

  return null;
}
