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
          borderRadius: 28,
          background: 'linear-gradient(160deg, var(--mk-honey-50, #FEF9EF) 0%, var(--mk-honey-100, #FEF7EC) 100%)',
          border: '1px solid var(--mk-border-warm-strong, rgba(32, 21, 36, 0.14))',
          boxShadow: 'var(--mk-shadow-honey, 0 8px 24px rgba(233, 162, 59, 0.24))',
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
            background: 'var(--mk-plum-800, #201524)',
            color: 'var(--mk-honey-300, #F8BE68)',
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
            background: 'radial-gradient(circle at 30% 30%, var(--mk-honey-200, #FCE5B3) 0%, var(--mk-honey-400, #F0AC4C) 70%, var(--mk-honey-700, #9B6316) 100%)',
            boxShadow: 'var(--mk-shadow-honey, 0 8px 24px rgba(233, 162, 59, 0.24))',
          }}
        >
          <NotoEmoji name="wrapped-gift" size={44} />
        </div>

        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--mk-font-display, Epilogue)',
            fontSize: 22,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: 'var(--mk-plum-800, #201524)',
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
            color: 'var(--mk-plum-500, #58413D)',
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
            background: 'rgba(253, 251, 247, 0.75)',
            border: '1px solid var(--mk-border-warm, rgba(32, 21, 36, 0.08))',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--mk-plum-800, #201524)',
          }}
        >
          <LucideSparkles size={14} />
          Ta carte reste 100&nbsp;% envoyable sans cadeau
        </div>
      </div>
    </div>
  );
}
