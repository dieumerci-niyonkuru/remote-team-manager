import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { task, proj, ws, ai, timer, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { useStore } from '../store';
import { getT } from '../i18n';
import { format } from 'date-fns';
import {
  CheckSquare, FolderKanban, Users, TrendingUp, Clock,
  ArrowRight, MessageSquare, LayoutDashboard, RefreshCw,
  BarChart3, Lightbulb
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const card = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 'clamp(16px, 2vw, 20px)',
  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
};

const quickActions = [
  { label: 'Projects', to: '/projects', icon: FolderKanban, color: 'var(--brand)' },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare, color: 'var(--accent)' },
  { label: 'Chat', to: '/chat', icon: MessageSquare, color: 'var(--success)' },
  { label: 'Team', to: '/team', icon: Users, color: 'var(--warning)' },
  { label: 'Analytics', to: '/analytics', icon: BarChart3, color: 'var(--brand)' },
];

export default function Dashboard() {
  const { user, activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [focusActive, setFocusActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const intervalRef = useRef(null);

  const formatTime = useCallback((totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }, []);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
  }, []);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleToggleFocus = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      if (focusActive) {
        await timer.pause(activeWorkspace.id);
        setFocusActive(false);
        clearTimerInterval();
        setTasks(unwrapData(await task.list(activeWorkspace.id)));
      } else {
        await timer.start(activeWorkspace.id);
        setFocusActive(true);
        setTimerSeconds(0);
        startInterval();
      }
    } catch {
      toast.error(t('dashboard.timer_failed', 'Timer action failed'));
    }
  }, [activeWorkspace, focusActive, clearTimerInterval, startInterval, t]);

  useEffect(() => {
    if (!activeWorkspace) { setLoading(false); return; }
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const wid = activeWorkspace.id;
        const [tasksRes, projRes, memRes, actRes, sumRes, insRes] = await Promise.allSettled([
          task.list(wid),
          proj.list(wid),
          ws.members(wid),
          ws.activity(wid),
          ai.summary(),
          ai.insights(),
        ]);

        if (cancelled) return;

        if (tasksRes.status === 'fulfilled') setTasks(unwrapData(tasksRes.value));
        if (projRes.status === 'fulfilled') setProjects(unwrapData(projRes.value));
        if (memRes.status === 'fulfilled') setMembers(unwrapData(memRes.value));
        if (actRes.status === 'fulfilled') setActivity(unwrapData(actRes.value));
        if (sumRes.status === 'fulfilled') setSummary(unwrapData(sumRes.value));
        if (insRes.status === 'fulfilled') setInsights(unwrapData(insRes.value));
      } catch {
        if (!cancelled) toast.error(t('dashboard.load_failed', 'Failed to load dashboard'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeWorkspace, lang]);

  useEffect(() => {
    if (!activeWorkspace) return;
    let cancelled = false;

    async function syncTimer() {
      try {
        const res = await timer.logs();
        const logs = unwrapData(res);
        const active = Array.isArray(logs) && logs.find(l => l.end == null);
        if (!cancelled && active) {
          setFocusActive(true);
          const started = new Date(active.start);
          const elapsed = Math.floor((Date.now() - started.getTime()) / 1000);
          setTimerSeconds(Math.max(0, elapsed));
          startInterval();
        }
      } catch {}
    }

    syncTimer();
    return () => { cancelled = true; };
  }, [activeWorkspace, startInterval]);

  useEffect(() => {
    return () => clearTimerInterval();
  }, [clearTimerInterval]);

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'there';
  const completionRate = summary?.completion_rate ?? 0;
  const totalTasks = summary?.total ?? tasks.length;
  const doneTasks = summary?.done ?? tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = summary?.in_progress ?? tasks.filter(t => t.status === 'in_progress').length;
  const reviewTasks = tasks.filter(t => t.status === 'review').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const projectCount = projects.length;
  const onlineMembers = members.filter(m => m.is_online);

  if (!activeWorkspace) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--brand-bg, var(--brand)15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <LayoutDashboard size={26} style={{ color: 'var(--brand)' }} />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>No Workspace Selected</h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Create or select a workspace to get started.</p>
          <Link to="/workspaces" style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))', color: '#fff', padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 8px 24px rgba(51,102,255,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(51,102,255,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(51,102,255,0.3)'; }}
            >
            Go to Workspaces
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              {getGreeting()}, {firstName}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <button onClick={() => window.location.reload()} style={{ ...card, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'clamp(8px, 1.5vw, 12)' }}>
          {[
            { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'var(--brand)' },
            { label: 'Completed', value: doneTasks, icon: TrendingUp, color: 'var(--success)' },
            { label: 'In Progress', value: inProgressTasks, icon: Clock, color: 'var(--accent)' },
            { label: 'Review', value: reviewTasks, icon: Clock, color: 'var(--warning)' },
            { label: 'To Do', value: todoTasks, icon: CheckSquare, color: 'var(--text3)' },
            { label: 'Projects', value: projectCount, icon: FolderKanban, color: 'var(--brand)' },
          ].map(s => (
            <div key={s.label} style={card}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(6px, 1.5vw, 10)' }}>
                <span style={{ fontSize: 'clamp(10px, 1.2vw, 11)', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                <span style={{ width: 'clamp(24px, 3vw, 28)', height: 'clamp(24px, 3vw, 28)', borderRadius: 8, background: `${s.color}15`, border: `1px solid ${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  <s.icon size={14} />
                </span>
              </div>
              <div style={{ fontSize: 'clamp(18px, 3vw, 24)', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: focusActive ? 'var(--success)15' : 'var(--brand)15', border: `1px solid ${focusActive ? 'var(--success)30' : 'var(--brand)30'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} style={{ color: focusActive ? 'var(--success)' : 'var(--brand)' }} />
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Focus Timer</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: focusActive ? 'var(--success)' : 'var(--text)', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{formatTime(timerSeconds)}</div>
            </div>
          </div>
          <button
            onClick={handleToggleFocus}
            style={{ padding: '10px 20px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff', background: focusActive ? 'var(--danger, #e53e3e)' : 'linear-gradient(135deg, var(--brand), var(--accent))', boxShadow: focusActive ? '0 4px 12px rgba(229,62,62,0.3)' : '0 4px 12px rgba(51,102,255,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            {focusActive ? 'Stop Focus' : 'Start Focus'}
          </button>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>Completion Rate</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand)' }}>{Math.round(completionRate)}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--bg3, var(--border))', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(completionRate, 100)}%`, borderRadius: 4, background: 'var(--brand)', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(10px, 2vw, 14)' }}>

          <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', margin: '0 0 12px' }}>Recent Activity</h3>
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 300, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activity.length === 0 && <p style={{ fontSize: 12, color: 'var(--text3)' }}>No recent activity</p>}
              {activity.slice(0, 10).map((a, i) => (
                <div key={a.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < activity.slice(0, 10).length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: 'var(--text2)', margin: 0, lineHeight: 1.5 }}>
                      {a.description || a.action || JSON.stringify(a)}
                    </p>
                    {a.timestamp && (
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {format(new Date(a.timestamp), 'MMM d, h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', margin: '0 0 12px' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 'clamp(6px, 1.2vw, 10)', flex: 1 }}>
              {quickActions.map(a => (
                <Link key={a.label} to={a.to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(4px, 0.8vw, 6)', padding: 'clamp(10px, 2vw, 14px) clamp(4px, 0.8vw, 6px)', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px -6px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <a.icon size={18} style={{ color: a.color }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {tasks.length > 0 && (
          <div style={card}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', margin: '0 0 12px' }}>Task Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'clamp(6px, 1.2vw, 12)' }}>
              {[
                { label: 'To Do', count: todoTasks, color: 'var(--text3)' },
                { label: 'In Progress', count: inProgressTasks, color: 'var(--brand)' },
                { label: 'Review', count: reviewTasks, color: 'var(--warning)' },
                { label: 'Done', count: doneTasks, color: 'var(--success)' },
              ].map(s => (
                <div key={s.label} style={{ padding: 'clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ fontSize: 'clamp(10px, 1.2vw, 11)', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 'clamp(16px, 2.5vw, 20)', fontWeight: 800, color: s.color }}>{s.count}</span>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--bg3)' }}>
                      <div style={{ height: '100%', width: `${totalTasks ? (s.count / totalTasks) * 100 : 0}%`, borderRadius: 2, background: s.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights && (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Lightbulb size={16} style={{ color: 'var(--warning)' }} />
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Productivity Insights</h3>
              {insights.score != null && (
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: 'var(--brand)' }}>
                  Score: {insights.score}
                </span>
              )}
            </div>
            {insights.recommendations?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {insights.recommendations.map((r, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, padding: '6px 0', borderBottom: i < insights.recommendations.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {typeof r === 'string' ? r : r.text || r.message || JSON.stringify(r)}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>No recommendations available right now.</p>
            )}
          </div>
        )}

        {onlineMembers.length > 0 && (
          <div style={card}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', margin: '0 0 12px' }}>
              Team Online ({onlineMembers.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(6px, 1.2vw, 10)' }}>
              {onlineMembers.map(m => (
                <div key={m.id || m.user} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'clamp(4px, 0.8vw, 6px) clamp(8px, 1.5vw, 10px)', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--success)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>
                    {m.user_name || m.first_name || m.name || `User ${m.id}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
