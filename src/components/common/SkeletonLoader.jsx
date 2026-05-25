import React from 'react';

const pulse = {
  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
};

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'skeleton-styles';
  style.textContent = `
    @keyframes skeleton-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;
  document.head.appendChild(style);
}

function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'var(--border)',
      ...pulse, ...style,
    }} />
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <SkeletonBox width={40} height={40} borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonBox width="60%" height={14} />
          <SkeletonBox width="40%" height={12} />
        </div>
      </div>
      <SkeletonBox height={12} />
      <SkeletonBox height={12} width="80%" />
      <div style={{ display: 'flex', gap: 8 }}>
        <SkeletonBox width={60} height={24} borderRadius={12} />
        <SkeletonBox width={80} height={24} borderRadius={12} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 16, padding: '8px 16px' }}>
        {[30, 20, 20, 15, 15].map((w, i) => (
          <SkeletonBox key={i} width={`${w}%`} height={12} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
          {[30, 20, 20, 15, 15].map((w, j) => (
            <SkeletonBox key={j} width={`${w}%`} height={14} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <SkeletonBox width={36} height={36} borderRadius="50%" style={{ animationDelay: `${i * 0.1}s` }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SkeletonBox width="70%" height={14} style={{ animationDelay: `${i * 0.1 + 0.05}s` }} />
            <SkeletonBox width="45%" height={12} style={{ animationDelay: `${i * 0.1 + 0.1}s` }} />
          </div>
          <SkeletonBox width={60} height={24} borderRadius={12} style={{ animationDelay: `${i * 0.1}s` }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkeletonBox width={44} height={44} borderRadius={12} style={{ animationDelay: `${i * 0.1}s` }} />
            <SkeletonBox width="50%" height={12} style={{ animationDelay: `${i * 0.15}s` }} />
            <SkeletonBox width="70%" height={28} style={{ animationDelay: `${i * 0.2}s` }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export default SkeletonBox;
