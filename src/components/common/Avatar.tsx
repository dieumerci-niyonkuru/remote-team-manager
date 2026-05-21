import React from 'react';
import * as tokens from '../../styles/tokens';

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
  const initials = user?.initials || user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';
  
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
      className={`relative flex-shrink-0 rounded-[${tokens.radius.md}px] overflow-visible ${className}`}
      style={{ width: size, height: size }}
    >
      {user?.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.username || 'User'} 
          className={`w-full h-full object-cover rounded-[${tokens.radius.md}px] border border-white/10`}
        />
      ) : (
        <div 
          className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-brand to-accent-violet text-white font-black rounded-[${tokens.radius.md}px] border border-white/10 shadow-lg`}
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
