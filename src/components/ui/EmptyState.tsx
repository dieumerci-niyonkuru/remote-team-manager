import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    {icon && <div className="mb-4 text-4xl text-gray-400">{icon}</div>}
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-600 mb-4 text-center max-w-sm">{description}</p>}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
