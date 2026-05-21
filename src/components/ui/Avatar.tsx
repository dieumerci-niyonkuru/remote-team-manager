import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number; // size in pixels
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 40, className = '' }) => {
  const initials = name ? name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    : '';

  const baseStyle = `flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium overflow-hidden`;

  return (
    <div
      className={`${baseStyle} ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
