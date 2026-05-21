import React from 'react';
import { radiusClass } from '../../styles/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', size = 'sm', className = '' }) => {
  const variants = {
    primary: 'bg-brand/10 text-brand border-brand/20 shadow-[0_0_10px_rgba(51,102,255,0.1)]',
    secondary: 'bg-white/5 text-text-tertiary border-white/10',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    danger: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    ghost: 'bg-transparent text-text-tertiary border-white/5',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[8px]',
    sm: 'px-2.5 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
  };

  const radiusCls = radiusClass('full');

  return (
    <span className={`inline-flex items-center justify-center font-black uppercase tracking-widest ${radiusCls} border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
export default Badge;
