import React from 'react';

export default function Avatar({ user, size = 32, className = "" }) {
  if (!user) return <div style={{ width: size, height: size }} className={`rounded-full bg-gray-700 ${className}`} />;

  const initials = (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase();
  const avatarUrl = user.avatar_url || user.avatar || user.profile_picture;

  const getBgColor = (name) => {
    const colors = ['#3366ff', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <div 
      className={`relative shrink-0 rounded-xl overflow-hidden flex items-center justify-center font-bold text-white uppercase ${className}`}
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: getBgColor(user.username || user.first_name),
        fontSize: size * 0.4
      }}
    >
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={user.username} 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <span style={{ display: avatarUrl ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
        {initials}
      </span>
    </div>
  );
}
