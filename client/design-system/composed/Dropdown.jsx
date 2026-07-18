import React from 'react';
import { Icon } from '../Icon.jsx';

/**
 * Dropdown — simple menu triggered by any element.
 *
 * <Dropdown trigger={<Button variant="ghost" iconOnly icon="MoreHorizontal" />}>
 *   <Dropdown.Item icon="Edit3" onClick={edit}>Éditer</Dropdown.Item>
 *   <Dropdown.Item icon="Share2" onClick={share}>Partager</Dropdown.Item>
 *   <Dropdown.Separator />
 *   <Dropdown.Item icon="Trash2" onClick={remove} danger>Supprimer</Dropdown.Item>
 * </Dropdown>
 */

const DropdownContext = React.createContext(null);

export function Dropdown({ trigger, children, className = '', align = 'right' }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = React.useCallback(() => setOpen(false), []);

  return (
    <DropdownContext.Provider value={{ close }}>
      <div className={`mk-dropdown ${className}`} ref={rootRef}>
        {React.cloneElement(trigger, {
          onClick: (e) => {
            trigger.props.onClick?.(e);
            setOpen((v) => !v);
          },
          'aria-haspopup': 'menu',
          'aria-expanded': open,
        })}
        {open && (
          <div
            role="menu"
            className="mk-dropdown__menu"
            style={align === 'left' ? { left: 0, right: 'auto' } : undefined}
          >
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
}

Dropdown.Item = function DropdownItem({
  icon,
  onClick,
  danger = false,
  children,
  className = '',
  ...rest
}) {
  const ctx = React.useContext(DropdownContext);
  return (
    <button
      role="menuitem"
      type="button"
      className={`mk-dropdown__item ${danger ? 'mk-dropdown__item--danger' : ''} ${className}`}
      onClick={(e) => {
        onClick?.(e);
        ctx?.close();
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size="sm" />}
      {children}
    </button>
  );
};

Dropdown.Separator = function DropdownSeparator() {
  return <div className="mk-dropdown__separator" role="separator" />;
};

export default Dropdown;
