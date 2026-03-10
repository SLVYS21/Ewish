/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  WishWell Runtime Engine  —  ww-engine.js                       ║
 * ║  Shared by ALL templates.                                       ║
 * ║  Reads __WW_STYLE__ and __WW_DECO__ injected by serve.js        ║
 * ║  and applies backgrounds + decoration elements to every section. ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * SECTION KEYS  (used in backgrounds map + decorations[].section)
 *   global       → fallback for all sections with no specific bg
 *   greeting     → .one / .two
 *   music        → .music-interlude
 *   message      → .three / .four (WhatsApp / Google / text)
 *   ideas        → .five
 *   celebration  → .six (birthday / special main section)
 *   outro        → .nine
 *   custom       → any template-specific section
 *
 * Each template marks its sections with  data-section="key"
 * The engine reads that attribute to apply backgrounds.
 *
 * DECORATION ANIMATIONS (CSS keyframes defined here)
 *   none | float | spin | pulse | drift | pop | shake | swing | bounce
 */

(function () {
  'use strict';

  /* ─── Wait for DOM ──────────────────────────────────────────────── */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ─── Inject keyframe CSS once ─────────────────────────────────── */
  function injectKeyframes() {
    if (document.getElementById('ww-engine-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'ww-engine-keyframes';
    style.textContent = `
      @keyframes ww-float  { 0%,100%{transform:translateY(0) rotate(var(--ww-rot,0deg))} 50%{transform:translateY(-12px) rotate(var(--ww-rot,0deg))} }
      @keyframes ww-spin   { to{transform:rotate(calc(var(--ww-rot,0deg) + 360deg))} }
      @keyframes ww-pulse  { 0%,100%{transform:scale(1) rotate(var(--ww-rot,0deg))} 50%{transform:scale(1.15) rotate(var(--ww-rot,0deg))} }
      @keyframes ww-drift  { 0%{transform:translate(0,0) rotate(var(--ww-rot,0deg))} 25%{transform:translate(10px,-8px) rotate(var(--ww-rot,0deg))} 50%{transform:translate(0,-16px) rotate(var(--ww-rot,0deg))} 75%{transform:translate(-10px,-8px) rotate(var(--ww-rot,0deg))} 100%{transform:translate(0,0) rotate(var(--ww-rot,0deg))} }
      @keyframes ww-pop    { 0%{transform:scale(0) rotate(var(--ww-rot,0deg))} 60%{transform:scale(1.2) rotate(var(--ww-rot,0deg))} 100%{transform:scale(1) rotate(var(--ww-rot,0deg))} }
      @keyframes ww-shake  { 0%,100%{transform:rotate(var(--ww-rot,0deg))} 20%{transform:rotate(calc(var(--ww-rot,0deg) - 8deg))} 40%{transform:rotate(calc(var(--ww-rot,0deg) + 8deg))} 60%{transform:rotate(calc(var(--ww-rot,0deg) - 4deg))} 80%{transform:rotate(calc(var(--ww-rot,0deg) + 4deg))} }
      @keyframes ww-swing  { 0%,100%{transform-origin:top center;transform:rotate(var(--ww-rot,0deg))} 25%{transform:rotate(calc(var(--ww-rot,0deg) + 12deg))} 75%{transform:rotate(calc(var(--ww-rot,0deg) - 12deg))} }
      @keyframes ww-bounce { 0%,100%{transform:translateY(0) rotate(var(--ww-rot,0deg))} 40%{transform:translateY(-20px) rotate(var(--ww-rot,0deg))} 60%{transform:translateY(-10px) rotate(var(--ww-rot,0deg))} }
      @keyframes ww-fadein { from{opacity:0;transform:scale(0.7) rotate(var(--ww-rot,0deg))} to{opacity:var(--ww-opacity,0.85);transform:scale(1) rotate(var(--ww-rot,0deg))} }

      .ww-deco {
        position: absolute;
        pointer-events: none;
        transform-origin: center center;
        will-change: transform;
        user-select: none;
        -webkit-user-drag: none;
      }
      .ww-deco.ww-global {
        position: fixed;
      }
      .ww-bg-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }
      /* All section direct children above background */
      [data-section] > *:not(.ww-bg-overlay):not(.ww-deco) {
        position: relative;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  }

  /* ─── Apply background to a DOM element ────────────────────────── */
  function applyBackground(el, bg) {
    if (!bg || !bg.value) return;

    // Remove any previous overlay
    const old = el.querySelector(':scope > .ww-bg-overlay');
    if (old) old.remove();

    if (bg.type === 'color') {
      el.style.background = bg.value;
    } else if (bg.type === 'gradient') {
      el.style.background = bg.value;
    } else if (bg.type === 'image') {
      // Build layered background: optional dark overlay on top of image
      const overlayAlpha = bg.overlay != null ? bg.overlay : 0;
      const blurPx       = bg.blur    != null ? bg.blur    : 0;

      if (blurPx > 0) {
        // Use a pseudo-element-style div for blur (CSS backdrop-filter on bg not supported)
        el.style.position = el.style.position || 'relative';
        el.style.overflow = 'hidden';
        const imgDiv = document.createElement('div');
        imgDiv.className = 'ww-bg-overlay';
        imgDiv.style.cssText = `
          background: url("${bg.value}") center/cover no-repeat;
          filter: blur(${blurPx}px);
          transform: scale(1.05); /* prevent blur edge artifacts */
        `;
        el.insertBefore(imgDiv, el.firstChild);
      } else {
        el.style.background = `url("${bg.value}") center/cover no-repeat`;
      }

      if (overlayAlpha > 0) {
        const overlay = document.createElement('div');
        overlay.className = 'ww-bg-overlay';
        overlay.style.cssText = `
          background: rgba(0,0,0,${overlayAlpha});
          z-index: 1;
        `;
        el.appendChild(overlay);
      }
    }
  }

  /* ─── Apply all section backgrounds ───────────────────────────── */
  function applyBackgrounds(style) {
    const bgs = (style && style.backgrounds) ? style.backgrounds : {};
    const globalBg = bgs['global'];

    // All sections with data-section attribute
    document.querySelectorAll('[data-section]').forEach(el => {
      const key = el.getAttribute('data-section');
      const bg  = bgs[key] || globalBg;
      if (bg) applyBackground(el, bg);
    });
  }

  /* ─── Build a single decoration element ────────────────────────── */
  function buildDecoElement(deco) {
    const img = document.createElement('img');
    img.src              = deco.src;
    img.alt              = '';
    img.draggable        = false;
    img.className        = 'ww-deco' + (deco.section === 'global' ? ' ww-global' : '');

    const rot    = deco.rotate  != null ? deco.rotate  : 0;
    const op     = deco.opacity != null ? deco.opacity : 0.85;
    const sz     = deco.size    != null ? deco.size    : 80;
    const delay  = deco.delay   != null ? deco.delay   : 0;
    const zIdx   = deco.zIndex  != null ? deco.zIndex  : 10;
    const x      = deco.position && deco.position.x != null ? deco.position.x : 50;
    const y      = deco.position && deco.position.y != null ? deco.position.y : 10;

    img.style.cssText = `
      left:       ${x}%;
      top:        ${y}%;
      width:      ${sz}px;
      height:     auto;
      opacity:    ${op};
      z-index:    ${zIdx};
      --ww-rot:   ${rot}deg;
      --ww-opacity: ${op};
      transform:  rotate(${rot}deg);
      animation-delay: ${delay}s;
      animation-fill-mode: both;
    `;

    // Set animation
    const anim = deco.animation || 'float';
    if (anim !== 'none') {
      const DURATIONS = {
        float: '3s', spin: '6s', pulse: '2s', drift: '5s',
        pop: '0.6s', shake: '0.6s', swing: '3s', bounce: '2s',
      };
      const ITERATES = {
        float: 'infinite', spin: 'infinite', pulse: 'infinite', drift: 'infinite',
        pop: '1', shake: '1', swing: 'infinite', bounce: 'infinite',
      };
      const dur  = DURATIONS[anim] || '3s';
      const iter = ITERATES[anim]  || 'infinite';
      img.style.animation = `ww-fadein 0.6s ${delay}s both, ww-${anim} ${dur} ${delay + 0.6}s ${iter} ease-in-out`;
    } else {
      // fade in only
      img.style.animation = `ww-fadein 0.6s ${delay}s both`;
    }

    img.dataset.decoId = deco.id;
    return img;
  }

  /* ─── Mount all decorations ─────────────────────────────────────── */
  function applyDecorations(decos) {
    if (!decos || !decos.length) return;

    // Remove any previously mounted decos (useful for live-update from editor)
    document.querySelectorAll('.ww-deco').forEach(el => el.remove());

    decos.forEach(deco => {
      const el = buildDecoElement(deco);

      if (deco.section === 'global') {
        // Global: attach to body, fixed position
        document.body.appendChild(el);
      } else {
        // Section-specific: attach inside matching data-section
        const section = document.querySelector(`[data-section="${deco.section}"]`);
        if (section) {
          // Ensure section is relatively positioned
          const pos = window.getComputedStyle(section).position;
          if (pos === 'static') section.style.position = 'relative';
          section.appendChild(el);
        } else {
          // Fallback: body
          el.classList.add('ww-global');
          document.body.appendChild(el);
        }
      }
    });
  }

  /* ─── Live update handler (from editor postMessage) ────────────── */
  function handleLiveUpdate(event) {
    if (!event.data || event.data.type !== 'WW_DECO_UPDATE') return;
    const { decorations, style } = event.data;
    if (decorations !== undefined) applyDecorations(decorations);
    if (style && style.backgrounds) applyBackgrounds(style);
  }

  /* ─── Bootstrap ─────────────────────────────────────────────────── */
  ready(function () {
    injectKeyframes();

    const style = window.__WW_STYLE__ || {};
    const decos = window.__WW_DECO__  || [];

    applyBackgrounds(style);
    applyDecorations(decos);

    window.addEventListener('message', handleLiveUpdate);

    // Expose for manual re-runs (e.g. after GSAP reveals a section)
    window._wwEngine = {
      applyBackgrounds,
      applyDecorations,
      applyBackground,
    };
  });

})();