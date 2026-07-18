import { useEffect, useRef } from 'react';

/*
  Uses the same window.confetti() from @tsparticles/confetti as templates/birthday.
  The lib is loaded in client/index.html so it's globally available.
  Fires the exact `side_cannons` pattern from birthday/index.html:1638, on a loop.
*/

/* Kado palette: box #FF5470, ribbon #FFC145, confetti mint #00C2A8, violet #7C5CFF, sky #5CC8FF */
const COLORS = ['#FF5470', '#FFC145', '#00C2A8', '#7C5CFF', '#5CC8FF', '#FFFFFF'];

function waitForConfetti(retries = 40) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject();
    const start = Date.now();
    const tick = () => {
      if (window.confetti) return resolve(window.confetti);
      if (Date.now() - start > 8000) return reject();
      setTimeout(tick, 100);
    };
    tick();
  });
}

export default function ConfettiBurst({ cycleInterval = 2400 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let fire = null;
    let timers = [];

    const schedule = (fn, delay) => {
      const id = setTimeout(fn, delay);
      timers.push(id);
      return id;
    };

    const safe = (opts) => {
      if (cancelled || !fire) return;
      try { fire(opts); } catch {}
    };

    const cycle = () => {
      if (cancelled) return;
      /* Main volley — both cannons (same as birthday side_cannons) */
      safe({ particleCount: 70, angle:  60, spread: 55, startVelocity: 55, gravity: 1.1, ticks: 220, scalar: 0.95, colors: COLORS, origin: { x: 0, y: 0.9 } });
      safe({ particleCount: 70, angle: 120, spread: 55, startVelocity: 55, gravity: 1.1, ticks: 220, scalar: 0.95, colors: COLORS, origin: { x: 1, y: 0.9 } });
      /* Secondary follow-up 700ms later */
      schedule(() => {
        safe({ particleCount: 40, angle:  60, spread: 55, startVelocity: 45, gravity: 1.1, ticks: 220, scalar: 0.9, colors: COLORS, origin: { x: 0, y: 0.9 } });
        safe({ particleCount: 40, angle: 120, spread: 55, startVelocity: 45, gravity: 1.1, ticks: 220, scalar: 0.9, colors: COLORS, origin: { x: 1, y: 0.9 } });
      }, 700);
      /* Next cycle */
      schedule(cycle, cycleInterval);
    };

    waitForConfetti().then((confetti) => {
      if (cancelled || !canvasRef.current) return;
      /* Scoped canvas instance if create() is available (canvas-confetti API),
         otherwise fall back to the global (full-viewport) fire. */
      if (typeof confetti.create === 'function') {
        try {
          fire = confetti.create(canvasRef.current, { resize: true, useWorker: false });
        } catch {
          fire = confetti;
        }
      } else {
        fire = confetti;
      }
      cycle();
    }).catch(() => {
      /* CDN failed to load — silent no-op */
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      try { fire && fire.reset && fire.reset(); } catch {}
    };
  }, [cycleInterval]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
