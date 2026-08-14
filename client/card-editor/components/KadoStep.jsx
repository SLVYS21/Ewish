import React from 'react';
import { useCardState } from '../hooks/useCardState';
import { CURRENCIES, findCurrency, formatAmount } from '../data/currencies';
import NotoEmoji from '../../components/NotoEmoji';
import { LucideCircleSlash, LucideMousePointer2 } from 'lucide-react';

/*
 * Step 4 — Kado
 * Attach money that the recipient reveals by scratching a golden card.
 * Optional : if enabled=false the whole gift block is skipped.
 *
 * UX intent: make the moment tangible so people actually want to give.
 * Hero + live scratch preview + labelled presets do most of the emotional work.
 */

// Preset semantics — same index across currencies, since presets share meaning.
const PRESET_LABELS = ['Symbolique', 'Sympathique', 'Généreux', 'Grand jour', 'Wow'];

export default function KadoStep() {
  const { gift, setGift, texts } = useCardState();
  const cfg = findCurrency(gift.currency);
  const canEnable = gift.amount >= cfg.min;
  const recipient = (texts.subtitle || 'Ton proche').trim() || 'Ton proche';

  const setField = (patch) => setGift(g => ({ ...g, ...patch }));

  return (
    <div className="mk-anim-fade-in ce-kado-step">
      {/* -----  Hero  ----------------------------------------------------- */}
      <div className="ce-kado-hero">
        <div className="ce-kado-hero-orb" aria-hidden="true">
          <span className="ce-kado-hero-halo" />
          <NotoEmoji name="wrapped-gift" size={56} />
        </div>
        <h2 className="ce-kado-hero-title">Ajoute une surprise</h2>
        <p className="ce-kado-hero-sub">
          Un montant caché sous une carte à gratter dorée. Le petit geste qui rend
          une carte inoubliable.
        </p>
      </div>

      {/* -----  Choice  --------------------------------------------------- */}
      <div className="ce-kado-choice">
        <button
          type="button"
          className={`ce-kado-choice-card muted ${!gift.enabled ? 'selected' : ''}`}
          onClick={() => setField({ enabled: false })}
        >
          <span className="ce-kado-choice-icon muted-icon">
            <LucideCircleSlash size={18} />
          </span>
          <div className="ce-kado-choice-body">
            <div className="ce-kado-choice-title">Sans cadeau</div>
            <div className="ce-kado-choice-sub">Juste la carte</div>
          </div>
        </button>

        <button
          type="button"
          className={`ce-kado-choice-card sparkle ${gift.enabled ? 'selected' : ''}`}
          onClick={() => setField({ enabled: true })}
        >
          <span className="ce-kado-choice-badge">Recommandé</span>
          <span className="ce-kado-choice-icon sparkle-icon">
            <NotoEmoji name="wrapped-gift" size={24} />
          </span>
          <div className="ce-kado-choice-body">
            <div className="ce-kado-choice-title">Avec surprise</div>
            <div className="ce-kado-choice-sub">Argent à gratter</div>
          </div>
        </button>
      </div>

      {/* -----  Body (enabled)  ------------------------------------------ */}
      {gift.enabled && (
        <div className="ce-kado-body">
          {/* Live scratch card preview */}
          <div
            className={`ce-scratch-preview ${canEnable ? 'is-valid' : ''}`}
            aria-hidden="true"
          >
            <div className="ce-scratch-card">
              <div className="ce-scratch-stripes" />
              <div className="ce-scratch-shine" />
              <div className="ce-scratch-hint">
                <LucideMousePointer2 size={12} />
                <span>À gratter</span>
              </div>
              {canEnable && (
                <div className="ce-scratch-reveal-strip">
                  {formatAmount(gift.amount, gift.currency)}
                </div>
              )}
            </div>
            <div className="ce-scratch-caption">
              <NotoEmoji name="sparkles" size={14} />
              <span>
                <strong>{recipient}</strong> découvrira cette carte dorée
              </span>
            </div>
          </div>

          {/* Currency */}
          <div className="ce-kado-field">
            <label className="ce-kado-field-label">Devise</label>
            <div className="ce-currency-chips">
              {CURRENCIES.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setField({ currency: c.key })}
                  className={`ce-currency-chip ${gift.currency === c.key ? 'active' : ''}`}
                >
                  <span className="ce-currency-symbol">{c.symbol}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="ce-kado-field">
            <label className="ce-kado-field-label">Montant</label>
            <div className="ce-amount-hero">
              <input
                type="number"
                className="ce-amount-input"
                value={gift.amount || ''}
                onChange={e => setField({ amount: Number(e.target.value) || 0 })}
                step={cfg.step}
                min={0}
                max={cfg.max}
                placeholder="0"
              />
              <span className="ce-amount-symbol">{cfg.symbol}</span>
            </div>
            <div className="ce-amount-presets">
              {cfg.presets.map((p, i) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setField({ amount: p })}
                  className={`ce-amount-preset ${gift.amount === p ? 'selected' : ''}`}
                >
                  <span className="ce-amount-preset-value">
                    {formatAmount(p, gift.currency)}
                  </span>
                  <span className="ce-amount-preset-label">{PRESET_LABELS[i]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Petit mot */}
          <div className="ce-kado-field">
            <label className="ce-kado-field-label">
              <span>Petit mot</span>
              <span className="ce-form-hint">Optionnel — sous la carte à gratter</span>
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

          {/* Success confirmation */}
          {canEnable && (
            <div className="ce-kado-success">
              <div className="ce-kado-success-orb">
                <NotoEmoji name="sparkles" size={22} />
              </div>
              <div className="ce-kado-success-body">
                <div className="ce-kado-success-title">Ton cadeau est prêt</div>
                <div className="ce-kado-success-sub">
                  {recipient} va gratter cette carte pour découvrir{' '}
                  <strong>{formatAmount(gift.amount, gift.currency)}</strong>.
                </div>
              </div>
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
