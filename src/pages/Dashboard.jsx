import React from 'react';
import { useStore } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, CheckSquare, Users, TrendingUp, Clock, ChevronRight,
  ArrowUpRight, Zap, Activity, Bell, MessageSquare, Plus, Target,
  BarChart2, Flame, Star, Calendar
} from 'lucide-react';
import Avatar from '../components/common/Avatar';
import api from '../services/api';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
  urgent: { bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.3)', text:'#ef4444', glow:'rgba(239,68,68,0.4)' },
  high:   { bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.3)', text:'#f59e0b', glow:'rgba(245,158,11,0.4)' },
  medium: { bg:'rgba(51,102,255,0.1)', border:'rgba(51,102,255,0.3)', text:'var(--brand)', glow:'rgba(51,102,255,0.4)' },
  low:    { bg:'rgba(100,116,139,0.1)', border:'rgba(100,116,139,0.2)', text:'var(--text3)', glow:'transparent' },
};

const STATUS_COLORS = {
  done:        '#10b981',
  in_progress: 'var(--brand)',
  todo:        'var(--text3)',
  blocked:     '#ef4444',
};

function StatCard({ label, value, icon, color, bg, trend, loading }) {
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:24,
      display:'flex', flexDirection:'column', gap:16, position:'relative', overflow:'hidden',
      transition:'all 0.3s', cursor:'default'
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 20px 40px -8px ${bg.replace('0.1','0.25')}`; e.currentTarget.style.borderColor = color.replace(')', ',0.4)').replace('rgb','rgba'); }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:bg, opacity:0.5 }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ width:44, height:44, borderRadius:12, background:bg, border:`1px solid ${color.replace(')',',.2)').replace('var(--brand)','rgba(51,102,255,.2)')}`, display:'flex', alignItems:'center', justifyContent:'center', color }}>
          {icon}
        </div>
        {trend && (
          <span style={{ fontSize:11, fontWeight:800, color: trend > 0 ? '#10b981' : '#ef4444', background: trend > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding:'4px 8px', borderRadius:8 }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize:12, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>{label}</p>
        {loading ? (
          <div style={{ width:60, height:32, borderRadius:8, background:'var(--bg3)', animation:'skeleton-pulse 1.5s ease infinite' }} />
        ) : (
          <p style={{ fontSize:32, fontWeight:900, color:'var(--text)', letterSpacing:'-0.03em', lineHeight:1 }}>{value}</p>
        )}
      </div>
    </div>
  );
}

function QuickAction({ icon, label, to, color }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'16px 12px', borderRadius:16, background:'var(--bg3)', border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.2s', flex:1, minWidth:72 }}
      onMouseEnter={e => { e.currentTarget.style.background = color.replace('1)', '0.15)'); e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}>
      <div style={{ color, fontSize:22 }}>{icon}</div>
      <span style={{ fontSize:11, fontWeight:800, color:'var(--text2)', whiteSpace:'nowrap' }}>{label}</span>
    </button>
  );
}

export default function Dashboard() {
  const { user, activeWorkspace } = useStore();
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({ projects:0, tasks:0, members:0, notifications:0 });
  const [recentTasks, setRecentTasks] = React.useState([]);
  const [activeProjects, setActiveProjects] = React.useState([]);
  const [membersList, setMembersList] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (activeWorkspace) fetchAll();
  }, [activeWorkspace]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes, membRes, notifRes] = await Promise.allSettled([
        api.get(`/projects/?workspace=${activeWorkspace.id}`),
        api.get(`/tasks/?workspace=${activeWorkspace.id}`),
        api.get(`/workspaces/${activeWorkspace.id}/members/`),
        api.get('/notifications/'),
      ]);

      const projects = projRes.status === 'fulfilled' ? (projRes.value.data?.data || projRes.value.data || []) : [];
      const tasks    = taskRes.status === 'fulfilled'  ? (taskRes.value.data?.data  || taskRes.value.data  || []) : [];
      const members  = membRes.status === 'fulfilled'  ? (membRes.value.data?.data  || membRes.value.data  || []) : [];
      const notifs   = notifRes.status === 'fulfilled' ? (notifRes.value.data?.data || notifRes.value.data || []) : [];

      setActiveProjects(Array.isArray(projects) ? projects.slice(0, 4) : []);
      setRecentTasks(Array.isArray(tasks) ? tasks.slice(0, 6) : []);
      setMembersList(Array.isArray(members) ? members : []);
      setNotifications(Array.isArray(notifs) ? notifs.filter(n => n.unread).slice(0, 4) : []);

      const myTasks = Array.isArray(tasks) ? tasks.filter(t => t.assignee?.id === user?.id || t.assignee === user?.id) : [];
      setStats({
        projects: Array.isArray(projects) ? projects.length : 0,
        tasks: myTasks.length,
        members: Array.isArray(members) ? members.length : 0,
        notifications: Array.isArray(notifs) ? notifs.filter(n => n.unread).length : 0,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const completedTasks = recentTasks.filter(t => t.status === 'done').length;
  const completionRate = recentTasks.length > 0 ? Math.round((completedTasks / recentTasks.length) * 100) : 0;

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px', background:'var(--bg)', maxWidth:1400, margin:'0 auto' }} className="custom-scrollbar">

      {/* ── Welcome Header ────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:32 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--brand)', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#10b981', display:'inline-block', boxShadow:'0 0 8px #10b981' }} />
            {greeting()}, {user?.first_name || user?.username}
          </p>
          <h1 style={{ fontSize:'clamp(24px,3vw,36px)', fontWeight:900, color:'var(--text)', letterSpacing:'-0.03em', margin:0 }}>
            {activeWorkspace?.name || 'Your Workspace'}
          </h1>
          <p style={{ color:'var(--text3)', marginTop:6, fontSize:14 }}>
            {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
          </p>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => navigate('/tasks')}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:12, background:'var(--brand)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:800, boxShadow:'0 4px 16px rgba(51,102,255,0.35)', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform=''}>
            <Plus size={16} /> New Task
          </button>
          <button onClick={() => navigate('/notifications')}
            style={{ position:'relative', padding:'10px 14px', borderRadius:12, background:'var(--bg3)', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', color:'var(--text2)' }}>
            <Bell size={18} />
            {stats.notifications > 0 && (
              <span style={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:10, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--bg)' }}>
                {stats.notifications > 9 ? '9+' : stats.notifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16, marginBottom:32 }}>
        <StatCard label="Projects" value={stats.projects} icon={<Briefcase size={20} />} color="var(--brand)" bg="rgba(51,102,255,0.1)" trend={8} loading={loading} />
        <StatCard label="My Tasks" value={stats.tasks} icon={<CheckSquare size={20} />} color="#8b5cf6" bg="rgba(139,92,246,0.1)" trend={-3} loading={loading} />
        <StatCard label="Team Members" value={stats.members} icon={<Users size={20} />} color="#10b981" bg="rgba(16,185,129,0.1)" loading={loading} />
        <StatCard label="Completion" value={`${completionRate}%`} icon={<Target size={20} />} color="#f59e0b" bg="rgba(245,158,11,0.1)" trend={5} loading={loading} />
      </div>

      {/* ── Quick Actions ─────────────────────────────────── */}
      <div style={{ display:'flex', gap:10, marginBottom:32, overflowX:'auto', paddingBottom:4 }}>
        <QuickAction icon={<CheckSquare size={20} />} label="Tasks" to="/tasks" color="var(--brand)" />
        <QuickAction icon={<Briefcase size={20} />} label="Projects" to="/projects" color="#8b5cf6" />
        <QuickAction icon={<MessageSquare size={20} />} label="Chat" to="/chat" color="#10b981" />
        <QuickAction icon={<Users size={20} />} label="Team" to="/team" color="#f59e0b" />
        <QuickAction icon={<Calendar size={20} />} label="Calendar" to="/calendar" color="#06b6d4" />
        <QuickAction icon={<BarChart2 size={20} />} label="Analytics" to="/analytics" color="#ec4899" />
        <QuickAction icon={<Zap size={20} />} label="AI" to="/ai" color="#f97316" />
        <QuickAction icon={<Bell size={20} />} label="Alerts" to="/notifications" color="#ef4444" />
      </div>

      {/* ── Main 3-col grid ───────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>

        {/* Recent Tasks */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid var(--border)' }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', margin:0, display:'flex', alignItems:'center', gap:8 }}>
              <Flame size={18} style={{ color:'#f97316' }} /> Recent Tasks
            </h3>
            <button onClick={() => navigate('/tasks')} style={{ fontSize:12, color:'var(--brand)', fontWeight:700, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div>
            {loading ? [...Array(4)].map((_,i) => (
              <div key={i} style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'var(--bg3)', animation:'skeleton-pulse 1.5s infinite' }} />
                <div style={{ flex:1 }}>
                  <div style={{ width:'60%', height:12, borderRadius:4, background:'var(--bg3)', animation:'skeleton-pulse 1.5s infinite', marginBottom:6 }} />
                  <div style={{ width:'40%', height:10, borderRadius:4, background:'var(--bg3)', animation:'skeleton-pulse 1.5s infinite' }} />
                </div>
              </div>
            )) : recentTasks.length === 0 ? (
              <div style={{ padding:48, textAlign:'center', color:'var(--text3)' }}>
                <CheckSquare size={32} style={{ margin:'0 auto 10px', opacity:0.3, display:'block' }} />
                <p style={{ fontSize:14, fontWeight:600 }}>No tasks yet</p>
              </div>
            ) : recentTasks.map(task => {
              const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low;
              const statusColor = STATUS_COLORS[task.status] || 'var(--text3)';
              return (
                <div key={task.id} onClick={() => navigate('/tasks')}
                  style={{ padding:'14px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, cursor:'pointer', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background=''}>
                  <div style={{ width:4, height:36, borderRadius:2, background:p.text, flexShrink:0, boxShadow:`0 0 8px ${p.glow}` }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{task.title}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                      <span style={{ fontSize:10, fontWeight:800, color:statusColor, background:statusColor.replace('var(--brand)','rgba(51,102,255,').replace('#10b981','rgba(16,185,129,').replace('#ef4444','rgba(239,68,68,').replace('var(--text3)','rgba(100,116,139,')+='0.12)', padding:'2px 8px', borderRadius:4 }}>
                        {(task.status || 'todo').replace('_', ' ')}
                      </span>
                      <span style={{ fontSize:10, fontWeight:700, color:p.text }}>{task.priority}</span>
                    </div>
                  </div>
                  <ArrowUpRight size={16} style={{ color:'var(--text3)', flexShrink:0 }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Active Projects */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden', flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid var(--border)' }}>
              <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', margin:0, display:'flex', alignItems:'center', gap:8 }}>
                <Star size={18} style={{ color:'#f59e0b' }} /> Active Projects
              </h3>
              <button onClick={() => navigate('/projects')} style={{ fontSize:12, color:'var(--brand)', fontWeight:700, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div style={{ padding:16, display:'flex', flexDirection:'column', gap:10 }}>
              {loading ? [...Array(3)].map((_,i) => (
                <div key={i} style={{ padding:16, borderRadius:12, background:'var(--bg3)', animation:'skeleton-pulse 1.5s infinite', height:64 }} />
              )) : activeProjects.length === 0 ? (
                <div style={{ padding:32, textAlign:'center', color:'var(--text3)' }}>
                  <Briefcase size={28} style={{ margin:'0 auto 8px', opacity:0.3, display:'block' }} />
                  <p style={{ fontSize:13 }}>No projects yet</p>
                </div>
              ) : activeProjects.map(proj => {
                const prog = proj.progress || Math.floor(Math.random() * 80 + 10);
                return (
                  <div key={proj.id} onClick={() => navigate('/projects')}
                    style={{ padding:'14px 16px', borderRadius:14, background:'var(--bg3)', border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.transform='translateX(2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontSize:13, fontWeight:800, color:'var(--text)', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{proj.name}</span>
                      <span style={{ fontSize:12, fontWeight:800, color:'var(--brand)', marginLeft:8 }}>{prog}%</span>
                    </div>
                    <div style={{ height:4, background:'var(--bg2)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${prog}%`, background:'linear-gradient(90deg, var(--brand), #8b5cf6)', borderRadius:2, transition:'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Online */}
          <div style={{ background:'linear-gradient(135deg, rgba(51,102,255,0.08), rgba(139,92,246,0.08))', border:'1px solid rgba(51,102,255,0.2)', borderRadius:20, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:'var(--text)', margin:0, display:'flex', alignItems:'center', gap:8 }}>
                <Activity size={16} style={{ color:'var(--brand)' }} /> Team Pulse
              </h3>
              <span style={{ fontSize:11, fontWeight:700, color:'#10b981', background:'rgba(16,185,129,0.1)', padding:'3px 8px', borderRadius:6 }}>
                {membersList.length} members
              </span>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              {membersList.slice(0, 8).map(m => (
                <div key={m.id} style={{ position:'relative' }} title={m.user?.username || m.username}>
                  <Avatar user={m.user || m} size={36} status="online" />
                </div>
              ))}
              {membersList.length > 8 && (
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--bg3)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'var(--text3)' }}>
                  +{membersList.length - 8}
                </div>
              )}
            </div>
            <button onClick={() => navigate('/team')}
              style={{ width:'100%', padding:'10px', borderRadius:10, background:'rgba(51,102,255,0.15)', border:'1px solid rgba(51,102,255,0.25)', color:'var(--brand)', fontSize:12, fontWeight:800, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(51,102,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(51,102,255,0.15)'}>
              Open Team Directory →
            </button>
          </div>
        </div>
      </div>

      {/* ── Notifications preview ─────────────────────────── */}
      {notifications.length > 0 && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid var(--border)' }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', margin:0, display:'flex', alignItems:'center', gap:8 }}>
              <Bell size={18} style={{ color:'#ef4444' }} /> Recent Alerts
              <span style={{ fontSize:11, fontWeight:900, color:'#fff', background:'#ef4444', padding:'2px 8px', borderRadius:20 }}>{notifications.length}</span>
            </h3>
            <button onClick={() => navigate('/notifications')} style={{ fontSize:12, color:'var(--brand)', fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>
              View all
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:0 }}>
            {notifications.map((n, i) => (
              <div key={n.id} onClick={() => navigate('/notifications')}
                style={{ padding:'16px 24px', borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none', cursor:'pointer', display:'flex', gap:12, alignItems:'flex-start', transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background=''}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--brand)', flexShrink:0, marginTop:5 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, color:'var(--text)', margin:0, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    <span style={{ color:'var(--brand)', fontWeight:800 }}>{n.actor_name}</span> {n.verb}
                  </p>
                  <span style={{ fontSize:11, color:'var(--text3)' }}>{new Date(n.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          .dashboard-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
