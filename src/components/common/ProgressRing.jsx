import React from 'react';

export default function ProgressRing({ value = 0, size = 40, strokeWidth = 3, color = 'var(--brand)' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg3)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.3s' }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        fill="var(--text)" fontSize={size * 0.22} fontWeight="800" style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        {Math.round(value)}%
      </text>
    </svg>
  );
}
