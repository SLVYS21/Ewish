import { useEffect, useRef, useState } from 'react';
import { prepareFedapayCheckout } from '../utils/api';
import { FEDAPAY_CHECKOUT_JS_URL, getFedapayProduct } from '../data/fedapay';

/* ================================================================
   FedapayWidget — Checkout.js embedded, widget-created transaction.
   ---------------------------------------------------------------
   Flow (aligné sur la doc officielle fedapay-reactjs) :
     1. Au mount → POST /api/fedapay/prepare { product|amount, pubId }
        → { publicKey, transaction: { amount, description, custom_metadata },
            currency, callback_url }.
     2. Charge le script https://cdn.fedapay.com/checkout.js
        (une seule fois pour tout le document, hoisted sur window.FedaPay).
     3. FedaPay.init({ public_key, transaction, currency, callback_url,
        container, onComplete }) → le widget crée la Transaction lui-même
        avec la clé publique et collecte les infos customer (email/phone)
        dans son propre formulaire.
     4. onComplete avec CHECKOUT_COMPLETED → onPurchaseComplete(transactionId).

   Pourquoi pas de pré-création serveur : FedaPay refuse tout Customer
   avec un email déjà pris ("email n'est pas disponible"). Le widget
   gère cette collecte lui-même en réutilisant automatiquement le
   Customer existant côté FedaPay.

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

export default function FedapayWidget({
  product,          // 'card' | 'wall_simple' | 'wall_premium' — catalogue produit fixe
  amount,           // number — montant custom (override product)
  description,      // string — description libre (obligatoire si amount fourni)
  purpose,          // string — étiquette custom_metadata pour l'audit (ex: 'card_gift')
  pubId,
  onPurchaseComplete,
  onError,
}) {
  const useCustom  = typeof amount === 'number' && amount > 0;
  const productMeta = useCustom ? null : getFedapayProduct(product);
  const containerKey = useCustom ? `custom-${amount}` : product;
  const containerId  = `fedapay-embed-${pubId || 'default'}-${containerKey}`;
  const notifiedRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState({ status: 'loading', error: null });

  useEffect(() => {
    if (!useCustom && !productMeta) {
      setState({ status: 'error', error: `Produit inconnu : ${product}` });
      return;
    }
    if (!pubId) {
      setState({ status: 'error', error: 'pubId requis' });
      return;
    }

    let cancelled = false;
    notifiedRef.current = false;
    setState({ status: 'loading', error: null });

    (async () => {
      try {
        /* 1. Récupérer la config validée serveur (publicKey + transaction
              + custom_metadata avec pubId) — pas de Transaction.create. */
        const payload = useCustom
          ? { amount, description, purpose: purpose || 'custom', pubId }
          : { product, pubId };
        const { data } = await prepareFedapayCheckout(payload);
        if (cancelled) return;

        const { publicKey, transaction, currency, customer } = data;
        if (!publicKey || !transaction?.amount) {
          throw new Error('Réponse serveur invalide (publicKey/transaction manquant)');
        }

        /* 2. Charger Checkout.js. */
        const FedaPay = await loadCheckoutScript();
        if (cancelled) return;

        /* 3. Init embedded — le widget crée la Transaction avec la clé
              publique et collecte les infos customer dans son formulaire.
              Options alignées sur l'exemple officiel fedapay-reactjs :
                { public_key, transaction, currency, customer, container, onComplete }
              L'option `customer` (facultative) pré-remplit les champs
              email/phone/nom sans créer de Customer côté FedaPay. */
        const initOptions = {
          public_key: publicKey,
          transaction,          // { amount, description, custom_metadata }
          currency,             // { iso: 'XOF' }
          container: `#${containerId}`,
          onComplete: (reason, tx) => {
            if (notifiedRef.current) return;
            if (reason === FedaPay.CHECKOUT_COMPLETED) {
              notifiedRef.current = true;
              try { onPurchaseComplete?.(tx?.id); }
              catch (err) { onError?.(err); }
            }
            /* DIALOG_DISMISSED — on ne fait rien, l'user peut retenter. */
          },
        };
        if (customer) initOptions.customer = customer;
        FedaPay.init(initOptions);

        setState({ status: 'ready', error: null });
      } catch (err) {
        if (cancelled) return;
        const msg = err?.response?.data?.error || err?.message || 'Impossible de préparer le paiement';
        setState({ status: 'error', error: msg });
        onError?.(err);
      }
    })();

    return () => {
      cancelled = true;
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [product, pubId, amount, description, purpose, retryCount]);

  if (!useCustom && !productMeta) return null;

  return (
    <div className="mk-fedapay-host" style={{ width: '100%' }}>
      {/* Force l'iframe injectée par Checkout.js à remplir tout le
          container. Sans ça, Checkout.js applique parfois une hauteur
          fixe interne trop petite (~360px) qui coupe le formulaire. */}
      <style>{`
        .mk-fedapay-host iframe {
          width: 100% !important;
          min-height: 720px !important;
          border: 0 !important;
        }
      `}</style>
      {state.status === 'loading' && (
        <div className="mk-fedapay-loading" style={{ padding: 24, textAlign: 'center', color: 'var(--mk-ink-2, #666)' }}>
          Chargement du paiement…
        </div>
      )}
      {state.status === 'error' && (
        <div className="mk-fedapay-error" style={{ padding: 16, borderRadius: 12, background: '#fee', color: '#a00', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
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
      {/* Container FedaPay — présent dès le mount ET dimensionné avant
          l'init pour que Checkout.js puisse mesurer le container quand
          il monte son iframe. minHeight = 720 pour afficher la page
          complète (choix opérateur MoMo + form) sans scroll interne
          dans l'iframe. */}
      <div
        id={containerId}
        style={{
          minHeight: 720,
          width: '100%',
        }}
      />
    </div>
  );
}
