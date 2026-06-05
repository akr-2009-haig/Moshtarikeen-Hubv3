import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrl = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
        const key = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const needsCtrl = shortcut.ctrl || shortcut.meta;
        if (key && (needsCtrl ? (e.ctrlKey || e.metaKey) : true) && (!needsCtrl || ctrl)) {
          if (needsCtrl) {
            e.preventDefault();
            shortcut.handler();
            return;
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
