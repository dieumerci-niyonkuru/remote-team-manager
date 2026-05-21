import React from 'react';
import * as tokens from '../../styles/tokens';
import { radiusStyle } from '../../styles/utils';

type Option = { value: string | number; label: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
  error?: string;
  className?: string;
};

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', style, ...rest }) => (
  <div className="flex flex-col space-y-1">
    {label && <label className="text-sm font-medium">{label}</label>}
    <select
      className={`border px-3 py-2 bg-[#060b18] dark:bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-brand/40 ${error ? 'border-rose-500' : 'border-white/20'} ${className}`}
      style={{ ...radiusStyle('md'), ...style }}
      aria-label={label ? undefined : 'Select option'}
      {...rest}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export default Select;
