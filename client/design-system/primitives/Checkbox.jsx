import React from 'react';

/**
 * Checkbox — pattern natif + visuel custom
 *
 * <Checkbox checked={x} onChange={setX}>Modérer les messages</Checkbox>
 * <Checkbox indeterminate>Tous les invités</Checkbox>
 */
export const Checkbox = React.forwardRef(function Checkbox(
  { checked, onChange, disabled, indeterminate = false, children, className = '', ...rest },
  ref
) {
  const inputRef = React.useRef(null);
  React.useImperativeHandle(ref, () => inputRef.current);

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const classes = ['mk-checkbox', className].filter(Boolean).join(' ');

  return (
    <label className={classes}>
      <input
        ref={inputRef}
        type="checkbox"
        className="mk-checkbox__native"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked, e)}
        disabled={disabled}
        {...rest}
      />
      <span className="mk-checkbox__box" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      {children && <span>{children}</span>}
    </label>
  );
});

export default Checkbox;
