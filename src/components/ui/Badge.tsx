import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-indigo-600 text-white',
  secondary: 'bg-gray-600 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-600 text-white',
  danger: 'bg-red-600 text-white',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'primary', className = '', children, ...rest }) => {
  const classes = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`;
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
};

export default Badge;
