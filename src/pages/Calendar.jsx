import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { task, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await task.list(activeWorkspace.id);
      const all = unwrapData(r);
      setTasks(Array.isArray(all) ? all.filter(t => t.deadline) : []);
    } catch (e) { toast.error('Failed to load calendar'); } finally { setLoading(false); }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const tasksForDay = (d) => tasks.filter(t => t.deadline && isSameDay(new Date(t.deadline), d));
  const selectedTasks = tasksForDay(selectedDate);

  const statusColor = (s) => ({ todo: 'var(--text3)', in_progress: 'var(--brand)', review: 'var(--warning)', done: 'var(--success)' }[s] || 'var(--text3)');

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('calendar.title', 'Calendar')}</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>Task deadlines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, gridColumn: 'span 2' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', color: 'var(--text3)', cursor: 'pointer', minHeight: 36, display: 'flex', alignItems: 'center' }}><ChevronLeft size={14} /></button>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', color: 'var(--text3)', cursor: 'pointer', minHeight: 36, display: 'flex', alignItems: 'center' }}><ChevronRight size={14} /></button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><LoadingSpinner size={24} /></div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text3)', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d}</div>
              ))}
              {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
              {days.map(d => {
                const dayTasks = tasksForDay(d);
                const isToday = isSameDay(d, new Date());
                const isSelected = isSameDay(d, selectedDate);
                return (
                  <button key={d.toISOString()} onClick={() => setSelectedDate(d)}
                    style={{ background: isSelected ? 'var(--brand)' : isToday ? 'var(--brand-bg)' : 'transparent', border: isSelected ? '1px solid var(--brand)' : '1px solid transparent', borderRadius: 6, padding: '6px 4px', cursor: 'pointer', textAlign: 'center', transition: '0.15s', minHeight: 40 }}>
                    <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: isSelected ? '#fff' : isToday ? 'var(--brand)' : 'var(--text)' }}>{format(d, 'd')}</span>
                    {dayTasks.length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-1">
                        {dayTasks.slice(0, 3).map((t, i) => (
                          <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: statusColor(t.status) }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>{format(selectedDate, 'EEEE, MMM d')}</h3>
          <p style={{ fontSize: 11, color: 'var(--text3)', margin: '0 0 16px' }}>{selectedTasks.length} tasks due</p>
          {selectedTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>
              <CalIcon size={24} style={{ opacity: 0.4, marginBottom: 6 }} />
              <p style={{ fontSize: 12 }}>No tasks due on this day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((t, i) => (
                <div key={t.id || i} style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, borderLeft: `3px solid ${statusColor(t.status)}` }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{t.title}</h4>
                  <div className="flex items-center gap-3 mt-1" style={{ fontSize: 11, color: 'var(--text3)' }}>
                    <span className="flex items-center gap-1"><Clock size={10} /> {format(new Date(t.deadline), 'h:mm a')}</span>
                    <span style={{ color: statusColor(t.status), fontWeight: 600 }}>{t.status?.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
