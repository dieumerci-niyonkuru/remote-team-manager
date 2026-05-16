import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  Briefcase, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  Zap,
  Activity
} from 'lucide-react';
import WorkspaceAnalytics from '../components/dashboard/WorkspaceAnalytics';
import Avatar from '../components/common/Avatar';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import api from '../services/api';

export default function Dashboard() {
  const { user, activeWorkspace } = useStore();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    members: 0,
    activity: 0
  });
  const [tasksList, setTasksList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [membersList, setMembersList] = useState([]);
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

      const projectsData = projectsRes.data.data || projectsRes.data || [];
      const tasksData = tasksRes.data.data || tasksRes.data || [];
      const membersData = membersRes.data.data || membersRes.data || [];

      setProjectsList(projectsData);
      setTasksList(tasksData);
      setMembersList(membersData);

      setStats({
        projects: projectsData.length,
        tasks: tasksData.length,
        members: membersData.length,
        activity: 12
      });

      setRecentTasks(tasksData.slice(0, 5));
      setActiveProjects(projectsData.slice(0, 3));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 max-w-7xl mx-auto space-y-10 bg-[#060b18]">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black tracking-widest text-blue-500 uppercase mb-4">
            <Zap size={12} fill="currentColor" /> System Online
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            Welcome, {user?.first_name || user?.username}
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Your node is active in <span className="text-white font-black">{activeWorkspace?.name || 'Default Workspace'}</span>.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-xl">
           <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
             <TrendingUp size={24} />
           </div>
           <div className="pr-4">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Velocity Impact</p>
             <p className="text-lg font-black text-white">+14.2%</p>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Projects", value: stats.projects, icon: <Briefcase size={22} />, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Pending Tasks", value: stats.tasks, icon: <CheckSquare size={22} />, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Active Nodes", value: stats.members, icon: <Users size={22} />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Live Activity", value: stats.activity, icon: <Activity size={22} />, color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((stat, i) => (
          <Card key={i} variant="glass" className="p-6 text-center group hover:-translate-y-1 transition-all duration-500 border-white/5">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color} border border-white/5 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
            <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Recent Tasks */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <CheckSquare className="text-blue-500" size={28} />
                Critical Trajectory
              </h3>
              <Button variant="ghost" className="text-xs font-black uppercase tracking-widest" onClick={() => window.location.href='/tasks'}>
                View All <ChevronRight size={16} />
              </Button>
           </div>

           <Card variant="glass" className="overflow-hidden border-white/5 p-0 divide-y divide-white/5 shadow-2xl">
              {loading ? (
                <div className="p-20 text-center animate-pulse text-gray-500 font-black uppercase tracking-widest">Scanning Network...</div>
              ) : recentTasks.length === 0 ? (
                <div className="p-20 text-center text-gray-500 font-medium italic">No active trajectories detected.</div>
              ) : (
                recentTasks.map(task => (
                  <div key={task.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer">
                    <div className="flex items-center gap-6">
                       <div className={`w-1.5 h-12 rounded-full ${task.priority === 'urgent' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' : 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]'} transition-all`} />
                       <div>
                          <p className="text-lg font-black text-white group-hover:text-blue-400 transition-colors tracking-tight leading-none">{task.title}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-[10px] font-black px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-gray-400 uppercase tracking-widest">{task.status.replace('_', ' ')}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${task.priority === 'urgent' ? 'text-rose-500' : 'text-blue-500'}`}>{task.priority}</span>
                          </div>
                       </div>
                    </div>
                    <ArrowUpRight size={20} className="text-gray-700 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                ))
              )}
           </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-10">
           <div>
              <h3 className="text-xl font-black text-white mb-6 px-2 tracking-tight">Active Nodes</h3>
              <div className="space-y-4">
                 {activeProjects.map(project => (
                   <Card key={project.id} variant="glass" className="p-5 border-white/5 hover:border-blue-500/30 transition-colors group">
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded-lg">{project.project_type || 'Development'}</span>
                         <span className="text-[10px] font-black text-white">{project.progress || 0}%</span>
                      </div>
                      <h4 className="text-md font-black text-white mb-4 group-hover:text-blue-400 transition-colors tracking-tight leading-tight">{project.name}</h4>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                   </Card>
                 ))}
              </div>
           </div>

            <Card variant="glass" className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 p-8 border-blue-500/20 shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Activity size={120} />
               </div>
               <h3 className="text-xl font-black text-white mb-2 flex items-center gap-3 relative z-10">
                 <Users size={22} className="text-blue-400" />
                 Network Pulse
               </h3>
               <p className="text-xs text-blue-200/60 mb-8 font-medium relative z-10">Collaborating with you right now.</p>
               <div className="flex -space-x-4 mb-8 relative z-10">
                 {membersList.slice(0, 6).map(member => (
                   <Avatar key={member.id} user={member.user} size={44} className="ring-4 ring-[#0d1425] border-transparent" />
                 ))}
                 {membersList.length > 6 && (
                   <div className="w-11 h-11 rounded-3xl bg-gray-800 border-4 border-[#0d1425] flex items-center justify-center text-[10px] font-black text-gray-400">
                     +{membersList.length - 6}
                   </div>
                 )}
               </div>
               <Button variant="secondary" fullWidth className="py-3 font-black text-xs uppercase tracking-widest relative z-10">
                 Open Directory
               </Button>
            </Card>
        </div>
      </div>
      
      {/* Detailed Analytics Integration */}
      <div className="pt-10 animate-in fade-in duration-1000">
         <WorkspaceAnalytics 
           tasks={tasksList} 
           projects={projectsList} 
           members={membersList} 
         />
      </div>
    </div>
  );
}
