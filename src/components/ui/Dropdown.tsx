import React, { ReactNode, useState, useRef, useEffect } from 'react';

interface DropdownItem {
  label: string;
  onClick: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="absolute mt-2 w-48 bg-white rounded shadow-lg z-10">
          {items.map((item, idx) => (
            <button
              key={idx}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
