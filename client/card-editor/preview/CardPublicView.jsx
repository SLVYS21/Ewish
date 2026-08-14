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
    if (!pub || !pub.data) return;
    const d = pub.data;

    if (d.occasionId)      state.changeOccasion(d.occasionId);
    if (d.themeId)         state.changeTheme(d.themeId);
    if (d.envelopeColor)   state.setEnvelopeColor(d.envelopeColor);
    if (d.envelopeTexture) state.setEnvelopeTexture(d.envelopeTexture);
    if (d.linerChoice)     state.setLinerChoice(d.linerChoice);
    if (d.confettiStyle)   state.setConfettiStyle(d.confettiStyle);
    if (d.unboxingBg)      state.setUnboxingBg(d.unboxingBg);
    if (d.texts)           state.setTexts(prev => ({ ...prev, ...d.texts }));
    if (d.photo)           state.setPhoto(d.photo);
    if (d.gift)            state.setGift(d.gift);
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
