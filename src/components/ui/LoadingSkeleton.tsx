import React from 'react';

type SkeletonVariant = 'text' | 'avatar' | 'thumbnail' | 'button';

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  className = '',
  width,
  height,
}) => {
  const base = 'bg-gray-200 animate-pulse rounded';
  const sizeStyle = {
    width: width ?? (variant === 'avatar' ? 40 : variant === 'thumbnail' ? 80 : '100%'),
    height: height ?? (variant === 'text' ? 16 : variant === 'avatar' ? 40 : variant === 'thumbnail' ? 80 : 32),
  } as React.CSSProperties;

  return <div className={`${base} ${className}`} style={sizeStyle} />;
};

export default LoadingSkeleton;
