import React, { useEffect, useState } from 'react';
import { useCardState } from '../hooks/useCardState';
import { ShareView, buildShareUrl } from '../../pages/SharePage';
import { getShortLink } from '../../utils/api';
import { formatAmount } from '../data/currencies';
import {
  LucideSparkles, LucideRotateCcw, LucideGift, LucideEye,
} from 'lucide-react';

/*
 * Step 5 — Aperçu et Partage.
 * Reuses the ShareView component from pages/SharePage.jsx to match the visual
 * language of the wall / other card editors (same QR renderer, same social
 * network buttons, same personalized-message flow).
 */
export default function ShareStep({ onOpenUnboxing }) {
  const {
    texts, occasion, gift,
    publishState, publishedPub, publishError,
    publishCard, resetPublish,
  } = useCardState();

  const [shortCode, setShortCode] = useState('');

  // Once published, try to resolve a shortCode (it powers the "code court"
  // section of ShareView). If it fails (e.g. anon user without auth), we
  // just leave it empty — ShareView still works.
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

  return (
    <div className="mk-anim-fade-in">
      <h2 className="ce-section-title">Aperçu et partage</h2>
      <p className="ce-section-desc">
        Feuilletez la preview à droite pour vérifier chaque page, puis publiez votre carte.
      </p>

      {/* Summary — always visible so users can double-check before publishing */}
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
          <button className="ce-cta" onClick={publishCard}>
            <LucideSparkles size={18} />
            Publier ma carte
          </button>
          <button className="ce-btn ce-btn-ghost ce-final-secondary" onClick={onOpenUnboxing}>
            <LucideEye size={16} />
            Voir le rendu final
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
            onClick={() => { resetPublish(); publishCard(); }}
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
          <button className="ce-btn ce-btn-ghost ce-final-secondary" onClick={onOpenUnboxing}>
            <LucideEye size={16} />
            Rejouer le rendu final
          </button>
        </div>
      )}
    </div>
  );
}
