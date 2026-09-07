import { useEffect, useRef, useState } from 'react';
import { prepareFedapayCheckout } from '../utils/api';
import { FEDAPAY_CHECKOUT_JS_URL, getFedapayProduct } from '../data/fedapay';

/* ================================================================
   FedapayWidget — Checkout.js OVERLAY (bouton "Payer X FCFA").
   ---------------------------------------------------------------
   Comportement :
     1. Au mount → POST /api/fedapay/prepare { product|amount, pubId }
        → { publicKey, transaction: { amount, description, custom_metadata },
            currency }.
     2. Charge le script https://cdn.fedapay.com/checkout.js (une seule
        fois pour tout le document, hoisted sur window.FedaPay).
     3. FedaPay.init('#buttonId', { public_key, transaction, currency,
        onComplete }) — Checkout.js s'attache au bouton et ouvre son
        OVERLAY plein écran lorsque l'user clique. Pas d'iframe embarquée
        dans le modal parent.
     4. onComplete/CHECKOUT_COMPLETED → onPurchaseComplete(transactionId).
        DIALOG_DISMISSED → FedaPay referme lui-même son overlay.

   Pourquoi overlay et pas embed :
     - Le mode embed forçait une iframe de 720px dans le footer du modal
       parent → contenu tronqué, footer non scrollable, bouton "Annuler"
       de FedaPay incapable de fermer le modal parent.
     - En overlay, FedaPay gère son propre modal plein écran → scroll,
       fermeture par croix/backdrop, focus trap : tout est natif.

   Props : { product | (amount, description, purpose), pubId,
             onPurchaseComplete(id), onError(err) }
   ================================================================ */

let checkoutScriptPromise = null;
function loadCheckoutScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('window unavailable'));
  if (window.FedaPay) return Promise.resolve(window.FedaPay);
  if (checkoutScriptPromise) return checkoutScriptPromise;

  checkoutScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src^="${FEDAPAY_CHECKOUT_JS_URL.split('?')[0]}"]`);
    if (existing) {
      existing.addEventListener('load',  () => resolve(window.FedaPay));
      existing.addEventListener('error', () => reject(new Error('FedaPay script failed to load')));
      if (window.FedaPay) resolve(window.FedaPay);
      return;
    }
    const s = document.createElement('script');
    s.src   = FEDAPAY_CHECKOUT_JS_URL;
    s.async = true;
    s.onload  = () => resolve(window.FedaPay);
    s.onerror = () => reject(new Error('FedaPay script failed to load'));
    document.head.appendChild(s);
  });
  return checkoutScriptPromise;
}

function formatAmount(n) {
  return Number(n || 0).toLocaleString('fr-FR');
}

export default function FedapayWidget({
  product,          // 'card' | 'wall_simple' | 'wall_premium' — catalogue produit fixe
  amount,           // number — montant custom (override product)
  description,      // string — description libre (obligatoire si amount fourni)
  purpose,          // string — étiquette custom_metadata pour l'audit (ex: 'card_gift')
  pubId,
  onPurchaseComplete,
  onError,
}) {
  const useCustom   = typeof amount === 'number' && amount > 0;
  const productMeta = useCustom ? null : getFedapayProduct(product);
  const buttonKey   = useCustom ? `custom-${amount}` : product;
  const buttonId    = `fedapay-pay-${pubId || 'default'}-${buttonKey}`;

  const notifiedRef  = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState({ status: 'loading', error: null, amount: null });

  useEffect(() => {
    if (!useCustom && !productMeta) {
      setState({ status: 'error', error: `Produit inconnu : ${product}`, amount: null });
      return;
    }
    if (!pubId) {
      setState({ status: 'error', error: 'pubId requis', amount: null });
      return;
    }

    let cancelled = false;
    notifiedRef.current = false;
    setState({ status: 'loading', error: null, amount: null });

    (async () => {
      try {
        /* 1. Récupérer la config validée serveur (publicKey + transaction
              + custom_metadata avec pubId). */
        const payload = useCustom
          ? { amount, description, purpose: purpose || 'custom', pubId }
          : { product, pubId };
        const { data } = await prepareFedapayCheckout(payload);
        if (cancelled) return;

        const { publicKey, transaction, currency } = data;
        if (!publicKey || !transaction?.amount) {
          throw new Error('Réponse serveur invalide (publicKey/transaction manquant)');
        }

        /* 2. Charger Checkout.js. */
        const FedaPay = await loadCheckoutScript();
        if (cancelled) return;

        /* 3. Init overlay — Checkout.js s'attache au bouton via son ID
              et ouvre son overlay plein écran au clic. Pas de `container`
              → pas d'iframe embarquée. */
        FedaPay.init(`#${buttonId}`, {
          public_key: publicKey,
          transaction,          // { amount, description, custom_metadata }
          currency,             // { iso: 'XOF' }
          onComplete: (reason, tx) => {
            if (notifiedRef.current) return;
            if (reason === FedaPay.CHECKOUT_COMPLETED) {
              notifiedRef.current = true;
              try { onPurchaseComplete?.(tx?.id); }
              catch (err) { onError?.(err); }
            }
            /* DIALOG_DISMISSED — FedaPay referme son overlay tout seul,
               on ne fait rien côté modal parent. */
          },
        });

        setState({ status: 'ready', error: null, amount: transaction.amount });
      } catch (err) {
        if (cancelled) return;
        const msg = err?.response?.data?.error || err?.message || 'Impossible de préparer le paiement';
        setState({ status: 'error', error: msg, amount: null });
        onError?.(err);
      }
    })();

    return () => {
      cancelled = true;
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [product, pubId, amount, description, purpose, retryCount]);

  if (!useCustom && !productMeta) return null;

  const resolvedAmount = state.amount ?? (useCustom ? amount : productMeta?.amount);
  const ctaText = state.status === 'loading'
    ? 'Préparation du paiement…'
    : `Payer ${formatAmount(resolvedAmount)} FCFA`;

  return (
    <div className="mk-fedapay-host" style={{ width: '100%' }}>
      {state.status === 'error' && (
        <div className="mk-fedapay-error" style={{ padding: 12, borderRadius: 10, background: '#fee', color: '#a00', fontSize: 13, marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span>{state.error}</span>
          <button
            type="button"
            onClick={() => setRetryCount(c => c + 1)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid #c00',
              background: '#fff', color: '#a00', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}
          >
            Réessayer
          </button>
        </div>
      )}
      <button
        id={buttonId}
        type="button"
        disabled={state.status !== 'ready'}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: 10,
          border: 'none',
          background: state.status === 'ready' ? 'var(--mk-accent, #E11D48)' : '#c9c4d6',
          color: '#fff',
          fontSize: 15,
          fontWeight: 700,
          cursor: state.status === 'ready' ? 'pointer' : 'not-allowed',
          transition: 'background .2s, transform .2s',
        }}
      >
        {ctaText}
      </button>
    </div>
  );
}
