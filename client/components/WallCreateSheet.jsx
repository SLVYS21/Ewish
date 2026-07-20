import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setEventId('anniversary');
    setRecipient('');
    setError('');
    setLoading(false);
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, [open]);

  const event = useMemo(() => getEvent(eventId), [eventId]);
  const trimmed = recipient.trim();
  const previewName = trimmed || 'Prénom';
  const previewTitle = event.title(previewName);
  const previewSubtitle = event.subtitle(trimmed);

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
      const bg = getBackground(DEFAULT_BACKGROUND_ID);
      const finalTitle = event.title(trimmed);
      const finalSubtitle = event.subtitle(trimmed);
      const res = await createPublication({
        templateName: DEFAULT_WALL_TEMPLATE,
        customName: `wall-${Date.now()}`,
        title: finalTitle,
        data: {
          eyebrow: event.eyebrow,
          titleName: trimmed,
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
          wallBackgroundId: DEFAULT_BACKGROUND_ID,
          wallBackground: bg.css,
          wallBackgroundInk: bg.ink,
          wallBackgroundSize: bg.size || 'cover',
          wallAccent: bg.accent || '#FF5470',
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

        {/* Preview */}
        <div
          className={s.preview}
          style={{ background: event.tint }}
          aria-live="polite"
        >
          <div className={s.previewEyebrow}>
            <Sparkles size={12} />
            {event.eyebrow}
          </div>
          <div className={s.previewTitle}>{previewTitle}</div>
          <div className={s.previewSubtitle}>{previewSubtitle}</div>
        </div>

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
