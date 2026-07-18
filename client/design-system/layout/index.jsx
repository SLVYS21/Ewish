import React from 'react';

/**
 * Container — largeur cadrée, padding-x responsive automatique.
 * <Container variant="marketing">…</Container>
 */
export function Container({
  variant,           // undefined | narrow | marketing | full
  as: Cmp = 'div',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'mk-container',
    variant && `mk-container--${variant}`,
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

/**
 * Section — rythme vertical standard.
 * <Section muted>…</Section>
 * <Section hero>…</Section>
 */
export function Section({
  hero = false,
  muted = false,
  inverted = false,
  as: Cmp = 'section',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'mk-section',
    hero && 'mk-section--hero',
    muted && 'mk-section--muted',
    inverted && 'mk-section--inverted',
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

/**
 * Stack — flex-column avec gap paramétrable via prop.
 * <Stack gap={6}>…</Stack>   → 24px
 * <Stack horizontal gap={2}>…</Stack>
 */
export function Stack({
  gap,                // number → mapped to --mk-space-{n}
  horizontal = false,
  as: Cmp = 'div',
  className = '',
  style,
  children,
  ...rest
}) {
  const classes = [
    'mk-stack',
    horizontal && 'mk-stack--horizontal',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const mergedStyle = {
    ...(gap != null ? { '--mk-stack-gap': `var(--mk-space-${gap})` } : null),
    ...style,
  };
  return (
    <Cmp className={classes} style={mergedStyle} {...rest}>
      {children}
    </Cmp>
  );
}

/**
 * Grid — nb de colonnes responsive.
 * <Grid cols={{ base: 1, md: 2, lg: 3 }}>…</Grid>
 */
export function Grid({
  cols = { base: 1 },
  gap,
  className = '',
  style,
  children,
  ...rest
}) {
  const responsiveClasses = [];
  if (cols.sm) responsiveClasses.push(`mk-grid--sm-${cols.sm}`);
  if (cols.md) responsiveClasses.push(`mk-grid--md-${cols.md}`);
  if (cols.lg) responsiveClasses.push(`mk-grid--lg-${cols.lg}`);

  const classes = ['mk-grid', ...responsiveClasses, className]
    .filter(Boolean)
    .join(' ');

  const mergedStyle = {
    '--mk-grid-cols': cols.base ?? 1,
    ...(gap != null ? { '--mk-grid-gap': `var(--mk-space-${gap})` } : null),
    ...style,
  };
  return (
    <div className={classes} style={mergedStyle} {...rest}>
      {children}
    </div>
  );
}

/**
 * Divider — trait horizontal sobre.
 * <Divider />         → subtle
 * <Divider gold />    → accent doré
 * <Divider vertical /> → dans un Stack horizontal
 */
export function Divider({ gold = false, vertical = false, className = '', ...rest }) {
  const classes = [
    'mk-divider',
    gold && 'mk-divider--gold',
    vertical && 'mk-divider--vertical',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <hr className={classes} {...rest} />;
}
