import { Joyride, STATUS } from 'react-joyride';

/* Tour react-joyride pour l'éditeur de carte enveloppe (route /card-editor).
   3 étapes ciblant les nouveautés UX : stepbar (progression), toggle preview
   (nouveau), carrousel horizontal des styles.

   Précondition côté parent : setCurrentStep(2) AVANT de passer run=true, pour
   que .ce-theme-list soit rendue dans le DOM. */
export default function OnboardingTourCardEditor({ run, onClose }) {
  /* On ne monte le composant Joyride que quand run=true (voir OnboardingTour). */
  if (!run) return null;

  const steps = [
    {
      target: '.ce-steps-bar',
      content:
        'Ton parcours en 5 étapes : Occasion → Style → Contenu → Kado → Partage. Tu peux revenir sur une étape déjà validée à tout moment.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.ce-preview-toggle',
      content:
        "Ce bouton cache ou affiche l'aperçu de ta carte. Fermé par défaut pour laisser la place aux options, ouvert automatiquement à l'étape Style.",
      placement: 'bottom',
    },
    {
      target: '.ce-theme-list',
      content:
        "Fais défiler horizontalement pour découvrir tous les styles. L'aperçu se met à jour en direct — clique sur celui qui te plaît.",
      placement: 'bottom',
    },
  ];

  const handleCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      onClose?.();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleCallback}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer',
      }}
      styles={{
        options: {
          primaryColor: '#E5A620',
          textColor: '#2B2440',
          backgroundColor: '#FFFFFF',
          arrowColor: '#FFFFFF',
          overlayColor: 'rgba(20, 14, 40, 0.55)',
          zIndex: 1400,
        },
      }}
    />
  );
}
