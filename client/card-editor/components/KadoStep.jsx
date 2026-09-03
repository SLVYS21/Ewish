import React, { useEffect } from 'react';
import { useCardState } from '../hooks/useCardState';
import NotoEmoji from '../../components/NotoEmoji';
import { LucideLock, LucideSparkles } from 'lucide-react';

/*
 * Step 4 — Kado (verrouillé)
 * Le module cadeau (carte à gratter dorée) est temporairement désactivé.
 * On force gift.enabled = false pour empêcher toute activation depuis l'UI
 * ou depuis un ancien draft, et on affiche un écran "Bientôt".
 */
export default function KadoStep() {
  const { gift, setGift } = useCardState();

  useEffect(() => {
    if (gift?.enabled) setGift(g => ({ ...g, enabled: false }));
  }, [gift?.enabled, setGift]);

  return (
    <div className="mk-anim-fade-in ce-kado-step">
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 14,
          padding: '32px 22px 30px',
          borderRadius: 20,
          background: 'linear-gradient(160deg, #FFF7DE 0%, #FDE7A5 100%)',
          border: '1.5px solid #E5C97A',
          boxShadow: '0 10px 30px -14px rgba(184,139,42,.35)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 999,
            background: '#161311',
            color: '#FDE7A5',
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}
        >
          <LucideLock size={11} />
          Bientôt
        </span>

        <div
          style={{
            position: 'relative',
            width: 74,
            height: 74,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'radial-gradient(circle at 30% 30%, #FFF6C7 0%, #F2C866 70%, #B58A2A 100%)',
            boxShadow: '0 8px 22px -8px rgba(184,139,42,.55)',
          }}
        >
          <NotoEmoji name="wrapped-gift" size={44} />
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--mk-display)',
            fontSize: 22,
            lineHeight: 1.15,
            color: '#5A4318',
          }}
        >
          Le cadeau à gratter arrive bientôt
        </h2>

        <p
          style={{
            margin: 0,
            maxWidth: 340,
            fontSize: 13.5,
            lineHeight: 1.55,
            color: '#7A5C24',
          }}
        >
          On peaufine la carte à gratter dorée qui cachera un vrai montant
          surprise pour ton proche. Reviens vite&nbsp;— cette petite magie sera
          disponible très prochainement.
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 999,
            background: 'rgba(255,255,255,.7)',
            border: '1px solid rgba(184,139,42,.35)',
            fontSize: 12,
            fontWeight: 700,
            color: '#7A5C24',
          }}
        >
          <LucideSparkles size={14} />
          Ta carte reste 100&nbsp;% envoyable sans cadeau
        </div>
      </div>
    </div>
  );
}
