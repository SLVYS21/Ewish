import React from 'react';
import ReactDOM from 'react-dom';
import { Icon } from '../Icon.jsx';

/**
 * Modal — dialog centered with overlay, ESC + click-outside close, focus trap basic.
 *
 * <Modal open={open} onClose={() => setOpen(false)} title="Créer une carte">
 *   <p className="mk-body">Contenu de la modale…</p>
 *   <Modal.Footer>
 *     <Button variant="ghost" onClick={close}>Annuler</Button>
 *     <Button variant="primary" onClick={submit}>Valider</Button>
 *   </Modal.Footer>
 * </Modal>
 */
export function Modal({
  open,
  onClose,
  title,
  size,               // undefined (md) | sm | lg
  closeOnOverlay = true,
  showClose = true,
  children,
  className = '',
  ...rest
}) {
  const modalRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const modalClass = ['mk-modal', size && `mk-modal--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return ReactDOM.createPortal(
    <div
      className="mk-modal-overlay"
      onClick={closeOnOverlay ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={modalClass}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        {...rest}
      >
        {(title || showClose) && (
          <div className="mk-modal__header">
            {title && <div className="mk-modal__title">{title}</div>}
            {showClose && (
              <button
                type="button"
                className="mk-modal__close"
                onClick={onClose}
                aria-label="Fermer"
              >
                <Icon name="X" size="md" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

Modal.Body = function ModalBody({ className = '', children, ...rest }) {
  return (
    <div className={`mk-modal__body ${className}`} {...rest}>
      {children}
    </div>
  );
};
Modal.Footer = function ModalFooter({ className = '', children, ...rest }) {
  return (
    <div className={`mk-modal__footer ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Modal;
