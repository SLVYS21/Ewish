import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder, checkPromo, trackEvent } from '../utils/api';
import s from './OrderModal.module.css';

const TEMPLATE_LABELS = {
  birthday:          'Birthday Wish',
  special:           'Vœu Spécial',
  'collective-family':'Collectif Famille',
  'collective-pro':  'Collectif Pro',
};
const TEMPLATE_PRICES = { birthday: 5000, special: 6000, 'collective-family': 8000, 'collective-pro': 10000 };

function fmtPrice(p) { return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'; }

export default function OrderModal({ templateName, onClose }) {
  const [form, setForm]           = useState({
    firstName: '', phone: '', occasion: ''
  });
  const [submitting, setSubmitting]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    return form.firstName && form.phone && form.occasion;
  };

  const submit = async () => {
    setSubmitting(true); setError('');
    try {
      await createOrder({
        templateName,
        senderName: form.firstName,
        senderPhone: form.phone,
        occasion: form.occasion,
      });
      // Track purchase (Initiated since no payment yet)
      trackEvent('Lead', { content_name: TEMPLATE_LABELS[templateName] });
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: TEMPLATE_LABELS[templateName] });
      setDone(true);
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={s.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={s.modal}
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button className={s.close} onClick={onClose}>✕</button>

          {done ? (
            <div className={s.success}>
              <motion.div className={s.successIcon} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}>🎉</motion.div>
              <h3>Commande reçue !</h3>
              <p>Nous vous contacterons dans les prochaines heures pour finaliser votre vœu. Vérifiez votre boîte email.</p>
              <button className={s.btnClose} onClick={onClose}>Fermer</button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className={s.head}>
                <h3 className={s.title}>Passer commande</h3>
                <p style={{fontSize: '0.8rem', color: 'var(--muted)', marginTop: '8px'}}>Remplissez ce formulaire et nous vous recontacterons par WhatsApp pour finaliser.</p>
              </div>

              {/* Fields */}
              <div className={s.body}>
                <div className={s.fields}>
                  <Field label="Votre Nom *" value={form.firstName} onChange={v => set('firstName', v)} placeholder="Ex: Kofi" />
                  <Field label="Numéro WhatsApp *" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="Ex: +229 97..." />
                  <Field label="Évènement *" value={form.occasion} onChange={v => set('occasion', v)} placeholder="Ex: Anniversaire de ma mère, Départ en retraite..." />
                </div>
                {error && <p className={s.errorMsg}>{error}</p>}
              </div>

              {/* Footer nav */}
              <div className={s.foot}>
                <button className={s.btnSubmit} onClick={submit} disabled={submitting || !canNext()}>{submitting ? 'Envoi…' : 'Envoyer la demande'}</button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className={s.fieldGroup}>
      <label className={s.label}>{label}</label>
      <input className={s.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}