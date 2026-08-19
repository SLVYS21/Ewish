import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import NotoEmoji from './NotoEmoji';
import QuickAuthModal from './QuickAuthModal';
import { OCCASIONS, OCC_BY_ID } from '../create-flow/occasions';
import { createFlowTypeFor, isEnvelopeTemplate } from '../create-flow/syntheticTemplates';
import { saveContext, clearContext } from '../create-flow/context';
import { createPublication } from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';

/* Modale d'infos post-preview : collecte occasion + destinataire + titre,
   puis crée la publication et navigue vers l'éditeur adéquat selon le type
   du template. Remplace la redirection vers /create pour les entrées via
   le picker de templates.

   Comportement par type :
   - wish/invitation → createPublication → /ewish-admin/ewish/edit/:id
   - wall            → createPublication (ou draft offline si !user) → /ewish-admin/wall/:id
   - envelope        → saveContext + /card-editor (hydratation via loadContext)
   - invitation      → variante titre-seul (pas d'occasion/destinataire)

   Auth : QuickAuthModal si non-connecté et type != wall. */
export default function TemplateInfoModal({ template, open, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isInvitation = template?.kind === 'invitation';
  const type = template ? createFlowTypeFor(template.name) : 'wish';
  const isEnvelope = template ? isEnvelopeTemplate(template.name) : false;

  const [occasionId, setOccasionId] = useState('anniversary');
  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [titleDirty, setTitleDirty] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const inputRef = useRef(null);

  const occasion = OCC_BY_ID[occasionId];

  /* Reset à chaque ouverture — évite de garder les valeurs d'un template
     précédent (surtout après un swipe dans le picker). */
  useEffect(() => {
    if (!open) return;
    setError('');
    setLoading(false);
    setOccasionId('anniversary');
    setRecipient('');
    setTitle('');
    setTitleDirty(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [open, template?.name]);

  /* Auto-suggestion du titre depuis occasion + destinataire (sauf si édité manuellement). */
  useEffect(() => {
    if (isInvitation || titleDirty) return;
    if (occasion && recipient.trim()) {
      setTitle(occasion.titleFor(recipient.trim()));
    } else {
      setTitle('');
    }
  }, [occasion, recipient, titleDirty, isInvitation]);

  /* Escape + body scroll lock pendant que la modale est ouverte. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !template) return null;

  const doCreate = async (freshUser = user) => {
    let payloadTitle;
    let payloadData;

    if (isInvitation) {
      payloadTitle = title.trim();
      if (!payloadTitle) { setError('Donne un nom à cette création'); return; }
      payloadData = {
        titleName: payloadTitle,
        subtitle: template.defaultData?.subtitle || '',
      };
    } else {
      const rec = recipient.trim();
      if (!occasion) { setError('Choisis une occasion.'); return; }
      if (!rec) { setError('Indique le prénom du destinataire.'); return; }
      payloadTitle = (title.trim() || occasion.titleFor(rec)).trim();
      if (type === 'wall') {
        payloadData = {
          eyebrow: `✦ ${occasion.label}`,
          titleName: rec,
          subtitle: `Un mot pour ${rec}.`,
          occasion: occasion.id,
          occasionLabel: occasion.label,
          recipient: rec,
          festive: true,
          wishesEnabled: true,
        };
      } else {
        payloadData = {
          titleName: rec,
          occasion: occasion.id,
          occasionLabel: occasion.label,
          recipient: rec,
        };
      }
    }

    /* Envelope : pas de createPublication ici — on passe le contexte via
       saveContext, l'éditeur de carte le lit à l'hydratation. */
    if (isEnvelope || type === 'envelope') {
      saveContext({
        type: 'envelope',
        occasion: occasion?.id,
        recipient: recipient.trim(),
        title: payloadTitle,
      });
      navigate('/card-editor');
      return;
    }

    /* Wall offline draft : si pas connecté, on sauve un draft en localStorage
       et on route vers /ewish-admin/wall/draft pour éditer sans compte. */
    if (!freshUser && type === 'wall') {
      const draft = {
        templateName: template.name,
        customName: `wall-${Date.now()}`,
        title: payloadTitle,
        data: payloadData,
        style: {},
        decorations: [],
        widgets: [],
        cagnotteConfig: null,
      };
      localStorage.setItem('ewish_wall_draft', JSON.stringify(draft));
      navigate('/ewish-admin/wall/draft');
      return;
    }

    /* Wish/invitation non-connecté : on demande l'auth avant createPublication. */
    if (!freshUser && type !== 'wall') {
      setAuthOpen(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const slugPrefix = type === 'wall' ? 'wall' : isInvitation ? 'invit' : 'wish';
      const res = await createPublication({
        templateName: template.name,
        customName: `${slugPrefix}-${Date.now()}`,
        title: payloadTitle,
        data: payloadData,
      });
      clearContext();
      const dest = type === 'wall'
        ? `/ewish-admin/wall/${res.data._id}`
        : `/ewish-admin/ewish/edit/${res.data._id}`;
      navigate(dest);
    } catch (err) {
      setError(err?.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthed = (freshUser) => {
    setAuthOpen(false);
    doCreate(freshUser);
  };

  return (
    <>
      <div
        className="modal-veil"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      >
        <div className="mk-modal" style={isInvitation ? {} : { width: 520 }}>
          <div className="mk-modal-head">
            <div>
              <div className="mk-modal-title">
                {isInvitation ? 'Pour qui ?' : 'Pour qui et quelle occasion ?'}
              </div>
              <div className="mk-modal-sub">
                {isInvitation
                  ? 'Pour la retrouver facilement dans tes créations.'
                  : 'On génère le titre à partir de ces infos.'}
              </div>
            </div>
            <button className="btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="mk-modal-body">
            {isInvitation ? (
              <div className="field">
                <label className="field-label">Titre</label>
                <input
                  ref={inputRef}
                  className="mk-input"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(''); setTitleDirty(true); }}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && doCreate()}
                  placeholder="ex : Anniversaire de Sarah, Pot de départ Marc…"
                />
              </div>
            ) : (
              <>
                <div className="field">
                  <label className="field-label">L'occasion</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {OCCASIONS.map((occ) => (
                      <button
                        key={occ.id}
                        type="button"
                        className={`pill${occ.id === occasionId ? ' on' : ''}`}
                        onClick={() => { setOccasionId(occ.id); setError(''); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <NotoEmoji name={occ.noto} size={16} />
                        {occ.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Pour qui ?</label>
                  <div className="field-hint" style={{ marginBottom: 4 }}>
                    Prénom du destinataire — apparaît dans le titre.
                  </div>
                  <input
                    ref={inputRef}
                    className="mk-input"
                    value={recipient}
                    onChange={(e) => { setRecipient(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && doCreate()}
                    placeholder="Sarah, Léa & Karim, l'équipe RH…"
                  />
                </div>

                <div className="field">
                  <label className="field-label">
                    Titre <span className="field-hint" style={{ fontWeight: 400 }}>(pré-rempli, éditable)</span>
                  </label>
                  <input
                    className="mk-input"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setTitleDirty(true); }}
                    placeholder="Ex : Joyeux anniversaire, Sarah"
                  />
                </div>
              </>
            )}

            {error && <div className="field-error">{error}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
              <button className="btn btn-primary" onClick={() => doCreate()} disabled={loading}>
                {loading ? 'Création…' : <>Ouvrir l'éditeur <ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuickAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={handleAuthed}
        title="Un compte pour continuer"
        subtitle="Inscription en 15 secondes — on ouvre l'éditeur juste après."
      />
    </>
  );
}
