import { radiusStyle } from '../../styles/utils';
// import * as tokens from '../../styles/tokens'; // removed unused tokens import

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // backward compatibility, maps to left icon
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  multiline = false,
  rows = 3,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = `w-full bg-[#0b1429] border border-white/5 px-4 py-3 text-sm text-white placeholder:text-text-tertiary transition-all duration-200 outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50`;
  const errorStyles = error ? 'border-rose-500/50 focus:ring-rose-500/20' : '';
  const iconPadding = leftIcon ? 'pl-11' : '';
  
  const Component = multiline ? 'textarea' : 'input';

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
            {leftIcon}
          </div>
        )}
        
        <Component
          className={`${baseStyles} ${errorStyles} ${iconPadding}`}
          rows={multiline ? rows : undefined}
          {...(props as any)}
        />
        
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="w-1 h-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
