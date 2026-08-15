/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  WishWell Runtime Engine    ww-engine.js                       ║
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

    // Sections need full viewport coverage for bg wrap to work
    // Don't override position if element is already position:fixed (e.g. notre-film scenes)
    if (isSection) {
      const computedPos = window.getComputedStyle(el).position;
      if (computedPos !== 'fixed') {
        el.style.top      = '0';
        el.style.left     = '0';
        el.style.right    = '0';
        el.style.bottom   = '0';
        el.style.width    = '100%';
        el.style.height   = '100vh';
        el.style.position = 'absolute';
        el.style.overflow = 'hidden';
      } else {
        // Fixed element  just ensure overflow is hidden
        el.style.overflow = 'hidden';
      }
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

  /* ─── Section Resolving ────────────────────────────────────────── */
  const SECTION_FALLBACKS = {
    greeting: '.one, .greeting-section, #section-greeting',
    music: '.music-interlude, #section-music',
    message: '.three, .four, .message-section, .google-section, #section-message',
    ideas: '.five, #section-ideas',
    celebration: '.six, .celebration-section, #section-celebration',
    outro: '.nine, .outro-section, #section-outro'
  };

  function getSectionElement(key) {
    if (key === 'global') return document.body;
    let el = document.querySelector(`[data-section="${key}"]`);
    if (el) return el;
    if (SECTION_FALLBACKS[key]) {
      return document.querySelector(SECTION_FALLBACKS[key]);
    }
    return null;
  }

  /* ─── Visibility Observer ───────────────────────────────────────── */
  function onVisible(element, onShow, onHide) {
    if (element === document.body) {
      onShow();
      return null;
    }

    function check() {
      const style = window.getComputedStyle(element);
      return parseFloat(style.opacity) > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    }

    let currentlyVisible = check();
    if (currentlyVisible) onShow();

    const observer = new MutationObserver(() => {
      const vis = check();
      if (vis && !currentlyVisible) {
        currentlyVisible = true;
        onShow();
      } else if (!vis && currentlyVisible) {
        currentlyVisible = false;
        if (onHide) onHide();
      }
    });

    observer.observe(element, { attributes: true, attributeFilter: ['style', 'class'] });
    return observer;
  }

  /* ─── Apply all section backgrounds ───────────────────────────── */
  function applyBackgrounds(style) {
    const bgs = (style && style.backgrounds) ? style.backgrounds : {};
    const globalBg = bgs['global'];

    if (globalBg && globalBg.value) {
      applyBackground(document.body, globalBg);
    }

    Object.keys(bgs).forEach(key => {
      if (key === 'global') return;
      const bg = bgs[key];
      if (bg && bg.value) {
        const el = getSectionElement(key);
        if (el) applyBackground(el, bg);
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

  /* ─── Mount all decorations ─────────────────────────────────────── */
  function applyDecorations(decos) {
    if (!decos || !decos.length) return;

    // Remove any previously mounted decos
    document.querySelectorAll('.ww-deco').forEach(el => {
      _clearDecoTimers(el);
      if (el._wwObserver) { el._wwObserver.disconnect(); }
      el.remove();
    });

    decos.forEach(deco => {
      const img = document.createElement('img');
      img.src              = deco.src;
      img.alt              = '';
      img.draggable        = false;
      img.className        = 'ww-deco' + (deco.section === 'global' ? ' ww-global' : '');
      img.dataset.decoId   = deco.id;

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
        opacity:    0; /* Hidden until visible */
        z-index:    ${zIdx};
        --ww-rot:   ${rot}deg;
        --ww-opacity: ${op};
        transform:  rotate(${rot}deg);
        pointer-events: none;
      `;

      const sectionEl = getSectionElement(deco.section) || document.body;
      if (sectionEl === document.body) img.classList.add('ww-global');

      const pos = window.getComputedStyle(sectionEl).position;
      if (pos === 'static' && sectionEl !== document.body) sectionEl.style.position = 'relative';
      sectionEl.appendChild(img);

      const showAfter = deco.showAfter != null ? deco.showAfter : 0;
      const hideAfter = deco.hideAfter != null ? deco.hideAfter : 0;
      const anim = deco.animation || 'float';
      
      const DURATIONS = { float:'3s', spin:'6s', pulse:'2s', drift:'5s', pop:'0.6s', shake:'0.6s', swing:'3s', bounce:'2s' };
      const ITERATES  = { float:'infinite', spin:'infinite', pulse:'infinite', drift:'infinite', pop:'1', shake:'1', swing:'infinite', bounce:'infinite' };

      img._wwStart = () => {
        _clearDecoTimers(img);
        img.style.opacity = '0';
        img.style.animation = 'none';
        img.style.display = 'block';
        void img.offsetWidth; // force reflow

        const applyAnim = () => {
          if (anim !== 'none') {
            img.style.animation = `ww-fadein 0.6s both, ww-${anim} ${DURATIONS[anim]||'3s'} 0.6s ${ITERATES[anim]||'infinite'} ease-in-out`;
          } else {
            img.style.animation = 'ww-fadein 0.6s both';
          }
        };

        const totalStartDelay = Math.max(showAfter, delay);
        if (totalStartDelay > 0) {
          img._wwShowTimer = setTimeout(applyAnim, totalStartDelay * 1000);
        } else {
          applyAnim();
        }

        if (hideAfter > 0) {
          img._wwHideTimer = setTimeout(() => _scheduleHide(img, deco), hideAfter * 1000);
        }
      };

      img._wwStop = () => {
        _clearDecoTimers(img);
        img.style.animation = 'none';
        img.style.opacity = '0';
      };

      img._wwObserver = onVisible(sectionEl, () => img._wwStart(), () => img._wwStop());
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
    if (isNaN(ms) || ms < 0) return '';

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
          ${w.author ? '<div class="ww-widget-quote-author"> ' + w.author + '</div>' : ''}
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

  /* ─── Gift (Kado) scratch card ─────────────────────────────────────
     Injecté sur les templates HTML (birthday, notre-film, forever, sanctuary
     et special) quand la publication a un data.gift.enabled avec un montant
     valide. Un FAB rond en bas à droite ouvre une modal contenant une carte
     dorée à gratter (canvas destination-out). Une fois 55% révélé, le foil
     s'efface automatiquement et le montant reste visible. */
  function formatGiftAmount(amount, currency) {
    const n = Number(amount) || 0;
    const parts = n.toLocaleString('fr-FR');
    if (currency === 'EUR') return '€' + parts;
    if (currency === 'USD') return '$' + parts;
    return parts + ' FCFA';
  }
  function mountGift(gift) {
    if (!gift || !gift.enabled || !gift.amount || Number(gift.amount) <= 0) return;
    if (document.getElementById('ww-gift-fab')) return;

    /* Styles injectés une fois */
    if (!document.getElementById('ww-gift-styles')) {
      const st = document.createElement('style');
      st.id = 'ww-gift-styles';
      st.textContent = `
        #ww-gift-fab {
          position: fixed; right: 18px; bottom: 18px; z-index: 999998;
          width: 60px; height: 60px; border-radius: 50%; border: none;
          background: radial-gradient(circle at 30% 30%, #F7DE84 0%, #E0B94A 55%, #B58A2A 100%);
          box-shadow: 0 6px 20px rgba(184,139,42,.5), 0 2px 6px rgba(0,0,0,.15), inset 0 -3px 8px rgba(0,0,0,.15);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 28px; padding: 0;
          animation: ww-gift-pulse 2.4s ease-in-out infinite;
        }
        #ww-gift-fab::after {
          content: ''; position: absolute; inset: -4px; border-radius: 50%;
          border: 2px solid rgba(224,185,74,.55); animation: ww-gift-ring 2.4s ease-out infinite;
        }
        @keyframes ww-gift-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes ww-gift-ring  { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(1.5); opacity: 0; } }
        #ww-gift-modal {
          position: fixed; inset: 0; z-index: 999999;
          background: rgba(15,10,25,.72); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: ww-gift-fadein .25s ease;
        }
        @keyframes ww-gift-fadein { from { opacity: 0; } to { opacity: 1; } }
        .ww-gift-card {
          position: relative; width: 100%; max-width: 340px;
          background: #fff; border-radius: 22px; padding: 24px 22px 26px;
          box-shadow: 0 30px 80px rgba(0,0,0,.4);
          animation: ww-gift-slide .35s cubic-bezier(.22,1.14,.32,1);
          text-align: center; font-family: system-ui,-apple-system,'Segoe UI',sans-serif; color: #221a10;
        }
        @keyframes ww-gift-slide { from { transform: translateY(24px) scale(.95); opacity: 0; } to { transform: none; opacity: 1; } }
        .ww-gift-close {
          position: absolute; top: 10px; right: 10px;
          width: 32px; height: 32px; border-radius: 50%; border: none;
          background: rgba(0,0,0,.06); color: #333; cursor: pointer; font-size: 18px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
        }
        .ww-gift-title { font-size: 1.05rem; font-weight: 800; letter-spacing: .01em; margin: 4px 0 4px; color: #B58A2A; }
        .ww-gift-sub   { font-size: .82rem; color: #6a5a3c; margin: 0 0 16px; line-height: 1.4; }
        .ww-gift-scratch {
          position: relative; width: 260px; height: 150px; margin: 0 auto;
          border-radius: 14px; overflow: hidden;
          background: linear-gradient(135deg,#FFF7D6 0%,#FDE7A5 40%,#FFF0BE 100%);
          box-shadow: inset 0 0 0 2px rgba(184,139,42,.35), 0 6px 22px rgba(184,139,42,.25);
        }
        .ww-gift-reveal {
          position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
          font-weight: 900; color: #B58A2A;
        }
        .ww-gift-amount { font-size: 2rem; letter-spacing: .02em; }
        .ww-gift-label  { font-size: .7rem; text-transform: uppercase; letter-spacing: .18em; color: #A07826; margin-top: 4px; opacity: .8; }
        .ww-gift-canvas { position: absolute; inset: 0; cursor: grab; touch-action: none; }
        .ww-gift-canvas:active { cursor: grabbing; }
        .ww-gift-hint { font-size: .72rem; color: #8a6b2c; margin-top: 10px; letter-spacing: .05em; }
        .ww-gift-msg  { margin-top: 14px; padding: 10px 12px; border-radius: 12px;
          background: rgba(224,185,74,.12); border: 1px dashed rgba(184,139,42,.4);
          font-size: .82rem; color: #5a4318; line-height: 1.45; font-style: italic; }
      `;
      document.head.appendChild(st);
    }

    /* FAB */
    const fab = document.createElement('button');
    fab.id = 'ww-gift-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Cadeau à gratter');
    fab.textContent = '🎁';
    document.body.appendChild(fab);

    let modalOpen = false;
    fab.addEventListener('click', function () {
      if (modalOpen) return;
      modalOpen = true;
      openGiftModal(gift, function () {
        modalOpen = false;
      });
    });
  }

  function openGiftModal(gift, onClose) {
    const overlay = document.createElement('div');
    overlay.id = 'ww-gift-modal';
    overlay.innerHTML = `
      <div class="ww-gift-card" role="dialog" aria-modal="true">
        <button class="ww-gift-close" aria-label="Fermer">×</button>
        <div class="ww-gift-title">Une petite surprise pour toi</div>
        <div class="ww-gift-sub">Gratte la carte dorée pour découvrir ton cadeau</div>
        <div class="ww-gift-scratch">
          <div class="ww-gift-reveal">
            <div class="ww-gift-amount">${formatGiftAmount(gift.amount, gift.currency)}</div>
            <div class="ww-gift-label">Ton cadeau</div>
          </div>
          <canvas class="ww-gift-canvas" width="260" height="150"></canvas>
        </div>
        <div class="ww-gift-hint">Glisse ton doigt / la souris pour révéler</div>
        ${gift.message ? `<div class="ww-gift-msg">${escapeHtml(gift.message)}</div>` : ''}
      </div>
    `;
    document.body.appendChild(overlay);

    function close() {
      overlay.remove();
      if (onClose) onClose();
    }
    overlay.querySelector('.ww-gift-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    const canvas = overlay.querySelector('.ww-gift-canvas');
    setupScratch(canvas);
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function setupScratch(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    /* Foil doré : dégradé + hachures diagonales pour l'effet gratter */
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#F5D976');
    grad.addColorStop(0.5, '#C29A3E');
    grad.addColorStop(1, '#8A6820');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    /* Motif diagonal subtil */
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 1;
    for (let x = -h; x < w; x += 8) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + h, h); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.font = 'bold 12px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('À GRATTER', w / 2, h / 2 + 4);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 34;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let drawing = false;
    let last = null;
    let revealed = false;

    function pointFromEvent(e) {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return {
        x: (t.clientX - rect.left) * (w / rect.width),
        y: (t.clientY - rect.top)  * (h / rect.height),
      };
    }

    function checkReveal() {
      if (revealed) return;
      const img = ctx.getImageData(0, 0, w, h).data;
      let cleared = 0;
      const step = 16; /* échantillonnage */
      for (let i = 3; i < img.length; i += step * 4) {
        if (img[i] === 0) cleared++;
      }
      const total = img.length / (step * 4);
      if (cleared / total > 0.55) {
        revealed = true;
        /* Clear the rest en douceur */
        canvas.style.transition = 'opacity .5s ease';
        canvas.style.opacity = '0';
      }
    }

    function start(e) {
      e.preventDefault();
      drawing = true;
      last = pointFromEvent(e);
    }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      const p = pointFromEvent(e);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    }
    function end() {
      if (!drawing) return;
      drawing = false;
      last = null;
      checkReveal();
    }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
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
        btn.textContent = br.label || 'Crée le tien sur myKado ✨';
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

    function applyEnvelope(style) {
      // Ne pas bloquer l'éditeur (iframe)
      if (window.self !== window.top) return;
      var theme = style.envelopeTheme;
      if (!theme || theme === 'none') return;

      var overlay = document.createElement('div');
      overlay.id = 'ww-envelope-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:var(--bg, #FAF7F0);overflow:hidden;cursor:pointer;';
      
      var content = document.createElement('div');
      content.style.cssText = 'position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;';
      
      if (theme === 'youth') {
        overlay.style.background = 'radial-gradient(circle, #ffeaf2, #ffb3c6)';
        content.innerHTML = '<div style="font-size:5rem;filter:drop-shadow(0 10px 15px rgba(255,0,100,0.3));animation:ww-bounce 1s infinite alternate;">🎁</div><div style="margin-top:20px;font-family:var(--font);font-weight:700;color:#d81159;font-size:1.2rem;letter-spacing:1px;">Ouvrir la surprise</div>';
      } else if (theme === 'pro') {
        overlay.style.background = '#1A1C23';
        content.innerHTML = '<div style="width:80px;height:80px;background:#8c2323;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 10px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.4);border:2px solid #5a1414;color:#e8c060;font-size:2rem;font-family:serif;font-style:italic;">M</div><div style="margin-top:24px;font-family:var(--font);color:#E8A33D;font-size:0.9rem;letter-spacing:4px;text-transform:uppercase;">Briser le sceau</div>';
      } else if (theme === 'casual') {
        overlay.style.background = '#e9e1d3';
        content.innerHTML = '<div style="width:200px;height:280px;background:#fff;border-radius:8px;box-shadow:0 15px 35px rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;border-left:4px solid #d4c5b0;font-family:var(--font);color:#5c5447;font-size:1.1rem;">Ouvrir la carte</div>';
      }

      overlay.appendChild(content);
      document.body.appendChild(overlay);
      
      // Pause master timeline
      var poll = setInterval(function() {
        if (window._ww_tl) {
          window._ww_tl.pause();
          window._ww_tl.progress(0);
          clearInterval(poll);
        }
      }, 20);

      overlay.addEventListener('click', function() {
        // Simple opening animation
        if (typeof TweenMax !== 'undefined') {
          if (theme === 'youth') {
            if (window.confetti) window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
            TweenMax.to(content, 0.4, { scale: 1.5, opacity: 0, ease: Power2.easeIn });
            TweenMax.to(overlay, 0.6, { opacity: 0, delay: 0.3, onComplete: finish });
          } else if (theme === 'pro') {
            TweenMax.to(content, 0.5, { scale: 2, opacity: 0 });
            TweenMax.to(overlay, 1, { y: '-100%', ease: Power3.easeInOut, delay: 0.2, onComplete: finish });
          } else {
            TweenMax.to(content, 0.8, { rotationY: -90, transformOrigin: "left center", opacity: 0, ease: Power2.easeIn });
            TweenMax.to(overlay, 0.6, { opacity: 0, delay: 0.5, onComplete: finish });
          }
        } else {
          finish();
        }

        function finish() {
          overlay.remove();
          if (window._ww_tl) window._ww_tl.play();
        }
      });
    }

    // FIX: Remove the deprecated SVG intro overlay if it still exists in the HTML
    const oldIntro = document.getElementById('intro-overlay');
    if (oldIntro) oldIntro.remove();
    
    applyBackgrounds(style);
    applyDecorations(decos);
    applyEnvelope(style);
    mountGift(window.__WW_DATA__ && window.__WW_DATA__.gift);

    window.addEventListener('message', handleLiveUpdate);

    // Expose for manual re-runs (e.g. after GSAP reveals a section)
    // Expose as window.wwEngine  all templates call window.wwEngine.init() / .applyLiveUpdate()
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
          if (style.fontFamily) {
            root.style.setProperty('--font',   `'${style.fontFamily}', sans-serif`);
            root.style.setProperty('--font-b', `'${style.fontFamily}', sans-serif`);
          }
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