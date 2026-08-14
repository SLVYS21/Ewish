import React, { useEffect, useRef, useState } from 'react';
import { useCardState } from '../hooks/useCardState';
import { OCCASIONS } from '../data/occasions';
import NotoEmoji from '../../components/NotoEmoji';
import { LucideChevronDown, LucideCheck, LucideUser } from 'lucide-react';

export default function OccasionSelector() {
  const { occasionId, changeOccasion, occasion, texts, setRecipient, focusPreview } = useCardState();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="mk-anim-fade-in">
      <h2 className="ce-section-title">Pour quelle occasion ?</h2>
      <p className="ce-section-desc">Choisissez le contexte et à qui vous adressez la carte.</p>

      {/* -----  Occasion dropdown  ----------------------------------------- */}
      <div className="ce-field-group">
        <label className="ce-form-label"><span>Occasion</span></label>
        <div className="ce-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className={`ce-dropdown-trigger ${open ? 'open' : ''}`}
            onClick={() => { setOpen(o => !o); focusPreview('cover'); }}
          >
            <span className="ce-dropdown-icon ce-dropdown-icon-noto">
              <NotoEmoji name={occasion.icon} size={24} />
            </span>
            <span className="ce-dropdown-value">{occasion.label}</span>
            <LucideChevronDown
              size={18}
              style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', color: 'var(--mk-ink-3)' }}
            />
          </button>

          {open && (
            <div className="ce-dropdown-menu">
              {OCCASIONS.map(o => {
                const selected = o.id === occasionId;
                return (
                  <button
                    key={o.id}
                    type="button"
                    className={`ce-dropdown-item ${selected ? 'selected' : ''}`}
                    onClick={() => { changeOccasion(o.id); setOpen(false); }}
                  >
                    <span className="ce-dropdown-item-icon ce-dropdown-item-icon-noto">
                      <NotoEmoji name={o.icon} size={20} />
                    </span>
                    <span style={{ flex: 1 }}>{o.label}</span>
                    {selected && <LucideCheck size={16} style={{ color: 'var(--ce-step-color-strong)' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* -----  Recipient name  -------------------------------------------- */}
      <div className="ce-field-group">
        <label className="ce-form-label">
          <span>Pour qui ?</span>
          <span className="ce-form-hint">Prénom affiché sur la couverture</span>
        </label>
        <div className="ce-input-with-icon">
          <LucideUser size={16} />
          <input
            className="mk-input"
            type="text"
            value={texts.subtitle}
            onChange={(e) => setRecipient(e.target.value)}
            onFocus={() => focusPreview('cover')}
            placeholder="Sarah"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
