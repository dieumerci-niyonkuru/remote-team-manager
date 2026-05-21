import React from 'react';
import { Loader2 } from 'lucide-react';
import * as tokens from '../../styles/tokens';
import { radiusStyle, shadowStyle } from '../../styles/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `inline-flex items-center justify-center font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`;
    
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95 focus:ring-blue-500 border border-transparent',
      secondary: 'bg-gray-800 hover:bg-gray-700 text-white active:scale-95 focus:ring-gray-500 border border-gray-700',
      danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 active:scale-95 focus:ring-red-500',
      outline: 'bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white active:scale-95 focus:ring-gray-500',
      ghost: 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white active:scale-95 focus:ring-gray-500 border border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2',
    };

    const combinedClasses = [
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-live={loading ? 'polite' : 'off'}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
