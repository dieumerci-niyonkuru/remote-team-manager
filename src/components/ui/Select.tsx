import React from 'react';

type Option = { value: string | number; label: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
  error?: string;
  className?: string;
};

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', ...rest }) => (
  <div className="flex flex-col space-y-1">
    {label && <label className="text-sm font-medium">{label}</label>}
    <select
      className={`border rounded-[${tokens.radius.md}px] px-${tokens.spacing[3]} py-${tokens.spacing[2]} bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/40 ${error ? 'border-rose-500' : 'border-white/20'} ${className}`}
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
