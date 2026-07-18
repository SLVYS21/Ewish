import React from 'react';
import * as Lucide from 'lucide-react';

/**
 * myKado Icon — wrapper Lucide avec defaults design system.
 *
 * <Icon name="Gift" size="md" />
 * <Icon name="Sparkles" size={20} color="var(--mk-action-accent-gold)" />
 *
 * Toutes les icônes stroke 1.75px round-round, currentColor.
 */

const SIZE_MAP = {
  xs: 'var(--mk-icon-size-xs)',
  sm: 'var(--mk-icon-size-sm)',
  md: 'var(--mk-icon-size-md)',
  lg: 'var(--mk-icon-size-lg)',
  xl: 'var(--mk-icon-size-xl)',
  '2xl': 'var(--mk-icon-size-2xl)',
};

export function Icon({
  name,
  size = 'md',
  color = 'currentColor',
  strokeWidth,
  className,
  style,
  ...rest
}) {
  const Cmp = Lucide[name];
  if (!Cmp) {
    if (import.meta.env?.DEV) console.warn(`[Icon] Lucide icon not found: ${name}`);
    return null;
  }

  const resolvedSize = typeof size === 'number' ? size : SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <Cmp
      size={typeof size === 'number' ? size : undefined}
      color={color}
      strokeWidth={strokeWidth ?? 1.75}
      absoluteStrokeWidth
      className={className}
      style={{
        width: typeof size === 'number' ? undefined : resolvedSize,
        height: typeof size === 'number' ? undefined : resolvedSize,
        flexShrink: 0,
        ...style,
      }}
      aria-hidden={rest['aria-label'] ? undefined : true}
      {...rest}
    />
  );
}

/* Brique mapping — usage rapide dans l'app */
export const BRIQUE_ICONS = {
  cartes:      'Sparkles',
  murs:        'LayoutGrid',
  cadeaux:     'Gift',
  calendriers: 'CalendarHeart',
  business:    'Building2',
};

export default Icon;
