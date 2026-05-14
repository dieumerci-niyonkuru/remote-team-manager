import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  Activity as ActivityIcon, 
  CheckCircle, 
  MessageSquare, 
  UserPlus, 
  PlusCircle, 
  RefreshCw, 
  Clock,
  ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Activity() {
  const { activeWorkspace } = useStore();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspace) {
      fetchActivity();
    }
  }, [activeWorkspace]);

  const fetchActivity = async () => {
    try {
      // In production, this would be a dedicated /activity/ endpoint
      // For now, we simulate with a premium feed structure
      const mockData = [
        { id: 1, actor: 'Sarah Connor', verb: 'completed task', target: 'API Implementation', time: '2 mins ago', type: 'task' },
        { id: 2, actor: 'John Doe', verb: 'posted a comment in', target: 'UX Research', time: '15 mins ago', type: 'comment' },
        { id: 3, actor: 'Alex Murphy', verb: 'created a new project', target: 'Mobile Redesign', time: '1 hr ago', type: 'project' },
        { id: 4, actor: 'James Bond', verb: 'joined the workspace', target: activeWorkspace?.name, time: '3 hrs ago', type: 'member' },
        { id: 5, actor: 'Ellen Ripley', verb: 'updated priority for', target: 'Security Audit', time: '5 hrs ago', type: 'task' },
      ];
      setActivities(mockData);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'task': return <CheckCircle className="text-green-500" size={18} />;
      case 'comment': return <MessageSquare className="text-blue-500" size={18} />;
      case 'project': return <PlusCircle className="text-purple-500" size={18} />;
      case 'member': return <UserPlus className="text-orange-500" size={18} />;
      default: return <ActivityIcon className="text-gray-500" size={18} />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <ActivityIcon className="text-blue-500" size={36} />
            Activity Pulse
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Tracking the real-time heartbeat of <span className="text-white font-bold">{activeWorkspace?.name}</span>.</p>
        </div>
        <button 
          onClick={() => { fetchActivity(); toast.success('Feed updated'); }}
          className="flex items-center gap-2 bg-gray-800/40 hover:bg-gray-800/80 text-gray-300 px-6 py-3 rounded-2xl font-bold transition-all border border-gray-800"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="relative">
        {/* Timeline Stem */}
        <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-gray-800 to-transparent" />

        <div className="space-y-12 relative z-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : activities.map((act) => (
            <div key={act.id} className="flex gap-8 group">
              <div className="w-14 h-14 rounded-2xl bg-[#0d1425] border border-gray-800 flex items-center justify-center shrink-0 shadow-2xl group-hover:border-blue-500/50 transition-all duration-500">
                {getIcon(act.type)}
              </div>
              <div className="flex-1 bg-gray-800/20 border border-gray-800 rounded-[28px] p-6 hover:bg-gray-800/40 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                   <p className="text-sm font-medium text-gray-400">
                     <span className="text-white font-black">{act.actor}</span> {act.verb} <span className="text-blue-400 font-bold">{act.target}</span>
                   </p>
                   <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">
                     <Clock size={12} />
                     {act.time}
                   </span>
                </div>
                <div className="flex items-center justify-end">
                   <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">
                     View Details
                     <ArrowUpRight size={12} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
