import React from 'react';
import { useCardState } from '../hooks/useCardState';
import { CURRENCIES, findCurrency, formatAmount } from '../data/currencies';
import { LucideGift, LucideSparkles, LucideCheck, LucideBan } from 'lucide-react';

/*
 * Step 4 — Kado
 * Attach money that the recipient reveals by scratching a golden card.
 * Optional : if enabled=false the whole gift block is skipped.
 */
export default function KadoStep() {
  const { gift, setGift } = useCardState();
  const cfg = findCurrency(gift.currency);
  const canEnable = gift.amount >= cfg.min;

  const setField = (patch) => setGift(g => ({ ...g, ...patch }));

  return (
    <div className="mk-anim-fade-in">
      <h2 className="ce-section-title">Joindre un cadeau ?</h2>
      <p className="ce-section-desc">
        Optionnel. Le destinataire découvrira le montant en grattant une carte dorée.
      </p>

      {/* On/Off big cards */}
      <div className="ce-kado-toggle">
        <button
          type="button"
          className={`ce-kado-toggle-btn ${!gift.enabled ? 'active' : ''}`}
          onClick={() => setField({ enabled: false })}
        >
          <LucideBan size={18} />
          <div>
            <div className="ce-kado-toggle-title">Sans cadeau</div>
            <div className="ce-kado-toggle-sub">Juste la carte</div>
          </div>
        </button>
        <button
          type="button"
          className={`ce-kado-toggle-btn ${gift.enabled ? 'active' : ''}`}
          onClick={() => setField({ enabled: true })}
        >
          <LucideGift size={18} />
          <div>
            <div className="ce-kado-toggle-title">Avec cadeau</div>
            <div className="ce-kado-toggle-sub">Argent surprise</div>
          </div>
        </button>
      </div>

      {gift.enabled && (
        <div className="ce-kado-body">
          <div className="ce-form-group">
            <label className="ce-form-label"><span>Montant</span></label>
            <div className="ce-gift-amount-row">
              <div className="ce-gift-currency-seg">
                {CURRENCIES.map(c => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setField({ currency: c.key })}
                    className={`ce-seg-btn ${gift.currency === c.key ? 'active' : ''}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="ce-gift-amount-input-wrap">
                <input
                  type="number"
                  className="mk-input ce-gift-amount"
                  value={gift.amount || ''}
                  onChange={e => setField({ amount: Number(e.target.value) || 0 })}
                  step={cfg.step}
                  min={0}
                  max={cfg.max}
                  placeholder="0"
                />
                <span className="ce-gift-symbol">{cfg.symbol}</span>
              </div>
            </div>
            <div className="ce-gift-presets">
              {cfg.presets.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setField({ amount: p })}
                  className={`ce-preset-chip ${gift.amount === p ? 'selected' : ''}`}
                >
                  {formatAmount(p, gift.currency)}
                </button>
              ))}
            </div>
          </div>

          <div className="ce-form-group">
            <label className="ce-form-label">
              <span>Petit mot (optionnel)</span>
              <span className="ce-form-hint">Sous la carte à gratter</span>
            </label>
            <textarea
              className="mk-textarea"
              rows={2}
              value={gift.message}
              onChange={e => setField({ message: e.target.value })}
              placeholder="Ex : Pour te faire plaisir"
              maxLength={140}
            />
          </div>

          {canEnable && (
            <div className="ce-gift-preview">
              <LucideSparkles size={14} style={{ color: '#FFC145' }} />
              <span>Cadeau attaché : <strong>{formatAmount(gift.amount, gift.currency)}</strong></span>
              <LucideCheck size={14} style={{ color: 'var(--mk-accent)', marginLeft: 'auto' }} />
            </div>
          )}

          {gift.amount > 0 && !canEnable && (
            <div className="ce-gift-warning">
              Minimum {formatAmount(cfg.min, gift.currency)} pour attacher un cadeau.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
