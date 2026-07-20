/* Confetti effects — factorisé depuis templates/birthday/index.html:1602.
   Utilise window.confetti (tsparticles bundle chargé dans index.html).
   fire(type, opts?) déclenche l'effet ; retourne un canceller. */

function get() {
  if (typeof window === 'undefined') return null;
  return window.confetti || null;
}

/* Un effet peut durer (frames animées). On enregistre les timers pour
   les annuler si l'utilisateur switche vite d'effet. */
const runners = { end: 0, raf: 0, timers: [] };

function stop() {
  runners.end = 0;
  if (runners.raf) cancelAnimationFrame(runners.raf);
  runners.raf = 0;
  runners.timers.forEach(clearTimeout);
  runners.timers = [];
}

export function fireConfetti(type = 'default', originOverride) {
  const confetti = get();
  if (!confetti) return;
  stop();

  const origin = originOverride || { x: 0.5, y: 0.4 };
  const safe = (opts) => { try { confetti(opts); } catch {} };
  const later = (fn, ms) => runners.timers.push(setTimeout(fn, ms));

  switch (type) {
    case 'fireworks':
      safe({ spread: 360, startVelocity: 55, particleCount: 40, origin: { x: Math.random(), y: Math.random() * 0.6 } });
      safe({ spread: 360, startVelocity: 35, decay: 0.91, scalar: 0.8, particleCount: 25, origin: { x: Math.random(), y: Math.random() * 0.6 } });
      safe({ spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, particleCount: 20, origin: { x: Math.random(), y: Math.random() * 0.6 } });
      later(() => safe({ spread: 360, startVelocity: 45, particleCount: 35, origin: { x: Math.random(), y: Math.random() * 0.6 } }), 800);
      break;

    case 'snow':
      runners.end = Date.now() + 3000;
      (function snowFrame() {
        safe({ particleCount: 4, angle: 270, spread: 180, startVelocity: 18, gravity: 0.45, decay: 0.97, scalar: 0.9, shapes: ['circle'], colors: ['#fff', '#d0eaff', '#b0d4ff'], ticks: 700, origin: { x: Math.random(), y: -0.05 } });
        if (Date.now() < runners.end) runners.raf = requestAnimationFrame(snowFrame);
      })();
      break;

    case 'stars':
      safe({ particleCount: 100, spread: 360, startVelocity: 30, decay: 0.95, gravity: 0.5, shapes: ['star'], colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'], origin });
      break;

    case 'hearts':
      safe({ particleCount: 80, spread: 120, startVelocity: 40, shapes: ['heart'], colors: ['#ff69b4', '#ff1493', '#ff6eb4', '#ffb6c1', '#ff0066'], origin });
      later(() => safe({ particleCount: 70, spread: 120, startVelocity: 40, shapes: ['heart'], colors: ['#ff69b4', '#ff1493', '#ff6eb4', '#ffb6c1', '#ff0066'], origin: { x: 0.2, y: 0.5 } }), 500);
      later(() => safe({ particleCount: 70, spread: 120, startVelocity: 40, shapes: ['heart'], colors: ['#ff69b4', '#ff1493', '#ff6eb4', '#ffb6c1', '#ff0066'], origin: { x: 0.8, y: 0.5 } }), 900);
      break;

    case 'emoji_party':
      safe({ particleCount: 50, spread: 120, startVelocity: 35, shapes: ['emoji'], shapeOptions: { emoji: { value: ['🎉', '🎊', '✨', '🎈', '🥳'] } }, origin });
      break;

    case 'side_cannons':
      safe({ particleCount: 80, angle:  60, spread: 55, origin: { x: 0, y: 0.65 } });
      safe({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.65 } });
      later(() => {
        safe({ particleCount: 50, angle:  60, spread: 55, origin: { x: 0, y: 0.65 } });
        safe({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.65 } });
      }, 700);
      break;

    case 'school_pride':
      runners.end = Date.now() + 2500;
      (function pride() {
        safe({ particleCount: 3, angle:  60, spread: 55, origin: { x: 0 }, colors: ['#FF5470', '#FFFFFF'] });
        safe({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFC145', '#FFFFFF'] });
        if (Date.now() < runners.end) runners.raf = requestAnimationFrame(pride);
      })();
      break;

    case 'realistic':
      safe({ particleCount: 100, spread: 70, origin, ticks: 300, gravity: 1.2, scalar: 1 });
      later(() => safe({ particleCount: 50, angle:  60, spread: 60, origin: { x: 0, y: 0.7 } }), 400);
      later(() => safe({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 700);
      break;

    case 'gold_rain':
      runners.end = Date.now() + 3000;
      (function goldFrame() {
        safe({ particleCount: 6, angle: 270, spread: 120, startVelocity: 22, gravity: 0.9, decay: 0.96, scalar: 1.1, shapes: ['square', 'circle'], colors: ['#c9a84c', '#e8c86a', '#f5e07a', '#d4af37', '#fff8dc'], ticks: 600, origin: { x: Math.random(), y: -0.02 } });
        if (Date.now() < runners.end) runners.raf = requestAnimationFrame(goldFrame);
      })();
      break;

    default:
      safe({ particleCount: 160, spread: 100, origin, startVelocity: 45, gravity: 0.9 });
      later(() => safe({ particleCount: 60, spread: 60, origin: { x: 0.25, y: 0.6 } }), 500);
      later(() => safe({ particleCount: 60, spread: 60, origin: { x: 0.75, y: 0.6 } }), 800);
  }
}

export function stopConfetti() { stop(); }
