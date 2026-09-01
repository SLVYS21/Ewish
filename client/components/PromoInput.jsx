import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { validatePromo } from '../utils/api';
import s from './PromoInput.module.css';

/*
 * PromoInput  input contrôlé pour appliquer un code promo à un publish.
 * - baseAmount = frais de publication en FCFA (jamais le cadeau Kado).
 *   Le serveur applique la même règle : le discount ne touche que la base.
 * - onApplied({ code, discount, finalPrice }) : preview validée par /promo/validate.
 * - onCleared() : l'utilisateur retire le code.
 */
export default function PromoInput({ templateName, baseAmount, applied, onApplied, onCleared, disabled }) {
  const [code, setCode]     = useState('');
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState('');

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setBusy(true);
    setError('');
    try {
      const res = await validatePromo(trimmed, templateName, baseAmount);
      const { code: validated, discount, finalPrice } = res.data;
      onApplied({ code: validated, discount, finalPrice });
      setCode('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Code invalide');
    } finally {
      setBusy(false);
    }
  };

  const handleClear = () => {
    onCleared();
    setError('');
  };

  if (applied) {
    return (
      <div className={s.applied}>
        <div className={s.appliedLeft}>
          <Check size={14} className={s.appliedIcon} />
          <span className={s.appliedCode}>{applied.code}</span>
          <span className={s.appliedDiscount}>
            {applied.discount.toLocaleString('fr-FR')} FCFA remisés
          </span>
        </div>
        <button type="button" className={s.appliedRemove} onClick={handleClear} disabled={disabled}>
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={s.wrap}>
      <div className={s.row}>
        <Tag size={14} className={s.tagIcon} />
        <input
          type="text"
          className={s.input}
          placeholder="Code promo"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApply())}
          disabled={disabled || busy}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          type="button"
          className={s.applyBtn}
          onClick={handleApply}
          disabled={disabled || busy || !code.trim()}
        >
          {busy ? <Loader2 size={14} className={s.spin} /> : 'Appliquer'}
        </button>
      </div>
      {error && <div className={s.error}>{error}</div>}
    </div>
  );
}
