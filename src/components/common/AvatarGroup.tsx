import React from 'react';
import Avatar from './Avatar';

interface User {
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar?: string;
  avatar_url?: string;
  initials?: string;
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: number;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 4,
  size = 32,
  className = '',
}) => {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className={`flex items-center ${className}`}>
      {visible.map((user, i) => (
        <div
          key={user.username || i}
          className="relative"
          style={{ marginLeft: i > 0 ? -(size * 0.25) : 0, zIndex: max - i }}
        >
          <Avatar user={user} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="relative flex items-center justify-center rounded-full bg-gray-800 border-2 border-[var(--bg-card,rgba(17,30,59,0.4))] text-xs font-bold text-gray-400"
          style={{ width: size, height: size, marginLeft: -(size * 0.25), zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
