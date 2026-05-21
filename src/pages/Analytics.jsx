import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Users, Target, Download, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Analytics() {
  const stats = [
    { label: "Active Users", value: "2,543", change: "+12.5%", positive: true, icon: <Users size={20} /> },
    { label: "Task Completion Rate", value: "84.2%", change: "+5.1%", positive: true, icon: <Target size={20} /> },
    { label: "Average Velocity", value: "42 pts/sprint", change: "-2.3%", positive: false, icon: <Activity size={20} /> },
    { label: "Revenue Impact", value: "$124,500", change: "+18.2%", positive: true, icon: <TrendingUp size={20} /> }
  ];

  // Sample data for charts
  const velocityData = [
    { name: 'Jan', val: 40 },
    { name: 'Feb', val: 55 },
    { name: 'Mar', val: 30 },
    { name: 'Apr', val: 80 },
    { name: 'May', val: 65 },
    { name: 'Jun', val: 45 },
    { name: 'Jul', val: 90 },
    { name: 'Aug', val: 75 },
    { name: 'Sep', val: 50 },
    { name: 'Oct', val: 85 },
    { name: 'Nov', val: 60 },
    { name: 'Dec', val: 95 },
  ];

  const taskData = [
    { name: 'Completed', value: 55, color: '#10B981' },
    { name: 'In Progress', value: 25, color: '#3B82F6' },
    { name: 'Blocked', value: 20, color: '#EF4444' },
  ];

  return (
    <div className="bg-[#060b18] min-h-screen p-8 md:p-12 text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center">
                <Activity size={24} />
              </div>
              Analytics
            </h1>
            <p className="text-gray-400 mt-2 font-medium">Real-time insights and performance metrics across your organization.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="font-bold border-gray-800">
              <Calendar size={16} className="mr-2" /> Last 30 Days
            </Button>
            <Button variant="primary" className="font-bold bg-indigo-600 hover:bg-indigo-700">
              <Download size={16} className="mr-2" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} variant="glass" className="p-6 relative overflow-hidden group border-gray-800/50 hover:border-indigo-500/30">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-500">
                {stat.icon}
              </div>
              <div className="text-indigo-400 mb-4">{stat.icon}</div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <h2 className="text-3xl font-black text-white mt-1 mb-2">{stat.value}</h2>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change} vs last month
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card variant="glass" className="lg:col-span-2 p-8 border-gray-800/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-white">Project Velocity</h3>
              <select className="bg-[#0b1429] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-gray-400 outline-none">
                <option>All Projects</option>
                <option>Frontend Re-architecture</option>
                <option>Backend Scaling</option>
              </select>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Secondary Chart */}
          <Card variant="glass" className="p-8 border-gray-800/50 flex flex-col">
            <h3 className="text-lg font-black text-white mb-8">Task Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {taskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3">
               <div className="flex items-center justify-between text-sm font-bold">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Completed</div>
                 <span className="text-white">55%</span>
               </div>
               <div className="flex items-center justify-between text-sm font-bold">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500" /> In Progress</div>
                 <span className="text-white">25%</span>
               </div>
               <div className="flex items-center justify-between text-sm font-bold">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /> Blocked</div>
                 <span className="text-white">20%</span>
               </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
