import { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { CardStateProvider, useCardState } from '../card-editor/hooks/useCardState';
import UnboxingView from '../card-editor/preview/UnboxingView';
import '../card-editor/card-editor.css';

/* Preview réelle de l'enveloppe myKado — même rendu que ce que produira
   l'éditeur. On monte un CardStateProvider isolé (indépendant de celui
   éventuellement présent ailleurs) puis on hydrate avec le contexte /create
   (occasion + destinataire + titre) via les setters exposés par useCardState.

   L'utilisateur voit l'enveloppe scellée, peut cliquer le cachet cire pour
   la faire s'ouvrir → carte qui sort → il découvre l'intérieur. Puis clic
   sur le CTA "Créer cette enveloppe" pour matérialiser la publication. */

/* Mapping /create → card-editor. Mêmes IDs que CardEditorLayout.
   Dupliqué ici pour éviter un import cross-package. Si un 3e endroit
   en a besoin, extraire dans create-flow/occasionsMap.js. */
const OCCASION_MAP_FROM_CREATE = {
  anniversary: 'anniversaire',
  wedding:     'mariage',
  birth:       'naissance',
  farewell:    'retraite',
  welcome:     'felicitations',
  thanks:      'merci',
  tribute:     'condoleances',
  other:       'autre',
};

/* Hydrate le CardStateProvider frais avec les infos du contexte /create.
   Runs une seule fois à mount (les setters sont stables). */
function ContextHydrator({ occasion, recipient, title, children }) {
  const { changeOccasion, setRecipient, updateText } = useCardState();

  useEffect(() => {
    const mappedOcc = OCCASION_MAP_FROM_CREATE[occasion];
    if (mappedOcc) changeOccasion(mappedOcc);
    if (recipient) setRecipient(recipient);
    if (title)     updateText('title', title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}

export default function EnvelopePreviewNative({
  title,
  recipient,
  occasion,
  onClose,
  onConfirm,
  loading,
  ctaLabel = 'Créer cette enveloppe',
}) {
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
      aria-label="Aperçu de l'enveloppe"
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: '#FFF3F5',
      }}
    >
      {/* Rendu enveloppe interactif — même chemin de code que /c/:slug */}
      <CardStateProvider>
        <ContextHydrator occasion={occasion} recipient={recipient} title={title}>
          <div className="ce-unboxing-overlay ce-unboxing-overlay-standalone">
            <UnboxingView publicMode />
          </div>
        </ContextHydrator>
      </CardStateProvider>

      {/* Chip titre en haut à gauche */}
      {title && (
        <div style={{
          position: 'absolute',
          top: 'max(16px, env(safe-area-inset-top))',
          left: 'max(16px, env(safe-area-inset-left))',
          zIndex: 5,
          display: 'inline-flex', alignItems: 'center',
          padding: '8px 14px',
          background: '#FFFFFF',
          borderRadius: 999,
          boxShadow: '0 8px 24px -8px rgba(0,0,0,.25)',
          fontFamily: 'var(--mk-body, "Plus Jakarta Sans", system-ui, sans-serif)',
          fontSize: 13, fontWeight: 700, color: '#2B2440',
          maxWidth: 'calc(100vw - 100px)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          pointerEvents: 'none',
        }}>
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
          zIndex: 5,
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: '#FFFFFF', color: '#2B2440',
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

      {/* CTA primaire flottant en bas — même pattern que TemplatePreviewFullscreen */}
      <div style={{
        position: 'absolute',
        bottom: 'max(24px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
      }}>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 26px',
            borderRadius: 999,
            border: 'none',
            background: loading ? '#B83C51' : '#FF5470',
            color: '#FFFFFF',
            fontFamily: 'var(--mk-body, "Plus Jakarta Sans", system-ui, sans-serif)',
            fontSize: 15, fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 12px 32px -8px rgba(255,84,112,.5)',
            transition: 'transform .15s ease, background .15s ease',
            opacity: loading ? .9 : 1,
          }}
          onMouseEnter={(e) => {
            if (loading) return;
            e.currentTarget.style.background = '#D6465E';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            if (loading) return;
            e.currentTarget.style.background = '#FF5470';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {loading ? (
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
              <span>{ctaLabel}</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
