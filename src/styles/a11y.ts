import { useId } from 'react';

/**
 * Hook that returns a stable unique ID for ARIA attributes.
 */
export const useA11yId = (prefix: string = 'a11y') => {
  const id = useId();
  return `${prefix}-${id}`;
};
