import React from 'react';
import { radiusClass } from '../../styles/utils';

interface AvatarProps {
  user?: {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    avatar?: string;
    avatar_url?: string;
    initials?: string;
  };
  size?: number;
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#3366ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  ];
  return colors[Math.abs(hash) % colors.length];
}

function hashStringToColor2(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#6366f1', '#ec4899', '#06b6d4', '#84cc16', '#f97316',
    '#3366ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  ];
  return colors[Math.abs(hash >> 3) % colors.length];
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 40,
  status = 'none',
  className = '',
  style,
}) => {
  const name = user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || '';
  const initials = user?.initials || name.split(' ').map(n => n[0]).join('').toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';
  const avatarSrc = user?.avatar || user?.avatar_url || null;
  const key = user?.username || user?.email || name || 'user';
  
  const statusColors: Record<string, string> = {
    online: '#10b981',
    offline: '#6b7280',
    away: '#f59e0b',
    busy: '#ef4444',
  };

  const fontSize = Math.max(size / 2.5, 12);
  const color1 = hashStringToColor(key);
  const color2 = hashStringToColor2(key);

  return (
    <div 
      className={`relative flex-shrink-0 ${radiusClass('md')} overflow-visible ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      {avatarSrc ? (
        <img 
          src={avatarSrc} 
          alt={user?.username || 'User'} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div 
          style={{ 
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${color1}, ${color2})`,
            color: '#fff', fontWeight: 900, fontSize, borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {initials}
        </div>
      )}      
      {status !== 'none' && (
        <span 
          style={{
            position: 'absolute', bottom: -1, right: -1,
            width: size > 24 ? 12 : 8, height: size > 24 ? 12 : 8,
            borderRadius: '50%', background: statusColors[status] || '#6b7280',
            border: `2px solid var(--bg2, #0d1425)`,
            boxShadow: status === 'online' ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
          }}
          title={status}
        />
      )}
    </div>
  );
};

export default Avatar;
