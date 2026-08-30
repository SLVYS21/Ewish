import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPublicationBySlug } from '../../utils/api';
import { CardStateProvider, useCardState } from '../hooks/useCardState';
import UnboxingView from './UnboxingView';
import '../card-editor.css';

/*
 * Public read-only page for a shared myenvelope card.
 *   URL:  /c/:slug
 *
 * Loads the publication from the backend, hydrates the card state, and
 * renders the UnboxingView so the recipient can click the wax seal and
 * discover the card themselves.
 */

function Hydrator({ pub, children }) {
  const state = useCardState();

  useEffect(() => {
    if (!pub) return;

    /* Lecture des nouveaux champs plats (envelopeXxx). Fallback sur
       pub.data.* pour les enveloppes pré-migration. */
    const d = pub.data || {};
    const t = pub.envelopeTheme || {};
    const tx = pub.envelopeTexts || {};
    const g = pub.envelopeGift;

    const occ = pub.envelopeOccasion || d.occasionId;
    if (occ) state.changeOccasion(occ);

    const themeId = t.id || d.themeId;
    if (themeId) state.changeTheme(themeId);

    const color = t.color || d.envelopeColor;
    if (color) state.setEnvelopeColor(color);

    const texture = t.texture || d.envelopeTexture;
    if (texture) state.setEnvelopeTexture(texture);

    const liner = t.liner || d.linerChoice;
    if (liner) state.setLinerChoice(liner);

    const conf = pub.envelopeConfetti || d.confettiStyle;
    if (conf) state.setConfettiStyle(conf);

    const bg = pub.envelopeUnboxingBg || d.unboxingBg;
    if (bg) state.setUnboxingBg(bg);

    const hasNewTexts = tx && (tx.title || tx.recipient || tx.message);
    if (hasNewTexts) {
      state.setTexts(prev => ({
        ...prev,
        title:        tx.title        || prev.title,
        subtitle:     tx.recipient    || prev.subtitle,
        photoCaption: tx.photoCaption || prev.photoCaption,
        message:      tx.message      || prev.message,
        signature:    tx.signature    || prev.signature,
        backNote:     tx.backNote     || prev.backNote,
      }));
    } else if (d.texts) {
      state.setTexts(prev => ({ ...prev, ...d.texts }));
    }

    const photoUrl = pub.envelopePhoto || d.photo;
    if (photoUrl) state.setPhoto(photoUrl);

    if (g && (g.enabled || g.amount)) {
      state.setGift({
        enabled:  !!g.enabled,
        amount:   Number(g.amount) || 0,
        currency: g.currency || 'XOF',
        message:  g.message || '',
      });
    } else if (d.gift) {
      state.setGift(d.gift);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pub]);

  return children;
}

export default function CardPublicView() {
  const { slug } = useParams();
  const [pub, setPub]         = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublicPublicationBySlug(slug)
      .then(data => { if (!cancelled) setPub(data); })
      .catch(err => {
        if (cancelled) return;
        const msg = err?.response?.data?.error || 'Cette carte est introuvable ou a été retirée.';
        setError(msg);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="ce-public-loading">
        <div className="ce-spinner" />
      </div>
    );
  }

  if (error || !pub) {
    return (
      <div className="ce-public-error">
        <h1>Carte introuvable</h1>
        <p>{error || 'Ce lien ne correspond à aucune carte.'}</p>
        <a href="/" className="ce-btn ce-btn-primary">Retour à l'accueil</a>
      </div>
    );
  }

  return (
    <CardStateProvider>
      <Hydrator pub={pub}>
        <div className="ce-unboxing-overlay ce-unboxing-overlay-standalone">
          <UnboxingView publicMode />
        </div>
      </Hydrator>
    </CardStateProvider>
  );
}
