import { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../store';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Clock, AlertTriangle, CheckCircle2, Circle, Filter } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
  urgent: { bar: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' },
  high:   { bar: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b' },
  medium: { bar: '#3366ff', bg: 'rgba(51,102,255,0.15)', border: 'rgba(51,102,255,0.4)', text: '#3366ff' },
  low:    { bar: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#10b981' },
};

const STATUS_ICON = {
  todo:        <Circle size={13} className="text-gray-500" />,
  in_progress: <Clock size={13} className="text-blue-400" />,
  review:      <AlertTriangle size={13} className="text-amber-400" />,
  done:        <CheckCircle2 size={13} className="text-emerald-400" />,
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function Schedule() {
  const { activeWorkspace } = useStore();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewStart, setViewStart] = useState(() => startOfWeek(new Date()));
  const [daysVisible, setDaysVisible] = useState(14); // 2-week view
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoveredTask, setHoveredTask] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (activeWorkspace) fetchData();
  }, [activeWorkspace]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch projects and tasks independently — one failure must not blank the other
    try {
      const res = await api.get(`/projects/?workspace=${activeWorkspace.id}`);
      const list = Array.isArray(res.data) ? res.data
        : (res.data?.results || res.data?.data || []);
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects:', err);
      toast.error('Could not load projects for this workspace');
    }

    try {
      const res = await api.get(`/tasks/?workspace=${activeWorkspace.id}`);
      const list = Array.isArray(res.data) ? res.data
        : (res.data?.results || res.data?.data || []);
      setTasks(list);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      toast.error('Failed to load schedule data');
    }

    setLoading(false);
  };

  // Generate visible date columns
  const dates = useMemo(() => {
    return Array.from({ length: daysVisible }, (_, i) => addDays(viewStart, i));
  }, [viewStart, daysVisible]);

  // Filter tasks
  const visibleTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.due_date); // Only tasks with due dates shown on Gantt
    if (filterProject !== 'all') {
      filtered = filtered.filter(t => {
        const pid = t.project && typeof t.project === 'object'
          ? String(t.project.id) : String(t.project);
        return pid === filterProject;
      });
    }
    if (filterStatus !== 'all') filtered = filtered.filter(t => t.status === filterStatus);
    return filtered;
  }, [tasks, filterProject, filterStatus]);

  // Tasks that have start_date + due_date (span bars) vs just due_date (milestone dots)
  const ganttTasks = useMemo(() => {
    return visibleTasks.map(t => {
      const due = new Date(t.due_date);
      const start = t.start_date ? new Date(t.start_date) : due;
      return { ...t, _start: start, _end: due };
    });
  }, [visibleTasks]);

  const viewEnd = addDays(viewStart, daysVisible - 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Column width in px
  const COL_W = 56;
  const ROW_H = 52;
  const LABEL_W = 220;

  function dayIndex(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const ms = d - viewStart;
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  const goBack = () => setViewStart(prev => addDays(prev, -daysVisible));
  const goForward = () => setViewStart(prev => addDays(prev, daysVisible));
  const goToToday = () => setViewStart(startOfWeek(new Date()));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#060b18', color: '#fff', overflow: 'hidden' }}>
      {/* ── Header ── */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0a1020', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(51,102,255,0.4)' }}>
              <CalendarDays size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Schedule & Gantt</h1>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, marginTop: 2 }}>
                {activeWorkspace?.name || 'No workspace'} · {formatDate(viewStart)} – {formatDate(viewEnd)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              {[7, 14, 30].map(d => (
                <button key={d} onClick={() => setDaysVisible(d)} style={{
                  padding: '6px 12px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  background: daysVisible === d ? 'rgba(51,102,255,0.3)' : 'transparent',
                  color: daysVisible === d ? '#fff' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.15s',
                }}>
                  {d}d
                </button>
              ))}
            </div>

            {/* Project filter */}
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, outline: 'none' }}
            >
              <option value="all">All Projects</option>
              {projects.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, outline: 'none' }}
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>

            {/* Navigation */}
            <button onClick={goBack} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={goToToday} style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(51,102,255,0.2)', border: '1px solid rgba(51,102,255,0.3)', color: '#3366ff', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
              Today
            </button>
            <button onClick={goForward} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Gantt Chart ── */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3366ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }} ref={containerRef}>
          <div style={{ minWidth: LABEL_W + COL_W * daysVisible }}>
            {/* ── Date header row ── */}
            <div style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 10, background: '#0a1020', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {/* label placeholder */}
              <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.07)', padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Task · {ganttTasks.length} scheduled
                </span>
              </div>
              {/* date columns */}
              {dates.map((d, i) => {
                const isToday = isSameDay(d, today);
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div key={i} style={{
                    width: COL_W, flexShrink: 0, textAlign: 'center', padding: '8px 2px',
                    borderRight: '1px solid rgba(255,255,255,0.04)',
                    background: isToday ? 'rgba(51,102,255,0.12)' : isWeekend ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: isToday ? '#3366ff' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: isToday ? '#3366ff' : isWeekend ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)', lineHeight: 1.2, marginTop: 1 }}>
                      {d.getDate()}
                    </div>
                    {isToday && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#3366ff', margin: '3px auto 0', boxShadow: '0 0 6px #3366ff' }} />}
                  </div>
                );
              })}
            </div>

            {/* ── Task rows ── */}
            {ganttTasks.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
                <CalendarDays size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                <p style={{ fontSize: 15, fontWeight: 700 }}>No tasks with due dates found</p>
                <p style={{ fontSize: 12, marginTop: 6 }}>
                  {filterProject !== 'all' || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Set due dates on tasks to see them in the Gantt chart.'}
                </p>
              </div>
            ) : (
              ganttTasks.map((task, rowIdx) => {
                const colors = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                const startIdx = dayIndex(task._start);
                const endIdx = dayIndex(task._end);
                const clampedStart = Math.max(0, startIdx);
                const clampedEnd = Math.min(daysVisible - 1, endIdx);
                const visible = clampedEnd >= 0 && clampedStart < daysVisible;
                const isOverdue = task._end < today && task.status !== 'done';

                return (
                  <div key={task.id} style={{
                    display: 'flex',
                    height: ROW_H,
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    position: 'relative',
                  }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                  >
                    {/* Task label */}
                    <div style={{
                      width: LABEL_W, flexShrink: 0,
                      borderRight: '1px solid rgba(255,255,255,0.07)',
                      padding: '8px 16px',
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: hoveredTask === task.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                    }}>
                      {STATUS_ICON[task.status] || STATUS_ICON.todo}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isOverdue ? '#ef4444' : '#fff', truncate: true, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: LABEL_W - 52 }}>
                          {isOverdue && '⚠ '}{task.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                          {task._end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Grid cells behind the bar */}
                    <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                      {dates.map((d, i) => {
                        const isToday = isSameDay(d, today);
                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                        return (
                          <div key={i} style={{
                            width: COL_W, flexShrink: 0, height: '100%',
                            borderRight: '1px solid rgba(255,255,255,0.03)',
                            background: isToday ? 'rgba(51,102,255,0.06)' : isWeekend ? 'rgba(255,255,255,0.01)' : 'transparent',
                          }} />
                        );
                      })}

                      {/* Gantt bar */}
                      {visible && (() => {
                        const barStart = clampedStart * COL_W;
                        const barWidth = Math.max(COL_W * 0.6, (clampedEnd - clampedStart + 1) * COL_W - 4);
                        const isMilestone = startIdx === endIdx; // single day = milestone diamond
                        const isDone = task.status === 'done';

                        return (
                          <div title={`${task.title} — Due: ${formatDate(task._end)}`} style={{
                            position: 'absolute',
                            left: barStart + 2,
                            top: isMilestone ? '50%' : '50%',
                            transform: isMilestone ? 'translateY(-50%) rotate(45deg)' : 'translateY(-50%)',
                            width: isMilestone ? 14 : barWidth,
                            height: isMilestone ? 14 : 22,
                            background: isDone
                              ? 'rgba(16,185,129,0.2)'
                              : isOverdue
                              ? 'rgba(239,68,68,0.2)'
                              : colors.bg,
                            border: `1.5px solid ${isDone ? '#10b981' : isOverdue ? '#ef4444' : colors.bar}`,
                            borderRadius: isMilestone ? 2 : 6,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', paddingLeft: 6, gap: 4,
                            overflow: 'hidden',
                            boxShadow: `0 0 8px ${isDone ? 'rgba(16,185,129,0.2)' : isOverdue ? 'rgba(239,68,68,0.15)' : colors.bg}`,
                            transition: 'all 0.15s',
                            opacity: isDone ? 0.6 : 1,
                          }}>
                            {!isMilestone && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: isDone ? '#10b981' : isOverdue ? '#ef4444' : colors.bar, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {task.title}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Legend ── */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0a1020', display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0, flexWrap: 'wrap' }}>
        {Object.entries(PRIORITY_COLORS).map(([p, c]) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c.bg, border: `1.5px solid ${c.bar}` }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(239,68,68,0.2)', border: '1.5px solid #ef4444' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Overdue</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(16,185,129,0.2)', border: '1.5px solid #10b981' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Done</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
