import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

export default function OnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour if the user hasn't seen it yet
    const hasSeenTour = localStorage.getItem('mk_onboarding_completed');
    if (!hasSeenTour) {
      // Small delay to ensure UI has rendered
      const timer = setTimeout(() => setRun(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      target: 'body',
      content: 'Bienvenue sur ton espace myKado ! Laisse-nous te faire visiter les fonctionnalités principales.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#tour-create',
      content: "C'est ici que tout commence ! Tu peux créer une carte animée, ou bien un mur collaboratif à plusieurs mains.",
      placement: 'bottom',
    },
    {
      target: '#tour-recent',
      content: 'Retrouve ici toutes tes créations récentes (brouillons ou en ligne).',
      placement: 'bottom',
    },
    {
      target: '#tour-credits',
      content: 'Certains thèmes premiums nécessitent des crédits. Tu peux consulter ton solde ici.',
      placement: 'left',
    },
    {
      target: '#tour-themes',
      content: "Découvre nos thèmes mis en vedette pour t'inspirer !",
      placement: 'top',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('mk_onboarding_completed', 'true');
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
      callback={handleJoyrideCallback}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer',
      }}
      styles={{
        options: {
          primaryColor: '#E11D48',
          textColor: '#333',
          backgroundColor: '#fff',
          arrowColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
        },
      }}
    />
  );
}
