import Kado from '../components/Kado/Kado';

/* ══════════════════════════════════════════════════════════
   MascotteLoader — pleine page, s'affiche pendant la publication
   du mur (~2s). Fond blanc + halos rose/or, mascotte aux couleurs
   d'origine (rose #FF5470 box + or #FFC145 ruban).
   ══════════════════════════════════════════════════════════ */
export default function MascotteLoader({ message = 'On prépare ton mur…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background:
          'radial-gradient(60% 45% at 50% 40%, rgba(255,193,69,0.28) 0%, rgba(255,255,255,0.96) 55%, #FFFFFF 100%)',
        color: '#2B2440',
        padding: 24,
        animation: 'mkLoaderFadeIn 260ms cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      {/* Halo or */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,193,69,0.55) 0%, rgba(255,193,69,0) 65%)',
          filter: 'blur(4px)',
          animation: 'mkLoaderHalo 2.6s ease-in-out infinite',
        }}
      />
      {/* Halo rose */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,84,112,0.32) 0%, rgba(255,84,112,0) 60%)',
          filter: 'blur(6px)',
          animation: 'mkLoaderHalo 3.2s ease-in-out infinite reverse',
        }}
      />
      {/* Anneau pointillé */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 240,
          height: 240,
          borderRadius: '50%',
          border: '2px dashed rgba(255, 84, 112, 0.42)',
          animation: 'mkLoaderRing 10s linear infinite',
        }}
      />

      <div style={{ position: 'relative' }}>
        <Kado
          size={210}
          boxColor="#FF5470"
          ribbonColor="#FFC145"
          cycle={['jump', 'confetti', 'love', 'wink']}
          cycleInterval={900}
          ambient
        />
      </div>

      <div style={{ textAlign: 'center', maxWidth: '30ch', position: 'relative' }}>
        <div
          style={{
            fontFamily: 'var(--mk-font-serif, Fraunces, serif)',
            fontSize: 26,
            fontStyle: 'italic',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            marginBottom: 6,
            color: '#2B2440',
          }}
        >
          {message}
        </div>
        <div style={{ fontSize: 14, color: '#55506B', lineHeight: 1.5 }}>
          Kado prépare ton mur, saupoudre les confettis et scelle ta cagnotte.
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          width: 220,
          height: 4,
          borderRadius: 999,
          overflow: 'hidden',
          background: '#FFE9EE',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #FF5470, #FFC145, #FF5470)',
            transformOrigin: '0 50%',
            animation: 'mkLoaderBar 1.6s cubic-bezier(0.65,0,0.35,1) infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes mkLoaderFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mkLoaderBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes mkLoaderHalo {
          0%,100% { transform: scale(1); opacity: 0.85; }
          50%     { transform: scale(1.08); opacity: 1; }
        }
        @keyframes mkLoaderRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
