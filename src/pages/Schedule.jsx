import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { task, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format, isAfter, startOfDay } from 'date-fns';
import { CalendarDays, Clock, Plus, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

const STATUS_MAP = {
  todo: { color: 'var(--text3)', label: 'To Do' },
  in_progress: { color: 'var(--brand)', label: 'In Progress' },
  review: { color: 'var(--warning)', label: 'Review' },
  done: { color: 'var(--success)', label: 'Done' },
};

export default function Schedule() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('upcoming');

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await task.list(activeWorkspace.id);
      const all = unwrapData(res);
      setTasks(all);
    } catch {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const now = startOfDay(new Date());

  const upcoming = tasks.filter(t => {
    if (!t.due_date) return false;
    return isAfter(new Date(t.due_date), now) || format(new Date(t.due_date), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
  });

  const overdue = tasks.filter(t => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    return d < now && t.status !== 'done';
  });

  const today = tasks.filter(t => {
    if (!t.due_date) return false;
    return format(new Date(t.due_date), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
  });

  const thisWeek = tasks.filter(t => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return d > now && d <= weekEnd && format(d, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd');
  });

  const grouped = {};
  const source = view === 'upcoming' ? upcoming : view === 'overdue' ? overdue : view === 'today' ? today : view === 'week' ? thisWeek : tasks;

  source.forEach(t => {
    const key = t.due_date ? format(new Date(t.due_date), 'yyyy-MM-dd') : 'No Date';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => {
    if (a === 'No Date') return 1;
    if (b === 'No Date') return -1;
    return a.localeCompare(b);
  });

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { key: 'today', label: 'Today', count: today.length },
    { key: 'week', label: 'This Week', count: thisWeek.length },
    { key: 'overdue', label: 'Overdue', count: overdue.length },
    { key: 'all', label: 'All', count: tasks.length },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('schedule.title', 'Schedule')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{source.length} tasks</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setView(tab.key)}
            style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.15s', flexShrink: 0,
              background: view === tab.key ? 'var(--brand)' : 'var(--bg2)',
              border: view === tab.key ? '1px solid var(--brand)' : '1px solid var(--border)',
              color: view === tab.key ? '#fff' : 'var(--text3)' }}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : sortedDates.length === 0 ? (
        <EmptyState icon={<CalendarDays size={24} />} title="No tasks" description="Nothing scheduled for this view." />
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {date === 'No Date' ? 'No Deadline' : format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {grouped[date].sort((a, b) => {
                  if (!a.due_date) return 1;
                  if (!b.due_date) return -1;
                  return new Date(a.due_date) - new Date(b.due_date);
                }).map((tk, i) => {
                  const st = STATUS_MAP[tk.status] || STATUS_MAP.todo;
                  return (
                    <div key={tk.id || i} style={{ ...cardBase, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                      <div style={{ width: 4, height: 32, borderRadius: 2, background: st.color, flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{tk.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {tk.priority && <Badge variant="secondary" style={{ fontSize: 9 }}>{tk.priority}</Badge>}
                          {tk.project_name && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{tk.project_name}</span>}
                        </div>
                      </div>
                      {tk.due_date && (
                        <span className="flex items-center gap-1 shrink-0" style={{ fontSize: 11, color: 'var(--text3)' }}>
                          <Clock size={11} />
                          {format(new Date(tk.due_date), 'h:mm a')}
                        </span>
                      )}
                      <div style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: `${st.color}15`, color: st.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {st.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
