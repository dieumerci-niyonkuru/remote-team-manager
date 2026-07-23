import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 500,
        width: 44, height: 44, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--brand), var(--accent))',
        color: '#fff', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(51,102,255,0.35)',
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, opacity 0.3s',
        animation: 'scrollBtnIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(51,102,255,0.5)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(51,102,255,0.35)'; }}
    >
      <ChevronUp size={20} strokeWidth={2.5} />
      <style>{`
        @keyframes scrollBtnIn {
          from { opacity: 0; transform: translateY(16px) scale(0.8); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </button>
  );
}
