import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, MessageSquare, CalendarDays, Upload } from 'lucide-react';

const actions = [
  { label: 'New Task', to: '/tasks', icon: <Plus size={14} />, color: 'var(--brand)' },
  { label: 'Chat', to: '/chat', icon: <MessageSquare size={14} />, color: 'var(--accent)' },
  { label: 'Calendar', to: '/calendar', icon: <CalendarDays size={14} />, color: 'var(--success)' },
  { label: 'Upload', to: '/files', icon: <Upload size={14} />, color: 'var(--warning)' },
];

export default function QuickActionsWidget() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 12px' }}>Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(a => (
          <Link key={a.label} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg3)', borderRadius: 8, textDecoration: 'none', transition: '0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; }}>
            <span style={{ color: a.color }}>{a.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
