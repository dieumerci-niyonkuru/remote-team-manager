import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { task, proj, ws, ai, unwrapData } from '../services/api';
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
          <Link to="/workspaces" style={{ background: 'var(--brand)', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
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
          <button onClick={() => window.location.reload()} style={{ ...card, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'var(--brand)' },
            { label: 'Completed', value: doneTasks, icon: TrendingUp, color: 'var(--success)' },
            { label: 'In Progress', value: inProgressTasks, icon: Clock, color: 'var(--accent)' },
            { label: 'Review', value: reviewTasks, icon: Clock, color: 'var(--warning)' },
            { label: 'To Do', value: todoTasks, icon: CheckSquare, color: 'var(--text3)' },
            { label: 'Projects', value: projectCount, icon: FolderKanban, color: 'var(--brand)' },
          ].map(s => (
            <div key={s.label} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  <s.icon size={14} />
                </span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, flex: 1 }}>
              {quickActions.map(a => (
                <Link key={a.label} to={a.to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 6px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
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
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'To Do', count: todoTasks, color: 'var(--text3)' },
                { label: 'In Progress', count: inProgressTasks, color: 'var(--brand)' },
                { label: 'Review', count: reviewTasks, color: 'var(--warning)' },
                { label: 'Done', count: doneTasks, color: 'var(--success)' },
              ].map(s => (
                <div key={s.label} style={{ flex: '1 1 120px', padding: '10px 14px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</span>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {onlineMembers.map(m => (
                <div key={m.id || m.user} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: 'var(--bg)' }}>
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
