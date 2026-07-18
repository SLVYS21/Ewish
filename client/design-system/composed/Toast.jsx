import React from 'react';
import ReactDOM from 'react-dom';
import { Icon } from '../Icon.jsx';

/**
 * Toast system — provider + useToast hook.
 *
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * // Anywhere:
 * const { toast } = useToast();
 * toast.success({ title: 'Carte envoyée', message: 'Bravo !' });
 * toast.error({ title: 'Erreur', message: 'Réessaie plus tard' });
 */

const ToastContext = React.createContext(null);

const VARIANT_ICONS = {
  default: 'Bell',
  success: 'CheckCircle2',
  warning: 'AlertTriangle',
  error:   'AlertCircle',
  info:    'Info',
};

export function ToastProvider({ children, defaultDuration = 4000 }) {
  const [toasts, setToasts] = React.useState([]);

  const dismiss = React.useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback(
    (t) => {
      const id = t.id ?? Math.random().toString(36).slice(2);
      const duration = t.duration ?? defaultDuration;
      setToasts((cur) => [...cur, { ...t, id }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [defaultDuration, dismiss]
  );

  const api = React.useMemo(
    () => ({
      toast: {
        show:    (t) => push({ variant: 'default', ...t }),
        success: (t) => push({ variant: 'success', ...t }),
        warning: (t) => push({ variant: 'warning', ...t }),
        error:   (t) => push({ variant: 'error',   ...t }),
        info:    (t) => push({ variant: 'info',    ...t }),
        dismiss,
      },
    }),
    [push, dismiss]
  );

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {portalTarget &&
        ReactDOM.createPortal(
          <div className="mk-toast-container" aria-live="polite" aria-atomic="true">
            {toasts.map((t) => (
              <div key={t.id} className={`mk-toast mk-toast--${t.variant || 'default'}`} role="status">
                <div className="mk-toast__icon">
                  <Icon name={VARIANT_ICONS[t.variant || 'default']} size="md" />
                </div>
                <div className="mk-toast__content">
                  {t.title && <div className="mk-toast__title">{t.title}</div>}
                  {t.message && <div className="mk-toast__message">{t.message}</div>}
                </div>
                <button
                  type="button"
                  className="mk-toast__close"
                  onClick={() => dismiss(t.id)}
                  aria-label="Fermer"
                >
                  <Icon name="X" size="sm" />
                </button>
              </div>
            ))}
          </div>,
          portalTarget
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast() must be used inside <ToastProvider>');
  return ctx;
}

export default ToastProvider;
