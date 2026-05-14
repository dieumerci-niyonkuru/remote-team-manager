import React, { useState, useEffect } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { useStore } from '../store';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
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

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <CalendarIcon className="text-blue-500" size={36} />
            Timeline
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Visualizing project milestones and task deadlines.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800/40 p-1.5 rounded-2xl border border-gray-800">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 px-2 transition-colors">
              Today
            </button>
            <span className="text-sm font-black text-white px-4 min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20">
            <Plus size={20} />
            Schedule Event
          </button>
        </div>
      </div>

      <div className="bg-gray-800/20 border border-gray-800 rounded-[40px] p-8 md:p-10 shadow-2xl overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px]">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-4 mb-8">
            {weekDays.map(d => (
              <div key={d} className="text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4">
            {days.map((day, i) => {
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              const dayTasks = tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), day));

              return (
                <div 
                  key={i} 
                  className={`min-h-[160px] rounded-3xl p-4 border transition-all duration-500 flex flex-col ${
                    !isCurrentMonth ? 'opacity-20 pointer-events-none' : 'opacity-100'
                  } ${
                    isToday ? 'bg-blue-600/10 border-blue-500/50 shadow-2xl shadow-blue-600/10' : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className={`text-sm font-black mb-4 w-8 h-8 flex items-center justify-center rounded-xl ${
                    isToday ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                    {dayTasks.map(t => (
                      <div 
                        key={t.id} 
                        className={`text-[9px] font-black uppercase p-2 rounded-lg border truncate ${
                          t.status === 'done' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        }`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
