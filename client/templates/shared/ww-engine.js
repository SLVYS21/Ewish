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
      .ww-bg-wrap {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }
      /* All section direct children above background */
      [data-section] > *:not(.ww-bg-wrap):not(.ww-deco) {
        position: relative;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  }

  /* ─── Apply background to a DOM element ────────────────────────── */
  function applyBackground(el, bg) {
    if (!bg || !bg.value) return;

    // Remove any previous ww-bg wrappers
    el.querySelectorAll(':scope > .ww-bg-wrap').forEach(n => n.remove());

    const isBody    = el === document.body;
    const isSection = !isBody && el.hasAttribute('data-section');

    // Sections are position:absolute with auto height — give them full viewport coverage
    if (isSection) {
      el.style.top      = '0';
      el.style.left     = '0';
      el.style.right    = '0';
      el.style.bottom   = '0';
      el.style.width    = '100%';
      el.style.height   = '100vh';
      el.style.position = 'absolute';
      el.style.overflow = 'hidden';
    }

    // We always use a wrapper div so we can layer image + overlay cleanly
    // and not fight with the element's own background property
    const wrap = document.createElement('div');
    wrap.className = 'ww-bg-wrap';
    wrap.style.cssText = [
      'position:absolute',
      'inset:0',
      'z-index:0',
      'pointer-events:none',
    ].join(';');

    if (bg.type === 'color') {
      wrap.style.background = bg.value;
    } else if (bg.type === 'gradient') {
      wrap.style.background = bg.value;
    } else if (bg.type === 'image') {
      const blurPx     = bg.blur    != null ? bg.blur    : 0;
      const overlayAlpha = bg.overlay != null ? bg.overlay : 0;

      // Image layer
      const imgLayer = document.createElement('div');
      imgLayer.style.cssText = [
        'position:absolute', 'inset:0',
        `background:url("${bg.value}") center/cover no-repeat`,
        blurPx > 0 ? `filter:blur(${blurPx}px);transform:scale(1.05)` : '',
      ].filter(Boolean).join(';');
      wrap.appendChild(imgLayer);

      // Dark overlay layer
      if (overlayAlpha > 0) {
        const ov = document.createElement('div');
        ov.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,${overlayAlpha})`;
        wrap.appendChild(ov);
      }
    }

    // Insert as first child so content sits on top
    el.insertBefore(wrap, el.firstChild);

    // Ensure direct children (content) are above the bg wrapper
    if (!isBody) {
      el.querySelectorAll(':scope > *:not(.ww-bg-wrap):not(.ww-deco)').forEach(child => {
        if (!child.style.position || child.style.position === 'static') {
          child.style.position = 'relative';
        }
        if (!child.style.zIndex) child.style.zIndex = '1';
      });
    }
  }

  /* ─── Apply all section backgrounds ───────────────────────────── */
  function applyBackgrounds(style) {
    const bgs = (style && style.backgrounds) ? style.backgrounds : {};
    const globalBg = bgs['global'];

    // Apply global bg to body (affects all sections that don't have their own bg)
    if (globalBg && globalBg.value) {
      applyBackground(document.body, globalBg);
    }

    // Apply per-section backgrounds (override global)
    document.querySelectorAll('[data-section]').forEach(el => {
      const key = el.getAttribute('data-section');
      if (key === 'global') return;
      const bg = bgs[key];
      if (bg && bg.value) {
        applyBackground(el, bg);
      }
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
    // Accept both WW_UPDATE (main editor message) and legacy WW_DECO_UPDATE
    if (!event.data) return;
    const t = event.data.type;
    if (t !== 'WW_UPDATE' && t !== 'WW_DECO_UPDATE') return;

    const { decorations, style } = event.data;

    // Apply per-section backgrounds from incoming style
    if (style && style.backgrounds) {
      // Merge into __WW_STYLE__ so sections revealed later pick it up
      window.__WW_STYLE__ = window.__WW_STYLE__ || {};
      window.__WW_STYLE__.backgrounds = {
        ...(window.__WW_STYLE__.backgrounds || {}),
        ...style.backgrounds,
      };
      applyBackgrounds({ backgrounds: style.backgrounds });
    }

    // Update decorations
    if (decorations !== undefined) {
      window.__WW_DECO__ = decorations;
      applyDecorations(decorations);
    }
  }

  /* ─── Editor preview mode ──────────────────────────────────────── */
  // When running inside the editor iframe, GSAP animations make sections
  // invisible (opacity:0). We inject a style override to make all sections
  // visible so backgrounds and decorations can be previewed.
  var _editorModeActive = false;
  function enterEditorPreviewMode() {
    if (_editorModeActive) return;
    // Only activate when inside an iframe (editor context)
    if (window.self === window.top) return;
    _editorModeActive = true;

    // Pause any GSAP timeline running on the page
    if (window.TweenMax) { try { TweenMax.pauseAll(true, true); } catch(e){} }
    if (window.TimelineMax) {
      try {
        // Find all tweens and pause them
        var tweens = TweenMax.getAllTweens ? TweenMax.getAllTweens() : [];
        tweens.forEach(function(t){ try{ t.pause(); }catch(e){} });
      } catch(e) {}
    }

    // Inject CSS that makes all sections fully visible regardless of GSAP inline styles
    if (!document.getElementById('ww-editor-mode')) {
      var st = document.createElement('style');
      st.id = 'ww-editor-mode';
      st.textContent = [
        '.container { visibility: visible !important; }',
        '.container > div {',
        '  opacity: 1 !important;',
        '  transform: none !important;',
        '  visibility: visible !important;',
        '  pointer-events: all !important;',
        '}',
        // Stack sections vertically so all are visible, not overlapping
        '.container {',
        '  height: auto !important;',
        '  overflow: visible !important;',
        '  position: relative !important;',
        '}',
        '.container > div {',
        '  position: relative !important;',
        '  top: auto !important;',
        '  left: auto !important;',
        '  right: auto !important;',
        '  height: 100vh !important;',
        '  width: 100% !important;',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '  border-bottom: 1px solid rgba(0,0,0,0.06) !important;',
        '}',
      ].join('\n');
      document.head.appendChild(st);
    }
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
    // Expose as window.wwEngine — all templates call window.wwEngine.init() / .applyLiveUpdate()
    window.wwEngine = {
      init: function() {
        var style = window.__WW_STYLE__ || {};
        var decos = window.__WW_DECO__  || [];
        var bgs   = style.backgrounds   || {};
        // If there are any backgrounds or section-specific decos, enter editor preview mode
        var hasSectionContent = Object.keys(bgs).some(function(k){ return bgs[k] && bgs[k].value; })
          || decos.some(function(d){ return d.section && d.section !== 'global'; });
        if (hasSectionContent) enterEditorPreviewMode();
        applyBackgrounds(style);
        applyDecorations(decos);
      },
      // applyLiveUpdate: called with the WW_UPDATE payload directly (templates do: applyLiveUpdate(e.data))
      // Payload shape: { type, data:{...pubFields}, style:{primaryColor,...,backgrounds:{...}}, decorations:[] }
      applyLiveUpdate: function(payload) {
        if (!payload || !payload.type) return;  // must have type field to be a valid WW message
        const { style, decorations } = payload;
        if (style && style.backgrounds) {
          window.__WW_STYLE__ = window.__WW_STYLE__ || {};
          window.__WW_STYLE__.backgrounds = { ...(window.__WW_STYLE__.backgrounds || {}), ...style.backgrounds };
          // In editor (iframe) context: make all sections visible so bg preview works
          enterEditorPreviewMode();
          applyBackgrounds({ backgrounds: style.backgrounds });
        }
        if (decorations !== undefined) {
          window.__WW_DECO__ = decorations;
          // In editor context: ensure sections are visible for deco preview
          if (decorations.some(d => d.section && d.section !== 'global')) {
            enterEditorPreviewMode();
          }
          applyDecorations(decorations);
        }
      },
      applyBackgrounds,
      applyDecorations,
      applyBackground,
    };
    window._wwEngine = window.wwEngine; // legacy alias
  });

})();