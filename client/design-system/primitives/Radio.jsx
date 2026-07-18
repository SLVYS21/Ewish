import React from 'react';

/**
 * Radio — pattern natif + visuel custom
 *
 * <Radio name="visibility" value="public" checked={...} onChange={...}>Public</Radio>
 * <Radio name="visibility" value="private">Privé</Radio>
 */
export const Radio = React.forwardRef(function Radio(
  { name, value, checked, onChange, disabled, children, className = '', ...rest },
  ref
) {
  const classes = ['mk-radio', className].filter(Boolean).join(' ');

  return (
    <label className={classes}>
      <input
        ref={ref}
        type="radio"
        className="mk-radio__native"
        name={name}
        value={value}
        checked={!!checked}
        onChange={(e) => onChange?.(value, e)}
        disabled={disabled}
        {...rest}
      />
      <span className="mk-radio__dot" aria-hidden="true" />
      {children && <span>{children}</span>}
    </label>
  );
});

export function RadioGroup({ name, value, onChange, children, className = '', ...rest }) {
  const cls = ['mk-radio-group', className].filter(Boolean).join(' ');
  return (
    <div
      role="radiogroup"
      className={cls}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mk-space-2)' }}
      {...rest}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              name,
              checked: child.props.value === value,
              onChange,
            })
          : child
      )}
    </div>
  );
}

export default Radio;
