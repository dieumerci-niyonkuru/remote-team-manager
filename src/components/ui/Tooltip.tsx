import React, { ReactNode, useState, useRef, useEffect, useId } from 'react';

type Position = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  children: ReactNode; // element that triggers tooltip
  content: ReactNode; // tooltip content
  position?: Position;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  };
  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 150);
  };

  const positionClasses: Record<Position, string> = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  };

  const trigger = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        'aria-describedby': visible ? tooltipId : undefined,
        onFocus: show,
        onBlur: hide,
      })
    : children;

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {trigger}
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute z-10 px-3 py-2 text-sm text-white bg-gray-800 rounded ${positionClasses[position]} ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
