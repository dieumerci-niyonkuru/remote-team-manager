import React from 'react';
import { Button } from './Button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white/2 rounded-[40px] border border-dashed border-white/10 ${className}`}>
      <div className="w-20 h-20 bg-brand/10 text-brand rounded-[24px] flex items-center justify-center mb-6 animate-pulse">
        {icon || <Plus size={32} />}
      </div>
      
      <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-text-secondary text-base max-w-sm mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} leftIcon={<Plus size={18} />} className="shadow-2xl">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
