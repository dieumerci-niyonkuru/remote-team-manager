import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react';
import WorkspaceAnalytics from '../components/dashboard/WorkspaceAnalytics';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, activeWorkspace } = useStore();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    members: 0,
    activity: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspace) {
      fetchDashboardData();
    }
  }, [activeWorkspace]);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, membersRes] = await Promise.all([
        api.get(`/projects/?workspace=${activeWorkspace.id}`),
        api.get(`/tasks/?workspace=${activeWorkspace.id}&assignee=${user.id}`),
        api.get(`/workspaces/${activeWorkspace.id}/members/`)
      ]);

      setStats({
        projects: projectsRes.data.length,
        tasks: tasksRes.data.length,
        members: membersRes.data.length,
        activity: 12 // Mock activity count
      });

      setRecentTasks(tasksRes.data.slice(0, 5));
      setActiveProjects(projectsRes.data.slice(0, 3));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="text-blue-500">{user?.username}</span> 👋
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Here's what's happening in <span className="text-white font-bold">{activeWorkspace?.name}</span> today.</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-800/40 p-2 rounded-2xl border border-gray-800">
           <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
             <TrendingUp size={20} />
           </div>
           <div className="pr-4">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Productivity</p>
             <p className="text-sm font-bold text-white">+14% this week</p>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Projects" value={stats.projects} icon={<Briefcase />} color="blue" />
        <StatCard title="My Tasks" value={stats.tasks} icon={<CheckSquare />} color="purple" />
        <StatCard title="Team Members" value={stats.members} icon={<Users />} color="green" />
        <StatCard title="Recent Activity" value={stats.activity} icon={<Clock />} color="orange" />
      </div>

      {/* Analytics Pulse Section */}
      <WorkspaceAnalytics 
        tasks={tasks} 
        projects={projects} 
        members={members} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Recent Tasks */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckSquare className="text-purple-500" size={24} />
                My Recent Tasks
              </h3>
              <button className="text-sm font-bold text-blue-500 hover:underline flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
           </div>

           <div className="bg-gray-800/30 border border-gray-800 rounded-3xl overflow-hidden divide-y divide-gray-800/50">
              {loading ? (
                <div className="p-10 text-center text-gray-500">Loading tasks...</div>
              ) : recentTasks.length === 0 ? (
                <div className="p-10 text-center text-gray-500 font-medium italic">No tasks assigned to you in this workspace yet.</div>
              ) : (
                recentTasks.map(task => (
                  <div key={task.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className={`w-2 h-10 rounded-full ${task.priority === 'urgent' ? 'bg-rose-500' : 'bg-blue-500'} opacity-40 group-hover:opacity-100 transition-opacity`} />
                       <div>
                          <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1 uppercase font-black tracking-tighter">{task.status.replace('_', ' ')} • {task.priority}</p>
                       </div>
                    </div>
                    <ArrowUpRight size={18} className="text-gray-700 group-hover:text-blue-500 transition-colors" />
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Right Column: Active Projects & Team */}
        <div className="space-y-8">
           <div>
              <h3 className="text-xl font-bold text-white mb-6">Active Projects</h3>
              <div className="space-y-4">
                 {activeProjects.map(project => (
                   <div key={project.id} className="p-4 bg-gray-800/20 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{project.project_type}</span>
                         <span className="text-[10px] font-bold text-white">{project.progress}%</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{project.name}</h4>
                      <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                         <div className="bg-blue-600 h-full rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 p-6 rounded-3xl border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-400" />
                Team Chat
              </h3>
              <p className="text-xs text-blue-200/60 mb-4 font-medium">Quickly jump back into the conversation.</p>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                Open Chat
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5',
    green: 'text-green-500 bg-green-500/10 border-green-500/20 shadow-green-500/5',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/5',
  };

  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} bg-gray-800/10 shadow-xl flex flex-col items-center text-center group hover:translate-y-[-2px] transition-all`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}
