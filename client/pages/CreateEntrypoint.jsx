import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TypeSelector from '../create-flow/TypeSelector';
import InfoStep from '../create-flow/InfoStep';
import TemplateStep from '../create-flow/TemplateStep';
import PreviewStep from '../create-flow/PreviewStep';
import { saveContext, loadContext, clearContext } from '../create-flow/context';
import { useAuth } from '../admin/context/AuthContext';
import { createPublication } from '../utils/api';
import QuickAuthModal from '../components/QuickAuthModal';

/* Kado n'est PAS dans VALID_TYPES : la tuile affiche un badge "Bientôt" en
   étape 1 et le clic déclenche un toast au lieu de naviguer. Les URLs
   /create?type=kado tombent donc sur le TypeSelector (safe fallback). */
const VALID_TYPES = new Set(['wish', 'wall', 'envelope']);

const DEFAULT_WALL_TEMPLATE = 'wall-of-wishes';

/* Payload createPublication par type — même contexte, template différent.
   Pour wall, on utilise `ctx.wallTemplate` (pré-sélectionné via Dashboard
   ou TemplatesGallery) sinon le default. */
function buildPublicationPayload(ctx) {
  const base = {
    customName: `draft-${Date.now()}`,
    title: ctx.title,
    data: {
      recipient: ctx.recipient,
      occasion: ctx.occasion,
    },
  };
  if (ctx.type === 'envelope') return { ...base, templateName: 'myenvelope' };
  if (ctx.type === 'wall')     return { ...base, templateName: ctx.wallTemplate || DEFAULT_WALL_TEMPLATE };
  if (ctx.type === 'wish')     return { ...base, templateName: ctx.wishTemplate };
  return null;
}

/* Route de l'éditeur cible par type. */
function editorRouteFor(type, pubId) {
  if (type === 'envelope') return `/card-editor?id=${pubId}`;
  if (type === 'wall')     return `/ewish-admin/wall/${pubId}`;
  if (type === 'wish')     return `/ewish-admin/ewish/edit/${pubId}`;
  return null;
}

export default function CreateEntrypoint() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  const rawType = params.get('type');
  const type = VALID_TYPES.has(rawType) ? rawType : null;
  const step = params.get('step');
  const name = params.get('name') || '';

  const qsName = name ? `&name=${encodeURIComponent(name)}` : '';

  /* Création effective de la pub (tous types) + navigate vers l'éditeur.
     Accepte un `authedUser` explicite pour contourner le state stale de
     useAuth juste après une auth via modale. */
  const createAndNavigate = async (authedUser) => {
    if (creating) return;
    const ctx = loadContext();
    if (!ctx || !VALID_TYPES.has(ctx.type)) {
      navigate('/create', { replace: true });
      return;
    }
    if (ctx.type === 'wish' && !ctx.wishTemplate) {
      navigate(`/create?type=wish&step=template${qsName}`, { replace: true });
      return;
    }
    const payload = buildPublicationPayload(ctx);
    if (!payload) return;

    setCreating(true);
    setCreateError('');
    try {
      const res = await createPublication(payload);
      clearContext();
      navigate(editorRouteFor(ctx.type, res.data._id));
    } catch (err) {
      setCreateError(err?.response?.data?.error || 'Erreur à la création — réessaie.');
    } finally {
      setCreating(false);
    }
  };

  /* Handler du CTA "Créer ce mur/cette carte/cette enveloppe" depuis
     PreviewStep. Séquence stricte : preview → modale de connexion (si !user)
     → éditeur. Si l'utilisateur est déjà connecté (a un compte), on saute
     la modale et on passe directement à l'éditeur.
     `authLoading` (getMe() en cours) : on attend la résolution pour ne pas
     ouvrir la modale à tort au tout début. */
  const handleConfirmPreview = () => {
    if (authLoading) return;
    if (!user) {
      setPendingConfirm(true);
      setAuthModalOpen(true);
      return;
    }
    createAndNavigate(user);
  };

  const handleAuthed = (freshUser) => {
    setAuthModalOpen(false);
    if (pendingConfirm) {
      setPendingConfirm(false);
      createAndNavigate(freshUser);
    }
  };

  /* Étape 1 — sélection du type (aucun ?type= dans l'URL). Le clic sur Kado
     ne navigue pas : on affiche un toast "Bientôt disponible". */
  if (!type) {
    const triggerComingSoon = () => {
      setComingSoon(true);
      setTimeout(() => setComingSoon(false), 2600);
    };
    return (
      <>
        <TypeSelector
          onSelect={(selected) => {
            if (selected === 'kado') {
              triggerComingSoon();
              return;
            }
            navigate(`/create?type=${selected}${qsName}`);
          }}
        />
        {comingSoon && <ComingSoonToast />}
      </>
    );
  }

  /* Étape preview — dernière avant createPublication. Pour envelope/wall
     directement après InfoStep ; pour wish après TemplateStep. */
  if (step === 'preview') {
    const ctx = loadContext();
    const ready = ctx && ctx.type === type
      && ctx.occasion && ctx.recipient
      && (type !== 'wish' || ctx.wishTemplate);
    if (!ready) {
      /* Contexte incomplet : renvoi vers l'étape précédente adéquate. */
      const back = type === 'wish' && ctx?.wishTemplate == null
        ? `/create?type=wish&step=template${qsName}`
        : `/create?type=${type}${qsName}`;
      navigate(back, { replace: true });
      return null;
    }

    /* Le template à prévisualiser : wishTemplate pour wish, wallTemplate
       (ou default) pour wall, N/A pour envelope. */
    const previewTemplateName =
      type === 'wish' ? ctx.wishTemplate :
      type === 'wall' ? (ctx.wallTemplate || DEFAULT_WALL_TEMPLATE) :
      null;

    return (
      <>
        <PreviewStep
          type={type}
          templateName={previewTemplateName}
          title={ctx.title}
          recipient={ctx.recipient}
          occasion={ctx.occasion}
          onClose={() => {
            /* Retour à l'étape précédente selon le type. Si un template a
               été pré-sélectionné pour wish (arrivée depuis une tuile),
               on revient à l'étape 2 plutôt qu'au chooser template. */
            const back = type === 'wish' && !ctx.wishTemplate
              ? `/create?type=wish&step=template${qsName}`
              : `/create?type=${type}${qsName}`;
            navigate(back);
          }}
          onConfirm={handleConfirmPreview}
          loading={creating}
        />
        <QuickAuthModal
          open={authModalOpen}
          onClose={() => {
            setAuthModalOpen(false);
            setPendingConfirm(false);
          }}
          onAuthed={handleAuthed}
          title="Un compte pour préparer ta création"
          subtitle="Inscription en 15 secondes — ta création est sauvegardée automatiquement pendant l'édition."
        />
        {createError && <ErrorToast message={createError} />}
      </>
    );
  }

  /* Étape 3 (wish uniquement) — choix du template. Fin : navigate vers
     l'étape preview (pas de createPublication ici). */
  if (type === 'wish' && step === 'template') {
    const handleWishTemplate = (wishTemplate) => {
      const ctx = loadContext();
      if (!ctx || ctx.type !== 'wish') {
        navigate(`/create?type=wish${qsName}`, { replace: true });
        return;
      }
      saveContext({ ...ctx, wishTemplate });
      navigate(`/create?type=wish&step=preview${qsName}`);
    };

    return (
      <TemplateStep
        onBack={() => navigate(`/create?type=wish${qsName}`)}
        onSelect={handleWishTemplate}
      />
    );
  }

  /* Étape 2 — informations communes (occasion + destinataire + titre).
     On merge avec le contexte existant pour préserver un template
     pré-sélectionné (via clic sur une tuile Dashboard/TemplatesGallery). */
  const handleSubmit = (ctx) => {
    const existing = loadContext() || {};
    const merged = { ...existing, ...ctx };
    saveContext(merged);

    if (merged.type === 'wish') {
      /* Wish : si un template est déjà choisi (arrivée depuis une tuile
         template), on saute TemplateStep et on va direct au preview. */
      if (merged.wishTemplate) {
        navigate(`/create?type=wish&step=preview${qsName}`);
        return;
      }
      navigate(`/create?type=wish&step=template${qsName}`);
      return;
    }
    /* envelope/wall : direct sur l'étape preview. */
    navigate(`/create?type=${merged.type}&step=preview${qsName}`);
  };

  return (
    <InfoStep
      type={type}
      initialName={name}
      onBack={() => navigate('/create')}
      onSubmit={handleSubmit}
    />
  );
}

function ErrorToast({ message }) {
  return (
    <div
      role="alert"
      style={{
        position: 'fixed', bottom: 24, left: '50%',
        transform: 'translateX(-50%)', zIndex: 1400,
        background: '#2B2440', color: '#FFFFFF',
        padding: '12px 18px', borderRadius: 12,
        fontFamily: 'var(--mk-body, sans-serif)',
        fontSize: 14, maxWidth: 420, textAlign: 'center',
        boxShadow: '0 12px 32px -10px rgba(43, 36, 64, .35)',
      }}
    >
      {message}
    </div>
  );
}

/* Toast "Bientôt disponible" — apparaît quand on clique sur la tuile Kado. */
function ComingSoonToast() {
  return (
    <div
      role="status"
      style={{
        position: 'fixed', bottom: 24, left: '50%',
        transform: 'translateX(-50%)', zIndex: 1001,
        background: '#2B2440', color: '#FFFFFF',
        padding: '12px 18px 12px 14px', borderRadius: 999,
        fontFamily: 'var(--mk-body, sans-serif)',
        fontSize: 14, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 10,
        boxShadow: '0 12px 32px -10px rgba(43, 36, 64, .45)',
        animation: 'mk-toast-in .25s ease',
      }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 22, height: 22, borderRadius: '50%',
        background: '#FF5470', color: '#FFFFFF',
        fontSize: 13, fontWeight: 800,
      }}>!</span>
      <span>Bientôt disponible — reste à l'écoute !</span>
      <style>{`@keyframes mk-toast-in {
        from { opacity: 0; transform: translate(-50%, 12px); }
        to   { opacity: 1; transform: translate(-50%, 0); }
      }`}</style>
    </div>
  );
}
