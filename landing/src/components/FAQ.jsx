import { useState } from 'react';
import { FAQS } from '../data';

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section section-faq" id="faq">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span> FAQ</span>
          <h2>Vos questions,<br/><em>nos réponses.</em></h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <button
              key={i}
              className={`faq-item ${open === i ? 'faq-open' : ''}`}
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
            >
              <div className="faq-q">
                <span className="faq-num">{String(i+1).padStart(2,'0')}</span>
                <span>{f.q}</span>
                <span className="faq-icon" aria-hidden>{open === i ? '–' : '+'}</span>
              </div>
              {open === i && <div className="faq-a">{f.a}</div>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
