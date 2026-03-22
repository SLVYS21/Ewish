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
      @keyframes ww-fadein  { from{opacity:0;transform:scale(0.7) rotate(var(--ww-rot,0deg))} to{opacity:var(--ww-opacity,0.85);transform:scale(1) rotate(var(--ww-rot,0deg))} }
      @keyframes ww-fadeout { from{opacity:var(--ww-opacity,0.85)} to{opacity:0;transform:scale(0.8) rotate(var(--ww-rot,0deg))} }

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

  /* ─── Hide a decoration with fadeout ───────────────────────────── */
  function _scheduleHide(img, deco) {
    const fadeoutDur = 0.8;
    img.style.animation = `ww-fadeout ${fadeoutDur}s ease-in-out both`;
    img._wwHideTimer = setTimeout(() => {
      if (img.parentNode) img.style.display = 'none';
    }, fadeoutDur * 1000);
  }

  /* ─── Clear all timers on a deco element ────────────────────────── */
  function _clearDecoTimers(el) {
    if (el._wwShowTimer) { clearTimeout(el._wwShowTimer); el._wwShowTimer = null; }
    if (el._wwHideTimer) { clearTimeout(el._wwHideTimer); el._wwHideTimer = null; }
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

    // ── Visibility timing ────────────────────────────────────
    const showAfter = deco.showAfter != null ? deco.showAfter : 0;
    const hideAfter = deco.hideAfter != null ? deco.hideAfter : 0; // 0 = never hide

    if (showAfter > 0) {
      // Start hidden, reveal after showAfter seconds
      img.style.opacity = '0';
      img.style.animation = 'none';
      img._wwShowTimer = setTimeout(() => {
        img.style.animation = '';  // restore
        const anim2 = deco.animation || 'float';
        const DURATIONS2 = { float:'3s', spin:'6s', pulse:'2s', drift:'5s', pop:'0.6s', shake:'0.6s', swing:'3s', bounce:'2s' };
        const ITERATES2  = { float:'infinite', spin:'infinite', pulse:'infinite', drift:'infinite', pop:'1', shake:'1', swing:'infinite', bounce:'infinite' };
        if (anim2 !== 'none') {
          img.style.animation = `ww-fadein 0.6s both, ww-${anim2} ${DURATIONS2[anim2]||'3s'} 0.6s ${ITERATES2[anim2]||'infinite'} ease-in-out`;
        } else {
          img.style.animation = 'ww-fadein 0.6s both';
        }
        // Schedule hide if needed
        if (hideAfter > 0) {
          img._wwHideTimer = setTimeout(() => _scheduleHide(img, deco), 0);
        }
      }, showAfter * 1000);
    } else if (hideAfter > 0) {
      // Visible from start, hide after hideAfter seconds
      const totalDelay = (hideAfter - delay) * 1000;
      img._wwHideTimer = setTimeout(() => _scheduleHide(img, deco), Math.max(0, totalDelay));
    }

    return img;
  }

  /* ─── Mount all decorations ─────────────────────────────────────── */
  function applyDecorations(decos) {
    if (!decos || !decos.length) return;

    // Remove any previously mounted decos — clear timers first to avoid stale callbacks
    document.querySelectorAll('.ww-deco').forEach(el => { _clearDecoTimers(el); el.remove(); });

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
    if (event.data.widgets !== undefined) {
      window.__WW_WIDGETS__ = event.data.widgets;
      applyWidgets(event.data.widgets);
    }
  }


  /* ─── Widget rendering engine ───────────────────────────────────── */
  function formatDuration(fromDate, unit) {
    const from = new Date(fromDate);
    const now   = new Date();
    const ms    = now - from;
    if (isNaN(ms) || ms < 0) return '—';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours   = Math.floor(minutes / 60);
    const days    = Math.floor(hours / 24);
    const months  = Math.floor(days / 30.44);
    const years   = Math.floor(days / 365.25);

    if (unit === 'hours') return hours.toLocaleString('fr-FR') + ' heures';
    if (unit === 'days')  return days.toLocaleString('fr-FR') + ' jours';
    if (unit === 'months') return months + ' mois';
    if (unit === 'years') return years + ' ans';
    // auto: pick best unit
    if (years  >= 1) return years  + (years  === 1 ? ' an'   : ' ans');
    if (months >= 1) return months + ' mois';
    if (days   >= 1) return days   + (days   === 1 ? ' jour' : ' jours');
    return hours + ' heures';
  }

  function buildWidgetEl(w) {
    const wrap = document.createElement('div');
    wrap.className = 'ww-widget ww-widget-' + w.type;
    wrap.dataset.widgetId = w.id;

    if (w.type === 'countdown' || w.type === 'memories') {
      const value = formatDuration(w.date, w.unit || 'auto');
      wrap.innerHTML = `
        <div class="ww-widget-inner">
          <div class="ww-widget-label">${w.label || ''}</div>
          <div class="ww-widget-value" data-ww-countdown="${w.id}">${value}</div>
        </div>`;
      // Live tick every minute
      var ticker = setInterval(function() {
        var el = document.querySelector('[data-ww-countdown="' + w.id + '"]');
        if (!el) { clearInterval(ticker); return; }
        el.textContent = formatDuration(w.date, w.unit || 'auto');
      }, 60000);

    } else if (w.type === 'age') {
      const from = new Date(w.date);
      const now  = new Date();
      let years  = now.getFullYear() - from.getFullYear();
      let months = now.getMonth()    - from.getMonth();
      let days   = now.getDate()     - from.getDate();
      if (days   < 0) { months--; days   += 30; }
      if (months < 0) { years--;  months += 12; }
      wrap.innerHTML = `
        <div class="ww-widget-inner">
          <div class="ww-widget-label">${w.label || 'Âge'}</div>
          <div class="ww-widget-age">
            <span class="ww-widget-age-num">${years}</span><span class="ww-widget-age-unit"> ans</span>
            <span class="ww-widget-age-sub">${months} mois et ${days} jours</span>
          </div>
        </div>`;

    } else if (w.type === 'quote') {
      wrap.innerHTML = `
        <div class="ww-widget-inner ww-widget-quote-inner">
          <div class="ww-widget-quote-mark">"</div>
          <div class="ww-widget-quote-text">${w.text || ''}</div>
          ${w.author ? '<div class="ww-widget-quote-author">— ' + w.author + '</div>' : ''}
        </div>`;
    }
    return wrap;
  }

  function injectWidgetStyles() {
    if (document.getElementById('ww-widget-styles')) return;
    var st = document.createElement('style');
    st.id = 'ww-widget-styles';
    st.textContent = `
      .ww-widgets-zone {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        display: flex; flex-wrap: wrap; justify-content: center;
        gap: 10px; padding: 16px;
        z-index: 20; pointer-events: none;
      }
      .ww-widget {
        background: rgba(255,255,255,0.88);
        backdrop-filter: blur(12px);
        border-radius: 16px;
        padding: 10px 18px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        min-width: 120px; text-align: center;
        animation: ww-fadein 0.5s both;
      }
      .ww-widget-inner { display: flex; flex-direction: column; align-items: center; gap: 2px; }
      .ww-widget-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.06em; color: #888; font-weight: 600; }
      .ww-widget-value { font-size: 1.6rem; font-weight: 800; color: var(--primary, #ff69b4); line-height: 1.1; }
      .ww-widget-age   { display: flex; flex-direction: column; align-items: center; }
      .ww-widget-age-num  { font-size: 2rem; font-weight: 900; color: var(--primary, #ff69b4); line-height: 1; }
      .ww-widget-age-unit { font-size: 0.9rem; font-weight: 600; color: #666; }
      .ww-widget-age-sub  { font-size: 0.65rem; color: #aaa; margin-top: 2px; }
      .ww-widget-quote-inner { max-width: 200px; }
      .ww-widget-quote-mark { font-size: 2.5rem; line-height: 0.6; color: var(--primary, #ff69b4); font-family: Georgia, serif; opacity: 0.5; }
      .ww-widget-quote-text { font-size: 0.78rem; font-style: italic; color: #333; line-height: 1.4; }
      .ww-widget-quote-author { font-size: 0.65rem; color: #999; margin-top: 4px; }
    `;
    document.head.appendChild(st);
  }

  function applyWidgets(widgets) {
    injectWidgetStyles();
    // Remove existing
    document.querySelectorAll('.ww-widgets-zone').forEach(el => el.remove());
    if (!widgets || !widgets.length) return;

    // Find the celebration section to attach widgets to
    var container = document.querySelector('[data-section="celebration"]')
      || document.querySelector('.six')
      || document.body;

    var zone = document.createElement('div');
    zone.className = 'ww-widgets-zone';
    widgets.forEach(function(w) { zone.appendChild(buildWidgetEl(w)); });

    // Ensure container is relatively positioned
    var pos = window.getComputedStyle(container).position;
    if (pos === 'static') container.style.position = 'relative';
    container.appendChild(zone);
  }

  /* ─── Bootstrap ─────────────────────────────────────────────────── */
  ready(function () {
    injectKeyframes();

    const style = window.__WW_STYLE__ || {};
    // ── Branding promo button ────────────────────────────────────
    const br = window.__WW_BRANDING__;
    if (br && br.show) {
      (function() {
        var btn = document.createElement('a');
        btn.href = br.url;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.id = 'ww-branding-btn';
        btn.textContent = br.label || 'Crée le tien sur eWishWell ✨';
        btn.style.cssText = [
          'position:fixed',
          'bottom:14px',
          'left:50%',
          'transform:translateX(-50%)',
          'z-index:8999',
          'background:rgba(255,255,255,0.92)',
          'backdrop-filter:blur(10px)',
          '-webkit-backdrop-filter:blur(10px)',
          'border:1px solid rgba(0,0,0,0.08)',
          'border-radius:50px',
          'padding:8px 18px',
          'font-family:system-ui,-apple-system,sans-serif',
          'font-size:0.72rem',
          'font-weight:600',
          'color:#444',
          'text-decoration:none',
          'white-space:nowrap',
          'box-shadow:0 4px 16px rgba(0,0,0,0.12)',
          'opacity:0',
          'transition:opacity 0.6s ease 1.5s, transform 0.2s',
          'cursor:pointer',
        ].join(';');
        btn.addEventListener('mouseenter', function() {
          btn.style.transform = 'translateX(-50%) translateY(-2px)';
          btn.style.boxShadow = '0 6px 22px rgba(0,0,0,0.18)';
        });
        btn.addEventListener('mouseleave', function() {
          btn.style.transform = 'translateX(-50%)';
          btn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
        });
        document.body.appendChild(btn);
        // Fade in après un délai pour ne pas distraire
        setTimeout(function() { btn.style.opacity = '1'; }, 100);
      })();
    }

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
        applyBackgrounds(style);
        applyDecorations(decos);
        applyWidgets(window.__WW_WIDGETS__ || []);
      },
      // applyLiveUpdate: called with the WW_UPDATE payload directly (templates do: applyLiveUpdate(e.data))
      // Payload shape: { type, data:{...pubFields}, style:{primaryColor,...,backgrounds:{...}}, decorations:[] }
      applyLiveUpdate: function(payload) {
        if (!payload || !payload.type) return;  // must have type field to be a valid WW message
        const { style, decorations } = payload;
        if (style) {
          window.__WW_STYLE__ = window.__WW_STYLE__ || {};
          // Apply CSS variables live for instant preview
          const root = document.documentElement;
          if (style.primaryColor) root.style.setProperty('--primary',    style.primaryColor);
          if (style.accentColor)  root.style.setProperty('--accent',     style.accentColor);
          if (style.fontFamily)   root.style.setProperty('--font',       `'${style.fontFamily}', sans-serif`);
          if (style.textColor)    root.style.setProperty('--text-color', style.textColor);
          if (style.textMuted)    root.style.setProperty('--text-muted', style.textMuted);
          if (style.fontSize) {
            const scale = style.fontSize === 'small' ? '0.85' : style.fontSize === 'large' ? '1.15' : '1';
            root.style.setProperty('--fs-scale', scale);
          }
          if (style.backgrounds) {
            window.__WW_STYLE__.backgrounds = { ...(window.__WW_STYLE__.backgrounds || {}), ...style.backgrounds };
            // In editor (iframe) context: make all sections visible so bg preview works
            applyBackgrounds({ backgrounds: style.backgrounds });
          }
        }
        if (decorations !== undefined) {
          window.__WW_DECO__ = decorations;
          // In editor context: ensure sections are visible for deco preview
          applyDecorations(decorations);
        }
        if (payload.widgets !== undefined) {
          window.__WW_WIDGETS__ = payload.widgets;
          applyWidgets(payload.widgets);
        }
      },
      applyBackgrounds,
      applyDecorations,
      applyBackground,
    };
    window._wwEngine = window.wwEngine; // legacy alias
  });

})();