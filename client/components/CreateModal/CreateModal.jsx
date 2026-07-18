import { useEffect } from 'react';
import { X, Info, ArrowRight, Heart } from 'lucide-react';
import s from './CreateModal.module.css';

/* ══════════════════════════════════════════════════════════════════
   CreateModal
   Bottom sheet (mobile) / centered modal (desktop)
   3 tuiles : Mur / Carte / Cadeau
   ══════════════════════════════════════════════════════════════════ */
export default function CreateModal({ open, onClose, onSelect }) {
  /* Escape to close */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    /* Lock body scroll */
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const pick = (mode) => {
    onSelect(mode);
    onClose();
  };

  return (
    <div
      className={s.veil}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={s.sheet} role="dialog" aria-modal="true" aria-label="Créer">
        <div className={s.grip} />

        {/* Header */}
        <div className={s.head}>
          <button className={s.info} aria-label="En savoir plus">
            <Info size={18} />
          </button>
          <button className={s.close} onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
          <h2 className={s.title}>Qu'est-ce qu'on crée aujourd'hui&nbsp;?</h2>
          <p className={s.subtitle}>
            Crée un mur, une carte, ou envoie un cadeau pour te lancer.
          </p>
        </div>

        {/* Tiles */}
        <div className={s.tileList}>
          <button
            className={`${s.tile} ${s.tileBoard}`}
            onClick={() => pick('wall')}
          >
            <div className={s.tileBody}>
              <span className={s.tileTitle}>
                Créer un mur <ArrowRight size={18} className={s.tileArrow} />
              </span>
              <span className={s.tileDesc}>
                Invite plusieurs personnes à ajouter des messages.
              </span>
            </div>
            <div className={s.tileArt}>
              <div className={s.artBoard}>
                <span className={s.artBoardChip} />
                <span className={s.artBoardChip} />
                <span className={s.artBoardChip} />
                <span className={s.artBoardChip} />
                <span className={s.artBoardChip} />
                <span className={s.artBoardChip} />
                <span className={s.artBoardChip} />
                <span className={s.artBoardChip} />
                <span className={s.artBoardChip} />
              </div>
            </div>
          </button>

          <button
            className={`${s.tile} ${s.tileCard}`}
            onClick={() => pick('wish')}
          >
            <div className={s.tileBody}>
              <span className={s.tileTitle}>
                Créer une carte <ArrowRight size={18} className={s.tileArrow} />
              </span>
              <span className={s.tileDesc}>
                Parfait si tu es le seul contributeur.
              </span>
            </div>
            <div className={s.tileArt}>
              <div className={s.artCard}>
                <div className={s.artCardEnv} />
                <Heart size={22} className={s.artCardHeart} fill="currentColor" />
              </div>
            </div>
          </button>

          <button
            className={`${s.tile} ${s.tileGift}`}
            onClick={() => pick('gift')}
          >
            <div className={s.tileBody}>
              <span className={s.tileTitle}>
                Envoyer un cadeau <ArrowRight size={18} className={s.tileArrow} />
              </span>
              <span className={s.tileDesc}>
                Offre un cadeau ou une carte cadeau.
              </span>
            </div>
            <div className={s.tileArt}>
              <div className={s.artGift}>
                <div className={s.artGiftCard} />
                <div className={s.artGiftCard} />
                <div className={s.artGiftCard} />
              </div>
            </div>
          </button>
        </div>

        {/* Go back */}
        <div className={s.goBackWrap}>
          <button className={s.goBack} onClick={onClose}>
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}
