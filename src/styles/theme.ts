import { spacing } from './spacing';
import { radius } from './tokens';
import { shadow } from './shadows';
import { colors } from './colors';
import { typography } from './typography';
import { breakpoints } from './breakpoints';
import { zindex } from './zindex';
import { animation } from './animations';

export const theme = {
  spacing,
  radius,
  shadow,
  colors,
  typography,
  breakpoints,
  zindex,
  animation,
};

export type Theme = typeof theme;
