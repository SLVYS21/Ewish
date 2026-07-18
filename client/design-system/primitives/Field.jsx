import React from 'react';
import { Icon } from '../Icon.jsx';

/**
 * Field wrapper — utilisé autour d'Input / Textarea / Select
 * Gère label + hint + error de manière cohérente
 *
 * <Field label="Nom du destinataire" hint="Comme il apparaîtra sur la carte">
 *   <Input value={x} onChange={...} />
 * </Field>
 *
 * <Field label="Email" error="Adresse invalide">
 *   <Input type="email" />
 * </Field>
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  className = '',
  ...rest
}) {
  const classes = ['mk-field', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {label && (
        <label className="mk-field__label" htmlFor={htmlFor}>
          {label}
          {required && <span style={{ color: 'var(--mk-state-error)' }}> *</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="mk-field__error" role="alert">
          <Icon name="AlertCircle" size="xs" />
          {error}
        </div>
      )}
      {!error && hint && <div className="mk-field__hint">{hint}</div>}
    </div>
  );
}

export const Input = React.forwardRef(function Input(
  { error, className = '', type = 'text', ...rest },
  ref
) {
  const classes = ['mk-input', error && 'mk-input--error', className]
    .filter(Boolean)
    .join(' ');
  return <input ref={ref} type={type} className={classes} {...rest} />;
});

export const Textarea = React.forwardRef(function Textarea(
  { error, className = '', rows = 4, ...rest },
  ref
) {
  const classes = ['mk-textarea', error && 'mk-textarea--error', className]
    .filter(Boolean)
    .join(' ');
  return <textarea ref={ref} rows={rows} className={classes} {...rest} />;
});

export const Select = React.forwardRef(function Select(
  { error, className = '', children, ...rest },
  ref
) {
  const classes = ['mk-select', error && 'mk-select--error', className]
    .filter(Boolean)
    .join(' ');
  return (
    <select ref={ref} className={classes} {...rest}>
      {children}
    </select>
  );
});

export default Field;
