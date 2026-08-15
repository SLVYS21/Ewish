import TileChooser from './TileChooser';
import {
  BirthdayIllustration,
  ForeverIllustration,
  NotreFilmIllustration,
} from './templateIllustrations';

const WISH_TEMPLATES = [
  {
    id: 'birthday',
    title: 'Anniversaire',
    description: 'Gâteau, confettis, ambiance festive',
    Illustration: BirthdayIllustration,
    accent: 'rose',
  },
  {
    id: 'forever',
    title: "Lettre d'amour",
    description: "Lettre d'amour à un être cher",
    Illustration: ForeverIllustration,
    accent: 'butter',
  },
  {
    id: 'notre-film',
    title: 'Notre Film',
    description: 'Souvenir cinématique, pétale transition',
    Illustration: NotreFilmIllustration,
    accent: 'lilac',
  },
];

export default function TemplateStep({ onSelect, onBack }) {
  return (
    <TileChooser
      tiles={WISH_TEMPLATES}
      title="Choisis ton style"
      subtitle="Chaque template a sa propre ambiance."
      ariaLabel="Templates wish disponibles"
      onSelect={onSelect}
      onBack={onBack}
    />
  );
}
