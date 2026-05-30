import { useEffect } from 'react';
import { X } from 'lucide-react';
import s from './MSheet.module.css';

export default function MSheet({ open, onClose, children, title }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.sheet} onClick={e => e.stopPropagation()}>
        <div className={s.handle} />
        {title && (
          <div className={s.header}>
            <span className={s.title}>{title}</span>
            <button className={s.closeBtn} onClick={onClose}><X size={18}/></button>
          </div>
        )}
        <div className={s.body}>{children}</div>
      </div>
    </div>
  );
}
