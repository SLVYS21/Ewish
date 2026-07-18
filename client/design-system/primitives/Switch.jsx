import React from 'react';

/**
 * Switch — toggle on/off
 *
 * <Switch checked={active} onChange={setActive}>Accepter les cadeaux</Switch>
 */
export const Switch = React.forwardRef(function Switch(
  { checked, onChange, disabled, children, className = '', ...rest },
  ref
) {
  const classes = ['mk-switch', className].filter(Boolean).join(' ');

  return (
    <label className={classes}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className="mk-switch__native"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked, e)}
        disabled={disabled}
        {...rest}
      />
      <span className="mk-switch__track">
        <span className="mk-switch__thumb" />
      </span>
      {children && <span>{children}</span>}
    </label>
  );
});

export default Switch;
