import * as tokens from './tokens';

/**
 * Returns an inline style object containing the border-radius value
 * from the centralized design tokens.
 */
export const radiusStyle = (size: keyof typeof tokens.radius) => ({
  borderRadius: `${tokens.radius[size]}px`,
});

/**
 * Returns an inline style object containing the box-shadow value
 * from the centralized design tokens.
 */
export const shadowStyle = (size: keyof typeof tokens.shadow) => ({
  boxShadow: tokens.shadow[size],
});

