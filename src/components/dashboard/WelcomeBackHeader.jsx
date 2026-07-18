import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useStore } from '../../store';
import { getT } from '../../i18n';

export default function WelcomeBackHeader({ onRefresh, syncStatus, timeSinceLastSync, hasPremiumFeature }) {
  const { user, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const name = user?.first_name || user?.username || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          {greeting}, {name}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>Here's what's happening with your workspace</p>
      </div>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>Last sync: {timeSinceLastSync}</span>
        <button onClick={onRefresh}
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, transition: '0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)'; }}>
          <RefreshCw size={13} className={syncStatus === 'syncing' ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
    </div>
  );
}
