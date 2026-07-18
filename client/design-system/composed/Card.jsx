import React from 'react';

/**
 * Card — container éditorial avec variantes
 *
 * <Card variant="elevated" size="lg">
 *   <Card.Header>
 *     <h3 className="mk-h3">Titre</h3>
 *     <IconButton icon="MoreHorizontal" />
 *   </Card.Header>
 *   <Card.Body>Contenu…</Card.Body>
 *   <Card.Footer>
 *     <Button variant="primary">Action</Button>
 *   </Card.Footer>
 * </Card>
 */
export function Card({
  variant,          // undefined (default) | elevated | outlined | muted
  size,             // undefined (md) | sm | lg
  interactive = false,
  as: Cmp = 'div',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'mk-card',
    variant && `mk-card--${variant}`,
    size && `mk-card--${size}`,
    interactive && 'mk-card--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Cmp className={classes} {...rest}>
      {children}
    </Cmp>
  );
}

Card.Header = function CardHeader({ className = '', children, ...rest }) {
  return (
    <div className={`mk-card__header ${className}`} {...rest}>
      {children}
    </div>
  );
};
Card.Body = function CardBody({ className = '', children, ...rest }) {
  return (
    <div className={`mk-card__body ${className}`} {...rest}>
      {children}
    </div>
  );
};
Card.Footer = function CardFooter({ className = '', children, ...rest }) {
  return (
    <div className={`mk-card__footer ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Card;
