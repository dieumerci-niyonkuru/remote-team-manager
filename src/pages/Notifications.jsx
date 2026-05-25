import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { 
  Bell, CheckCircle2, PlusCircle, MessageSquare,
  UserPlus, Clock, Trash2, Check
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar';
import useWebSocket from '../hooks/useWebSocket';

export default function Notifications() {
  const { user } = useStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications/');
      const data = res.data?.data || res.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Use the robust hook — handles reconnection automatically
  useWebSocket(user ? `/ws/notifications/` : null, {
    enabled: !!user,
    onMessage: (data) => {
      if (data.type === 'send_notification' && data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        toast.success(`🔔 ${data.notification.verb}`);
      }
    },
  });

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = filter === 'unread'
    ? notifications.filter(n => n.unread)
    : notifications;

  const getIcon = (verb = '') => {
    if (verb.includes('task')) return <PlusCircle size={16} />;
    if (verb.includes('comment') || verb.includes('message')) return <MessageSquare size={16} />;
    if (verb.includes('invite') || verb.includes('member')) return <UserPlus size={16} />;
    return <Bell size={16} />;
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div style={{ minHeight:'100%', overflowY:'auto', padding:'32px 24px', maxWidth:800, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:32, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:900, color:'var(--text)', display:'flex', alignItems:'center', gap:12, margin:0 }}>
            <Bell style={{ color:'var(--brand)' }} size={28} />
            Notifications
          </h1>
          <p style={{ color:'var(--text3)', marginTop:6, fontSize:14 }}>
            Stay updated with your team's activity.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:700, color:'var(--brand)', background:'var(--brand-bg)', border:'1px solid rgba(51,102,255,0.2)', borderRadius:10, padding:'8px 16px', cursor:'pointer', transition:'0.2s' }}
          >
            <Check size={15} />
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display:'flex', gap:4, background:'var(--bg3)', padding:4, borderRadius:12, width:'fit-content', marginBottom:24, border:'1px solid var(--border)' }}>
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:'7px 20px', borderRadius:10, fontSize:12, fontWeight:800, cursor:'pointer', border:'none', transition:'0.2s',
              background: filter === f ? 'var(--bg)' : 'transparent',
              color: filter === f ? 'var(--text)' : 'var(--text3)',
              boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
            }}>
            {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
          <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--brand)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background:'var(--bg-card)', border:'2px dashed var(--border)', borderRadius:24, padding:80, textAlign:'center' }}>
          <Bell style={{ color:'var(--text3)', margin:'0 auto 16px' }} size={48} />
          <p style={{ color:'var(--text3)', fontWeight:700 }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => n.unread && markAsRead(n.id)}
              style={{
                display:'flex', alignItems:'flex-start', gap:14, padding:16, borderRadius:16,
                border: n.unread ? '1px solid rgba(51,102,255,0.25)' : '1px solid var(--border)',
                background: n.unread ? 'rgba(51,102,255,0.05)' : 'var(--bg-card)',
                cursor: n.unread ? 'pointer' : 'default', transition:'0.2s',
                position:'relative'
              }}
              className="notification-row"
            >
              {/* Unread dot */}
              {n.unread && (
                <span style={{ position:'absolute', top:16, left:10, width:6, height:6, borderRadius:'50%', background:'var(--brand)' }} />
              )}
              <Avatar user={{ username: n.actor_name, avatar_url: n.actor_avatar_url }} size={38} />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:14, color: n.unread ? 'var(--text)' : 'var(--text2)', margin:0, lineHeight:1.5, fontWeight: n.unread ? 700 : 500 }}>
                  <span style={{ color:'var(--brand)', fontWeight:800 }}>{n.actor_name}</span>{' '}
                  {n.verb}
                </p>
                <span style={{ fontSize:11, color:'var(--text3)', display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
                  <Clock size={10} />
                  {new Date(n.timestamp).toLocaleString()}
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:6, borderRadius:8, color:'var(--brand)', background:'var(--brand-bg)' }}>
                {getIcon(n.verb)}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                title="Dismiss"
                style={{ background:'transparent', border:'none', color:'var(--text3)', cursor:'pointer', borderRadius:8, padding:6, transition:'0.2s' }}
                className="delete-btn"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .notification-row:hover { transform: translateY(-1px); box-shadow: 0 4px 20px -6px rgba(0,0,0,0.3); }
        .delete-btn:hover { color: #e11d48 !important; background: rgba(225,29,72,0.1) !important; }
      `}</style>
    </div>
  );
}
