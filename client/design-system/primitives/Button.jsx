import React from 'react';
import { Icon } from '../Icon.jsx';

/**
 * myKado Button primitive
 *
 * <Button variant="primary" size="md" onClick={...}>Créer</Button>
 * <Button variant="secondary" iconLeft="ArrowLeft">Retour</Button>
 * <Button variant="primary" iconRight="ArrowRight" trailing>Envoyer</Button>
 * <Button variant="gold" size="lg" fullWidth>Ouvrir la carte</Button>
 * <Button variant="ghost" iconOnly icon="Settings" aria-label="Réglages" />
 */
export const Button = React.forwardRef(function Button(
  {
    variant = 'primary',   // primary | secondary | tertiary | ghost | gold | danger
    size = 'md',           // sm | md | lg
    iconLeft,
    iconRight,
    icon,                  // for iconOnly
    iconOnly = false,
    fullWidth = false,
    loading = false,
    disabled = false,
    as: Cmp = 'button',
    className = '',
    children,
    ...rest
  },
  ref
) {
  const classes = [
    'mk-btn',
    `mk-btn--${variant}`,
    `mk-btn--${size}`,
    fullWidth && 'mk-btn--full',
    iconOnly && 'mk-btn--icon-only',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconSize = size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm';

  return (
    <Cmp
      ref={ref}
      type={Cmp === 'button' ? 'button' : undefined}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Icon name="Loader2" size={iconSize} className="mk-btn__spinner" />
      ) : (
        <>
          {iconLeft && <Icon name={iconLeft} size={iconSize} />}
          {iconOnly ? <Icon name={icon} size={iconSize} /> : children}
          {iconRight && <Icon name={iconRight} size={iconSize} />}
        </>
      )}
    </Cmp>
  );
});

export default Button;
