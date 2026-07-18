import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { task, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { CalendarDays, Clock, Plus } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import StatusBadge from '../components/common/StatusBadge';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

const STATUS_COLORS = {
  todo: 'var(--text3)',
  in_progress: 'var(--brand)',
  review: 'var(--warning)',
  done: 'var(--success)',
};

export default function Schedule() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await task.list(activeWorkspace.id, undefined, { upcoming: true });
      setTasks(unwrapData(res));
    } catch (e) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const grouped = tasks.reduce((acc, t) => {
    const key = t.deadline ? format(new Date(t.deadline), 'yyyy-MM-dd') : 'No Date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('schedule.title', 'Schedule')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{tasks.length} upcoming tasks</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState icon={<CalendarDays size={24} />} title="No upcoming tasks" description="All clear — nothing scheduled." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, dayTasks]) => (
            <div key={date}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {date === 'No Date' ? 'No Date' : format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {dayTasks.sort((a, b) => {
                  if (!a.deadline) return 1;
                  if (!b.deadline) return -1;
                  return new Date(a.deadline) - new Date(b.deadline);
                }).map((t, i) => (
                  <div key={t.id || i} style={{ ...cardBase, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div style={{ width: 8, height: 8, borderRadius: 3, background: STATUS_COLORS[t.status] || 'var(--text3)', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.title}</span>
                      {t.priority && <Badge variant="secondary" style={{ marginLeft: 6, fontSize: 9 }}>{t.priority}</Badge>}
                    </div>
                    {t.deadline && (
                      <span className="flex items-center gap-1 shrink-0" style={{ fontSize: 11, color: 'var(--text3)' }}>
                        <Clock size={11} /> {format(new Date(t.deadline), 'h:mm a')}
                      </span>
                    )}
                    <StatusBadge status={t.status} color={STATUS_COLORS[t.status]} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
