import { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

/* Preview fullscreen d'un template — iframe qui prend tout le viewport,
   close X flottant en haut à droite, CTA primaire flottant en bas au centre.
   Remplace les preview minuscules en drawer/modal (wall-sheet, etc.).

   Props :
   - src           : URL de l'iframe (ex. `${API_URL}/preview/wall-of-wishes`)
   - title         : titre affiché en haut (chip) + attribut iframe
   - onClose       : ferme la preview (clic X ou Escape)
   - primaryAction : { label, onClick } — CTA principal en bas (optionnel) */
export default function TemplatePreviewFullscreen({
  src,
  title,
  onClose,
  primaryAction,
}) {
  /* Escape ferme la preview + body scroll lock pendant qu'elle est ouverte. */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Aperçu de ${title}` : 'Aperçu'}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: '#000000',
      }}
    >
      {/* Iframe pleine surface */}
      <iframe
        src={src}
        title={title || 'Aperçu du template'}
        allow="autoplay"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          border: 'none', background: '#FFFFFF',
        }}
      />

      {/* Chip titre en haut à gauche */}
      {title && (
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
          {title}
        </div>
      )}

      {/* Close X en haut à droite */}
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
          transition: 'transform .15s ease, background .15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF3F5'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
      >
        <X size={20} />
      </button>

      {/* CTA primaire flottant en bas */}
      {primaryAction && (
        <div
          style={{
            position: 'absolute',
            bottom: 'max(24px, env(safe-area-inset-bottom))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            pointerEvents: 'none', // seul le bouton est cliquable
          }}
        >
          <button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.loading}
            style={{
              pointerEvents: 'auto',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 26px',
              borderRadius: 999,
              border: 'none',
              background: primaryAction.loading ? '#B83C51' : '#FF5470',
              color: '#FFFFFF',
              fontFamily: 'var(--mk-body, "Plus Jakarta Sans", system-ui, sans-serif)',
              fontSize: 15, fontWeight: 700,
              cursor: primaryAction.loading ? 'wait' : 'pointer',
              boxShadow: '0 12px 32px -8px rgba(255,84,112,.5)',
              transition: 'transform .15s ease, background .15s ease',
              opacity: primaryAction.loading ? .9 : 1,
            }}
            onMouseEnter={(e) => {
              if (primaryAction.loading) return;
              e.currentTarget.style.background = '#D6465E';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              if (primaryAction.loading) return;
              e.currentTarget.style.background = '#FF5470';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {primaryAction.loading ? (
              <>
                <span style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,.35)',
                  borderTopColor: '#FFFFFF',
                  animation: 'mk-spin .8s linear infinite',
                }} />
                <span>Un instant…</span>
                <style>{`@keyframes mk-spin { to { transform: rotate(360deg); } }`}</style>
              </>
            ) : (
              <>
                <span>{primaryAction.label}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
