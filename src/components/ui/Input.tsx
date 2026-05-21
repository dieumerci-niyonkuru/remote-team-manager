import { radiusStyle } from '../../styles/utils';
import * as tokens from '../../styles/tokens';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  className?: string;
};

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...rest }) => (
  <div className="flex flex-col space-y-1">
    {label && <label className="text-sm font-medium">{label}</label>}
      <input
        style={radiusStyle('md')}
        className={`border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...rest}
      />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export default Input;
