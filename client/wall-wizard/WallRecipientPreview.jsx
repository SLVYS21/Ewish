import { useState, useEffect, useRef } from 'react';
import { Gift, ArrowRight, Heart, MessageCircle } from 'lucide-react';
import Kado from '../components/Kado/Kado';
import { getEvent, getBackground } from './constants';

const DEMO_WORDS = [
  { name: 'Aïcha',    message: "Que cette nouvelle année t'apporte tout ce que tu mérites. Je pense fort à toi." },
  { name: 'Marc',     message: "On a passé tant de moments géniaux ensemble. Vivement les prochains !" },
  { name: 'La team',  message: "Bravo pour tout ce que tu accomplis. On est fiers de t'avoir avec nous." },
];

/* ══════════════════════════════════════════════════════════
   WallRecipientPreview
   Reproduit dans un cadre l'expérience destinataire :
     1) Panneau intro (titre + phrase + mascotte + bouton Ouvrir)
     2) Mode déballage : particules + reveal
     3) Mode stories : swipe/nav entre les mots démo
   Utilisé dans l'étape 6 du wizard et pourra être réutilisé sur
   /site/wall/:slug lorsque la v2 destinataire arrivera.
   ══════════════════════════════════════════════════════════ */
export default function WallRecipientPreview({
  event, recipient, title, phrase, backgroundId, cagnotteEnabled, cagnotteTitle, cagnotteGoal,
}) {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'unwrap' | 'wall' | 'stories'
  const [storyIdx, setStoryIdx] = useState(0);
  const unwrapTimer = useRef(null);

  const ev = getEvent(event);
  const bg = getBackground(backgroundId);
  const displayTitle = title || ev.title(recipient || '…');
  const displayPhrase = phrase || ev.subtitle(recipient || '');

  const startUnwrap = () => {
    setPhase('unwrap');
    clearTimeout(unwrapTimer.current);
    unwrapTimer.current = setTimeout(() => setPhase('wall'), 1600);
  };

  useEffect(() => () => clearTimeout(unwrapTimer.current), []);

  /* Reset quand la config change (l'utilisateur ajuste dans le wizard) */
  useEffect(() => {
    setPhase('intro');
    setStoryIdx(0);
  }, [event, recipient, backgroundId]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: bg.css,
        color: bg.ink,
        fontFamily: 'var(--mk-font-sans, Inter, sans-serif)',
        overflow: 'hidden',
      }}
    >
      {/* ── Intro ── */}
      {phase === 'intro' && (
        <div style={{
          position: 'absolute', inset: 0, padding: '24px 22px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', gap: 18, animation: 'mkPreviewIn 380ms cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={{
            fontFamily: 'var(--mk-font-mono, DM Mono, monospace)',
            fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
            opacity: 0.85,
          }}>
            {ev.eyebrow}
          </div>
          <Kado size={110} mode="wink" boxColor="#FF5470" ribbonColor="#FFC145" />
          <h2 style={{
            fontFamily: 'var(--mk-font-serif, Fraunces, serif)',
            fontSize: 22, fontStyle: 'italic', fontWeight: 500,
            lineHeight: 1.1, margin: 0, letterSpacing: '-0.01em',
            textShadow: bg.ink === '#FFFFFF' ? '0 2px 16px rgba(0,0,0,0.35)' : 'none',
          }}>
            {displayTitle}
          </h2>
          <p style={{
            fontSize: 13, lineHeight: 1.55, margin: 0, maxWidth: '30ch', opacity: 0.94,
          }}>
            {displayPhrase}
          </p>
          <button
            type="button"
            onClick={startUnwrap}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 22px', borderRadius: 999,
              background: 'linear-gradient(135deg, #FFC145 0%, #FF5470 100%)',
              color: '#FFFFFF',
              border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 10px 22px -6px rgba(255,84,112,0.55)',
            }}
          >
            <Gift size={16} /> Ouvrir les Kados
          </button>
          {cagnotteEnabled && (
            <div style={{
              fontSize: 11, opacity: 0.85, marginTop: 4,
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <Heart size={11} /> {cagnotteTitle || 'Cagnotte'} · Objectif {(cagnotteGoal || 0).toLocaleString('fr-FR')} F
            </div>
          )}
        </div>
      )}

      {/* ── Unwrap ── */}
      {phase === 'unwrap' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'mkFlash 260ms ease-out',
        }}>
          <Kado size={140} mode="confetti" boxColor="#FF5470" ribbonColor="#FFC145" />
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35) 0%, transparent 60%)',
            animation: 'mkUnwrapPulse 1.4s ease-out',
          }} />
        </div>
      )}

      {/* ── Wall (grid des mots démo) ── */}
      {phase === 'wall' && (
        <div style={{
          position: 'absolute', inset: 0, padding: '20px 20px 24px',
          display: 'flex', flexDirection: 'column', gap: 12,
          animation: 'mkPreviewIn 320ms cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={{
            fontFamily: 'var(--mk-font-serif, Fraunces, serif)',
            fontSize: 17, fontStyle: 'italic', textAlign: 'center', letterSpacing: '-0.01em',
            marginBottom: 4,
          }}>
            {displayTitle}
          </div>
          <div style={{
            fontSize: 11, textAlign: 'center', opacity: 0.85,
            marginBottom: 8, letterSpacing: '.02em',
          }}>
            Touche un mot pour le lire en grand
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, overflow: 'hidden' }}>
            {DEMO_WORDS.map((w, i) => (
              <button
                key={i}
                onClick={() => { setStoryIdx(i); setPhase('stories'); }}
                style={{
                  background: 'rgba(255,255,255,0.94)',
                  color: '#2B2440',
                  border: 'none', borderRadius: 12, padding: '11px 12px',
                  textAlign: 'left', cursor: 'pointer',
                  fontFamily: 'inherit', overflow: 'hidden',
                  boxShadow: '0 4px 10px -4px rgba(0,0,0,0.25)',
                  transform: `rotate(${i % 2 === 0 ? '-1.2' : '1.2'}deg)`,
                }}
              >
                <div style={{
                  fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.06em',
                  fontWeight: 700, color: '#FF5470', marginBottom: 4,
                }}>
                  {w.name}
                </div>
                <div style={{ fontSize: 11.5, lineHeight: 1.4, color: '#2B2440' }}>
                  {w.message.length > 80 ? w.message.slice(0, 80) + '…' : w.message}
                </div>
              </button>
            ))}
          </div>
          {cagnotteEnabled && (
            <div style={{
              padding: '10px 12px', borderRadius: 12,
              background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Gift size={16} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{cagnotteTitle || 'Cagnotte'}</div>
                <div style={{
                  height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.2)',
                  overflow: 'hidden', marginTop: 4,
                }}>
                  <div style={{
                    width: '46%', height: '100%', borderRadius: 999,
                    background: 'linear-gradient(90deg, #FF5470, #FFC145)',
                  }} />
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700 }}>46%</span>
            </div>
          )}
        </div>
      )}

      {/* ── Stories mode (lecture d'un mot en grand) ── */}
      {phase === 'stories' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column',
          animation: 'mkPreviewIn 260ms ease-out',
        }}>
          {/* barres de progression stories */}
          <div style={{ display: 'flex', gap: 4, padding: '12px 12px 8px' }}>
            {DEMO_WORDS.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 2.5, borderRadius: 999,
                background: i < storyIdx ? '#fff' : 'rgba(255,255,255,0.3)',
              }}>
                {i === storyIdx && (
                  <div style={{
                    width: '60%', height: '100%', background: '#fff', borderRadius: 999,
                  }} />
                )}
              </div>
            ))}
          </div>
          <div
            onClick={() => {
              const next = storyIdx + 1;
              if (next >= DEMO_WORDS.length) setPhase('wall');
              else setStoryIdx(next);
            }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              justifyContent: 'center', padding: '24px 22px',
              cursor: 'pointer', color: '#fff', textAlign: 'center', gap: 14,
            }}
          >
            <MessageCircle size={26} style={{ opacity: 0.6, alignSelf: 'center' }} />
            <div style={{
              fontFamily: 'var(--mk-font-mono, DM Mono, monospace)',
              fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
              opacity: 0.75,
            }}>
              {DEMO_WORDS[storyIdx].name}
            </div>
            <div style={{
              fontFamily: 'var(--mk-font-serif, Fraunces, serif)',
              fontSize: 18, fontStyle: 'italic', fontWeight: 500,
              lineHeight: 1.45,
            }}>
              « {DEMO_WORDS[storyIdx].message} »
            </div>
            <div style={{ fontSize: 11, opacity: 0.65, marginTop: 6 }}>
              Touche pour voir le suivant
            </div>
          </div>
          <button
            onClick={() => { setPhase('wall'); setStoryIdx(0); }}
            style={{
              alignSelf: 'center', margin: '0 0 18px',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.28)',
              padding: '8px 18px', borderRadius: 999,
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            Revenir au mur <ArrowRight size={12} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes mkPreviewIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mkFlash {
          0%   { background: rgba(255,255,255,0); }
          50%  { background: rgba(255,255,255,0.35); }
          100% { background: rgba(255,255,255,0); }
        }
        @keyframes mkUnwrapPulse {
          0%   { transform: scale(0.6); opacity: 0.9; }
          80%  { transform: scale(1.6); opacity: 0.4; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
