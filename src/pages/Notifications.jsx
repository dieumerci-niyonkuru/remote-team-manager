import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import {
  Bell, BellOff, Check, CheckCircle, AtSign, UserPlus,
  Trash2, ArrowRight, Settings, X, RefreshCw,
} from 'lucide-react';
import { notifications as notifApi } from '../services/api';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar';
import useWebSocket from '../hooks/useWebSocket';

/* ── helpers ──────────────────────────────────────────────── */
function timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function groupByDate(items) {
  const now = new Date();
  const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
  items.forEach(n => {
    const d = new Date(n.timestamp);
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0)      groups.Today.push(n);
    else if (diffDays === 1) groups.Yesterday.push(n);
    else if (diffDays < 7)   groups['This Week'].push(n);
    else                     groups.Earlier.push(n);
  });
  return groups;
}

const TYPE_META = {
  task:    { icon: CheckCircle, color: '#10b981', border: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  mention: { icon: AtSign,      color: '#3b82f6', border: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  invite:  { icon: UserPlus,    color: '#8b5cf6', border: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  system:  { icon: Bell,        color: '#f59e0b', border: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
};

function detectType(verb = '') {
  if (verb.includes('task') || verb.includes('assign')) return 'task';
  if (verb.includes('mention') || verb.includes('@'))   return 'mention';
  if (verb.includes('invite') || verb.includes('member')) return 'invite';
  return 'system';
}

const FILTERS = ['All', 'Unread', 'Mentions', 'Tasks', 'System'];

function filterNotifications(notifs, tab) {
  switch (tab) {
    case 'Unread':   return notifs.filter(n => n.unread);
    case 'Mentions': return notifs.filter(n => detectType(n.verb) === 'mention');
    case 'Tasks':    return notifs.filter(n => detectType(n.verb) === 'task');
    case 'System':   return notifs.filter(n => detectType(n.verb) === 'system');
    default:         return notifs;
  }
}

/* ── Empty state illustration ─────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', animation: 'fadeInUp 0.4s ease both' }}>
      <div style={{ width: 80, height: 80, margin: '0 auto 24px', borderRadius: '50%', background: 'var(--bg3)', border: '2px dashed var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Bell size={32} color="var(--text3)" />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
        You're all caught up! 🎉
      </h3>
      <p style={{ fontSize: 14, color: 'var(--text3)', maxWidth: 280, margin: '0 auto' }}>
        No notifications here. Check back later or adjust your filter.
      </p>
    </div>
  );
}

/* ── Single notification row ──────────────────────────────── */
function NotifRow({ n, onMarkRead, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const type = detectType(n.verb);
  const meta = TYPE_META[type] || TYPE_META.system;
  const Icon = meta.icon;

  function handleClick() {
    if (n.unread) onMarkRead(n.id);
    if (n.deep_link) navigate(n.deep_link);
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
        borderRadius: 14, cursor: 'pointer', position: 'relative',
        border: n.unread ? `1px solid ${meta.border}33` : '1px solid var(--border)',
        background: n.unread ? meta.bg : 'var(--bg-card)',
        borderLeft: `3px solid ${meta.border}`,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? '0 6px 20px -6px rgba(0,0,0,0.35)' : 'none',
        animation: 'fadeIn 0.25s ease both',
      }}
    >
      {/* Unread dot */}
      {n.unread && (
        <span style={{
          position: 'absolute', top: 18, right: 14,
          width: 7, height: 7, borderRadius: '50%',
          background: meta.color,
          boxShadow: `0 0 6px ${meta.color}`,
        }} />
      )}

      {/* Avatar or icon */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {n.actor_avatar_url || n.actor_name ? (
          <Avatar user={{ username: n.actor_name, avatar_url: n.actor_avatar_url }} size={38} />
        ) : (
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: meta.bg, border: `1px solid ${meta.border}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} color={meta.color} />
          </div>
        )}
        {/* Type icon overlay */}
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 16, height: 16, borderRadius: '50%',
          background: meta.color, border: '2px solid var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={8} color="#fff" />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, lineHeight: 1.5, margin: 0,
          fontWeight: n.unread ? 700 : 500,
          color: n.unread ? 'var(--text)' : 'var(--text2)',
        }}>
          {n.actor_name && (
            <span style={{ color: meta.color, fontWeight: 800 }}>{n.actor_name} </span>
          )}
          {n.verb}
        </p>
        {n.description && (
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            {n.description}
          </p>
        )}
        <span style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, display: 'inline-block', opacity: 0.7 }} />
          {timeAgo(n.timestamp)}
        </span>
      </div>

      {/* Hover action buttons */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.15s ease',
      }}>
        {n.unread && (
          <button
            onClick={e => { e.stopPropagation(); onMarkRead(n.id); }}
            title="Mark as read"
            style={{ ...actionBtnStyle, color: meta.color }}
          >
            <Check size={13} />
          </button>
        )}
        {n.deep_link && (
          <button
            onClick={e => { e.stopPropagation(); navigate(n.deep_link); }}
            title="Open"
            style={{ ...actionBtnStyle, color: 'var(--brand)' }}
          >
            <ArrowRight size={13} />
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onDelete(n.id); }}
          title="Dismiss"
          style={{ ...actionBtnStyle, color: 'var(--danger)' }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  background: 'var(--bg3)', border: '1px solid var(--border)',
  borderRadius: 7, padding: '5px 7px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.15s, opacity 0.15s',
};

/* ── Date group label ─────────────────────────────────────── */
function GroupLabel({ label, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      margin: '20px 0 10px',
    }}>
      <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700 }}>({count})</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function Notifications() {
  const { user } = useStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [soundOn, setSoundOn] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;
  const audioRef = useRef(null);
  const pollRef = useRef(null);

  /* fetch */
  const fetchNotifs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await notifApi.list();
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err) {
      if (!silent) console.error('Failed to fetch notifications:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    // Poll every 30 seconds
    pollRef.current = setInterval(() => fetchNotifs(true), 30_000);
    return () => clearInterval(pollRef.current);
  }, [fetchNotifs]);

  /* WebSocket real-time */
  useWebSocket(user ? '/ws/notifications/' : null, {
    enabled: !!user,
    onMessage: (data) => {
      if (data.type === 'send_notification' && data.notification) {
        setItems(prev => [data.notification, ...prev]);
        if (soundOn) {
          // play a short beep via Web Audio API
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
            osc.start(); osc.stop(ctx.currentTime + 0.3);
          } catch {}
        }
        toast(`🔔 ${data.notification.verb}`, { duration: 3000 });
      }
    },
  });

  /* actions */
  const markRead = async (id) => {
    try {
      await notifApi.markRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch {
      toast.error('Could not mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await notifApi.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, unread: false })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotif = async (id) => {
    setItems(prev => prev.filter(n => n.id !== id)); // optimistic
    try { await notifApi.delete(id); } catch {}
  };

  /* derived */
  const unreadCount = items.filter(n => n.unread).length;
  const filtered = filterNotifications(items, filter);
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const grouped = groupByDate(visible);

  return (
    <div style={{ minHeight: '100%', overflowY: 'auto', padding: '32px 24px', maxWidth: 760, margin: '0 auto' }} className="page-enter">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--brand)', color: '#fff',
                fontSize: 11, fontWeight: 900, padding: '2px 8px',
                borderRadius: 999, lineHeight: 1.6, minWidth: 20, textAlign: 'center',
              }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text3)', marginTop: 5, fontSize: 13 }}>
            Real-time activity from your team.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Sound toggle */}
          <button
            onClick={() => setSoundOn(v => !v)}
            title={soundOn ? 'Mute sounds' : 'Enable sounds'}
            style={{ ...headerBtnStyle, color: soundOn ? 'var(--brand)' : 'var(--text3)', borderColor: soundOn ? 'rgba(51,102,255,0.3)' : 'var(--border)' }}
          >
            {soundOn ? <Bell size={15} /> : <BellOff size={15} />}
          </button>
          {/* Refresh */}
          <button onClick={() => fetchNotifs()} title="Refresh" style={headerBtnStyle}>
            <RefreshCw size={15} />
          </button>
          {/* Settings */}
          <button title="Notification settings" style={headerBtnStyle}>
            <Settings size={15} />
          </button>
          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 800, color: 'var(--brand)',
                background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.2)',
                borderRadius: 10, padding: '7px 14px', cursor: 'pointer', transition: '0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <CheckCircle size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{
        display: 'flex', gap: 4, background: 'var(--bg3)',
        padding: 4, borderRadius: 12, marginBottom: 24,
        border: '1px solid var(--border)', overflowX: 'auto',
        scrollbarWidth: 'none', flexWrap: 'nowrap',
      }}>
        {FILTERS.map(f => {
          const count = f === 'All' ? items.length
            : f === 'Unread' ? unreadCount
            : filterNotifications(items, f).length;
          const active = filter === f;
          return (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              style={{
                padding: '7px 16px', borderRadius: 9, fontSize: 12, fontWeight: 800,
                cursor: 'pointer', border: 'none', transition: '0.2s', whiteSpace: 'nowrap',
                background: active ? 'var(--bg)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text3)',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                flexShrink: 0,
              }}>
              {f}
              {count > 0 && (
                <span style={{
                  marginLeft: 5, background: active ? 'var(--brand)' : 'var(--bg2)',
                  color: active ? '#fff' : 'var(--text3)',
                  borderRadius: 999, padding: '0 6px', fontSize: 10, fontWeight: 900,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {Object.entries(grouped).map(([label, group]) =>
            group.length === 0 ? null : (
              <div key={label}>
                <GroupLabel label={label} count={group.length} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.map(n => (
                    <NotifRow key={n.id} n={n} onMarkRead={markRead} onDelete={deleteNotif} />
                  ))}
                </div>
              </div>
            )
          )}

          {/* Load more */}
          {hasMore && visible.length < filtered.length && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={() => setPage(p => p + 1)}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  color: 'var(--text2)', borderRadius: 10, padding: '10px 28px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                }}
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
      `}</style>
    </div>
  );
}

const headerBtnStyle = {
  background: 'var(--bg3)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '8px 10px', cursor: 'pointer',
  color: 'var(--text2)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', transition: '0.2s',
};
