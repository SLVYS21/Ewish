import { useState, useEffect, useRef, useMemo } from 'react';
import s from './Kado.module.css';

/* ══════════════════════════════════════════════════════════════════
   Kado — mascotte myKado
   Modes : idle | jump | shake | wink | confetti | sleep
           | roll | love | drop | levitate | logo
   ══════════════════════════════════════════════════════════════════ */

function shade(hex, f) {
  let h = (hex || '#FF5470').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const m = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return '#' + [m(r), m(g), m(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

/* ── Face paths ── */
const MOUTH_IDLE  = 'M110 240 Q130 246 150 240 Q130 262 110 240 Z';
const MOUTH_HAPPY = 'M104 236 Q130 240 156 236 Q130 272 104 236 Z';

/* ── Star icon reused across sparkles ── */
function Star({ className, width = 24, height = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={width} height={height} className={className}>
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
    </svg>
  );
}

/* ── Heart icon ── */
function Heart({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M12 21 C6 16 2.5 12.5 2.5 8.8 C2.5 6 4.7 4 7.3 4 C9 4 10.8 5 12 6.8 C13.2 5 15 4 16.7 4 C19.3 4 21.5 6 21.5 8.8 C21.5 12.5 18 16 12 21 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Kado base body — shared SVG (feet + box + ribbon + face)
   ══════════════════════════════════════════════════════════════════ */
function KadoBody({ eyeState, faceOverride, showFeet = true, showBlush = true }) {
  /* eyeState : { blink: bool, lookX: num, lookY: num, happy: bool } */
  const { blink, lookX, lookY, happy } = eyeState || { blink: false, lookX: 0, lookY: 0, happy: false };
  const eyeScaleY = blink ? 0.1 : 1;
  const mouthPath = happy ? MOUTH_HAPPY : MOUTH_IDLE;

  return (
    <>
      {/* Feet */}
      {showFeet && (
        <>
          <ellipse cx="96" cy="286" rx="20" ry="12" fill="var(--k-box-edge)" />
          <ellipse cx="164" cy="286" rx="20" ry="12" fill="var(--k-box-edge)" />
        </>
      )}

      {/* Box body */}
      <rect x="46" y="140" width="168" height="146" rx="26" fill="var(--k-box)" />
      <rect x="46" y="140" width="168" height="18" rx="9" fill="#FFFFFF" opacity=".14" />

      {/* Lid */}
      <rect x="32" y="96" width="196" height="52" rx="22" fill="var(--k-box-dark)" />
      <rect x="32" y="96" width="196" height="16" rx="8" fill="#FFFFFF" opacity=".16" />

      {/* Vertical ribbon */}
      <rect x="112" y="96" width="36" height="190" fill="var(--k-ribbon)" />
      <rect x="112" y="96" width="14" height="190" fill="#FFFFFF" opacity=".18" />

      {/* Bow */}
      <path d="M130 78 C104 52 68 56 78 80 C85 97 118 90 130 78 Z" fill="var(--k-ribbon)" />
      <path d="M130 78 C156 52 192 56 182 80 C175 97 142 90 130 78 Z" fill="var(--k-ribbon)" />
      <path d="M130 78 C104 52 68 56 78 80 C90 74 112 74 130 78 Z" fill="#FFFFFF" opacity=".2" />
      <path d="M130 78 C156 52 192 56 182 80 C170 74 148 74 130 78 Z" fill="#FFFFFF" opacity=".2" />
      <ellipse cx="130" cy="80" rx="15" ry="13" fill="var(--k-ribbon-dark)" />

      {/* Blush */}
      {showBlush && (
        <>
          <ellipse cx="76"  cy="228" rx="15" ry="9" fill={happy ? '#FF9FB0' : '#FFB3C0'} className={s.blush} />
          <ellipse cx="184" cy="228" rx="15" ry="9" fill={happy ? '#FF9FB0' : '#FFB3C0'} className={`${s.blush} ${s.blushDelay}`} />
        </>
      )}

      {/* Face — Eyes */}
      {faceOverride === 'sleep' ? (
        <>
          <path d="M88 208 Q100 216 112 208" stroke="var(--k-ink)" strokeWidth="4.6" fill="none" strokeLinecap="round" />
          <path d="M148 208 Q160 216 172 208" stroke="var(--k-ink)" strokeWidth="4.6" fill="none" strokeLinecap="round" />
        </>
      ) : happy ? (
        <>
          <path d="M84 210 Q100 190 116 210" stroke="var(--k-ink)" strokeWidth="5.5" fill="none" strokeLinecap="round" />
          <path d="M144 210 Q160 190 176 210" stroke="var(--k-ink)" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformBox: 'fill-box', transformOrigin: '100px 206px' }} className={s.eyeAnim}>
            <circle cx="100" cy="206" r="18" fill="#FFFFFF" />
            <g style={{ transform: `translate(${lookX}px, ${lookY}px)` }} className={s.pupil}>
              <circle cx="100" cy="206" r="10" fill="var(--k-ink)" />
              <circle cx="104" cy="202" r="3.4" fill="#FFFFFF" />
            </g>
          </g>
          <g style={{ transform: `scaleY(${eyeScaleY})`, transformBox: 'fill-box', transformOrigin: '160px 206px' }} className={s.eyeAnim}>
            <circle cx="160" cy="206" r="18" fill="#FFFFFF" />
            <g style={{ transform: `translate(${lookX}px, ${lookY}px)` }} className={s.pupil}>
              <circle cx="160" cy="206" r="10" fill="var(--k-ink)" />
              <circle cx="164" cy="202" r="3.4" fill="#FFFFFF" />
            </g>
          </g>
        </>
      )}

      {/* Mouth (with breathe animation wrapper) */}
      {faceOverride !== 'sleep' && (
        <g className={s.breathe}>
          {happy && <ellipse cx="130" cy="252" rx="13" ry="9" fill="var(--k-tongue)" />}
          <path d={mouthPath} fill="var(--k-ink)" />
        </g>
      )}
      {faceOverride === 'sleep' && (
        <path d="M118 246 Q130 254 142 246" stroke="var(--k-ink)" strokeWidth="4.4" fill="none" strokeLinecap="round" />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Waving hand (mode="wink")
   ══════════════════════════════════════════════════════════════════ */
function WavingHand() {
  return (
    <g className={s.modeWave}>
      <rect x="212" y="180" width="20" height="52" rx="10" fill="var(--k-box)" />
      <circle cx="230" cy="176" r="16" fill="var(--k-blush-hot)" />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Confetti overlay
   ══════════════════════════════════════════════════════════════════ */
function ConfettiOverlay() {
  return (
    <div className={s.overlayScope}>
      <span className={`${s.confettiPiece} ${s.cp1}`} />
      <span className={`${s.confettiPiece} ${s.cp2}`} />
      <span className={`${s.confettiPiece} ${s.cp3}`} />
      <span className={`${s.confettiPiece} ${s.cp4}`} />
      <span className={`${s.confettiPiece} ${s.cp5}`} />
      <span className={`${s.confettiPiece} ${s.cp6}`} />
      <span className={`${s.confettiPiece} ${s.cp7}`} />
      <span className={`${s.confettiPiece} ${s.cp8}`} />
      <span className={`${s.confettiPiece} ${s.cp9}`} />
      <span className={`${s.confettiPiece} ${s.cp10}`} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Zzz overlay (mode="sleep")
   ══════════════════════════════════════════════════════════════════ */
function ZzzOverlay() {
  return (
    <div className={s.overlay}>
      <span className={`${s.zzz} ${s.z1}`}>Z</span>
      <span className={`${s.zzz} ${s.z2}`}>Z</span>
      <span className={`${s.zzz} ${s.z3}`}>Z</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Hearts overlay (mode="love")
   ══════════════════════════════════════════════════════════════════ */
function HeartsOverlay() {
  return (
    <div className={s.overlayScope}>
      <Heart className={`${s.heart} ${s.h1}`} />
      <Heart className={`${s.heart} ${s.h2}`} />
      <Heart className={`${s.heart} ${s.h3}`} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Orbit stars (mode="levitate")
   ══════════════════════════════════════════════════════════════════ */
function OrbitOverlay() {
  return (
    <div className={s.overlay}>
      <div className={s.sparkleAnchor}>
        <Star className={`${s.orbitStar} ${s.os1}`} width={18} height={18} />
        <Star className={`${s.orbitStar} ${s.os2}`} width={14} height={14} />
        <Star className={`${s.orbitStar} ${s.os3}`} width={16} height={16} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Twinkle sparkles (mode="idle" — ambient)
   ══════════════════════════════════════════════════════════════════ */
function TwinkleOverlay() {
  return (
    <div className={s.overlay}>
      <Star className={`${s.twinkle} ${s.tw1}`} />
      <Star className={`${s.twinkle} ${s.tw2}`} />
      <Star className={`${s.twinkle} ${s.tw3}`} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Main Kado component
   ══════════════════════════════════════════════════════════════════ */
export default function Kado({
  mode = 'idle',
  size = 200,
  boxColor = '#FF5470',
  ribbonColor = '#FFC145',
  speed = 1,
  ambient = false,
  className = '',
  style = {},
  onClick,
  cycle = null,        // Array of modes to rotate through, e.g. ['jump','wink','confetti','love','drop']
  cycleInterval = 4200, // ms per mode
}) {
  /* ── Cycle rotation ── */
  const cycleActive = Array.isArray(cycle) && cycle.length > 0;
  const [cycleIdx, setCycleIdx] = useState(0);

  useEffect(() => {
    if (!cycleActive) return;
    const id = setInterval(() => {
      setCycleIdx(i => (i + 1) % cycle.length);
    }, cycleInterval);
    return () => clearInterval(id);
  }, [cycleActive, cycleInterval, cycle]);

  /* ── Active mode = cycled mode if active, else static mode ── */
  const activeMode = cycleActive ? cycle[cycleIdx] : mode;

  /* ── Idle micro-behaviors (blink + look + happy) ── */
  const [eyeState, setEyeState] = useState({ blink: false, lookX: 0, lookY: 0, happy: false });
  const isIdle = activeMode === 'idle' || (mode === 'logo' && !cycleActive);
  const isLogo = mode === 'logo';
  const timers = useRef([]);

  useEffect(() => {
    if (!isIdle) return;
    const wait = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };
    const rnd  = (a, b) => a + Math.random() * (b - a);
    let cancelled = false;

    const setSafe = (patch) => { if (!cancelled) setEyeState(prev => ({ ...prev, ...patch })); };

    const loopBlink = () => wait(() => {
      setEyeState(prev => {
        if (prev.happy) { loopBlink(); return prev; }
        wait(() => setSafe({ blink: false }), 120);
        if (Math.random() < 0.35) {
          wait(() => setSafe({ blink: true }),  270);
          wait(() => setSafe({ blink: false }), 390);
        }
        loopBlink();
        return { ...prev, blink: true };
      });
    }, rnd(2200, 4800));

    const dirs = [[-7, 0], [7, 0], [0, 5], [-6, 4], [6, 4], [0, -4]];
    const loopLook = () => wait(() => {
      setEyeState(prev => {
        if (prev.happy) { loopLook(); return prev; }
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        wait(() => setSafe({ lookX: 0, lookY: 0 }), rnd(900, 1500));
        loopLook();
        return { ...prev, lookX: d[0], lookY: d[1] };
      });
    }, rnd(2600, 5200));

    const loopHappy = () => wait(() => {
      setSafe({ happy: true, blink: false, lookX: 0, lookY: 0 });
      wait(() => setSafe({ happy: false }), rnd(1500, 2100));
      loopHappy();
    }, rnd(5500, 9000));

    loopBlink();
    loopLook();
    loopHappy();

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [isIdle]);

  /* ── CSS variables setup ── */
  const cssVars = useMemo(() => ({
    '--k-box':         boxColor,
    '--k-box-dark':    shade(boxColor, -0.16),
    '--k-box-edge':    shade(boxColor, -0.28),
    '--k-ribbon':      ribbonColor,
    '--k-ribbon-dark': shade(ribbonColor, -0.18),
    '--k-spd':         speed,
    width:  size,
    height: size,
    ...style,
  }), [boxColor, ribbonColor, speed, size, style]);

  /* ── Shape body wrapper by activeMode ── */
  const bodyMode = {
    idle:     { wrapperCls: null,           extraShadow: false, faceOverride: null },
    logo:     { wrapperCls: null,           extraShadow: false, faceOverride: null },
    jump:     { wrapperCls: s.modeJump,     extraShadow: true,  faceOverride: null },
    shake:    { wrapperCls: s.modeShake,    extraShadow: false, faceOverride: null },
    wink:     { wrapperCls: null,           extraShadow: false, faceOverride: null },
    confetti: { wrapperCls: s.modeCheer,    extraShadow: false, faceOverride: null },
    sleep:    { wrapperCls: s.modeSleepBreath, extraShadow: false, faceOverride: 'sleep' },
    roll:     { wrapperCls: s.modeRoll,     extraShadow: false, faceOverride: null },
    love:     { wrapperCls: s.modeLovePulse, extraShadow: false, faceOverride: null },
    drop:     { wrapperCls: s.modeDrop,     extraShadow: false, faceOverride: null },
    levitate: { wrapperCls: s.modeLevitate, extraShadow: false, faceOverride: null },
  }[activeMode] || { wrapperCls: null, extraShadow: false, faceOverride: null };

  const showFeet   = activeMode !== 'roll' && !isLogo;
  const forceHappy = activeMode === 'confetti' || activeMode === 'love' || activeMode === 'jump';
  const currentEyeState = forceHappy
    ? { blink: false, lookX: 0, lookY: 0, happy: true }
    : (isIdle ? eyeState : { blink: false, lookX: 0, lookY: 0, happy: false });

  /* Compact viewBox for logo (no shadow band, no feet, room for bob) */
  const viewBox = isLogo ? '0 30 260 240' : '0 0 260 320';

  return (
    <span
      className={`${s.kado} ${isLogo ? s.kadoLogo : ''} ${className}`}
      style={cssVars}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Kado' : undefined}
    >
      <svg viewBox={viewBox} width={size} height={size} className={s.svg}>
        {/* Ground shadow — hidden in logo & levitate modes */}
        {!isLogo && activeMode !== 'levitate' && (
          <ellipse
            cx="130" cy="300" rx="88" ry="15"
            fill="var(--k-ink)"
            opacity=".16"
            className={bodyMode.extraShadow ? s.modeJumpShadow : (isIdle ? s.shadow : undefined)}
          />
        )}
        {activeMode === 'levitate' && (
          <ellipse cx="130" cy="300" rx="60" ry="12" fill="#7C5CFF" opacity=".18" />
        )}

        {/* Bob / mode wrapper — key changes on cycle to restart animation cleanly */}
        <g className={isIdle ? s.bob : undefined}>
          <g key={cycleActive ? `${cycleIdx}-${activeMode}` : activeMode}
             className={isIdle ? s.wiggle : bodyMode.wrapperCls}>
            <KadoBody eyeState={currentEyeState} showFeet={showFeet} faceOverride={bodyMode.faceOverride} />
            {activeMode === 'wink' && <WavingHand />}
          </g>
        </g>
      </svg>

      {ambient && isIdle && <TwinkleOverlay />}
      {activeMode === 'confetti' && <ConfettiOverlay key={`conf-${cycleIdx}`} />}
      {activeMode === 'sleep'    && <ZzzOverlay />}
      {activeMode === 'love'     && <HeartsOverlay key={`love-${cycleIdx}`} />}
      {activeMode === 'levitate' && <OrbitOverlay />}
      {activeMode === 'shake'    && <span className={s.qMark}>?</span>}
    </span>
  );
}
