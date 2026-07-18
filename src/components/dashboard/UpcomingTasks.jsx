import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, ArrowRight } from 'lucide-react';

export default function UpcomingTasks({ tasks = [], loading }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Upcoming Tasks</h3>
        <Link to="/tasks" style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          View All <ArrowRight size={11} />
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="animate-pulse" style={{ height: 36, background: 'var(--bg3)', borderRadius: 6 }} />)}</div>
      ) : tasks.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 16 }}>No upcoming tasks</p>
      ) : (
        <div className="space-y-1">
          {tasks.slice(0, 5).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6 }}>
              <CheckSquare size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{t.title}</span>
              {t.priority && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'var(--bg3)', color: 'var(--text3)', textTransform: 'uppercase' }}>{t.priority}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
