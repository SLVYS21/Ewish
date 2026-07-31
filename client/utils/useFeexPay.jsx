import { useState, useCallback } from 'react';
import FeexPayModal from '../components/FeexPayModal';

/* ================================================================
   useFeexPay  hook impératif type "openKkiapayWidget".
   ---------------------------------------------------------------
   Usage :
     const { openCheckout, feexpayModal } = useFeexPay();
     <>{feexpayModal}</>
     openCheckout({
       amount: 2500,
       description: 'Mur Premium',
       customId: 'wall_'+pubId,
       onSuccess: ({ reference }) => publishPublication(pubId, { planType, feexpayReference: reference }),
       onFailure: err => console.error(err),
     });
   ---------------------------------------------------------------
   L'appelant DOIT rendre `feexpayModal` quelque part dans son arbre
   (au niveau qu'il veut  l'overlay est fixed/inset:0 donc le
   z-index reste le même partout).
   ================================================================ */

export default function useFeexPay() {
  const [state, setState] = useState(null); // null | { amount, description, customId, onSuccess, onFailure, initEndpoint, initExtraBody }

  const openCheckout = useCallback((opts) => {
    if (!opts?.amount) throw new Error('useFeexPay.openCheckout: amount requis');
    setState({
      amount:        Number(opts.amount),
      description:   opts.description || '',
      customId:      opts.customId || '',
      initEndpoint:  opts.initEndpoint  || '/feexpay/init',
      initExtraBody: opts.initExtraBody || {},
      onSuccess:     opts.onSuccess,
      onFailure:     opts.onFailure,
    });
  }, []);

  const close = useCallback(() => setState(null), []);

  const feexpayModal = state ? (
    <FeexPayModal
      amount={state.amount}
      description={state.description}
      customId={state.customId}
      initEndpoint={state.initEndpoint}
      initExtraBody={state.initExtraBody}
      onClose={close}
      onSuccess={(res) => {
        try { state.onSuccess?.(res); } finally { close(); }
      }}
      onFailure={(err) => {
        state.onFailure?.(err);
        /* on ne ferme pas automatiquement en cas d'échec  le user peut retenter */
      }}
    />
  ) : null;

  return { openCheckout, close, feexpayModal, isOpen: !!state };
}
