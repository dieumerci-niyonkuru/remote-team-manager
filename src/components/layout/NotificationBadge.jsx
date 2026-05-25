import React, { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import * as tokens from '../../styles/tokens';
import api from '../../services/api';
import { useStore } from '../../store';
import { Link } from 'react-router-dom';
import useWebSocket from '../../hooks/useWebSocket';

export default function NotificationBadge() {
  const { user } = useStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/');
      const data = res.data?.data || res.data || [];
      const unread = Array.isArray(data) ? data.filter(n => n.unread).length : 0;
      setUnreadCount(unread);
    } catch (err) {
      // Silently fail — badge will just show 0
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
  }, [user, fetchUnreadCount]);

  const wsUrl = user ? `/ws/notifications/` : null;
  useWebSocket(wsUrl, {
    enabled: !!user,
    onMessage: (data) => {
      if (data.type === 'notification_message' || data.type === 'send_notification') {
        setUnreadCount(prev => prev + 1);
      }
    },
  });

  return (
    <Link
      to="/notifications"
      title="Notifications"
      style={{ position:'relative', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        padding:8, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)',
        borderRadius: tokens.radius?.md || 10, transition:'0.2s', textDecoration:'none',
        color:'var(--text2)'
      }}
    >
      <Bell size={19} />
      {unreadCount > 0 && (
        <span style={{
          position:'absolute', top:-4, right:-4, minWidth:18, height:18,
          background:'#e11d48', color:'#fff', fontSize:10, fontWeight:900,
          display:'flex', alignItems:'center', justifyContent:'center',
          borderRadius:999, border:'2px solid var(--bg)', padding:'0 4px',
          boxShadow:'0 2px 8px rgba(225,29,72,0.4)'
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
