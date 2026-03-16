/* ============================================================
   JAR OF WORDS  ·  eWishWell
   A cosy, animated jar you can shake to get warm messages.
   Usage: JarOfWords.init({ words: [...], recipientName: 'Marie', theme: 'pink' | 'gold' | 'mint' })
   ============================================================ */

window.JarOfWords = (() => {

  /* ── Default word pools per theme ── */
  const POOLS = {
    birthday: [
      "Tu mérites tout le bonheur du monde 🎂",
      "Une nouvelle année pleine de magie t'attend ✨",
      "Tu vieillis en beauté — comme du bon vin 🍷",
      "Que tous tes rêves deviennent réels 🌟",
      "Tu rends la vie de ceux qui t'entourent plus belle 💛",
      "Continue d'être exactement toi — c'est parfait 🌸",
      "Cette année sera la meilleure de toutes 🎉",
      "Tu as le don de rendre les gens heureux ☀️",
      "Chaque âge que tu atteins te va à merveille 💫",
      "Garde ton sourire — il illumine tout 😊",
      "Le monde est meilleur avec toi dedans 🌍",
      "Ta joie est contagieuse — ne change rien 🦋",
    ],
    special: [
      "Tu es une force tranquille qui inspire 🌿",
      "Chaque jour avec toi est un cadeau 🎁",
      "Tu as changé ma vie en mieux 💙",
      "Ta présence est un bonheur rare ✨",
      "Je suis tellement fier(e) de toi 🌟",
      "Tu mérites tout ce que la vie a de beau 🌺",
      "Ta force m'inspire chaque jour 💪",
      "Merci d'exister exactement comme tu es 🙏",
      "Tu es irrempla­çable — et tu le sais 👑",
      "Avec toi, même les jours ordinaires brillent ☀️",
      "Je t'aime plus que les mots ne peuvent le dire 💖",
      "Ta lumière guide ceux qui t'entourent 🕯️",
    ],
  };

  /* ── Pastel color palettes per slip ── */
  const SLIP_COLORS = [
    { bg: '#ffd6e0', text: '#c2185b' },
    { bg: '#fff3cd', text: '#b8860b' },
    { bg: '#d4f1c8', text: '#2e7d32' },
    { bg: '#d0e8ff', text: '#1565c0' },
    { bg: '#f3d9ff', text: '#7b1fa2' },
    { bg: '#ffe0b2', text: '#e65100' },
    { bg: '#e0f7fa', text: '#00695c' },
    { bg: '#fce4ec', text: '#ad1457' },
  ];

  /* ── State ── */
  let words = [];
  let drawn = [];
  let currentWord = null;

  /* ── DOM refs ── */
  let overlay, jar, slipEl, slipText, shakeBtn, closeBtn, pickBtn, progressEl;

  /* ────────────────────────────────────────────
     BUILD HTML
  ──────────────────────────────────────────── */
  function buildDOM() {
    const style = document.createElement('style');
    style.textContent = `
      /* ── Trigger button ── */
      #jar-trigger {
        position: fixed; bottom: 28px; right: 28px; z-index: 8000;
        background: linear-gradient(135deg, #ff9eb5, #ffcf77);
        border: none; border-radius: 99px;
        padding: 12px 22px 12px 16px;
        font-family: inherit; font-size: 0.88rem; font-weight: 600;
        color: #fff; cursor: pointer; display: none;
        box-shadow: 0 8px 28px rgba(255,120,160,0.4);
        transition: transform 0.2s, box-shadow 0.2s;
        animation: jar-pulse 2.5s ease-in-out infinite;
        gap: 7px; align-items: center;
      }
      #jar-trigger:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 14px 36px rgba(255,120,160,0.5); animation: none; }
      @keyframes jar-pulse {
        0%,100% { transform: translateY(0) scale(1); }
        50%      { transform: translateY(-5px) scale(1.03); }
      }

      /* ── Overlay ── */
      #jar-overlay {
        position: fixed; inset: 0; z-index: 9000;
        background: rgba(20,10,30,0.55);
        backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 0.35s;
        padding: 20px;
      }
      #jar-overlay.open { opacity: 1; pointer-events: all; }

      /* ── Modal box ── */
      #jar-modal {
        background: #fffaf5;
        border-radius: 28px;
        padding: 32px 28px 28px;
        width: 100%; max-width: 380px;
        box-shadow: 0 40px 100px rgba(0,0,0,0.25);
        transform: scale(0.92) translateY(24px);
        transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        text-align: center; position: relative;
        overflow: hidden;
      }
      #jar-overlay.open #jar-modal { transform: scale(1) translateY(0); }

      /* ── Deco top band ── */
      #jar-modal::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 5px;
        background: linear-gradient(90deg, #ff9eb5, #ffcf77, #a8edea, #fed6e3);
      }

      /* ── Close ── */
      #jar-close {
        position: absolute; top: 14px; right: 16px;
        background: none; border: none; font-size: 1.1rem;
        color: #bbb; cursor: pointer; line-height: 1;
        transition: color 0.2s, transform 0.2s;
      }
      #jar-close:hover { color: #ff6b9d; transform: rotate(90deg); }

      /* ── Jar SVG ── */
      #jar-svg-wrap {
        position: relative; width: 130px; height: 160px;
        margin: 0 auto 8px; cursor: pointer;
      }
      #jar-svg-wrap:hover #jar-body { filter: brightness(1.04); }

      /* Slips inside jar - decorative */
      .jar-slip-deco {
        position: absolute; border-radius: 4px;
        transition: transform 0.4s ease;
      }

      /* ── Headline ── */
      #jar-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 1.35rem; font-weight: 700;
        color: #2d1b3d; margin-bottom: 4px;
        line-height: 1.2;
      }
      #jar-subtitle {
        font-size: 0.75rem; color: #b0a0b8;
        margin-bottom: 20px; line-height: 1.4;
      }

      /* ── Slip card ── */
      #jar-slip {
        min-height: 90px;
        border-radius: 16px; padding: 18px 20px;
        margin: 0 auto 18px;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.95rem; font-weight: 500; line-height: 1.55;
        transform: rotate(0deg);
        transition: opacity 0.25s, transform 0.3s;
        opacity: 0;
        position: relative; overflow: hidden;
      }
      #jar-slip.visible { opacity: 1; }
      #jar-slip.exit { opacity: 0; transform: translateY(-12px) rotate(3deg); }
      #jar-slip::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 3px;
        background: rgba(255,255,255,0.5);
        border-radius: 99px;
      }

      /* ── Progress dots ── */
      #jar-progress {
        display: flex; gap: 6px; justify-content: center;
        margin-bottom: 18px; flex-wrap: wrap;
      }
      .jar-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #e8e0ef; transition: background 0.3s, transform 0.2s;
      }
      .jar-dot.drawn { background: linear-gradient(135deg,#ff9eb5,#ffcf77); transform: scale(1.2); }

      /* ── Buttons ── */
      #jar-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
      #jar-pick-btn {
        background: linear-gradient(135deg,#ff9eb5,#ffcf77);
        border: none; border-radius: 99px;
        padding: 12px 28px; font-family: inherit;
        font-size: 0.88rem; font-weight: 700;
        color: #fff; cursor: pointer;
        box-shadow: 0 6px 20px rgba(255,120,160,0.35);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      #jar-pick-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(255,120,160,0.45); }
      #jar-pick-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
      #jar-shake-btn {
        background: #f5eeff; border: 1.5px solid #ddd0f0;
        border-radius: 99px; padding: 11px 20px;
        font-family: inherit; font-size: 0.82rem; font-weight: 600;
        color: #9b59b6; cursor: pointer;
        transition: background 0.2s;
      }
      #jar-shake-btn:hover { background: #ede0ff; }

      /* ── Shake animation ── */
      @keyframes jar-shake {
        0%,100% { transform: rotate(0deg); }
        20%      { transform: rotate(-8deg) scale(1.05); }
        40%      { transform: rotate(8deg)  scale(1.05); }
        60%      { transform: rotate(-5deg); }
        80%      { transform: rotate(5deg); }
      }
      #jar-svg-wrap.shaking { animation: jar-shake 0.55s ease; }

      /* ── Empty state ── */
      #jar-empty {
        display: none; text-align: center; padding: 12px 0;
        font-size: 0.85rem; color: #b0a0b8;
      }
      #jar-refill-btn {
        background: none; border: none; color: #ff9eb5;
        font-family: inherit; font-size: 0.82rem; font-weight: 600;
        cursor: pointer; text-decoration: underline; margin-top: 6px;
        display: block; margin: 8px auto 0;
      }

      @media (max-width: 420px) {
        #jar-modal { padding: 28px 18px 22px; }
        #jar-title { font-size: 1.15rem; }
      }
    `;
    document.head.appendChild(style);

    /* Trigger button */
    const trigger = document.createElement('button');
    trigger.id = 'jar-trigger';
    trigger.innerHTML = 'Jar of Words';
    trigger.style.display = 'none';
    trigger.addEventListener('click', open);
    document.body.appendChild(trigger);

    /* Overlay */
    overlay = document.createElement('div');
    overlay.id = 'jar-overlay';
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.innerHTML = `
      <div id="jar-modal">
        <button id="jar-close">✕</button>

        <!-- Jar SVG -->
        <div id="jar-svg-wrap" title="Secoue le bocal !">
          <svg width="130" height="160" viewBox="0 0 130 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Lid -->
            <rect x="28" y="8" width="74" height="22" rx="8" fill="#d4a843" opacity="0.9"/>
            <rect x="32" y="12" width="66" height="14" rx="5" fill="#e8c060"/>
            <!-- Jar body -->
            <path id="jar-body" d="M22 34 Q18 40 18 50 L18 140 Q18 152 30 152 L100 152 Q112 152 112 140 L112 50 Q112 40 108 34 Z"
              fill="#fff8f0" stroke="#f0d9b0" stroke-width="2"/>
            <!-- Shine -->
            <path d="M30 50 Q28 70 28 100" stroke="rgba(255,255,255,0.7)" stroke-width="5" stroke-linecap="round"/>
            <!-- Slips inside (decorative, colored rectangles) -->
            <rect x="35" y="110" width="38" height="14" rx="4" fill="#ffd6e0" opacity="0.85" class="jar-slip-inner"/>
            <rect x="58" y="118" width="32" height="12" rx="4" fill="#d0e8ff" opacity="0.85" class="jar-slip-inner"/>
            <rect x="40" y="124" width="30" height="10" rx="3" fill="#d4f1c8" opacity="0.85" class="jar-slip-inner"/>
            <rect x="65" y="105" width="28" height="11" rx="3" fill="#fff3cd" opacity="0.85" class="jar-slip-inner"/>
            <rect x="38" y="98" width="25" height="10" rx="3" fill="#f3d9ff" opacity="0.85" class="jar-slip-inner"/>
            <rect x="60" y="94" width="32" height="10" rx="3" fill="#ffe0b2" opacity="0.8" class="jar-slip-inner"/>
            <rect x="44" y="86" width="28" height="9"  rx="3" fill="#e0f7fa" opacity="0.8" class="jar-slip-inner"/>
            <rect x="68" y="82" width="24" height="9"  rx="3" fill="#fce4ec" opacity="0.8" class="jar-slip-inner"/>
            <!-- Label band -->
            <rect x="30" y="62" width="70" height="22" rx="6" fill="rgba(255,200,150,0.25)" stroke="#f0d0a0" stroke-width="1"/>
            <text x="65" y="77" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#c8860a" font-style="italic">mots doux</text>
          </svg>
        </div>

        <div id="jar-title">Ton bocal de mots 💛</div>
        <div id="jar-subtitle">Pioche un message, un mot à la fois</div>

        <!-- Progress dots -->
        <div id="jar-progress"></div>

        <!-- Slip display -->
        <div id="jar-slip"></div>
        <div id="jar-empty">
          <p>Le bocal est vide 🌸<br>Tous les mots ont été piochés !</p>
          <button id="jar-refill-btn">Remettre tous les mots</button>
        </div>

        <!-- Actions -->
        <div id="jar-actions">
          <button id="jar-pick-btn">🎲 Piocher un mot</button>
          <button id="jar-shake-btn">🫙 Secouer</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    /* Wire up refs */
    slipEl    = overlay.querySelector('#jar-slip');
    slipText  = null; // set when picking
    shakeBtn  = overlay.querySelector('#jar-shake-btn');
    closeBtn  = overlay.querySelector('#jar-close');
    pickBtn   = overlay.querySelector('#jar-pick-btn');
    progressEl = overlay.querySelector('#jar-progress');
    const emptyEl = overlay.querySelector('#jar-empty');
    const refillBtn = overlay.querySelector('#jar-refill-btn');
    const jarWrap = overlay.querySelector('#jar-svg-wrap');

    closeBtn.addEventListener('click', close);
    pickBtn.addEventListener('click', pick);
    shakeBtn.addEventListener('click', () => shake(jarWrap));
    refillBtn.addEventListener('click', () => { drawn = []; renderProgress(); showEmpty(false); pickBtn.disabled = false; slipEl.classList.remove('visible'); });
    jarWrap.addEventListener('click', () => shake(jarWrap));
  }

  /* ────────────────────────────────────────────
     SHAKE
  ──────────────────────────────────────────── */
  function shake(el) {
    el.classList.remove('shaking');
    void el.offsetWidth; // reflow
    el.classList.add('shaking');
    el.addEventListener('animationend', () => el.classList.remove('shaking'), { once: true });
    // Wiggle the inner slips
    el.querySelectorAll('.jar-slip-inner').forEach((s, i) => {
      const dx = (Math.random() - 0.5) * 6;
      const dy = (Math.random() - 0.5) * 4;
      s.style.transform = `translate(${dx}px,${dy}px)`;
      setTimeout(() => s.style.transform = '', 600);
    });
  }

  /* ────────────────────────────────────────────
     PICK A WORD
  ──────────────────────────────────────────── */
  function pick() {
    const available = words.filter(w => !drawn.includes(w));
    if (!available.length) { showEmpty(true); return; }

    // Exit animation if already showing
    if (slipEl.classList.contains('visible')) {
      slipEl.classList.add('exit');
      setTimeout(() => {
        slipEl.classList.remove('exit');
        showWord(available);
      }, 280);
    } else {
      showWord(available);
    }
  }

  function showWord(available) {
    const word = available[Math.floor(Math.random() * available.length)];
    drawn.push(word);
    currentWord = word;

    // Pick color
    const color = SLIP_COLORS[(drawn.length - 1) % SLIP_COLORS.length];
    slipEl.style.background = color.bg;
    slipEl.style.color       = color.text;
    slipEl.textContent       = word;

    // Random slight rotation for handwritten feel
    const rot = (Math.random() - 0.5) * 3;
    slipEl.style.transform = `rotate(${rot}deg)`;

    slipEl.classList.add('visible');
    renderProgress();

    if (drawn.length === words.length) {
      setTimeout(() => { pickBtn.disabled = true; showEmpty(false, true); }, 600);
    }
  }

  /* ── Progress dots ── */
  function renderProgress() {
    progressEl.innerHTML = '';
    words.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'jar-dot' + (i < drawn.length ? ' drawn' : '');
      progressEl.appendChild(dot);
    });
  }

  function showEmpty(replace, append) {
    const emptyEl = overlay.querySelector('#jar-empty');
    if (replace) {
      slipEl.style.opacity = '0';
      emptyEl.style.display = 'block';
      pickBtn.disabled = true;
    } else if (append) {
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
      slipEl.style.opacity = '';
    }
  }

  /* ────────────────────────────────────────────
     OPEN / CLOSE
  ──────────────────────────────────────────── */
  function open() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Shake on open for delight
    setTimeout(() => shake(overlay.querySelector('#jar-svg-wrap')), 350);
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ────────────────────────────────────────────
     PUBLIC INIT
  ──────────────────────────────────────────── */
  function init({ words: customWords, recipientName, theme = 'birthday' } = {}) {
    // Personalise default pool with recipient name
    const pool = (POOLS[theme] || POOLS.birthday).map(w =>
      recipientName ? w.replace(/toi/g, recipientName).replace(/tu /g, `${recipientName} `) : w
    );
    words = customWords && customWords.length ? customWords : pool;
    drawn = [];

    buildDOM();
    renderProgress();

    // Show trigger button (can be called by template at right moment)
    return {
      showTrigger: () => {
        const btn = document.getElementById('jar-trigger');
        if (btn) { btn.style.display = 'inline-flex'; }
      },
      open,
      close,
    };
  }

  return { init };
})();