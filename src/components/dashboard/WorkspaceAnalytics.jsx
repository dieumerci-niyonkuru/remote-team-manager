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
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 32, padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Project Velocity</h3>
            <p style={{ fontSize: 14, color: 'var(--text3)' }}>Tasks completed this week</p>
          </div>
          <div style={{ background: 'var(--brand-bg)', color: 'var(--brand)', padding: '6px 16px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={14} />
            +12% vs LW
          </div>
        </div>
        
        <div className="flex items-end justify-between h-48 gap-3">
          {velocity.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
              <div 
                className="w-full rounded-xl transition-all duration-700 hover:brightness-125 relative group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                style={{ height: `${(v.value / maxVal) * 100}%`, background: 'linear-gradient(to top, var(--brand), var(--accent))' }}
              >
                <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg3)', color: 'var(--text)', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, opacity: 0, transition: 'opacity 0.15s', whiteSpace: 'nowrap' }}
                  className="group-hover:!opacity-100">
                  {v.value}
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase' }}>{v.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-2 gap-4">
        <AnalyticsCard 
          icon={<CheckCircle2 style={{ color: 'var(--success)' }} />} 
          label="Completion" 
          value={`${completionRate}%`} 
          desc="Overall task success rate"
        />
        <AnalyticsCard 
          icon={<AlertCircle style={{ color: 'var(--danger)' }} />} 
          label="Urgent" 
          value={urgentTasks} 
          desc="Critical tasks pending"
        />
        <AnalyticsCard 
          icon={<Users style={{ color: 'var(--brand)' }} />} 
          label="Activity" 
          value={members.length} 
          desc="Total active contributors"
        />
        <AnalyticsCard 
          icon={<TrendingUp style={{ color: 'var(--accent)' }} />} 
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
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 32, padding: 24, transition: 'border-color 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div className="flex items-center gap-3 mb-4">
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>{value}</div>
      <p style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700 }}>{desc}</p>
    </div>
  );
}
