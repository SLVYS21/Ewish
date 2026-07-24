import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Pencil, RotateCcw } from 'lucide-react';
import MSheet from './MSheet';
import { createPublication } from '../utils/api';
import {
  WALL_EVENTS,
  getEvent,
  getBackground,
  DEFAULT_WALL_TEMPLATE,
  DEFAULT_BACKGROUND_ID,
  DEFAULT_CONFETTI,
} from '../wall-wizard/constants';
import s from './WallCreateSheet.module.css';

export default function WallCreateSheet({ open, onClose, onCreated }) {
  const [eventId, setEventId] = useState('anniversary');
  const [recipient, setRecipient] = useState('');
  /* customTitle : null = laisser le titre auto ; string = l'admin a personnalisé. */
  const [customTitle, setCustomTitle] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setEventId('anniversary');
    setRecipient('');
    setCustomTitle(null);
    setEditingTitle(false);
    setError('');
    setLoading(false);
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, [open]);

  const event = useMemo(() => getEvent(eventId), [eventId]);
  const trimmed = recipient.trim();
  const previewName = trimmed || 'Prénom';
  const autoTitle = event.title(previewName);
  const previewTitle = (customTitle !== null && customTitle.trim()) ? customTitle : autoTitle;
  const previewSubtitle = event.subtitle(trimmed);

  function startEditingTitle() {
    /* On pré-remplit le champ libre avec le titre auto courant, pour que
       l'admin parte d'une base cohérente au lieu d'un champ vide. */
    setCustomTitle(autoTitle);
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 30);
  }

  function resetTitle() {
    setCustomTitle(null);
    setEditingTitle(false);
  }

  async function submit() {
    if (!trimmed) {
      setError('Indique pour qui est ce mur.');
      inputRef.current?.focus();
      return;
    }
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      /* Fond du mur : optionnel à la création. Si DEFAULT_BACKGROUND_ID
         est null, on ne pousse pas les champs wallBackground* pour laisser
         le serveur appliquer les fallbacks (accent palette → bannière). */
      const bg = DEFAULT_BACKGROUND_ID ? getBackground(DEFAULT_BACKGROUND_ID) : null;
      /* Titre affiché en bannière : soit celui saisi par l'admin, soit
         l'auto-généré depuis l'occasion + prénom. */
      const autoTitleFinal = event.title(trimmed);
      const customTrimmed  = (customTitle || '').trim();
      const finalTitle     = customTrimmed || autoTitleFinal;
      const finalSubtitle  = event.subtitle(trimmed);
      const res = await createPublication({
        templateName: DEFAULT_WALL_TEMPLATE,
        customName: `wall-${Date.now()}`,
        title: finalTitle,
        data: {
          /* eyebrow supprimé volontairement — la bannière ne porte plus le nom
             de l'occasion en haut ("Anniversaire", "Mariage"…) pour rester
             sobre et permettre au titre de tenir sur une ligne en desktop. */
          titleName: finalTitle,
          /* recipient = prénom seul (Sarah), distinct du titre complet
             ("Joyeux anniversaire, Sarah"). Utilisé pour tous les endroits
             "personnels" : reveal, thank-you PDF, filename export, crédits
             vidéo, message d'ajout de mot. */
          recipient: trimmed,
          subtitle: finalSubtitle,
          phrase: finalSubtitle,
          occasion: event.id,
          occasionLabel: event.label,
          festive: event.festive,
          wishesEnabled: true,
          bannerTint: event.tint,
          bannerInk: event.bannerInk || '#2B2440',
        },
        style: {
          ...(bg ? {
            wallBackgroundId: DEFAULT_BACKGROUND_ID,
            wallBackground: bg.css,
            wallBackgroundInk: bg.ink,
            wallBackgroundSize: bg.size || 'cover',
          } : {}),
          wallAccent: (bg && bg.accent) || '#FF5470',
          confettiType: event.confettiSuggestion || DEFAULT_CONFETTI,
        },
      });
      onCreated?.(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || 'Impossible de créer ce mur.');
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !loading) submit();
  }

  return (
    <MSheet open={open} onClose={onClose} title="Créer un mur">
      <div className={s.body}>
        <div className={s.intro}>
          Pour qui, et quelle occasion ? On adapte le titre et le ton
          en fonction de l'évènement.
        </div>

        {/* Occasion */}
        <div className={s.field}>
          <div className={s.label}>L'occasion</div>
          <div className={s.pillsWrap}>
            <div className={s.pills} role="radiogroup" aria-label="Occasion">
              {WALL_EVENTS.map((ev) => {
                const Icon = ev.Icon;
                const active = ev.id === eventId;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`${s.pill} ${active ? s.pillOn : ''}`}
                    style={active ? {
                      background: ev.accent,
                      borderColor: ev.accent,
                      color: '#fff',
                    } : undefined}
                    onClick={() => { setEventId(ev.id); setError(''); }}
                  >
                    <Icon size={14} />
                    <span>{ev.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recipient */}
        <div className={s.field}>
          <label className={s.label} htmlFor="wall-recipient">Pour qui ce mur ?</label>
          <input
            id="wall-recipient"
            ref={inputRef}
            className={s.input}
            value={recipient}
            maxLength={80}
            placeholder="Sarah, Léa & Karim, l'équipe RH…"
            onChange={(e) => { setRecipient(e.target.value); setError(''); }}
            onKeyDown={onKey}
          />
          <div className={s.hint}>Son prénom (ou surnom) apparaîtra dans le titre du mur.</div>
        </div>

        {/* Titre du mur — édition optionnelle. Fermé par défaut pour ne pas
            alourdir l'UX enfant : le titre auto est le bon défaut, l'admin
            peut le personnaliser via le bouton "Personnaliser le titre". */}
        {editingTitle && (
          <div className={s.field}>
            <div className={s.labelRow}>
              <label className={s.label} htmlFor="wall-title">Titre du mur</label>
              <button
                type="button"
                className={s.linkBtn}
                onClick={resetTitle}
              >
                <RotateCcw size={12} /> Titre auto
              </button>
            </div>
            <input
              id="wall-title"
              ref={titleInputRef}
              className={s.input}
              value={customTitle || ''}
              maxLength={120}
              placeholder={autoTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              onKeyDown={onKey}
            />
            <div className={s.hint}>Affiché en grand sur la bannière du mur.</div>
          </div>
        )}

        {/* Preview — sans eyebrow, titre sur une ligne comme sur la bannière finale */}
        <div
          className={s.preview}
          style={{ background: event.tint }}
          aria-live="polite"
        >
          <div className={s.previewTitle}>{previewTitle}</div>
          <div className={s.previewSubtitle}>{previewSubtitle}</div>
        </div>

        {!editingTitle && (
          <button
            type="button"
            className={s.linkBtn}
            style={{ alignSelf: 'flex-start' }}
            onClick={startEditingTitle}
          >
            <Pencil size={12} /> Personnaliser le titre
          </button>
        )}

        {error && <div className={s.error}>{error}</div>}

        {/* Actions */}
        <div className={s.actions}>
          <button
            type="button"
            className={s.btnGhost}
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="button"
            className={s.btnPrimary}
            onClick={submit}
            disabled={loading || !trimmed}
          >
            {loading ? 'Création…' : (<>Créer le mur <ArrowRight size={15} /></>)}
          </button>
        </div>
      </div>
    </MSheet>
  );
}
