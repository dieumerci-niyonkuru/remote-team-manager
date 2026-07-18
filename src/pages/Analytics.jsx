import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { proj, task, ws, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { TrendingUp, Users, FolderKanban, CheckSquare, BarChart3, Activity } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

export default function Analytics() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [taskList, setTaskList] = useState([]);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const wid = activeWorkspace.id;
      const [projRes, taskRes, memRes] = await Promise.allSettled([
        proj.list(wid),
        task.list(wid, undefined, {}),
        ws.members(wid),
      ]);
      if (projRes.status === 'fulfilled') setProjectCount(unwrapData(projRes.value).length);
      if (taskRes.status === 'fulfilled') setTaskList(unwrapData(taskRes.value));
      if (memRes.status === 'fulfilled') setMemberCount(unwrapData(memRes.value).length);
    } catch {
      toast.error('Failed to load analytics');
    } finally { setLoading(false); }
  };

  const completedTasks = taskList.filter(t => t.status === 'done' || t.status === 'completed').length;
  const inProgressTasks = taskList.filter(t => t.status === 'in_progress' || t.status === 'active').length;
  const productivity = taskList.length > 0 ? Math.round((completedTasks / taskList.length) * 100) : 0;

  const statsCards = [
    { label: 'Projects', value: projectCount, icon: <FolderKanban size={16} />, color: 'var(--brand)' },
    { label: 'Tasks Done', value: completedTasks, icon: <CheckSquare size={16} />, color: 'var(--success)' },
    { label: 'Team Members', value: memberCount, icon: <Users size={16} />, color: 'var(--accent)' },
    { label: 'Productivity', value: `${productivity}%`, icon: <TrendingUp size={16} />, color: 'var(--warning)' },
  ];

  const taskStatuses = [
    { label: 'Completed', count: completedTasks, color: 'var(--success)' },
    { label: 'In Progress', count: inProgressTasks, color: 'var(--brand)' },
    { label: 'To Do', count: taskList.filter(t => t.status === 'todo' || t.status === 'pending').length, color: 'var(--text3)' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('analytics.title', 'Analytics')}</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>Workspace performance overview</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsCards.map((s, i) => (
              <div key={i} style={cardBase}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={cardBase}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }} className="flex items-center gap-2">
                <BarChart3 size={14} style={{ color: 'var(--brand)' }} /> Task Breakdown
              </h3>
              <div className="space-y-3">
                {taskStatuses.map((s, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{s.count}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: taskList.length > 0 ? `${(s.count / taskList.length) * 100}%` : '0%', background: s.color, borderRadius: 4, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                ))}
                {taskList.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 20 }}>No task data available</p>
                )}
              </div>
            </div>

            <div style={cardBase}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }} className="flex items-center gap-2">
                <Activity size={14} style={{ color: 'var(--brand)' }} /> Overview
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Projects', value: projectCount },
                  { label: 'Total Tasks', value: taskList.length },
                  { label: 'Team Size', value: memberCount },
                  { label: 'Completion Rate', value: `${productivity}%` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
