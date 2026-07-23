import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

function AudioWavePlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  // Generate a random-looking static waveform shape
  // We use 30 bars, some tall, some short.
  const numBars = 30;
  const bars = Array.from({ length: numBars }).map((_, i) => {
    // Generate pseudo-random height based on index
    const height = 20 + Math.abs(Math.sin(i * 0.5) * Math.cos(i * 3.1)) * 80;
    return height;
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', background: '#f5f5f5',
      padding: '8px 12px', borderRadius: '40px', width: '100%', maxWidth: '300px',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', boxSizing: 'border-box'
    }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button 
        onClick={togglePlay}
        style={{
          width: '32px', height: '32px', borderRadius: '50%', background: '#1E2952',
          color: '#fff', border: 'none', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', flexShrink: 0
        }}
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
      </button>

      <div 
        onClick={handleSeek}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '2px', height: '24px',
          cursor: 'pointer', position: 'relative'
        }}
      >
        {bars.map((h, i) => {
          const barPercent = (i / numBars) * 100;
          const isActive = barPercent <= progress;
          return (
            <div 
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                background: isActive ? '#1E2952' : '#ccc',
                borderRadius: '2px',
                transition: 'background 0.1s linear',
                opacity: isPlaying && !isActive ? 0.7 + Math.random()*0.3 : 1
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default AudioWavePlayer;
