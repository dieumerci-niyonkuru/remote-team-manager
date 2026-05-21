import { radius, spacing, shadow } from './tokens';

export const radiusClass = (size: keyof typeof radius): string => {
  const map: Record<keyof typeof radius, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    xxl: 'rounded-2xl',
    full: 'rounded-full',
    custom32: 'rounded-[32px]',
    custom40: 'rounded-[40px]',
  };
  return map[size] ?? '';
};

export const spacingClass = (size: keyof typeof spacing, axis: 'x' | 'y' = 'x'): string => {
  const scale = size; // assuming spacing values map 1:1 to Tailwind scale (e.g., 4 => p-4)
  const prefix = axis === 'x' ? 'px' : 'py';
  return `${prefix}-${scale}`;
};

export const shadowClass = (size: keyof typeof shadow): string => {
  const map: Record<keyof typeof shadow, string> = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  return map[size] ?? '';
};

export const zIndexClass = (z: number): string => `z-[${z}]`;

export const animationClass = (name: keyof typeof import('./animations').default): string => {
  // Placeholder – map animation names to Tailwind utilities if needed
  return '';
};

export const breakpointClass = (bp: keyof typeof import('./breakpoints').default): string => `max-${bp}`;
