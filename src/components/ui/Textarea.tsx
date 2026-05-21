import React from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  className?: string;
};

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', ...rest }) => (
  <div className="flex flex-col space-y-1">
    {label && <label className="text-sm font-medium">{label}</label>}
    <textarea
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
      {...rest}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export default Textarea;
