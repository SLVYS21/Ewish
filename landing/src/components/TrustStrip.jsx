import { useEffect, useRef } from 'react';
import s from './TrustStrip.module.css';

const LOGOS = [
  { sigil: 'A', name: 'Atlantis' },
  { sigil: 'S', name: 'Sahel&Co' },
  { sigil: 'B', name: 'Baobab RH' },
  { sigil: 'M', name: 'Maison Diallo' },
  { sigil: 'K', name: 'Kora Events' },
];

export default function TrustStrip() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add(s.revealed); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    items.forEach(item => io.observe(item));
    return () => io.disconnect();
  }, []);

  return (
    <section className={s.trust} ref={ref}>
      <div className={s.trustInner}>
        <div className={`${s.trustLabel} ${s.reveal}`} data-reveal>
          Adopté par des équipes RH, agences évènementielles &amp; familles à travers l'Afrique de l'Ouest
        </div>
        <div className={s.trustLogos}>
          {LOGOS.map((logo, i) => (
            <span
              key={logo.name}
              className={`${s.trustLogo} ${s.reveal}`}
              data-reveal
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <span className={s.sigil}>{logo.sigil}</span>
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
