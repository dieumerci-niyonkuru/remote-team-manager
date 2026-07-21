import React, { useRef, useEffect } from 'react';
import { useA11yId } from '../../styles/a11y';
import { radiusStyle, shadowStyle } from '../../styles/utils';
import { X } from 'lucide-react';
import { Button } from './Button';
import FocusTrap from './FocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer
}) => {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // ⚠️  ALL hooks must be called unconditionally (Rules of Hooks).
  //     useA11yId uses useState internally — it MUST be above the early return.
  const titleId = useA11yId('modal');

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
      if (previouslyFocused.current) {
        previouslyFocused.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <FocusTrap>
        <div className={`w-full ${sizes[size]} overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', ...radiusStyle('lg'), ...shadowStyle('md'), maxHeight: '90vh' }}>
          {/* Header */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 id={titleId} className="text-lg sm:text-xl font-black tracking-tight" style={{ color: 'var(--text)' }}>{title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-8 py-5 sm:py-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-t flex items-center justify-end gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
              {footer}
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  );
};

export default Modal;
