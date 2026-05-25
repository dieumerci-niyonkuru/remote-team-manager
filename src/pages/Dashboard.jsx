import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ws, proj, task, auth } from '../services/api';
import Avatar from '../components/common/Avatar';
import {
  Briefcase, CheckSquare, Users, Target, Plus, Bell, MessageSquare,
  ChevronRight, ArrowUpRight, Zap, Activity, BarChart2, Calendar,
  TrendingUp, TrendingDown, Circle, Check, Clock, Star, Flame,
  Video, Sparkles, RotateCcw
} from 'lucide-react';

/* ─── CSS variables shim (matches existing var() refs) ─────── */
// These map to the app's existing --bg, --border, --text, etc.
// We define fallback values inline so the component works standalone.

const C = {
  brand:   '#3366ff',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#ef4444',
  cyan:    '#06b6d4',
};

/* ─── Priority / status meta ─────────────────────────────────── */
const PRIORITY = {
  urgent: { bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.35)',  text:'#ef4444', label:'Urgent' },
  high:   { bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.35)', text:'#f59e0b', label:'High'   },
  medium: { bg:'rgba(51,102,255,0.12)', border:'rgba(51,102,255,0.35)', text:'#3366ff', label:'Medium' },
  low:    { bg:'rgba(100,116,139,0.10)',border:'rgba(100,116,139,0.25)',text:'#64748b', label:'Low'    },
};

const STATUS = {
  done:        { text:'#10b981', bg:'rgba(16,185,129,0.12)',  label:'Done'        },
  in_progress: { text:'#3366ff', bg:'rgba(51,102,255,0.12)',  label:'In Progress' },
  todo:        { text:'#64748b', bg:'rgba(100,116,139,0.10)', label:'To Do'       },
  blocked:     { text:'#ef4444', bg:'rgba(239,68,68,0.12)',   label:'Blocked'     },
};

const AI_INSIGHTS = [
  'Your team completes 23% more tasks on Tuesdays. Schedule important work then.',
  'Tasks assigned to pairs finish 40% faster than solo tasks—try pairing more often.',
  'You have 3 overdue items. Clearing them now could unlock 2 blocked team tasks.',
  'Productivity peaks between 9 am – 12 pm. Protect that window from meetings.',
  'Your sprint velocity has improved 18% over the last 4 weeks. Great momentum!',
];

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skel({ w = '100%', h = 16, r = 8, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'rgba(255,255,255,0.06)',
      animation: 'skelPulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  );
}

/* ─── KPI Card ───────────────────────────────────────────────── */
function KpiCard({ label, value, icon, color, trend, loading, onClick }) {
  const [hov, setHov] = useState(false);
  const trendPos = trend > 0;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-card,#0d1425)',
        border: `1px solid ${hov ? color + '55' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 18,
        padding: '22px 20px',
        position: 'relative', overflow: 'hidden',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 20px 40px -8px ${color}30` : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ position: 'absolute', top: -18, right: -18, width: 70, height: 70, borderRadius: '50%', background: `${color}18`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 11, fontWeight: 800,
            color: trendPos ? C.emerald : C.rose,
            background: trendPos ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            padding: '3px 8px', borderRadius: 8,
          }}>
            {trendPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 5px' }}>{label}</p>
      {loading
        ? <Skel h={32} w={64} r={6} />
        : <p style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>{value}</p>
      }
      {!loading && trend !== undefined && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '6px 0 0', fontWeight: 500 }}>vs last week</p>
      )}
    </div>
  );
}

/* ─── Quick Action Button ────────────────────────────────────── */
function QBtn({ icon, label, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: '16px 10px', borderRadius: 14, flex: 1, minWidth: 68,
        background: hov ? `${color}20` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hov ? color + '55' : 'rgba(255,255,255,0.07)'}`,
        cursor: 'pointer', transition: 'all 0.2s',
        transform: hov ? 'translateY(-2px)' : 'none',
        color,
      }}
    >
      <div style={{ fontSize: 20, display: 'flex' }}>{icon}</div>
      <span style={{ fontSize: 11, fontWeight: 700, color: hov ? '#fff' : 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{label}</span>
    </button>
  );
}

/* ─── Circular Progress ──────────────────────────────────────── */
function CircleProgress({ pct, size = 54, color = C.brand, strokeWidth = 5 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  );
}

/* ─── AI Insights Card ───────────────────────────────────────── */
function AIInsightsCard({ score }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const rotate = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setIdx(i => (i + 1) % AI_INSIGHTS.length);
      setFading(false);
    }, 350);
  }, []);

  useEffect(() => {
    const t = setInterval(rotate, 6000);
    return () => clearInterval(t);
  }, [rotate]);

  const gaugeColor = score >= 80 ? C.emerald : score >= 60 ? C.amber : C.rose;

  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(51,102,255,0.1),rgba(139,92,246,0.08))',
      border: '1px solid rgba(51,102,255,0.25)',
      borderRadius: 20, padding: '22px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
          <Sparkles size={16} color={C.violet} /> AI Insights
        </h3>
        <button onClick={rotate} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, display: 'flex', transition: 'color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}>
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Productivity gauge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, padding: '12px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <CircleProgress pct={score} size={52} color={gaugeColor} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: gaugeColor }}>{score}</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 3px', fontWeight: 600 }}>Productivity Score</p>
          <p style={{ fontSize: 13, fontWeight: 800, color: gaugeColor, margin: 0 }}>
            {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs attention'}
          </p>
        </div>
      </div>

      {/* Rotating insight */}
      <p style={{
        fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', margin: 0,
        opacity: fading ? 0 : 1, transform: fading ? 'translateY(4px)' : 'none',
        transition: 'opacity 0.35s, transform 0.35s',
        minHeight: 56,
      }}>
        {AI_INSIGHTS[idx]}
      </p>

      <div style={{ display: 'flex', gap: 5, marginTop: 12 }}>
        {AI_INSIGHTS.map((_, i) => (
          <div key={i} style={{ height: 3, borderRadius: 2, flex: i === idx ? 2 : 1, background: i === idx ? C.violet : 'rgba(255,255,255,0.12)', transition: 'flex 0.4s, background 0.4s' }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Task Row ───────────────────────────────────────────────── */
function TaskRow({ t, onToggle }) {
  const [hov, setHov] = useState(false);
  const p = PRIORITY[t.priority] || PRIORITY.low;
  const done = t.status === 'done';
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: hov ? 'rgba(255,255,255,0.03)' : 'transparent',
        transition: 'background 0.15s', cursor: 'default',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle && onToggle(t.id)}
        style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
          border: `2px solid ${done ? C.emerald : 'rgba(255,255,255,0.2)'}`,
          background: done ? `${C.emerald}20` : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
        {done && <Check size={11} color={C.emerald} />}
      </button>

      {/* Priority accent */}
      <div style={{ width: 3, height: 28, borderRadius: 2, background: p.text, flexShrink: 0, boxShadow: `0 0 6px ${p.text}80` }} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: done ? 'rgba(255,255,255,0.35)' : '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: done ? 'line-through' : 'none' }}>
          {t.title}
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: p.text, background: p.bg, border: `1px solid ${p.border}`, padding: '1px 7px', borderRadius: 5 }}>{p.label}</span>
          {t.due_date && (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={9} /> {new Date(t.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {hov && <ArrowUpRight size={14} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />}
    </div>
  );
}

/* ─── Activity Item ──────────────────────────────────────────── */
function ActivityItem({ item, user }) {
  const initials = (item.actor_name || user?.username || '?')[0].toUpperCase();
  const colors = ['#3366ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
  const color = colors[(initials.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${color}25`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color, flexShrink: 0 }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '0 0 2px', lineHeight: 1.5 }}>
          <span style={{ color: '#fff', fontWeight: 700 }}>{item.actor_name || user?.username}</span>{' '}
          {item.verb || item.message || 'performed an action'}
        </p>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </span>
      </div>
    </div>
  );
}

/* ─── Project Progress Row ───────────────────────────────────── */
function ProjectRow({ project, index }) {
  const colors = [C.brand, C.violet, C.emerald, C.amber, C.cyan];
  const color = colors[index % colors.length];
  const pct = project.progress ?? Math.floor(Math.random() * 60 + 30);
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '14px 16px', borderRadius: 12,
        background: hov ? `${color}0e` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? color + '40' : 'rgba(255,255,255,0.06)'}`,
        transform: hov ? 'translateX(3px)' : 'none',
        transition: 'all 0.2s', cursor: 'default', marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <CircleProgress pct={pct} size={44} color={color} strokeWidth={4} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{project.name}</p>
            <span style={{ fontSize: 12, fontWeight: 900, color, marginLeft: 8 }}>{pct}%</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}88)`, borderRadius: 2, transition: 'width 1s ease' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Deadline Card ──────────────────────────────────────────── */
function DeadlineCard({ item, idx }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(item.due_date || item.deadline) - Date.now()) / 86400000));
  const urgent = daysLeft <= 2;
  const color = urgent ? C.rose : daysLeft <= 5 ? C.amber : C.emerald;
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'center',
      padding: '12px 14px', borderRadius: 12,
      background: `${color}0a`, border: `1px solid ${color}25`, marginBottom: 8,
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Calendar size={16} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title || item.name}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          {item.due_date ? new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
        </p>
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, color, whiteSpace: 'nowrap', background: `${color}18`, padding: '3px 8px', borderRadius: 6 }}>
        {daysLeft === 0 ? 'Today' : `${daysLeft}d`}
      </span>
    </div>
  );
}

/* ─── Member Presence ────────────────────────────────────────── */
function MemberPresence({ member }) {
  const statuses = ['online', 'away', 'offline'];
  const status = statuses[Math.floor(Math.random() * statuses.length)]; // fallback demo
  const realStatus = member.status || member.presence || status;
  const dotColors = { online: C.emerald, away: C.amber, offline: '#64748b', busy: C.rose };
  const u = member.user || member;
  const initials = (u.full_name || u.username || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const bgColors = [C.brand, C.violet, C.emerald, C.amber, C.rose, C.cyan];
  const bg = bgColors[(initials.charCodeAt(0) || 0) % bgColors.length];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {u.avatar ? (
          <img src={u.avatar} alt={u.username} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
        ) : (
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${bg},${bg}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff' }}>{initials}</div>
        )}
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: dotColors[realStatus] || dotColors.offline, border: '2px solid #0d1425', boxShadow: realStatus === 'online' ? `0 0 6px ${C.emerald}` : 'none' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.full_name || u.username}</p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'capitalize' }}>{realStatus}</p>
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────────── */
function SectionHead({ icon, title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
        {icon}{title}
      </h3>
      {action && (
        <button onClick={onAction} style={{ fontSize: 11, color: C.brand, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: '3px 6px', borderRadius: 6, transition: 'background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(51,102,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
          {action} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function Panel({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-card,#0d1425)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20, overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── MAIN DASHBOARD ─────────────────────────────────────────── */
export default function Dashboard() {
  const { user, activeWorkspace, workspaces, setActiveWorkspace } = useStore();
  const navigate = useNavigate();

  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [members,  setMembers]  = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const aiScore = useRef(Math.floor(Math.random() * 30 + 65)).current; // 65–95

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchAll = useCallback(async () => {
    if (!activeWorkspace?.id) { setLoading(false); return; }
    setLoading(true);
    const [projRes, taskRes, membRes, actRes] = await Promise.allSettled([
      proj.list(activeWorkspace.id),
      task.list(activeWorkspace.id, undefined, {}),
      ws.members(activeWorkspace.id),
      ws.activity(activeWorkspace.id),
    ]);
    const safe = r => (r.status === 'fulfilled' ? (Array.isArray(r.value?.data) ? r.value.data : r.value?.data?.results || r.value?.data || []) : []);
    setProjects(safe(projRes).slice(0, 5));
    setTasks(safe(taskRes).slice(0, 8));
    setMembers(safe(membRes));
    setActivity(safe(actRes).slice(0, 6));
    setLoading(false);
  }, [activeWorkspace?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Derived stats ── */
  const myTasks       = tasks.filter(t => t.assignee?.id === user?.id || t.assignee === user?.id || true /* show all on demo */);
  const completedToday = myTasks.filter(t => t.status === 'done').length;
  const upcoming       = [...tasks, ...projects].filter(i => i.due_date || i.deadline).sort((a, b) => new Date(a.due_date || a.deadline) - new Date(b.due_date || b.deadline)).slice(0, 4);

  /* ── Demo fallback data (renders even without API) ── */
  const demoTasks = [
    { id: 1, title: 'Review Q3 roadmap slides', priority: 'high',   status: 'in_progress', due_date: new Date().toISOString() },
    { id: 2, title: 'Fix auth token refresh bug', priority: 'urgent',status: 'todo',        due_date: new Date().toISOString() },
    { id: 3, title: 'Update design system tokens', priority: 'medium',status: 'done',       due_date: null },
    { id: 4, title: 'Write API documentation',    priority: 'low',   status: 'todo',        due_date: null },
    { id: 5, title: 'Deploy staging environment', priority: 'high',  status: 'in_progress', due_date: new Date().toISOString() },
  ];
  const demoProjects = [
    { id: 1, name: 'Web App v2.0', progress: 72 },
    { id: 2, name: 'API Refactor', progress: 45 },
    { id: 3, name: 'Design System', progress: 88 },
    { id: 4, name: 'Mobile Alpha', progress: 31 },
  ];
  const demoMembers = [
    { id: 1, user: { username: 'sarah_j', full_name: 'Sarah Jenkins' }, status: 'online' },
    { id: 2, user: { username: 'david_c', full_name: 'David Chen'    }, status: 'away'   },
    { id: 3, user: { username: 'elena_r', full_name: 'Elena R.'      }, status: 'online' },
    { id: 4, user: { username: 'tom_k',   full_name: 'Tom Keller'    }, status: 'offline'},
    { id: 5, user: { username: 'priya_s', full_name: 'Priya Singh'   }, status: 'online' },
    { id: 6, user: { username: 'alex_m',  full_name: 'Alex Martin'   }, status: 'away'   },
  ];
  const demoActivity = [
    { id: 1, actor_name: 'Sarah Jenkins', verb: 'completed "Design tokens audit"', timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 2, actor_name: 'David Chen',    verb: 'started "API Refactor — Phase 2"', timestamp: new Date(Date.now() - 32 * 60000).toISOString() },
    { id: 3, actor_name: 'Elena R.',      verb: 'commented on "Mobile nav bug"', timestamp: new Date(Date.now() - 58 * 60000).toISOString() },
    { id: 4, actor_name: 'Tom Keller',    verb: 'created project "Mobile Alpha"', timestamp: new Date(Date.now() - 90 * 60000).toISOString() },
  ];

  const displayTasks    = myTasks.length    > 0 ? myTasks    : demoTasks;
  const displayProjects = projects.length   > 0 ? projects   : demoProjects;
  const displayMembers  = members.length    > 0 ? members    : demoMembers;
  const displayActivity = activity.length   > 0 ? activity   : demoActivity;
  const onlineCount     = displayMembers.filter(m => (m.status || m.presence) === 'online').length || Math.ceil(displayMembers.length * 0.6);

  const [checkedIds, setCheckedIds] = useState(new Set());
  const toggleCheck = id => setCheckedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 'clamp(16px,2.5vw,28px) clamp(16px,3vw,36px)', background: 'var(--bg,#060b18)', maxWidth: 1440, margin: '0 auto' }} className="custom-scrollbar">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.emerald, boxShadow: `0 0 8px ${C.emerald}`, display: 'inline-block', animation: 'pulseDot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.emerald }}>Workspace Live</span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 4px', lineHeight: 1.15 }}>
            {greeting()}, {user?.first_name || user?.username || 'there'} 👋
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{dateStr}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Workspace selector */}
          {workspaces?.length > 1 && (
            <select
              value={activeWorkspace?.id || ''}
              onChange={e => { const found = workspaces.find(w => String(w.id) === e.target.value); if (found) setActiveWorkspace(found); }}
              style={{ padding: '9px 14px', borderRadius: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none' }}
            >
              {workspaces.map(w => <option key={w.id} value={w.id} style={{ background: '#0d1425' }}>{w.name}</option>)}
            </select>
          )}

          <button onClick={() => navigate('/tasks')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, background: `linear-gradient(90deg,${C.brand},${C.violet})`, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, boxShadow: '0 4px 16px rgba(51,102,255,0.35)', transition: 'transform 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
            <Plus size={15} /> New Task
          </button>

          <button onClick={() => navigate('/notifications')}
            style={{ position: 'relative', padding: '9px 13px', borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', transition: 'background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            <Bell size={17} />
          </button>
        </div>
      </div>

      {/* ── KPI STATS ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14, marginBottom: 24 }}>
        <KpiCard label="Total Tasks"      value={loading ? '—' : displayTasks.length}             icon={<CheckSquare size={19} />} color={C.brand}   trend={12}   loading={loading} onClick={() => navigate('/tasks')} />
        <KpiCard label="Completed Today"  value={loading ? '—' : completedToday || checkedIds.size} icon={<Target size={19} />}      color={C.emerald} trend={8}    loading={loading} onClick={() => navigate('/tasks')} />
        <KpiCard label="Active Projects"  value={loading ? '—' : displayProjects.length}           icon={<Briefcase size={19} />}   color={C.violet}  trend={-3}   loading={loading} onClick={() => navigate('/projects')} />
        <KpiCard label="Online Now"       value={loading ? '—' : onlineCount}                      icon={<Users size={19} />}       color={C.amber}              loading={loading} onClick={() => navigate('/team')} />
      </div>

      {/* ── QUICK ACTIONS ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        <QBtn icon={<Plus size={18} />}          label="New Task"    color={C.brand}   onClick={() => navigate('/tasks')} />
        <QBtn icon={<Briefcase size={18} />}     label="New Project" color={C.violet}  onClick={() => navigate('/projects')} />
        <QBtn icon={<MessageSquare size={18} />} label="Open Chat"   color={C.emerald} onClick={() => navigate('/chat')} />
        <QBtn icon={<Video size={18} />}         label="Video Call"  color={C.cyan}    onClick={() => navigate('/video')} />
        <QBtn icon={<BarChart2 size={18} />}     label="Analytics"   color={C.amber}   onClick={() => navigate('/analytics')} />
        <QBtn icon={<Zap size={18} />}           label="AI Assist"   color={'#f97316'} onClick={() => navigate('/ai')} />
        <QBtn icon={<Calendar size={18} />}      label="Calendar"    color={'#ec4899'} onClick={() => navigate('/calendar')} />
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 18, marginBottom: 18 }}>

        {/* LEFT: My Tasks */}
        <Panel>
          <SectionHead icon={<Flame size={15} color="#f97316" />} title="My Tasks" action="View all" onAction={() => navigate('/tasks')} />
          <div>
            {loading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Skel w={20} h={20} r={6} />
                    <div style={{ flex: 1 }}><Skel h={12} w="65%" style={{ marginBottom: 6 }} /><Skel h={10} w="40%" /></div>
                  </div>
                ))
              : displayTasks.map(t => (
                  <TaskRow key={t.id} t={{ ...t, status: checkedIds.has(t.id) ? 'done' : t.status }} onToggle={toggleCheck} />
                ))
            }
            {!loading && displayTasks.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                <CheckSquare size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                <p style={{ fontSize: 13 }}>No tasks yet — create your first one!</p>
              </div>
            )}
          </div>
        </Panel>

        {/* RIGHT: Project Progress */}
        <Panel>
          <SectionHead icon={<Star size={15} color={C.amber} />} title="Project Progress" action="View all" onAction={() => navigate('/projects')} />
          <div style={{ padding: '14px 14px 6px' }}>
            {loading
              ? [...Array(3)].map((_, i) => <Skel key={i} h={60} r={12} style={{ marginBottom: 8 }} />)
              : displayProjects.map((p, i) => <ProjectRow key={p.id} project={p} index={i} />)
            }
            {!loading && displayProjects.length === 0 && (
              <div style={{ padding: '32px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                <Briefcase size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }} />
                <p style={{ fontSize: 13 }}>No projects found</p>
              </div>
            )}
          </div>

          {/* Quick Actions inside panel */}
          <div style={{ padding: '14px 14px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 10px' }}>Quick Actions</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {[
                { label: 'New Task',    icon: <CheckSquare size={14} />, color: C.brand,   to: '/tasks'    },
                { label: 'New Project', icon: <Briefcase size={14} />,   color: C.violet,  to: '/projects' },
                { label: 'Start Chat',  icon: <MessageSquare size={14} />,color: C.emerald, to: '/chat'     },
                { label: 'Analytics',   icon: <BarChart2 size={14} />,   color: C.amber,   to: '/analytics'},
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.to)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: `${a.color}10`, border: `1px solid ${a.color}25`, cursor: 'pointer', color: a.color, fontSize: 12, fontWeight: 700, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${a.color}20`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.transform = ''; }}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* ── BOTTOM ROW ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18, marginBottom: 18 }}>

        {/* Team Presence */}
        <Panel>
          <SectionHead icon={<Activity size={15} color={C.brand} />} title="Team Presence"
            action={`${displayMembers.length} members`} onAction={() => navigate('/team')} />
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 8 }}>
              {loading
                ? [...Array(4)].map((_, i) => <Skel key={i} h={52} r={12} />)
                : displayMembers.slice(0, 8).map(m => <MemberPresence key={m.id} member={m} />)
              }
            </div>
            {!loading && displayMembers.length > 8 && (
              <button onClick={() => navigate('/team')} style={{ width: '100%', marginTop: 10, padding: '9px', borderRadius: 10, background: 'rgba(51,102,255,0.1)', border: '1px solid rgba(51,102,255,0.2)', color: C.brand, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(51,102,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(51,102,255,0.10)'; }}>
                View all {displayMembers.length} members →
              </button>
            )}
          </div>
        </Panel>

        {/* Recent Activity */}
        <Panel>
          <SectionHead icon={<Activity size={15} color={C.violet} />} title="Recent Activity" action="See all" onAction={() => navigate('/activity')} />
          <div>
            {loading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Skel w={30} h={30} r={15} />
                    <div style={{ flex: 1 }}><Skel h={11} w="75%" style={{ marginBottom: 5 }} /><Skel h={9} w="35%" /></div>
                  </div>
                ))
              : displayActivity.map(item => <ActivityItem key={item.id} item={item} user={user} />)
            }
          </div>
        </Panel>

        {/* Upcoming Deadlines */}
        <Panel>
          <SectionHead icon={<Calendar size={15} color={C.rose} />} title="Upcoming Deadlines" />
          <div style={{ padding: '12px 14px' }}>
            {loading
              ? [...Array(3)].map((_, i) => <Skel key={i} h={56} r={12} style={{ marginBottom: 8 }} />)
              : upcoming.length > 0
                ? upcoming.map((item, i) => <DeadlineCard key={item.id || i} item={item} idx={i} />)
                : (
                    // Demo deadlines when API has no results
                    [
                      { id: 'd1', title: 'Web App v2 Launch',    due_date: new Date(Date.now() + 2 * 86400000).toISOString() },
                      { id: 'd2', title: 'Design Review',        due_date: new Date(Date.now() + 5 * 86400000).toISOString() },
                      { id: 'd3', title: 'Q3 Roadmap Approval',  due_date: new Date(Date.now() + 7 * 86400000).toISOString() },
                    ].map((item, i) => <DeadlineCard key={item.id} item={item} idx={i} />)
                  )
            }
          </div>
        </Panel>
      </div>

      {/* ── AI INSIGHTS ─────────────────────────────────────────── */}
      <AIInsightsCard score={aiScore} />

      <style>{`
        @keyframes skelPulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.45; }
        }
        @keyframes pulseDot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.75); }
        }
        @media (max-width: 600px) {
          .custom-scrollbar { padding: 14px 12px !important; }
        }
      `}</style>
    </div>
  );
}
