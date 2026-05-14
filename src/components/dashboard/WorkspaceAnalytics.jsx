import React from 'react';
import { TrendingUp, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WorkspaceAnalytics({ tasks, projects, members }) {
  // Simple analytics calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const urgentTasks = tasks.filter(t => t.priority === 'urgent').length;
  
  // Weekly velocity mock data
  const velocity = [
    { day: 'Mon', value: 12 },
    { day: 'Tue', value: 18 },
    { day: 'Wed', value: 15 },
    { day: 'Thu', value: 25 },
    { day: 'Fri', value: 22 },
    { day: 'Sat', value: 10 },
    { day: 'Sun', value: 5 },
  ];
  
  const maxVal = Math.max(...velocity.map(v => v.value));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      {/* Task Completion Pulse */}
      <div className="bg-gray-800/20 border border-gray-800 rounded-[32px] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">Project Velocity</h3>
            <p className="text-sm text-gray-500">Tasks completed this week</p>
          </div>
          <div className="bg-blue-600/10 text-blue-500 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} />
            +12% vs LW
          </div>
        </div>
        
        <div className="flex items-end justify-between h-48 gap-3">
          {velocity.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
              <div 
                className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-xl transition-all duration-700 hover:brightness-125 relative group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                style={{ height: `${(v.value / maxVal) * 100}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  {v.value}
                </div>
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase">{v.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-2 gap-4">
        <AnalyticsCard 
          icon={<CheckCircle2 className="text-green-500" />} 
          label="Completion" 
          value={`${completionRate}%`} 
          desc="Overall task success rate"
        />
        <AnalyticsCard 
          icon={<AlertCircle className="text-rose-500" />} 
          label="Urgent" 
          value={urgentTasks} 
          desc="Critical tasks pending"
        />
        <AnalyticsCard 
          icon={<Users className="text-blue-500" />} 
          label="Activity" 
          value={members.length} 
          desc="Total active contributors"
        />
        <AnalyticsCard 
          icon={<TrendingUp className="text-purple-500" />} 
          label="Growth" 
          value={projects.length} 
          desc="Current active initiatives"
        />
      </div>
    </div>
  );
}

function AnalyticsCard({ icon, label, value, desc }) {
  return (
    <div className="bg-gray-800/20 border border-gray-800 rounded-[32px] p-6 hover:border-gray-700 transition-all group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <p className="text-[10px] text-gray-600 font-bold">{desc}</p>
    </div>
  );
}
