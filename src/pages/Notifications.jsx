import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { notifications } from '../services/api';
import { unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

const NOTIF_ICONS = {
  task_assigned: '📋', task_completed: '✅', comment: '💬', mention: '@',
  invitation: '✉️', project_update: '📁', message: '💬',
};

export default function Notifications() {
  const { lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await notifications.list(); setItems(unwrapData(r)); }
    catch (e) { toast.error('Failed to load notifications'); } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try { await notifications.markRead(id); setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)); }
    catch (e) { toast.error('Failed'); }
  };

  const markAllRead = async () => {
    try { await notifications.markAllRead(); setItems(prev => prev.map(n => ({ ...n, is_read: true }))); toast.success('All marked as read'); }
    catch (e) { toast.error('Failed'); }
  };

  const remove = async (id) => {
    try { await notifications.delete(id); setItems(prev => prev.filter(n => n.id !== id)); toast.success('Deleted'); }
    catch (e) { toast.error('Failed'); }
  };

  const filtered = items.filter(n => filter === 'unread' ? !n.is_read : true);
  const unreadCount = items.filter(n => !n.is_read).length;

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div className="flex items-center gap-3">
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('notifications.title', 'Notifications')}</h1>
          {unreadCount > 0 && <Badge variant="primary">{unreadCount} new</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" leftIcon={<CheckCheck size={14} />} onClick={markAllRead}>Mark All Read</Button>
        )}
      </div>

      <div className="flex gap-2">
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ background: filter === f ? 'var(--brand-bg)' : 'var(--bg3)', border: filter === f ? '1px solid rgba(51,102,255,0.2)' : '1px solid transparent', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: filter === f ? 'var(--brand)' : 'var(--text3)', cursor: 'pointer' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Bell size={24} />} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {filtered.map((n, i) => (
            <div key={n.id || i} style={{ ...cardBase, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, opacity: n.is_read ? 0.6 : 1, transition: 'opacity 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s', cursor: 'pointer', borderLeft: n.is_read ? '3px solid transparent' : '3px solid var(--brand)' }}
              onClick={() => !n.is_read && markRead(n.id)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{NOTIF_ICONS[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>{n.message || n.title || 'Notification'}</p>
                <p style={{ fontSize: 11, color: 'var(--text3)', margin: '3px 0 0' }}>{n.created_at ? format(new Date(n.created_at), 'MMM d, h:mm a') : ''}</p>
              </div>
              {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, marginTop: 5 }} />}
              <button onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, flexShrink: 0, borderRadius: 4 }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
