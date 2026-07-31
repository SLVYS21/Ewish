import { motion } from 'framer-motion';
import s from './Inspirations.module.css';

const occasions = [
  { id: 1, title: 'Anniversaire', desc: 'Joyeux Anniversaire Z🎊🎉', img: '/inspirations/1.jpg' },
  { id: 2, title: 'Célébration', desc: 'Joyeux Anniversaire 🎊🎉', img: '/inspirations/2.jpg' },
  { id: 3, title: 'Remerciement', desc: 'Merci pour ton travail exceptionnel !', img: '/inspirations/3.jpg' },
  { id: 4, title: 'Départ', desc: 'Bonne continuation !', img: '/inspirations/4.jpg' },
  { id: 5, title: 'Naissance', desc: 'Félicitations pour le bébé !', img: '/inspirations/5.jpg' },
  { id: 6, title: 'Rétablissement', desc: 'Bon rétablissement !', img: '/inspirations/6.jpg' },
  { id: 7, title: 'Mariage', desc: 'Félicitations pour le mariage !', img: '/inspirations/7.jpg' },
  { id: 8, title: 'Félicitations Pro', desc: 'Bravo pour ce projet !', img: '/inspirations/8.jpg' },
];

export default function Inspirations() {
  return (
    <section className={s.inspirationsSection}>
      <div className="mk-container">
        <div className="mk-sec-head" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="eyebrow">Inspirations</span>
          <h2 className="mk-sec-h2">Une carte pour chaque moment</h2>
          <p className="mk-sec-sub" style={{ margin: '0 auto' }}>
            Découvrez comment nos utilisateurs rendent leurs célébrations inoubliables et vibrantes d'émotion.
          </p>
        </div>
      </div>

      <div className={s.marqueeContainer}>
        <div className={s.marqueeTrack}>
          {/* Double the array for infinite scroll effect */}
          {[...occasions, ...occasions].map((item, index) => (
            <div key={index} className={s.card}>
              <div className={s.imgWrapper}>
                <img src={item.img} alt={item.title} loading="lazy" />
              </div>
              <div className={s.cardInfo}>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
