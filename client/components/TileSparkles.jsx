/*
  Discrete decorative shapes on a create-tile:
   - a large soft blob partially off-frame in one corner
   - a medium hollow ring floated off-center
   - one small accent dot
  3 shapes total, pale-white / translucent so they work on any tile gradient.
  `variant` = 0..2 shifts blob corner + ring/dot positions per tile.
*/

const VARIANTS = [
  { blob: { top: '-22%', left: '58%' }, ring: { top: '58%', left: '12%' }, dot: { top: '22%', left: '18%' } },
  { blob: { top: '52%', left: '-24%' }, ring: { top: '10%', left: '54%' }, dot: { top: '75%', left: '70%' } },
  { blob: { top: '-20%', left: '-22%' }, ring: { top: '55%', left: '62%' }, dot: { top: '18%', left: '76%' } },
];

export default function TileSparkles({ className, variant = 0 }) {
  const v = VARIANTS[variant % VARIANTS.length];
  return (
    <div className={className} aria-hidden>
      <span className="tile-shape tile-blob" style={{ top: v.blob.top, left: v.blob.left }} />
      <span className="tile-shape tile-ring" style={{ top: v.ring.top, left: v.ring.left }} />
      <span className="tile-shape tile-dot"  style={{ top: v.dot.top,  left: v.dot.left  }} />
    </div>
  );
}
