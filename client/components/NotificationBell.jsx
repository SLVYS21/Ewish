import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button } from '../design-system';
import { useNotifications } from '../hooks/useNotifications';

/**
 * myKado — Notification bell + panel
 *
 * <NotificationBell />
 *
 * À placer dans le header/sidebar de l'espace utilisateur.
 * Affiche une pastille "nouvelles" quand unreadCount > 0.
 */

const TYPE_ICON = {
  contribution_received: 'MessageSquare',
  gift_received:         'Gift',
  cagnotte_contribution: 'Coins',
  card_opened:           'MailOpen',
  wall_opened:           'LayoutGrid',
  moderation_pending:    'ShieldCheck',
  kyc_approved:          'CheckCircle2',
  kyc_rejected:          'AlertCircle',
  system:                'Bell',
};

function formatRelative(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'à l\'instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `il y a ${days} j`;
  return d.toLocaleDateString('fr-FR');
}

export default function NotificationBell({ authOk = true }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, dismiss, refresh } =
    useNotifications({ enabled: authOk });

  const wrapRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleClick = (n) => {
    if (!n.read) markRead(n._id);
    setOpen(false);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); if (!open) refresh(); }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
        aria-expanded={open}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 'var(--mk-radius-full)',
          background: open ? 'var(--mk-stone-100)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background var(--mk-motion-hover)',
          color: 'var(--mk-text-primary)',
        }}
      >
        <Icon name="Bell" size="md" />
        {unreadCount > 0 && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 4,
              right: 6,
              minWidth: 18,
              height: 18,
              padding: '0 5px',
              borderRadius: 999,
              background: 'var(--mk-action-secondary)',
              color: '#fff',
              fontFamily: 'var(--mk-font-sans)',
              fontSize: 11,
              fontWeight: 700,
              lineHeight: '18px',
              textAlign: 'center',
              border: '2px solid var(--mk-surface-base)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: '75vh',
            background: 'var(--mk-surface-elevated)',
            borderRadius: 'var(--mk-radius-md)',
            boxShadow: 'var(--mk-shadow-xl)',
            border: '1px solid var(--mk-border-subtle)',
            zIndex: 'var(--mk-z-popover)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--mk-border-subtle)',
            }}
          >
            <div className="mk-h5" style={{ fontSize: 16 }}>Notifications</div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                Tout marquer lu
              </Button>
            )}
          </header>

          <div style={{ overflow: 'auto', flex: 1 }}>
            {notifications.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Icon name="BellOff" size="xl" color="var(--mk-text-tertiary)" />
                <div className="mk-body" style={{ marginTop: 12 }}>Aucune notification</div>
                <div className="mk-caption" style={{ marginTop: 4 }}>
                  Tu seras averti quand quelque chose se passe.
                </div>
              </div>
            )}
            {notifications.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex',
                  gap: 12,
                  width: '100%',
                  padding: '14px 16px',
                  background: n.read ? 'transparent' : 'var(--mk-indigo-50)',
                  border: 'none',
                  borderBottom: '1px solid var(--mk-border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background var(--mk-motion-hover)',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--mk-radius-full)',
                    background: 'var(--mk-surface-base)',
                    color: 'var(--mk-text-brand)',
                    flexShrink: 0,
                    border: '1px solid var(--mk-border-subtle)',
                  }}
                >
                  <Icon name={TYPE_ICON[n.type] || 'Bell'} size="sm" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="mk-body-sm"
                    style={{ fontWeight: n.read ? 500 : 600, color: 'var(--mk-text-primary)' }}
                  >
                    {n.title}
                  </div>
                  {n.body && (
                    <div className="mk-caption" style={{ marginTop: 2 }}>
                      {n.body}
                    </div>
                  )}
                  <div className="mk-micro" style={{ marginTop: 4, color: 'var(--mk-text-tertiary)' }}>
                    {formatRelative(n.createdAt)}
                  </div>
                </div>
                {!n.read && (
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--mk-action-secondary)',
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
