import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-brand/20',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-brand/20',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-brand/20',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-brand/20',
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute z-[1000] px-4 py-2 bg-[#0d1425] border border-brand/20 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none whitespace-nowrap ${positionClasses[position]}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white">{content}</p>
          <div className={`absolute w-2 h-2 border-4 border-transparent ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};
