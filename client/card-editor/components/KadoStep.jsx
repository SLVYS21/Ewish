import React from 'react';
import { useCardState } from '../hooks/useCardState';
import { CURRENCIES, findCurrency, formatAmount } from '../data/currencies';
import useFeexPay from '../../utils/useFeexPay';
import NotoEmoji from '../../components/NotoEmoji';
import { LucideCircleSlash, LucideMousePointer2, LucideSparkles } from 'lucide-react';

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
  const { gift, setGift, texts, publishState, publishedPub, payGiftTopUp } = useCardState();
  const { openCheckout, feexpayModal } = useFeexPay();
  const cfg = findCurrency(gift.currency);
  const canEnable = gift.amount >= cfg.min;
  const recipient = (texts.subtitle || 'Ton proche').trim() || 'Ton proche';

  const setField = (patch) => setGift(g => ({ ...g, ...patch }));

  /* Top-up : la carte est déjà publiée mais le gift a été augmenté depuis le
     dernier paiement (paidGiftFcfa). On facture le delta via FeexPay sans
     re-facturer le socle 1500 (le serveur renvoie priceFCFA = owedGiftFcfa). */
  const paidGiftFcfa = Number(publishedPub?.paidGiftFcfa) || 0;
  const currentXof   = (gift.enabled && gift.currency === 'XOF') ? Math.floor(Number(gift.amount) || 0) : 0;
  const owedFcfa     = Math.max(0, currentXof - paidGiftFcfa);
  const showTopUp    = publishState === 'published' && owedFcfa > 0;
  const [topUpBusy, setTopUpBusy] = React.useState(false);

  const startTopUp = async () => {
    if (topUpBusy) return;
    setTopUpBusy(true);
    try {
      const first = await payGiftTopUp();
      if (first?.ok) return; // rien à payer (edge case)
      if (first?.paymentRequired && first?.priceFCFA) {
        openCheckout({
          amount:      first.priceFCFA,
          description: `myKado — Complément cadeau ${formatAmount(currentXof, 'XOF')}`,
          customId:    `envelope-topup:${first.pubId || Date.now()}`,
          onSuccess: async ({ reference }) => {
            await payGiftTopUp({ feexpayReference: reference });
            setTopUpBusy(false);
          },
          onFailure: () => setTopUpBusy(false),
        });
      } else {
        setTopUpBusy(false);
      }
    } catch {
      setTopUpBusy(false);
    }
  };

  return (
    <div className="mk-anim-fade-in ce-kado-step">
      {/* Top-up : gift augmenté après publication. Prompt FeexPay pour le delta. */}
      {showTopUp && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF7DE 0%, #FDE7A5 100%)',
          border: '1.5px solid #C29A3E', borderRadius: 16,
          padding: '14px 16px', marginBottom: 18,
          display: 'flex', flexDirection: 'column', gap: 10,
          boxShadow: '0 6px 20px rgba(184,139,42,.18)',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <LucideSparkles size={20} style={{ color: '#B58A2A', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#5A4318' }}>
                {paidGiftFcfa > 0 ? 'Nouveau montant à provisionner' : 'Cadeau à provisionner'}
              </div>
              <div style={{ fontSize: 12, color: '#7A5C24', marginTop: 3, lineHeight: 1.45 }}>
                Ta carte est déjà en ligne. Pour que {recipient} découvre&nbsp;
                <strong>{formatAmount(currentXof, 'XOF')}</strong>, il faut provisionner&nbsp;
                <strong>{owedFcfa.toLocaleString('fr-FR')} FCFA</strong>
                {paidGiftFcfa > 0 && <> supplémentaire (déjà provisionné&nbsp;: {paidGiftFcfa.toLocaleString('fr-FR')} FCFA)</>}.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={startTopUp}
            disabled={topUpBusy}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 16px', borderRadius: 12,
              background: 'linear-gradient(135deg, #E0B94A 0%, #B58A2A 100%)',
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 800,
              cursor: topUpBusy ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(184,139,42,.4)',
              opacity: topUpBusy ? 0.7 : 1,
            }}
          >
            {topUpBusy
              ? <>Chargement…</>
              : <><LucideSparkles size={16} /> Payer {owedFcfa.toLocaleString('fr-FR')} FCFA maintenant</>}
          </button>
        </div>
      )}

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
      {feexpayModal}
    </div>
  );
}
