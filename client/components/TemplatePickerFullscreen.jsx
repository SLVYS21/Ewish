import { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

/* Preview fullscreen avec navigation swipe/prev/next entre templates d'une
   même catégorie (wish, wall, invitation). Remplace le click-direct vers
   /create : l'utilisateur voit d'abord ce qu'il choisit, peut swiper pour
   comparer, puis lance la modale d'infos via le CTA.

   Props :
   - templates    : Template[] — liste dans laquelle naviguer
   - initialIndex : number     — template ouvert par défaut
   - onClose      : ()         — ferme le picker (clic X, Escape, swipe vers le bas ?)
   - onPick       : (tpl)      — CTA "Créer avec ce template" → sélectionne */
export default function TemplatePickerFullscreen({
  templates,
  initialIndex = 0,
  onClose,
  onPick,
}) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const current = templates[index];
  const hasPrev = index > 0;
  const hasNext = index < templates.length - 1;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft' && index > 0) setIndex((i) => i - 1);
      if (e.key === 'ArrowRight' && index < templates.length - 1) setIndex((i) => i + 1);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, templates.length, onClose]);

  const goto = (delta) => {
    const next = index + delta;
    if (next < 0 || next >= templates.length) return;
    setIndex(next);
  };

  /* Swipe horizontal mobile : déclenche prev/next si dx > 60px et dominant sur dy. */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && hasNext) setIndex((i) => i + 1);
      if (dx > 0 && hasPrev) setIndex((i) => i - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!current) return null;

  const API_URL = import.meta.env.VITE_API_URL || '';
  const src = `${API_URL}/preview/${current.name}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.label ? `Aperçu de ${current.label}` : 'Aperçu'}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: '#000000',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Iframe — key = name pour forcer le re-render à chaque changement */}
      <iframe
        key={current.name}
        src={src}
        title={current.label || current.name}
        allow="autoplay"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          border: 'none', background: '#FFFFFF',
        }}
      />

      {/* Chip titre haut gauche */}
      <div
        style={{
          position: 'absolute',
          top: 'max(16px, env(safe-area-inset-top))',
          left: 'max(16px, env(safe-area-inset-left))',
          zIndex: 2,
          display: 'inline-flex', alignItems: 'center',
          padding: '8px 14px',
          background: '#FFFFFF',
          borderRadius: 999,
          boxShadow: '0 8px 24px -8px rgba(0,0,0,.25)',
          fontFamily: 'var(--mk-body, "Plus Jakarta Sans", system-ui, sans-serif)',
          fontSize: 13, fontWeight: 700,
          color: '#2B2440',
          maxWidth: 'calc(100vw - 100px)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}
      >
        {current.label || current.name}
        {templates.length > 1 && (
          <span style={{ marginLeft: 8, opacity: .5, fontWeight: 500 }}>
            {index + 1}/{templates.length}
          </span>
        )}
      </div>

      {/* Close X haut droit */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer l'aperçu"
        style={{
          position: 'absolute',
          top: 'max(12px, env(safe-area-inset-top))',
          right: 'max(12px, env(safe-area-inset-right))',
          zIndex: 2,
          width: 44, height: 44,
          borderRadius: '50%',
          border: 'none',
          background: '#FFFFFF',
          color: '#2B2440',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px -8px rgba(0,0,0,.25)',
        }}
      >
        <X size={20} />
      </button>

      {/* Navigation prev/next — desktop uniquement (cachés < 768px via style) */}
      {hasPrev && (
        <button
          type="button"
          onClick={() => goto(-1)}
          aria-label="Template précédent"
          className="mk-picker-nav"
          style={{
            position: 'absolute',
            left: 'max(20px, env(safe-area-inset-left))',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            width: 48, height: 48,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.95)',
            color: '#2B2440',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px -8px rgba(0,0,0,.25)',
          }}
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={() => goto(1)}
          aria-label="Template suivant"
          className="mk-picker-nav"
          style={{
            position: 'absolute',
            right: 'max(20px, env(safe-area-inset-right))',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            width: 48, height: 48,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.95)',
            color: '#2B2440',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px -8px rgba(0,0,0,.25)',
          }}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Dots indicator — mobile surtout, indice de position dans la liste */}
      {templates.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(max(24px, env(safe-area-inset-bottom)) + 80px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: 'flex', gap: 6,
            padding: '6px 12px',
            background: 'rgba(0,0,0,0.35)',
            borderRadius: 999,
            backdropFilter: 'blur(8px)',
          }}
        >
          {templates.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === index ? 20 : 6,
                height: 6,
                borderRadius: 999,
                background: i === index ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                transition: 'width 0.25s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* CTA Créer avec ce template */}
      <div
        style={{
          position: 'absolute',
          bottom: 'max(24px, env(safe-area-inset-bottom))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <button
          type="button"
          onClick={() => onPick?.(current)}
          style={{
            pointerEvents: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 26px',
            borderRadius: 999,
            border: 'none',
            background: '#FF5470',
            color: '#FFFFFF',
            fontFamily: 'var(--mk-body, "Plus Jakarta Sans", system-ui, sans-serif)',
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 12px 32px -8px rgba(255,84,112,.5)',
            transition: 'transform .15s ease, background .15s ease',
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
          <span>Créer avec ce template</span>
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Boutons prev/next cachés sur mobile — on utilise le swipe à la place */}
      <style>{`
        @media (max-width: 768px) {
          .mk-picker-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
