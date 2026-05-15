import React, { useState, useEffect } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  addMonths, subMonths, parseISO
} from 'date-fns';
import { useStore } from '../store';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, Globe, Clock, Filter, MoreVertical
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Calendar() {
  const { activeWorkspace } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspace) {
      loadWorkspaceTasks();
    }
  }, [activeWorkspace]);

  const loadWorkspaceTasks = async () => {
    try {
      const res = await api.get(`/tasks/?workspace=${activeWorkspace.id}`);
      setTasks(res.data);
    } catch (e) { 
      console.error('Failed to load tasks:', e);
    } finally { 
      setLoading(false); 
    }
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
            
            <Button variant="secondary" size="md" className="hidden sm:flex border-white/10">
              <Globe size={18} className="mr-2" /> Google Sync
            </Button>
            <Button variant="primary" size="md" className="font-black">
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
                
                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar-mini pr-1">
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

                {/* Hover Add Button */}
                {isCurrentMonth && (
                  <button className="absolute bottom-2 right-2 p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-brand hover:text-white">
                    <Plus size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
