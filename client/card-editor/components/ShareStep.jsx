import React, { useEffect, useState } from 'react';
import { useCardState } from '../hooks/useCardState';
import { ShareView, buildShareUrl } from '../../pages/SharePage';
import { getShortLink } from '../../utils/api';
import { formatAmount, findCurrency } from '../data/currencies';
import useFeexPay from '../../utils/useFeexPay';
import NotoEmoji from '../../components/NotoEmoji';
import {
  LucideSparkles, LucideRotateCcw, LucideGift, LucideEye, LucidePlay,
} from 'lucide-react';

/*
 * Step 5 — Aperçu et Partage.
 * - Big "voir le rendu final" hero to preview the unboxing before commit
 * - Publish button opens the FeexPay checkout for (1500 FCFA + gift amount)
 * - Once published, reuses the shared ShareView (QR + social buttons)
 */

import { useAuth } from '../../admin/context/AuthContext';

const CARD_PUBLISH_FEE_FCFA = 1500;

export default function ShareStep({ onOpenUnboxing }) {
  const { user } = useAuth();
  const {
    texts, occasion, gift,
    publishState, publishedPub, publishError,
    publishCard, resetPublish,
  } = useCardState();

  const [shortCode, setShortCode] = useState('');
  const { openCheckout, feexpayModal } = useFeexPay();

  // Resolve a shortCode once published (for the "code court" section of ShareView).
  useEffect(() => {
    if (!publishedPub?._id) { setShortCode(''); return; }
    getShortLink(publishedPub._id)
      .then(res => setShortCode(res.data?.shortCode || ''))
      .catch(() => setShortCode(publishedPub.shortCode || ''));
  }, [publishedPub]);

  const shareUrl = buildShareUrl({ pub: publishedPub, shortCode, isWall: false });

  const idle       = publishState === 'idle';
  const publishing = publishState === 'publishing';
  const published  = publishState === 'published';
  const errored    = publishState === 'error';

  // Total price to display + charge : 1500 base + gift (XOF only, other currencies
  // stay symbolic — see server side publication.js).
  const giftCfg = findCurrency(gift.currency);
  const giftIncluded = gift.enabled && gift.currency === 'XOF' && gift.amount >= (giftCfg?.min || 0);
  const giftFcfa = giftIncluded ? Math.floor(Number(gift.amount)) : 0;
  const totalFcfa = CARD_PUBLISH_FEE_FCFA + giftFcfa;

  const startPublish = async () => {
    /* Try publishing first — if the server has already been paid (isPaid) it
       skips the payment gate and we're done immediately. Otherwise we get a
       PAYMENT_REQUIRED code and open FeexPay with the returned priceFCFA. */
    const first = await publishCard();
    if (first?.ok) return;

    if (first?.paymentRequired && first?.priceFCFA) {
      const finalize = async ({ reference }) => {
        resetPublish();
        await publishCard({ feexpayReference: reference });
      };
      openCheckout({
        amount:      first.priceFCFA,
        description: giftIncluded
          ? `myKado — Carte + cadeau ${formatAmount(gift.amount, gift.currency)}`
          : 'myKado — Publication de carte',
        customId:    first.pubId ? `envelope:${first.pubId}` : `envelope_${Date.now()}`,
        onSuccess:   finalize,
        onFailure:   (err) => {
          // eslint-disable-next-line no-console
          console.warn('[card-editor] FeexPay failed:', err?.message || err);
        },
      });
    }
  };

  return (
    <div className="mk-anim-fade-in">
      <h2 className="ce-section-title">Aperçu et partage</h2>
      <p className="ce-section-desc">
        Prévisualisez le rendu que verra le destinataire, puis publiez votre carte.
      </p>

      {/* ---- Big "voir le rendu final" hero — always visible on this step ---- */}
      <button
        type="button"
        className="ce-preview-hero"
        onClick={onOpenUnboxing}
      >
        <div className="ce-preview-hero-thumb" aria-hidden="true">
          <NotoEmoji name="wrapped-gift" size={36} />
          <span className="ce-preview-hero-play"><LucidePlay size={14} fill="currentColor" /></span>
        </div>
        <div className="ce-preview-hero-body">
          <div className="ce-preview-hero-eyebrow">Prévisualiser</div>
          <div className="ce-preview-hero-title">
            {published ? 'Rejouer le rendu final' : 'Voir le rendu final'}
          </div>
          <div className="ce-preview-hero-sub">
            Enveloppe qui s'ouvre, confettis, carte animée{gift.enabled ? ' + cadeau à gratter' : ''}
          </div>
        </div>
        <LucideEye size={20} className="ce-preview-hero-icon" />
      </button>

      {/* ---- Summary ---- */}
      <div className="ce-final-summary">
        <div className="ce-final-row"><span>Occasion</span><strong>{occasion.label}</strong></div>
        <div className="ce-final-row"><span>Destinataire</span><strong>{texts.subtitle || '—'}</strong></div>
        {gift.enabled && gift.amount > 0 && (
          <div className="ce-final-row">
            <span><LucideGift size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Cadeau</span>
            <strong>{formatAmount(gift.amount, gift.currency)}</strong>
          </div>
        )}
      </div>

      {idle && (
        <>
          {/* Price breakdown before publish */}
          {!user?.canBypassPaywall && (
            <div className="ce-price-card">
              <div className="ce-price-row">
                <span>Publication de la carte</span>
                <span>{CARD_PUBLISH_FEE_FCFA.toLocaleString('fr-FR')} FCFA</span>
              </div>
              {giftIncluded && (
                <div className="ce-price-row">
                  <span>Cadeau à gratter</span>
                  <span>{giftFcfa.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div className="ce-price-row ce-price-total">
                <span>Total</span>
                <strong>{totalFcfa.toLocaleString('fr-FR')} FCFA</strong>
              </div>
              {gift.enabled && !giftIncluded && (
                <div className="ce-price-hint">
                  Paiement en FCFA — les cadeaux en {gift.currency} restent symboliques pour l'instant.
                </div>
              )}
            </div>
          )}

          <button className="ce-cta" onClick={startPublish}>
            <LucideSparkles size={18} />
            {user?.canBypassPaywall && !giftIncluded
              ? 'Publier gratuitement (Testeur)'
              : `Payer ${(user?.canBypassPaywall ? giftFcfa : totalFcfa).toLocaleString('fr-FR')} FCFA & publier`}
          </button>
        </>
      )}

      {publishing && (
        <div className="ce-publish-loading" style={{ padding: '40px 0' }}>
          <div className="ce-spinner" />
          <div style={{ fontSize: 13, color: 'var(--mk-ink-2)', marginTop: 12 }}>
            Publication en cours…
          </div>
        </div>
      )}

      {errored && (
        <div className="ce-share-error">
          <div className="ce-share-error-title">Échec de la publication</div>
          <div className="ce-share-error-msg">{publishError || 'Réessayez.'}</div>
          <button
            className="ce-btn ce-btn-primary ce-final-secondary"
            onClick={() => { resetPublish(); startPublish(); }}
          >
            <LucideRotateCcw size={16} /> Réessayer
          </button>
        </div>
      )}

      {published && publishedPub && (
        <div className="ce-share-view-wrap">
          <ShareView
            pub={publishedPub}
            shortCode={shortCode}
            setShortCode={setShortCode}
            shareUrl={shareUrl}
            isWall={false}
          />
        </div>
      )}

      {feexpayModal}
    </div>
  );
}
