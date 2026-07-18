import React from 'react';
import { radiusClass } from '../../styles/utils';

interface AvatarProps {
  user?: {
    username?: string;
    full_name?: string;
    avatar?: string;
    initials?: string;
  };
  size?: number;
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 40,
  status = 'none',
  className = '',
}) => {
  const name = user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || '';
  const initials = user?.initials || name.split(' ').map(n => n[0]).join('').toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';
  const avatarSrc = user?.avatar || user?.avatar_url || null;
  
  const statusColors = {
    online: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    offline: 'bg-gray-500',
    away: 'bg-amber-500',
    busy: 'bg-rose-500',
    none: 'hidden',
  };

  const fontSize = Math.max(size / 2.5, 12);

  return (
    <div 
      className={`relative flex-shrink-0 ${radiusClass('md')} overflow-visible ${className}`}
      style={{ width: size, height: size }}
    >
      {avatarSrc ? (
        <img 
          src={avatarSrc} 
          alt={user?.username || 'User'} 
          className={`w-full h-full object-cover ${radiusClass('md')} border border-white/10`}
        />
      ) : (
        <div 
          className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-brand to-accent-violet text-white font-black ${radiusClass('md')} border border-white/10 shadow-lg`}
          style={{ fontSize }}
        >
          {initials}
        </div>
      )}      
      {status !== 'none' && (
        <span 
          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0d1425] ${statusColors[status]}`}
          title={status}
        />
      )}
    </div>
  );
};

export default Avatar;
