import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  eyebrowColor?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  eyebrowColor = 'var(--brand)',
  title,
  subtitle,
  align = 'center',
  className = '',
}) => {
  const alignClass = align === 'center' ? 'text-center mx-auto' : '';

  return (
    <div className={`mb-8 max-w-[580px] ${alignClass} ${className}`}>
      {eyebrow && (
        <p
          className="text-xs font-bold uppercase tracking-[0.12em] mb-3"
          style={{ color: eyebrowColor }}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="text-[clamp(22px,4vw,44px)] font-extrabold tracking-tight leading-tight text-[var(--text)] mb-3.5" style={{ letterSpacing: '-0.03em' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-[clamp(14px,1.6vw,16px)] leading-relaxed text-[var(--text3)] max-w-[480px] mx-0" style={align === 'center' ? { margin: '0 auto' } : undefined}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
