export const a11yStyles = `
/* Skip to content link – hidden but visible on focus */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  z-index: 10000;
  transition: top 0.3s ease-in-out;
}
.skip-link:focus {
  top: 0;
}
`;

import React from 'react';

// Hook to generate a stable, unique ID for ARIA attributes.
export const useA11yId = (prefix: string = 'a11y'): string => {
  const [id] = React.useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return id;
};
