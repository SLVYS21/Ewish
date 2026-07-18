import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../utils/api';

/**
 * myKado — Hook central pour les notifications.
 *
 * const { notifications, unreadCount, markRead, markAllRead, dismiss, refresh } = useNotifications();
 *
 * Polling toutes les 60s tant que l'onglet est visible. Pause quand caché.
 */

const POLL_INTERVAL_MS = 60_000;

export function useNotifications({ enabled = true, unreadOnly = false } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const fetchNow = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', {
        params: { limit: 50, unreadOnly: unreadOnly ? 'true' : undefined },
        withCredentials: true,
      });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      /* silent — pas de toast pour un polling */
    } finally {
      setLoading(false);
    }
  }, [enabled, unreadOnly]);

  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`, {}, { withCredentials: true });
      setNotifications((cur) => cur.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.post('/notifications/read-all', {}, { withCredentials: true });
      setNotifications((cur) => cur.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  }, []);

  const dismiss = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`, { withCredentials: true });
      setNotifications((cur) => cur.filter((n) => n._id !== id));
    } catch { /* silent */ }
  }, []);

  // Polling with visibility awareness
  useEffect(() => {
    if (!enabled) return;
    fetchNow();

    const start = () => {
      stop();
      timerRef.current = setInterval(fetchNow, POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };

    const onVis = () => {
      if (document.hidden) stop();
      else { fetchNow(); start(); }
    };

    start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [enabled, fetchNow]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNow,
    markRead,
    markAllRead,
    dismiss,
  };
}

export default useNotifications;
