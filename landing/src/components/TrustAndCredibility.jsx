import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import s from './TrustAndCredibility.module.css';

const TESTIMONIALS = [
  {
    quote: "Organiser le cadeau de départ de Koffi n'a jamais été aussi simple ! La cagnotte et le mur de mots en un seul lien, et l'argent est arrivé directement sur son Momo.",
    author: "Aminata",
    role: "RH à Abidjan"
  },
  {
    quote: "J'ai pu envoyer une carte animée et participer au cadeau de ma sœur depuis Paris. C'est sécurisé et tellement plus élégant qu'un simple transfert d'argent.",
    author: "Yannick",
    role: "Diaspora"
  }
];

const USE_CASES = [
  {
    title: "Pour un anniversaire",
    desc: "Une carte vibrante et une cagnotte pour le cadeau parfait.",
    bg: "var(--mk-indigo-700)",
    color: "#fff"
  },
  {
    title: "Soutenir un mariage à distance",
    desc: "Permettez à la famille éloignée de contribuer facilement.",
    bg: "var(--mk-clay-50)",
    color: "var(--mk-stone-900)"
  },
  {
    title: "Cadeaux d'entreprise",
    desc: "Un mur de mots géant signé par tout le bureau pour les pots de départ.",
    bg: "var(--mk-gold-100)",
    color: "var(--mk-stone-900)",
    image: "/assets/corporate_wall.png"
  },
  {
    title: "Pour la Saint-Valentin",
    desc: "Une surprise romantique avec message vocal et musique.",
    bg: "var(--mk-stone-100)",
    color: "var(--mk-stone-900)"
  }
];

export default function TrustAndCredibility() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };
  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  return (
    <section className={s.section}>
      <div className="mk-container">
        
        {/* Security & Partners */}
        <div className={s.securityBanner}>
          <div className={s.securityBadge}>
            <ShieldCheck size={32} className={s.shieldIcon} />
            <div>
              <h4 className={s.badgeTitle}>Paiements 100% sécurisés</h4>
              <p className={s.badgeDesc}>Transactions chiffrées de bout en bout</p>
            </div>
          </div>
          <div className={s.partners}>
            <div className={s.partnerLogo}>MTN MoMo</div>
            <div className={s.partnerLogo}>Wave</div>
            <div className={s.partnerLogo}>Orange Money</div>
            <div className={s.partnerLogo}>Moov Money</div>
            <div className={s.partnerLogo}>Visa / Mastercard</div>
          </div>
        </div>

        <div className={s.grid}>
          {/* Testimonials & Stats */}
          <div className={s.testimonials}>
            <div className={s.statsCounter}>
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={s.statsNumber}
              >
                +10 000
              </motion.span>
              <span className={s.statsText}>moments de joie partagés</span>
            </div>
            <h2 className={s.h2}>Ce qu'ils en disent</h2>
            
            <div className={s.carousel}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className={s.testimonialCard}
                >
                  <Quote size={40} className={s.quoteIcon} />
                  <p className={s.quoteText}>"{TESTIMONIALS[activeTestimonial].quote}"</p>
                  <div className={s.authorInfo}>
                    <strong>{TESTIMONIALS[activeTestimonial].author}</strong>
                    <span>{TESTIMONIALS[activeTestimonial].role}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <div className={s.carouselControls}>
                <button onClick={prevTestimonial} className={s.controlBtn}><ChevronLeft size={20} /></button>
                <button onClick={nextTestimonial} className={s.controlBtn}><ChevronRight size={20} /></button>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className={s.useCases}>
            <h2 className={s.h2} style={{ marginBottom: '32px' }}>Parfait pour...</h2>
            <div className={s.useCasesList}>
              {USE_CASES.map((uc, i) => (
                <motion.div 
                  key={uc.title}
                  className={`${s.useCaseCard} ${uc.image ? s.hasImage : ''}`}
                  style={{ backgroundColor: uc.bg, color: uc.color }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={s.ucContent}>
                    <h3 className="serif">{uc.title}</h3>
                    <p>{uc.desc}</p>
                  </div>
                  {uc.image && (
                    <div className={s.ucImageWrapper}>
                      <img src={uc.image} alt={uc.title} className={s.ucImage} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
