import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function OnboardingTooltip({ tooltipText, storageKey, actionText, onAction }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!storageKey) { setVisible(true); return; }
    const shown = localStorage.getItem(storageKey);
    if (!shown) setVisible(true);
  }, [storageKey]);

  const dismiss = () => {
    setVisible(false);
    if (storageKey) localStorage.setItem(storageKey, 'true');
  };

  if (!visible) return null;

  return (
    <div style={{ background: 'var(--brand-bg)', border: '1px solid rgba(51,102,255,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <Sparkles size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
      <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, flex: 1 }}>{tooltipText}</p>
      {actionText && onAction && (
        <button onClick={() => { onAction(); dismiss(); }}
          style={{ background: 'var(--brand)', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {actionText}
        </button>
      )}
      <button onClick={dismiss} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 2 }}>
        <X size={14} />
      </button>
    </div>
  );
}
