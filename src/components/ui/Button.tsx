import { radiusClass } from '../../styles/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  outline: 'border border-gray-300 hover:bg-gray-100 text-gray-800',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) => {
  const base = 'px-4 py-2 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const classes = `${base} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${radiusClass('md')} ${className}`;
  return (
    <button className={classes} aria-disabled={rest.disabled} {...rest}>
      {children}
    </button>
  );
};
