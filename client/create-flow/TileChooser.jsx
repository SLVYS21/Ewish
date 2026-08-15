import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import s from './TileChooser.module.css';

/* Composant générique pour un écran "choix" dans le wizard /create :
   header + grille de tuiles (desktop) qui devient carrousel horizontal
   scroll-snap + dots pagination OU grille 2 colonnes en mobile.

   Props :
   - tiles           : [{ id, title, description, Illustration, accent,
                         badge?, disabled? }]
                       accent = 'rose' | 'lilac' | 'butter' | 'mint' | 'peach'
                       badge  = string (petit label pill en haut-droite)
                       disabled = bool (opacity + parent gère le clic)
   - title           : titre principal (h1)
   - subtitle        : sous-titre
   - ariaLabel       : label ARIA du region du carrousel (accessibilité)
   - onSelect(id)    : appelé au clic sur une tuile (même si disabled — le
                       parent décide quoi faire, ex. toast "Bientôt")
   - onBack          : optionnel — affiche le bouton retour en haut à gauche
   - desktopColumns  : nombre de colonnes desktop (default 3)
   - mobileLayout    : 'carousel' | 'grid' (default 'carousel')
                       'grid' = 2 colonnes empilées, pas de dots. */
export default function TileChooser({
  tiles,
  title,
  subtitle,
  ariaLabel,
  onSelect,
  onBack,
  desktopColumns = 3,
  mobileLayout = 'carousel',
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tileRefs = useRef([]);
  const gridRef = useRef(null);
  const isCarousel = mobileLayout === 'carousel';

  /* Track de la tuile visible dans le carrousel mobile via IntersectionObserver.
     Inutile en mobile-grid (les dots sont masqués). */
  useEffect(() => {
    if (!isCarousel) return;
    if (!gridRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = tileRefs.current.indexOf(entry.target);
          if (idx === -1) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { idx, ratio: entry.intersectionRatio };
          }
        }
        if (best) setActiveIndex(best.idx);
      },
      { root: gridRef.current, threshold: [0.5, 0.75, 1] }
    );
    tileRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [tiles, isCarousel]);

  const scrollToTile = (index) => {
    const target = tileRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  const gridClassName = `${s.grid} ${isCarousel ? s.mobileCarousel : s.mobileGrid}`;
  const gridStyle = { gridTemplateColumns: `repeat(${desktopColumns}, minmax(0, 1fr))` };

  return (
    <div className={s.page}>
      {onBack && (
        <button className={s.back} onClick={onBack} type="button" aria-label="Retour">
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>
      )}

      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        {subtitle && <p className={s.subtitle}>{subtitle}</p>}
      </div>

      <div
        className={gridClassName}
        style={gridStyle}
        ref={gridRef}
        role="region"
        aria-label={ariaLabel}
      >
        {tiles.map(({ id, title: tTitle, description, Illustration, accent, badge, disabled }, i) => (
          <button
            key={id}
            ref={(el) => { tileRefs.current[i] = el; }}
            type="button"
            className={`${s.tile} ${s[`tile_${accent}`]} ${disabled ? s.tileDisabled : ''}`}
            onClick={() => onSelect?.(id)}
            aria-disabled={disabled ? 'true' : undefined}
          >
            {badge && (
              <span className={s.badge} aria-hidden={false}>
                {badge}
              </span>
            )}
            <div className={s.illuWrap}>
              <Illustration />
            </div>
            <div className={s.tileTitle}>{tTitle}</div>
            <div className={s.tileDesc}>{description}</div>
          </button>
        ))}
      </div>

      {isCarousel && (
        <div className={s.dots}>
          {tiles.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`${s.dot} ${i === activeIndex ? s.dotActive : ''}`}
              aria-label={`Aller à ${t.title}`}
              onClick={() => scrollToTile(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
