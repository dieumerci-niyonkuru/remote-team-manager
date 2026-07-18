import React from 'react';

export default function StatusBadge({ status, color, children }) {
  const label = children || status?.replace('_', ' ') || '';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      padding: '3px 8px', borderRadius: 6,
      background: `${color || 'var(--text3)'}15`,
      color: color || 'var(--text3)',
    }}>
      {label}
    </span>
  );
}
