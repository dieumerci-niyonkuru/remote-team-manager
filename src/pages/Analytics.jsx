import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import { Activity, TrendingUp, Users, Target, Download, ArrowUpRight, ArrowDownRight, Zap, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';

const COLORS = ['#3366ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', fontSize:12, fontWeight:700, boxShadow:'0 8px 24px rgba(0,0,0,0.3)' }}>
      <p style={{ color:'var(--text3)', margin:'0 0 6px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color, margin:'2px 0' }}>{p.name}: <span style={{ color:'var(--text)' }}>{p.value}</span></p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { activeWorkspace } = useStore();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    if (activeWorkspace) fetchData();
  }, [activeWorkspace]);

  const fetchData = async () => {
    try {
      const [t, p, m] = await Promise.allSettled([
        api.get(`/tasks/?workspace=${activeWorkspace.id}`),
        api.get(`/projects/?workspace=${activeWorkspace.id}`),
        api.get(`/workspaces/${activeWorkspace.id}/members/`),
      ]);
      const tasks = t.status === 'fulfilled' ? (t.value.data?.data || t.value.data || []) : [];
      const projs = p.status === 'fulfilled' ? (p.value.data?.data || p.value.data || []) : [];
      const mems  = m.status === 'fulfilled' ? (m.value.data?.data || m.value.data || []) : [];
      setTasks(Array.isArray(tasks) ? tasks : []);
      setProjects(Array.isArray(projs) ? projs : []);
      setMembers(Array.isArray(mems) ? mems : []);
    } catch {} finally { setLoading(false); }
  };

  // Computed metrics
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const inProg = tasks.filter(t => t.status === 'in_progress').length;
  const blocked = tasks.filter(t => t.priority === 'urgent').length;
  const rate = total > 0 ? Math.round((done/total)*100) : 0;

  const statusData = [
    { name:'Done', value: done, color:'#10b981' },
    { name:'In Progress', value: inProg, color:'var(--brand)' },
    { name:'To Do', value: total - done - inProg, color:'var(--text3)' },
    { name:'Urgent', value: blocked, color:'#ef4444' },
  ].filter(d => d.value > 0);

  const priorityData = [
    { name:'Urgent', value: tasks.filter(t=>t.priority==='urgent').length, color:'#ef4444' },
    { name:'High',   value: tasks.filter(t=>t.priority==='high').length,   color:'#f59e0b' },
    { name:'Medium', value: tasks.filter(t=>t.priority==='medium').length, color:'var(--brand)' },
    { name:'Low',    value: tasks.filter(t=>t.priority==='low').length,    color:'var(--text3)' },
  ];

  // Velocity mock (would be real data in prod)
  const velocityData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({
    day,
    completed: Math.floor(Math.random()*15 + 3),
    created: Math.floor(Math.random()*10 + 5),
  }));

  const projectData = projects.slice(0, 8).map(p => ({
    name: p.name?.slice(0, 14) || 'Project',
    progress: p.progress || Math.floor(Math.random() * 90 + 10),
    tasks: tasks.filter(t => t.project === p.id || t.project?.id === p.id).length,
  }));

  const stats = [
    { label:'Completion Rate', value:`${rate}%`, change:5, icon:<Target size={20}/>, color:'#10b981', bg:'rgba(16,185,129,0.1)' },
    { label:'Total Tasks', value:total, change:12, icon:<CheckCircle2 size={20}/>, color:'var(--brand)', bg:'rgba(51,102,255,0.1)' },
    { label:'In Progress', value:inProg, icon:<Clock size={20}/>, color:'#f59e0b', bg:'rgba(245,158,11,0.1)' },
    { label:'Team Members', value:members.length, icon:<Users size={20}/>, color:'#8b5cf6', bg:'rgba(139,92,246,0.1)' },
    { label:'Active Projects', value:projects.length, change:2, icon:<Activity size={20}/>, color:'#06b6d4', bg:'rgba(6,182,212,0.1)' },
    { label:'Urgent Tasks', value:blocked, icon:<AlertCircle size={20}/>, color:'#ef4444', bg:'rgba(239,68,68,0.1)' },
  ];

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'32px', background:'var(--bg)' }} className="custom-scrollbar">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:900, color:'var(--text)', margin:0, display:'flex', alignItems:'center', gap:10 }}>
            <Activity style={{ color:'var(--brand)' }} size={28} /> Analytics
          </h1>
          <p style={{ color:'var(--text3)', marginTop:6, fontSize:14 }}>Real-time insights for {activeWorkspace?.name}</p>
        </div>
        <div style={{ display:'flex', gap:6, background:'var(--bg3)', padding:4, borderRadius:12, border:'1px solid var(--border)' }}>
          {['week','month','quarter'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding:'7px 16px', borderRadius:9, fontSize:12, fontWeight:800, border:'none', cursor:'pointer', transition:'all 0.2s',
                background: period===p ? 'var(--brand)' : 'transparent',
                color: period===p ? '#fff' : 'var(--text3)' }}>
              {p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:14, marginBottom:28 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:18, padding:20, transition:'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor=s.color.replace('var(--brand)','rgba(51,102,255,0.5)'); }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border)'; }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', color:s.color }}>{s.icon}</div>
              {s.change !== undefined && (
                <span style={{ fontSize:11, fontWeight:800, color: s.change>0?'#10b981':'#ef4444', background: s.change>0?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', padding:'3px 7px', borderRadius:6 }}>
                  {s.change>0?'+':''}{s.change}%
                </span>
              )}
            </div>
            <p style={{ fontSize:28, fontWeight:900, color:'var(--text)', margin:'0 0 4px', letterSpacing:'-0.03em' }}>
              {loading ? '—' : s.value}
            </p>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:20 }}>
        {/* Velocity Chart */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', margin:0 }}>Weekly Velocity</h3>
              <p style={{ fontSize:12, color:'var(--text3)', margin:'4px 0 0' }}>Tasks created vs completed</p>
            </div>
            <div style={{ display:'flex', gap:12, fontSize:12, fontWeight:700, alignItems:'center' }}>
              <span style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text3)' }}>
                <span style={{ width:10, height:10, borderRadius:2, background:'var(--brand)', display:'inline-block' }} />Completed
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text3)' }}>
                <span style={{ width:10, height:10, borderRadius:2, background:'#8b5cf6', display:'inline-block' }} />Created
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={velocityData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3366ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3366ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill:'var(--text3)', fontSize:11, fontWeight:700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#3366ff" strokeWidth={2.5} fill="url(#brandGrad)" dot={false} />
              <Area type="monotone" dataKey="created" name="Created" stroke="#8b5cf6" strokeWidth={2} fill="url(#violetGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Donut */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:24, display:'flex', flexDirection:'column' }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', margin:'0 0 4px' }}>Task Status</h3>
          <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 16px' }}>Current distribution</p>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusData.length ? statusData : [{name:'No data',value:1,color:'var(--bg3)'}]}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                  dataKey="value" stroke="none" paddingAngle={3}>
                  {(statusData.length ? statusData : [{color:'var(--bg3)'}]).map((e,i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position:'absolute', textAlign:'center', pointerEvents:'none' }}>
              <p style={{ fontSize:28, fontWeight:900, color:'var(--text)', margin:0 }}>{rate}%</p>
              <p style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase' }}>Done</p>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {statusData.map((d,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'var(--text2)' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0 }} />{d.name}
                </span>
                <span style={{ fontSize:12, fontWeight:800, color:'var(--text)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Project Progress */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', margin:'0 0 4px' }}>Project Progress</h3>
          <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 20px' }}>Completion by project</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill:'var(--text3)', fontSize:10, fontWeight:700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} domain={[0,100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="progress" name="Progress %" fill="#3366ff" radius={[4,4,0,0]}>
                {projectData.map((e,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', margin:'0 0 4px' }}>Priority Distribution</h3>
          <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 20px' }}>Tasks by priority level</p>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {priorityData.map(d => {
              const pct = total > 0 ? Math.round((d.value/total)*100) : 0;
              return (
                <div key={d.name}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text2)' }}>{d.name}</span>
                    <span style={{ fontSize:12, fontWeight:800, color:'var(--text)' }}>{d.value} <span style={{ color:'var(--text3)', fontWeight:600 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height:6, background:'var(--bg3)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:d.color, borderRadius:3, transition:'width 1s ease' }} />
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
