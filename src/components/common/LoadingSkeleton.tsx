import React from 'react';
  import { radiusStyle, shadowStyle } from '../../styles/utils';
  import * as tokens from '../../styles/tokens';

interface LoadingSkeletonProps {
  variant?: 'text' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
  className?: string;
  children?: React.ReactNode;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'rectangle',
  width,
  height,
  className = '',
  children,
}) => {
  const variants = {
    text: 'rounded-lg h-4 w-full',
    circle: 'rounded-full',
    rectangle: '',
  };

  return (
    <div className={`bg-gray-200 animate-pulse ${variants[variant]} ${className}`} style={{ width, height, ...radiusStyle('lg') }}>
      {children}
    </div>
  );
};

export const CardSkeleton = () => (
  <div className={`bg-white/2 border border-white/5 p-6 space-y-4`} style={{ ...radiusStyle('lg') }}>
    <div className="flex items-center gap-3">
      <LoadingSkeleton variant="circle" width={40} height={40} />
      <div className="space-y-4 flex-1">
        <LoadingSkeleton variant="text" width="60%" />
        <LoadingSkeleton variant="text" width="40%" height={12} />
      </div>
    </div>
    <LoadingSkeleton variant="rectangle" height={100} />
    <div className="flex justify-between items-center">
      <LoadingSkeleton variant="text" width={80} />
      <LoadingSkeleton variant="circle" width={24} height={24} />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl">
        <div className="flex items-center gap-4">
          <LoadingSkeleton variant="circle" width={32} height={32} />
          <LoadingSkeleton variant="text" width={150} />
        </div>
        <LoadingSkeleton variant="text" width={80} />
        <LoadingSkeleton variant="text" width={100} />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
