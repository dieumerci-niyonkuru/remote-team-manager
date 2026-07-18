import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function ActivityFeed({ activities = [], loading }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Recent Activity</h3>
        <Link to="/activity" style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          View All <ArrowRight size={11} />
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="animate-pulse" style={{ height: 32, background: 'var(--bg3)', borderRadius: 6 }} />)}</div>
      ) : activities.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 16 }}>No recent activity</p>
      ) : (
        <div className="space-y-1">
          {activities.slice(0, 5).map((a, i) => (
            <div key={a.id || i} className="flex items-start gap-2" style={{ padding: '6px 0' }}>
              <Activity size={12} style={{ color: 'var(--brand)', marginTop: 3, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700 }}>{a.user?.first_name || 'Someone'}</span>{' '}
                  <span style={{ color: 'var(--text3)' }}>{a.description || a.action || 'did something'}</span>
                </p>
                <p style={{ fontSize: 10, color: 'var(--text3)', margin: '2px 0 0' }}>
                  {a.created_at ? format(new Date(a.created_at), 'MMM d, h:mm a') : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
