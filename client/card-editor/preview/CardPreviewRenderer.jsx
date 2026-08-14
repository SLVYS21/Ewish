import React, { useEffect, useRef, useState } from 'react';
import { useCardState } from '../hooks/useCardState';
import Envelope from './Envelope';
import CoverPage from './pages/CoverPage';
import InsideLeftPage from './pages/InsideLeftPage';
import InsideRightPage from './pages/InsideRightPage';
import BackPage from './pages/BackPage';
import { findCurrency, formatAmount } from '../data/currencies';
import NotoEmoji from '../../components/NotoEmoji';
import { LucideMailOpen, LucideBookOpen, LucideStickyNote, LucideMail } from 'lucide-react';

// Base sizes at 1x scale
const CARD_W = 400;
const CARD_H = 560;   // 5:7 portrait
const ENV_W  = 560;
const ENV_H  = 400;

const VIEWS = [
  { id: 'envelope', label: 'Enveloppe', icon: LucideMail },
  { id: 'cover',    label: 'Couverture', icon: LucideStickyNote },
  { id: 'inside',   label: 'Intérieur', icon: LucideBookOpen },
  { id: 'back',     label: 'Dos', icon: LucideMailOpen },
];

export default function CardPreviewRenderer() {
  const { theme, texts, photo, currentStep, previewFocus, gift } = useCardState();
  const [view, setView] = useState('cover');
  const [envOpen, setEnvOpen] = useState(false);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const giftCfg = findCurrency(gift?.currency);
  const hasGift = Boolean(gift?.enabled && gift?.amount >= (giftCfg?.min || 0));

  useEffect(() => {
    // On every step change before "Aperçu", reset to the cover view.
    if (currentStep < 4) setView('cover');
    if (currentStep === 1) setEnvOpen(false);
  }, [currentStep]);

  // React to field-driven preview focus (cover/inside/back/envelope).
  useEffect(() => {
    if (!previewFocus) return;
    setView(previewFocus);
  }, [previewFocus]);

  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth - 64;
      const h = el.clientHeight - 64;
      let baseW, baseH;
      if (view === 'envelope')      { baseW = ENV_W;      baseH = ENV_H; }
      else if (view === 'inside')   { baseW = CARD_W * 2 + 8; baseH = CARD_H; }
      else                          { baseW = CARD_W;     baseH = CARD_H; }
      const s = Math.min(w / baseW, h / baseH, 1);
      setScale(s > 0 ? s : 1);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [view]);

  return (
    <div className="ce-preview-inner">
      {/* Persistent gift indicator — shows across all views when a valid gift is attached */}
      {hasGift && (
        <div className="ce-preview-gift-badge" role="status" aria-label="Cadeau attaché">
          <span className="ce-preview-gift-orb" aria-hidden="true">
            <NotoEmoji name="wrapped-gift" size={18} />
          </span>
          <div className="ce-preview-gift-body">
            <span className="ce-preview-gift-eyebrow">Cadeau attaché</span>
            <span className="ce-preview-gift-amount">
              {formatAmount(gift.amount, gift.currency)}
            </span>
          </div>
        </div>
      )}

      <div className="ce-canvas-container" ref={containerRef}>
        <div className="ce-stage" style={{ transform: `scale(${scale})` }}>
          {view === 'envelope' && (
            <div
              className="ce-page-frame"
              style={{ width: ENV_W, height: ENV_H, background: 'transparent', boxShadow: 'none' }}
              onClick={() => setEnvOpen(o => !o)}
              role="button"
            >
              <Envelope theme={theme} open={envOpen} />
              <div className="ce-envelope-hint">
                {envOpen ? 'Cliquer pour refermer' : 'Cliquer pour ouvrir'}
              </div>
            </div>
          )}

          {view === 'cover' && (
            <div className="ce-page-frame" style={{ width: CARD_W, height: CARD_H }}>
              <CoverPage theme={theme} texts={texts} />
            </div>
          )}

          {view === 'inside' && (
            <div className="ce-page-frame ce-spread" style={{ width: CARD_W * 2 + 8, height: CARD_H }}>
              <div style={{ width: CARD_W, height: CARD_H, position: 'relative' }}>
                <InsideLeftPage theme={theme} texts={texts} photo={photo} />
              </div>
              <div className="ce-spread-crease" />
              <div style={{ width: CARD_W, height: CARD_H, position: 'relative' }}>
                <InsideRightPage theme={theme} texts={texts} />
              </div>
            </div>
          )}

          {view === 'back' && (
            <div className="ce-page-frame" style={{ width: CARD_W, height: CARD_H }}>
              <BackPage theme={theme} texts={texts} />
            </div>
          )}
        </div>
      </div>

      <div className="ce-preview-nav">
        {VIEWS.map(v => {
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`ce-nav-btn ${view === v.id ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
