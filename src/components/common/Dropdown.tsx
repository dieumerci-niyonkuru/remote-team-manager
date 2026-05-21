import React, { useState, useRef, useEffect } from 'react';

import { ChevronDown } from 'lucide-react';
import * as tokens from '../../styles/tokens';

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedItem = items.find(item => item.value === value);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
   const handleButtonKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
       e.preventDefault();
       setIsOpen(true);
       setFocusedIndex(0);
     }
   };
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const handleItemKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((index + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((index - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onChange(items[index].value);
        setIsOpen(false);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };
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
        onKeyDown={handleButtonKeyDown}
        className={`w-full bg-[#0b1429] border border-white/5 px-4 py-3 text-sm text-white flex items-center justify-between transition-all duration-200 outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50`} style={{ borderRadius: tokens.radius.md }} aria-haspopup="listbox" aria-controls="dropdown-menu" aria-expanded={isOpen}>

        <div className="flex items-center gap-3">
          {selectedItem?.icon}
          <span>{selectedItem?.label || 'Select option'}</span>
        </div>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0d1425] border border-white/10 z-[100] animate-in fade... p-2`} style={{ borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.lg }} role="listbox" id="dropdown-menu" aria-activedescendant={focusedIndex >= 0 ? `dropdown-item-${focusedIndex}` : undefined}>
                  {items.map((item, idx) => (
            <button
                type="button"
                key={item.value}
                ref={el => { optionRefs.current[idx] = el; }}
                id={`dropdown-item-${idx}`}
                role="option"
                aria-selected={item.value === value}
                onClick={() => {
                  onChange(item.value);
                  setIsOpen(false);
                }}
                onKeyDown={e => handleItemKeyDown(e, idx)}
                className={`w-full flex items-center gap-3 text-sm transition-colors ${item.value === value ? 'bg-brand/10 text-brand' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                style={{
                  paddingLeft: tokens.spacing[4],
                  paddingRight: tokens.spacing[4],
                  paddingTop: tokens.spacing[3],
                  paddingBottom: tokens.spacing[3],
                  borderRadius: tokens.radius.md,
                }}
            >        {item.icon}
              <span className="font-semibold">{item.label}</span>
            </button>

          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
