import { useState, useEffect } from 'react';
import { ShareView, UnlockView } from './SharePage';
import { getShortLink } from '../utils/api';
import { Loader2 } from 'lucide-react';

const WALL_NAMES = new Set(['wall-of-wishes','wall-of-wishes-3d','wall-of-wishes-modern','wall-of-wishes-space']);

export default function WallShareTab({ pub, setPub }) {
  const [shortCode, setShortCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pub?._id) return;
    getShortLink(pub._id)
      .then(res => setShortCode(res.data?.shortCode || ''))
      .catch(() => setShortCode(''))
      .finally(() => setLoading(false));
  }, [pub?._id]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="mk-spin" style={{ color: 'var(--mk-ink-3)' }} />
      </div>
    );
  }

  const isWall = WALL_NAMES.has(pub.templateName);
  const shareUrl = shortCode
    ? `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/s/${shortCode}`
    : `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/site/${pub.templateName}/${pub.customName}`;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 860, margin: '0 auto' }}>
      {pub.published ? (
        <ShareView
          pub={pub}
          shortCode={shortCode}
          setShortCode={setShortCode}
          shareUrl={shareUrl}
          isWall={isWall}
          onSlugUpdated={(newSlug) => setPub((prev) => (prev ? { ...prev, slug: newSlug } : prev))}
        />
      ) : (
        <UnlockView
          pub={pub}
          onUnlocked={() => setPub(prev => ({ ...prev, published: true }))}
        />
      )}
    </div>
  );
}
