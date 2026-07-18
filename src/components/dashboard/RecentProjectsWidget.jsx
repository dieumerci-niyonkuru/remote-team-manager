import React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, ArrowRight } from 'lucide-react';

export default function RecentProjectsWidget({ projects = [], loading }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Recent Projects</h3>
        <Link to="/projects" style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          View All <ArrowRight size={11} />
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="animate-pulse" style={{ height: 40, background: 'var(--bg3)', borderRadius: 6 }} />)}</div>
      ) : projects.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 16 }}>No projects yet</p>
      ) : (
        <div className="space-y-2">
          {projects.slice(0, 3).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg3)', borderRadius: 8 }}>
              <FolderKanban size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{p.name}</span>
              </div>
              <div style={{ height: 4, width: 50, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p.progress || 0}%`, background: 'var(--brand)', borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
