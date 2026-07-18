import React from 'react';
import { Users } from 'lucide-react';

export default function TeamStatusWidget({ teamStatus = {}, loading }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 12px' }}>Team Status</h3>
      {loading ? (
        <div className="animate-pulse" style={{ height: 40, background: 'var(--bg3)', borderRadius: 6 }} />
      ) : (
        <div className="flex items-center gap-3">
          <Users size={16} style={{ color: 'var(--brand)' }} />
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{teamStatus.online ?? 0}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>/ {teamStatus.total ?? 0} online</span>
          </div>
        </div>
      )}
    </div>
  );
}
