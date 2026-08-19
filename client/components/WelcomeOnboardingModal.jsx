import { useEffect } from 'react';
import NotoEmoji from './NotoEmoji';

/* Modale d'accueil first-visit : confettis + Noto emoji animé + texte +
   CTA "Commencer la visite" / "Passer". S'affiche au premier affichage du
   Dashboard (ou de l'éditeur) tant que le flag onboarding correspondant
   n'est pas true sur le user. Le parent gère la persistance (PATCH).

   Props :
   - open       : bool
   - title      : string
   - subtitle   : string
   - noto       : nom NotoEmoji ('party-popper', 'sparkles', ...)
   - onStart    : ()   — clic sur "Commencer" (lance react-joyride côté parent)
   - onSkip     : ()   — clic sur "Passer" (PATCH direct côté parent) */
export default function WelcomeOnboardingModal({
  open,
  title = 'Bienvenue sur myKado',
  subtitle = "On te fait un mini-tour rapide pour que tu voies l'essentiel.",
  noto = 'party-popper',
  onStart,
  onSkip,
}) {
  /* Confettis à l'ouverture : side cannons uniques (pas de boucle) pour ne pas
     détourner l'attention pendant que l'utilisateur lit la modale. */
  useEffect(() => {
    if (!open) return;
    const fire = window.confetti;
    if (typeof fire !== 'function') return;
    const colors = ['#FF5470', '#FFC145', '#00C2A8', '#7C5CFF', '#5CC8FF', '#FFFFFF'];
    try {
      fire({ particleCount: 90, angle: 60, spread: 60, startVelocity: 55, gravity: 1.1, ticks: 220, colors, origin: { x: 0, y: 0.85 } });
      fire({ particleCount: 90, angle: 120, spread: 60, startVelocity: 55, gravity: 1.1, ticks: 220, colors, origin: { x: 1, y: 0.85 } });
      setTimeout(() => {
        try {
          fire({ particleCount: 50, angle: 60, spread: 55, startVelocity: 45, gravity: 1.1, ticks: 220, colors, origin: { x: 0, y: 0.85 } });
          fire({ particleCount: 50, angle: 120, spread: 55, startVelocity: 45, gravity: 1.1, ticks: 220, colors, origin: { x: 1, y: 0.85 } });
        } catch {}
      }, 700);
    } catch {}
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onSkip?.(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onSkip]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed', inset: 0, zIndex: 1300,
        background: 'rgba(20, 14, 40, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#FFFFFF',
          borderRadius: 24,
          padding: '32px 28px 24px',
          boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.35)',
          textAlign: 'center',
          animation: 'mk-welcome-pop .35s cubic-bezier(.4, 1.4, .5, 1)',
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <NotoEmoji name={noto} size={72} />
        </div>

        <h2 style={{
          fontFamily: 'var(--mk-display, "Fraunces", serif)',
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1.15,
          color: '#2B2440',
          margin: '0 0 10px',
          letterSpacing: '-.01em',
        }}>
          {title}
        </h2>

        <p style={{
          fontFamily: 'var(--mk-body, "Plus Jakarta Sans", system-ui, sans-serif)',
          fontSize: 15,
          lineHeight: 1.5,
          color: '#5D5675',
          margin: '0 0 24px',
        }}>
          {subtitle}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button"
            onClick={onStart}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 999,
              border: 'none',
              background: '#FF5470',
              color: '#FFFFFF',
              fontFamily: 'var(--mk-body, "Plus Jakarta Sans", system-ui, sans-serif)',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 12px 28px -8px rgba(255, 84, 112, .5)',
              transition: 'transform .15s ease, background .18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#D6465E';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FF5470';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Commencer la visite
          </button>
          <button
            type="button"
            onClick={onSkip}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 999,
              border: 'none',
              background: 'transparent',
              color: '#5D5675',
              fontFamily: 'var(--mk-body, "Plus Jakarta Sans", system-ui, sans-serif)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color .15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#2B2440'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#5D5675'; }}
          >
            Passer
          </button>
        </div>
      </div>

      <style>{`
        @keyframes mk-welcome-pop {
          from { transform: scale(.9); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
