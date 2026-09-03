import React, { useMemo } from 'react';
import { BookOpen, Check } from 'lucide-react';
import { NARRATIVE_VARIANTS, detectActiveVariant } from '../data/narrativeVariants';
import styles from './NarrativeVariantPicker.module.css';

/**
 * NarrativeVariantPicker — sélecteur de fil narratif pour un template.
 * Ne s'affiche que si le template a plusieurs variantes définies.
 *
 * Props :
 *   templateName — clé du template (birthday, notre-film, forever)
 *   data — l'objet data complet du pub (utilisé pour détecter la variante active)
 *   onApply(dataPatch) — appelé quand une variante est sélectionnée ; reçoit
 *                       un objet partiel à merger dans le data.
 */
export default function NarrativeVariantPicker({ templateName, data, onApply }) {
  const variants = NARRATIVE_VARIANTS[templateName];
  const activeId = useMemo(() => detectActiveVariant(templateName, data), [templateName, data]);

  if (!variants || variants.length < 2) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.iconCircle}><BookOpen size={13}/></span>
        <div className={styles.headerText}>
          <div className={styles.title}>Fil narratif</div>
          <div className={styles.sub}>Change l'ambiance des textes de l'animation.</div>
        </div>
      </div>

      <div className={styles.railWrap}>
        <div className={styles.rail}>
          {variants.map(v => {
            const isActive = v.id === activeId;
            return (
              <button
                key={v.id}
                type="button"
                className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
                onClick={() => onApply?.(v.data)}
              >
                <div className={styles.cardHead}>
                  <span className={styles.cardLabel}>{v.label}</span>
                  {isActive && <Check size={13} className={styles.check} />}
                </div>
                <div className={styles.cardTag}>{v.tagline}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
