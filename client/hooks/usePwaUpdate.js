import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/* Délai avant auto-force du reload si l'utilisateur ignore le toast.
   24h = compromis entre "ne pas casser une session active" et "éviter
   qu'un utilisateur reste sur une version obsolète des semaines". */
const AUTO_FORCE_DELAY_MS = 24 * 60 * 60 * 1000;

/* Ré-check périodique côté client : le SW ne détecte une nouvelle version
   que si l'utilisateur navigue. Sur une PWA installée qui reste ouverte,
   sans ce polling, on manquerait des updates. 1h = raisonnable. */
const SW_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function usePwaUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      /* Polling actif : demande au navigateur de re-fetch le SW toutes
         les heures pour détecter les nouvelles versions même sans reload. */
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => { /* ignore network errors */ });
        }, SW_UPDATE_CHECK_INTERVAL_MS);
      }
    },
    onRegisterError(err) {
      console.warn('[pwa] SW registration failed', err);
    },
  });

  /* Auto-force après 24h : si l'utilisateur laisse le toast sans y toucher,
     on force le reload au prochain moment "safe" (onglet inactif). */
  const forceTimerRef = useRef(null);
  useEffect(() => {
    if (!needRefresh) {
      clearTimeout(forceTimerRef.current);
      return;
    }
    forceTimerRef.current = setTimeout(() => {
      /* Ne pas interrompre si l'utilisateur est en train de saisir : on
         attend qu'il quitte l'onglet (visibilitychange = hidden). */
      if (document.visibilityState === 'hidden') {
        updateServiceWorker(true);
      } else {
        const onHide = () => {
          if (document.visibilityState === 'hidden') {
            document.removeEventListener('visibilitychange', onHide);
            updateServiceWorker(true);
          }
        };
        document.addEventListener('visibilitychange', onHide);
      }
    }, AUTO_FORCE_DELAY_MS);
    return () => clearTimeout(forceTimerRef.current);
  }, [needRefresh, updateServiceWorker]);

  return {
    needRefresh,
    dismiss: () => setNeedRefresh(false),
    update: () => updateServiceWorker(true),
  };
}
