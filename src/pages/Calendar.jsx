import React, { useState, useEffect } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay,
  addMonths, subMonths, parseISO
} from 'date-fns';
import { useStore } from '../store';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Plus, Globe, Clock, X, ExternalLink
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import api, { unwrapData } from '../services/api';
import toast from 'react-hot-toast';

// ─── Schedule Task Modal ──────────────────────────────────────────────────────
function ScheduleTaskModal({ isOpen, onClose, initialDate, onCreated, workspaceId }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    status: 'todo',
  });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !workspaceId) return;
    api.get(`/projects/?workspace=${workspaceId}`)
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || res.data?.data || []);
        setProjects(list);
        if (list.length > 0) setSelectedProject(String(list[0].id));
      })
      .catch(() => {});
  }, [isOpen, workspaceId]);

  // Sync date when initialDate changes (clicking + on a day)
  useEffect(() => {
    if (initialDate) {
      setForm(prev => ({ ...prev, due_date: format(initialDate, 'yyyy-MM-dd') }));
    }
  }, [initialDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!selectedProject) return toast.error('Please select a project');
    setSaving(true);
    try {
      const payload = { ...form, project: selectedProject };
      if (!payload.due_date) delete payload.due_date;
      const res = await api.post('/tasks/', payload);
      const task = res.data?.data || res.data;
      toast.success('Task scheduled! 📅');
      onCreated?.(task);
      setForm({ title: '', description: '', priority: 'medium', due_date: format(new Date(), 'yyyy-MM-dd'), status: 'todo' });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to schedule task');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1425] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
          <CalendarIcon size={22} className="text-brand" />
          Schedule Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Task Title *</label>
            <input
              required
              autoFocus
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What needs to be done?"
              className="w-full bg-[#060b18] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-brand/60 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Project *</label>
              <select
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                className="w-full bg-[#060b18] border border-white/10 rounded-2xl px-3 py-3 text-sm text-white outline-none focus:border-brand/60 transition-all"
              >
                <option value="">Select project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full bg-[#060b18] border border-white/10 rounded-2xl px-3 py-3 text-sm text-white outline-none focus:border-brand/60 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full bg-[#060b18] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-brand/60 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional details..."
              className="w-full bg-[#060b18] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-brand/60 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-brand hover:bg-brand/90 text-white font-black rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scheduling…</>
            ) : (
              <><CalendarIcon size={16} /> Schedule Task</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Google Sync Modal ────────────────────────────────────────────────────────
function GoogleSyncModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleOpenGoogleCalendar = () => {
    window.open('https://calendar.google.com', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1425] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <Globe size={24} className="text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Google Calendar Sync</h2>
            <p className="text-[11px] text-gray-500 font-medium">Sync your tasks with Google Calendar</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <h3 className="text-sm font-black text-white mb-2">How to sync tasks</h3>
            <ol className="space-y-2 text-[12px] text-gray-400 list-decimal list-inside">
              <li>Open Google Calendar and click <span className="text-white font-bold">+ Other calendars</span></li>
              <li>Select <span className="text-white font-bold">From URL</span></li>
              <li>Paste your workspace calendar feed URL below</li>
              <li>Click <span className="text-white font-bold">Add calendar</span></li>
            </ol>
          </div>

          <div className="bg-brand/10 border border-brand/20 rounded-2xl p-4">
            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-2">Tasks with due dates appear as all-day events</p>
            <p className="text-[11px] text-gray-400">
              Any task with a due date set on this board will automatically appear on the corresponding day in Google Calendar after syncing.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleOpenGoogleCalendar}
            className="flex-1 py-3 bg-brand hover:bg-brand/90 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <ExternalLink size={16} />
            Open Google Calendar
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-black rounded-2xl transition-all text-sm border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Calendar Component ──────────────────────────────────────────────────
export default function Calendar() {
  const { activeWorkspace } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [scheduleInitialDate, setScheduleInitialDate] = useState(null);

  useEffect(() => {
    if (activeWorkspace) {
      loadWorkspaceTasks();
    }
  }, [activeWorkspace]);

  const loadWorkspaceTasks = async () => {
    try {
      const res = await api.get(`/tasks/?workspace=${activeWorkspace.id}`);
      setTasks(unwrapData(res));
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    if (newTask) setTasks(prev => [...prev, newTask]);
  };

  const handleDrop = async (e, date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    try {
      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
      await api.patch(`/tasks/${taskId}/`, { due_date: formattedDate });
      setTasks(prev => prev.map(t =>
        t.id.toString() === taskId ? { ...t, due_date: formattedDate } : t
      ));
      toast.success(`Task rescheduled to ${format(date, 'MMM do')}`);
    } catch (err) {
      toast.error('Failed to reschedule task');
    }
  };

  const onDragOver = (e) => e.preventDefault();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-[#060b18] min-h-screen text-white">
      {/* Header Area */}
      <div className="p-8 md:p-12 border-b border-white/5 bg-[#080d1a]/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                <CalendarIcon size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Timeline</h1>
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Workspace Schedules & Deadlines</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-[#0b1429] border border-white/5 rounded-2xl p-1 shadow-sm">
              <Button variant="icon" onClick={prevMonth} size="sm">
                <ChevronLeft size={18} />
              </Button>
              <div className="px-6 text-sm font-black min-w-[160px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </div>
              <Button variant="icon" onClick={nextMonth} size="sm">
                <ChevronRight size={18} />
              </Button>
            </div>

            <Button
              variant="secondary"
              size="md"
              className="hidden sm:flex border-white/10"
              onClick={() => setShowGoogleModal(true)}
            >
              <Globe size={18} className="mr-2" /> Google Sync
            </Button>
            <Button
              variant="primary"
              size="md"
              className="font-black"
              onClick={() => { setScheduleInitialDate(null); setShowScheduleModal(true); }}
            >
              <Plus size={18} className="mr-2" /> Schedule Task
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="p-8 md:p-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
          {/* Week Header */}
          {weekDays.map(d => (
            <div key={d} className="bg-[#0b1429] py-6 text-center text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] border-b border-white/5">
              {d}
            </div>
          ))}

          {/* Days Grid */}
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const dayTasks = tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), day));

            return (
              <div
                key={i}
                onDragOver={onDragOver}
                onDrop={(e) => handleDrop(e, day)}
                className={`min-h-[160px] p-4 transition-all duration-300 flex flex-col group relative
                  ${!isCurrentMonth ? 'bg-[#060b18] opacity-20 grayscale pointer-events-none' : 'bg-[#0b1429] hover:bg-[#121b33]'}
                  ${isToday ? 'relative z-10' : ''}`}
              >
                {isToday && (
                   <div className="absolute inset-0 border-2 border-brand/50 rounded-none pointer-events-none" />
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all
                    ${isToday ? 'bg-brand text-white shadow-lg shadow-brand/40' : 'text-text-tertiary group-hover:text-white'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-black text-text-tertiary uppercase tracking-tighter opacity-60 group-hover:opacity-100">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                  {dayTasks.map(t => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('taskId', t.id.toString());
                      }}
                      className={`text-[9px] font-black uppercase p-2 rounded-xl border flex items-center gap-2 cursor-grab active:cursor-grabbing transition-all hover:translate-x-1
                        ${t.status === 'done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                          t.priority === 'urgent' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                          'bg-brand/10 border-brand/20 text-brand'}`}
                      title={t.title}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                         t.status === 'done' ? 'bg-emerald-500' :
                         t.priority === 'urgent' ? 'bg-rose-500' : 'bg-brand'
                      }`} />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Add Button — opens Schedule modal pre-filled with this date */}
                {isCurrentMonth && (
                  <button
                    onClick={() => { setScheduleInitialDate(day); setShowScheduleModal(true); }}
                    className="absolute bottom-2 right-2 p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-brand hover:text-white"
                    title={`Schedule task for ${format(day, 'MMM d')}`}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <ScheduleTaskModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        initialDate={scheduleInitialDate}
        onCreated={handleTaskCreated}
        workspaceId={activeWorkspace?.id}
      />
      <GoogleSyncModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />
    </div>
  );
}
