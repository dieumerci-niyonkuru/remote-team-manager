import React from 'react';

type Status = 'online' | 'away' | 'busy' | 'offline';

interface StatusDotProps {
  status: Status;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const STATUS_COLORS: Record<Status, string> = {
  online: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]',
  away: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]',
  busy: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]',
  offline: 'bg-gray-500',
};

const SIZES = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
};

export const StatusDot: React.FC<StatusDotProps> = ({ status, size = 'sm', className = '' }) => {
  return (
    <span
      className={`inline-block rounded-full border-2 border-[var(--bg-card,rgba(17,30,59,0.4))] ${SIZES[size]} ${STATUS_COLORS[status]} ${className}`}
      aria-label={status}
    />
  );
};

export default StatusDot;
