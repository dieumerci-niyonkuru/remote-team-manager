import React, { useState, useRef, useEffect } from 'react';
import * as tokens from '../../styles/tokens';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  label?: string;
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  items,
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItem = items.find(item => item.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-1.5 w-full relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#0b1429] border border-white/5 rounded-[${tokens.radius.md}px] px-${tokens.spacing[4]} py-${tokens.spacing[3]} text-sm text-white flex items-center justify-between transition-all duration-200 outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50`}
      >
        <div className="flex items-center gap-3">
          {selectedItem?.icon}
          <span>{selectedItem?.label || 'Select option'}</span>
        </div>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0d1425] border border-white/10 rounded-[${tokens.radius.lg}px] shadow-${tokens.shadow.lg} z-[100] p-${tokens.spacing[2]} animate-in fade-in slide-in-from-top-2 duration-200`}>
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                onChange(item.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-${tokens.spacing[4]} py-${tokens.spacing[3]} rounded-[${tokens.radius.md}px] text-sm transition-colors ${
                item.value === value 
                  ? 'bg-brand/10 text-brand' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
