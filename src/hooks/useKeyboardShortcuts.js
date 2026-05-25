import { useEffect } from 'react';

export default function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      for (const shortcut of shortcuts) {
        const match =
          (!shortcut.ctrl || ctrl) &&
          (!shortcut.shift || shift) &&
          shortcut.key.toLowerCase() === key;

        if (match) {
          e.preventDefault();
          shortcut.action(e);
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
