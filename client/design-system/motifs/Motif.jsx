import React from 'react';

/**
 * myKado Motif — composant unifié pour afficher les motifs afro-modern SVG.
 * Contrat : color hérite via currentColor, jamais fill fixé (sauf accents).
 *
 * Usage :
 *   <Motif name="diamond-line" width={240} color="var(--mk-action-accent-gold)" />
 *   <Motif name="star-4pt" size={16} />
 *
 * Règles design (rappel) :
 * - Toujours en accent, jamais en élément principal
 * - Couleur : or #E8A33D par défaut, ou indigo #1E2952
 * - Backgrounds tileables : opacity 5-8% max
 */

const MOTIFS = {
  'diamond-line': () => import('./diamond-line.svg?raw'),
  'star-4pt':     () => import('./star-4pt.svg?raw'),
  'corner-mark':  () => import('./corner-mark.svg?raw'),
  'grid-diamond': () => import('./grid-diamond.svg?raw'),
};

export const AVAILABLE_MOTIFS = Object.keys(MOTIFS);

/**
 * Version inline (raw SVG chargé via import ?raw de Vite).
 * Alternative simple : version composant qui utilise <img src>.
 */
export function Motif({
  name,
  size,
  width,
  height,
  color = 'var(--mk-action-accent-gold)',
  opacity = 1,
  className,
  style,
  ...rest
}) {
  const [svg, setSvg] = React.useState(null);

  React.useEffect(() => {
    const loader = MOTIFS[name];
    if (!loader) {
      if (import.meta.env?.DEV) console.warn(`[Motif] Unknown motif: ${name}`);
      return;
    }
    loader().then((mod) => setSvg(mod.default));
  }, [name]);

  if (!svg) return null;

  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;

  return (
    <span
      className={className}
      style={{
        color,
        opacity,
        display: 'inline-flex',
        width: resolvedWidth,
        height: resolvedHeight,
        ...style,
      }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
      {...rest}
    />
  );
}

/**
 * Background pattern helper — retourne un style CSS avec url(...).
 * Usage : <div style={motifBackground('grid-diamond', 0.06)} />
 */
export function motifBackground(name, opacity = 0.06, color) {
  const url = new URL(`./${name}.svg`, import.meta.url).href;
  return {
    backgroundImage: `url("${url}")`,
    backgroundRepeat: 'repeat',
    opacity,
    color,
  };
}

export default Motif;
