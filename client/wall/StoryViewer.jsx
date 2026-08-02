import React, { useEffect, useState, useRef, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import AnimatedBackground, { BG_VARIANT_KEYS } from './AnimatedBackground';
import AudioWavePlayer from './AudioWavePlayer';
import { cldStory } from '../utils/cloudinary';

/* Séquence aléatoire de fonds  recalculée à chaque ouverture pour
   éviter la même suite à chaque visite. Contrainte : pas deux fonds
   identiques consécutifs. Si le nombre de wishes dépasse les 30
   variantes, on répète mais toujours en évitant l'adjacent. */
function pickBgSequence(count, allKeys) {
  if (!count || !allKeys.length) return [];
  const out = [];
  let last = null;
  for (let i = 0; i < count; i++) {
    const pool = last ? allKeys.filter(k => k !== last) : allKeys;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    out.push(pick);
    last = pick;
  }
  return out;
}

function StoryViewer({ wishes, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const mediaRef = useRef(null);

  /* Séquence de fonds figée pour cette instance du viewer  évite que
     le bg change à chaque re-render pendant la navigation entre slides
     (utilisation de useMemo avec wishes.length comme dep, plus stable
     que Math.random appelé dans le map). */
  const bgSequence = useMemo(
    () => pickBgSequence(wishes.length, BG_VARIANT_KEYS),
    [wishes.length]
  );

  const currentWish = wishes[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setMediaDuration(null);
    setIsPaused(false);
  }, [initialIndex]);

  useEffect(() => {
    if (mediaRef.current) {
      if (isPaused) {
        mediaRef.current.pause();
      } else {
        const p = mediaRef.current.play();
        if (p && p.catch) p.catch(() => {});
      }
    }
  }, [isPaused, currentIndex]);

  useEffect(() => {
    clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      if (isPaused) return;
      
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          handleNext();
          return 100;
        }
        const currentDuration = mediaDuration || 6000;
        const increment = (60 / currentDuration) * 100;
        return prev + increment;
      });
    }, 60);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isPaused, mediaDuration]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < wishes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose(); // End of stories
    }
  };

  if (!currentWish) return null;

  return (
    <div 
      id="story-viewer" 
      className="open"
      onPointerDown={() => setIsPaused(true)}
      onPointerUp={() => setIsPaused(false)}
      onPointerLeave={() => setIsPaused(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="story-bars">
        {wishes.map((_, idx) => (
          <i key={idx} className={idx < currentIndex ? 'done' : idx === currentIndex ? 'active' : ''}>
            <b style={idx === currentIndex ? { width: `${progress}%`, animation: 'none' } : {}} />
          </i>
        ))}
      </div>
      <div className="story-count">{currentIndex + 1} / {wishes.length}</div>
      <button id="story-close" onClick={onClose} aria-label="Fermer">
        <X size={20} />
      </button>
      
      <button className="story-arrow left" onClick={handlePrev} disabled={currentIndex === 0}>
        <ChevronLeft size={26} />
      </button>
      <button className="story-arrow right" onClick={handleNext}>
        <ChevronRight size={26} />
      </button>

      <div className="story-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {wishes.map((wish, idx) => {
          const bgId = bgSequence[idx];
          const emojiCodes = ['1f381', '1f382', '1f49d', '1f389', '1f4ab', '1f942', '1f60d'];
          const emojiCode = emojiCodes[(idx * 3) % emojiCodes.length];
          const corners = [
            { top: '40px', left: '40px' },
            { top: '40px', right: '40px' },
            { bottom: '80px', left: '40px' },
            { bottom: '80px', right: '40px' }
          ];
          const corner = corners[(idx * 7) % corners.length];
          
          return (
            <div key={idx} className="story-slide" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <AnimatedBackground backgroundId={bgId} />
              </div>
              
              {/* Noto Emoji Animé dans un coin */}
              <div style={{ position: 'absolute', zIndex: 10, width: '100px', height: '100px', pointerEvents: 'none', ...corner }}>
                <img 
                  src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${emojiCode}/512.gif`} 
                  alt="" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }} 
                />
              </div>

              <div className="story-card" style={{ zIndex: 1 }}>
                <div className="who">
                  <div className="av" style={{ background: '#B8842A' }}>{wish.firstName?.[0] || '?'}</div>
                  <div>
                    <b>{wish.firstName || 'Anonyme'}</b>
                    {wish.role && <div className="rel">{wish.role}</div>}
                  </div>
                </div>
                <div className={`big-tx${(wish.message || '').length > 300 ? ' is-xl' : (wish.message || '').length > 120 ? ' is-lg' : ''}`}>{wish.message}</div>
                {wish.mediaType === 'sticker' && wish.photoUrl && (
                  <div className="s-media" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', overflow: 'visible', position: 'relative', zIndex: 10 }}>
                    <img src={wish.photoUrl} alt="Sticker" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.18))' }} />
                  </div>
                )}
                {wish.mediaType !== 'sticker' && wish.photoUrl && (
                  <div className="s-media s-photo" style={{ position: 'relative', zIndex: 10 }}>
                    <img className="s-photo-bg" src={cldStory(wish.photoUrl)} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                    <img className="s-photo-fg" src={cldStory(wish.photoUrl)} alt="" loading="lazy" decoding="async" />
                  </div>
                )}
                {wish.videoUrl && (
                  <div className="s-media" style={{ background: '#000', position: 'relative', zIndex: 10 }}>
                    <video 
                      ref={idx === currentIndex ? mediaRef : null}
                      src={wish.videoUrl} 
                      controls 
                      playsInline 
                      autoPlay={idx === currentIndex}
                      onLoadedMetadata={(e) => {
                        if (idx === currentIndex) setMediaDuration(e.target.duration * 1000);
                      }}
                      style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} 
                    />
                  </div>
                )}
                {wish.audioUrl && (
                  <div className="s-media" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', zIndex: 10 }}>
                    <AudioWavePlayer 
                      src={wish.audioUrl} 
                      externalAudioRef={idx === currentIndex ? mediaRef : null}
                      autoPlay={idx === currentIndex}
                      onLoadedMetadataCallback={(e) => {
                        if (idx === currentIndex) setMediaDuration(e.target.duration * 1000);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="story-tap-l" onClick={handlePrev} />
      <div className="story-tap-r" onClick={handleNext} />
      <div className="story-hint">Touche à droite pour le mot suivant · ✕ pour revenir au mur</div>
    </div>
  );
}

export default StoryViewer;
