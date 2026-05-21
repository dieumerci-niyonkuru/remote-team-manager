import React from 'react';
import * as tokens from '../../styles/tokens';
import { LucideProps } from 'lucide-react';

interface IconProps extends Omit<LucideProps, 'size'> {
  /** Size name corresponding to design token spacing */
  size?: keyof typeof tokens.spacing;
  /** Optional fill color, defaults to current text color */
  color?: string;
}

/**
 * Icon component that standardizes sizing and color across the app.
 * Usage: <Icon name={Folder} size="4" />
 */
export const Icon: React.FC<IconProps> = ({ size = 4, color = 'currentColor', ...props }) => {
  const pixelSize = tokens.spacing[size] ?? 16;
  // The `as any` cast is needed because we receive a component via props.children in usage patterns.
  const Component = (props as any).children as React.ComponentType<LucideProps>;
  return <Component size={pixelSize} color={color} {...props} />;
};

export default Icon;
