import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color,
  showLabel = false,
  className = '',
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

  const barColor = color || (pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : pct >= 25 ? 'bg-amber-500' : 'bg-rose-500');

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full bg-white/5 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${barColor} rounded-full transition-all duration-500 ease-out ${heights[size]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
