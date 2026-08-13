import React, { useRef, useCallback } from 'react';
import { useCardState } from '../hooks/useCardState';
import { LucideImagePlus, LucideX, LucideBookOpen, LucideStickyNote, LucideMailOpen } from 'lucide-react';

// Order used for auto-advance on Enter (photo is skipped — it's a button, not an input).
const FIELD_ORDER = ['title', 'photoCaption', 'message', 'signature', 'backNote'];

const Section = ({ icon: Icon, title, children }) => (
  <div className="ce-wizard-section">
    <div className="ce-wizard-section-hd">
      <Icon size={16} />
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="ce-form-group">
    <label className="ce-form-label">
      <span>{label}</span>
      {hint && <span className="ce-form-hint">{hint}</span>}
    </label>
    {children}
  </div>
);

export default function ContentWizard() {
  const { texts, updateText, photo, setPhoto, occasion, focusPreview } = useCardState();
  const refs = useRef({});

  const onPhotoUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => setPhoto(ev.target.result);
    rd.readAsDataURL(f);
  };

  // On focus: sync preview to the corresponding surface + scroll field into center
  const onFieldFocus = useCallback((fieldKey, e) => {
    focusPreview(fieldKey);
    // Wait one tick so any layout shift settles first
    requestAnimationFrame(() => {
      e?.target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [focusPreview]);

  // Enter on a single-line input moves focus to the next field (& scrolls it in).
  const onEnter = (currentKey) => (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    const idx = FIELD_ORDER.indexOf(currentKey);
    if (idx < 0 || idx >= FIELD_ORDER.length - 1) return;
    const nextKey = FIELD_ORDER[idx + 1];
    const nextEl  = refs.current[nextKey];
    if (nextEl) {
      nextEl.focus();
      // scroll handled by nextEl's onFocus
    }
  };

  const registerRef = (key) => (el) => { refs.current[key] = el; };

  return (
    <div className="mk-anim-fade-in">
      <h2 className="ce-section-title">Personnalisez votre carte</h2>
      <p className="ce-section-desc">
        {occasion?.label ? `Pour ${occasion.label.toLowerCase()}. ` : ''}Ajoutez votre texte et une photo souvenir.
      </p>

      <Section icon={LucideStickyNote} title="Couverture (page 1)">
        <Field label="Titre principal" hint="">
          <input
            ref={registerRef('title')}
            className="mk-input"
            type="text"
            value={texts.title}
            onChange={e => updateText('title', e.target.value)}
            onFocus={e => onFieldFocus('title', e)}
            onKeyDown={onEnter('title')}
            placeholder={occasion?.title || 'Joyeux Anniversaire'}
          />
        </Field>
      </Section>

      <Section icon={LucideBookOpen} title="Intérieur — Photo souvenir (page 2)">
        <Field label="Photo">
          <label className="ce-photo-upload" onClick={() => focusPreview('photo')}>
            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={onPhotoUpload} />
            {photo ? (
              <div className="ce-photo-preview">
                <img src={photo} alt="souvenir" className="ce-photo-img" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Photo importée</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Cliquer pour changer</div>
                </div>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPhoto(null); }} className="ce-photo-remove">
                  <LucideX size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LucideImagePlus size={20} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>Uploader une photo</span>
              </div>
            )}
          </label>
        </Field>
        <Field label="Légende (optionnel)">
          <input
            ref={registerRef('photoCaption')}
            className="mk-input"
            type="text"
            value={texts.photoCaption}
            onChange={e => updateText('photoCaption', e.target.value)}
            onFocus={e => onFieldFocus('photoCaption', e)}
            onKeyDown={onEnter('photoCaption')}
            placeholder="Ex : Nos vacances à Marrakech"
          />
        </Field>
      </Section>

      <Section icon={LucideBookOpen} title="Intérieur — Message (page 3)">
        <Field label="Message principal" hint="">
          <textarea
            ref={registerRef('message')}
            className="mk-textarea"
            rows={6}
            value={texts.message}
            onChange={e => updateText('message', e.target.value)}
            onFocus={e => onFieldFocus('message', e)}
            placeholder="Écrivez votre message ici…"
          />
          <div className="ce-char-count">{(texts.message || '').length} caractères</div>
        </Field>
        <Field label="Signature">
          <input
            ref={registerRef('signature')}
            className="mk-input"
            type="text"
            value={texts.signature}
            onChange={e => updateText('signature', e.target.value)}
            onFocus={e => onFieldFocus('signature', e)}
            onKeyDown={onEnter('signature')}
            placeholder="Marc"
          />
        </Field>
      </Section>

      <Section icon={LucideMailOpen} title="Dos (page 4)">
        <Field label="Petit mot final">
          <input
            ref={registerRef('backNote')}
            className="mk-input"
            type="text"
            value={texts.backNote}
            onChange={e => updateText('backNote', e.target.value)}
            onFocus={e => onFieldFocus('backNote', e)}
            onKeyDown={onEnter('backNote')}
            placeholder="Fait avec amour"
          />
        </Field>
      </Section>
    </div>
  );
}
