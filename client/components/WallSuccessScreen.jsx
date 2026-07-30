import { useState } from 'react';
import { Share2, Check, ExternalLink } from 'lucide-react';

export default function WallSuccessScreen({ pub, siteUrl, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!siteUrl) return;
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share && siteUrl) {
      navigator.share({
        title: pub?.title || 'Mur de mots',
        text: 'Laisse un petit mot sur ce mur !',
        url: siteUrl,
      }).catch(err => {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      });
    } else {
      handleCopy();
    }
  };

  const displayUrl = siteUrl ? siteUrl.replace(/^https?:\/\//, '') : '';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#1E2952', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '1040px', height: '1040px', margin: '-520px 0 0 -520px', background: 'repeating-conic-gradient(from 0deg,#2C3A6E 0 10deg,#1A2247 10deg 20deg)', animation: 'mk-sun-a 78s linear infinite' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 34%,rgba(232,163,61,.24),transparent 55%)' }} />
      
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', padding: '60px 22px 24px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          
          <div style={{ position: 'relative', display: 'grid', placeItems: 'center', marginBottom: '18px' }}>
            <div style={{ position: 'absolute', width: '170px', height: '170px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,163,61,.4),transparent 68%)', animation: 'mk-pulse 4s ease-in-out infinite' }} />
            <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/512.gif" alt="" style={{ position: 'relative', width: '104px', height: '104px', filter: 'drop-shadow(0 14px 16px rgba(0,0,0,.45))', animation: 'mk-float 4.2s ease-in-out infinite' }} />
          </div>
          
          <div style={{ font: '800 10px var(--mk-body)', letterSpacing: '.22em', textTransform: 'uppercase', color: '#F2D68A' }}>
            Ton mur est en ligne
          </div>
          <div style={{ fontFamily: 'var(--mk-display)', fontSize: '34px', color: '#fff', lineHeight: 1.1, marginTop: '8px' }}>
            {pub?.title || 'Mur sans titre'}
          </div>
          <div style={{ font: '500 13px var(--mk-body)', color: 'rgba(255,255,255,.72)', marginTop: '12px', maxWidth: '30ch', lineHeight: 1.5 }}>
            Partage le lien à tes proches pour qu'ils ajoutent leurs mots.
          </div>
        </div>

        {siteUrl && (
          <div 
            onClick={handleCopy}
            style={{ cursor: 'pointer', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.16)', borderRadius: '14px', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}
          >
            {copied ? <Check size={16} color="#3FA98A" /> : <ExternalLink size={16} color="rgba(255,255,255,.7)" />}
            <span style={{ flex: 1, font: '600 12.5px "DM Mono", monospace', color: 'rgba(255,255,255,.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
              {displayUrl}
            </span>
            <span style={{ font: '800 12px var(--mk-body)', color: copied ? '#3FA98A' : '#F2D68A' }}>
              {copied ? 'Copié' : 'Copier'}
            </span>
          </div>
        )}

        <button 
          onClick={handleShare}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#E8A33D', color: '#161311', border: 'none', borderRadius: '14px', padding: '16px', font: '800 15px var(--mk-body)', marginBottom: '10px', cursor: 'pointer' }}
        >
          <Share2 size={17} /> Partager le mur
        </button>

        <button 
          onClick={onClose}
          style={{ width: '100%', background: 'none', color: 'rgba(255,255,255,.8)', border: 'none', padding: '6px', font: '800 13px var(--mk-body)', cursor: 'pointer' }}
        >
          Voir mon mur
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes mk-sun-a {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes mk-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes mk-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}} />
    </div>
  );
}
