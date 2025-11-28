import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsOptions {
  /** Handler for spacebar press (play/pause toggle) */
  onToggle: () => void;
  /** Handler for escape press */
  onEscape?: () => void;
  /** Whether shortcuts are currently enabled */
  enabled?: boolean;
  /** Whether an input is currently focused (disables shortcuts) */
  isEditing?: boolean;
}

/**
 * Hook for handling global keyboard shortcuts
 */
export function useKeyboardShortcuts({
  onToggle,
  onEscape,
  enabled = true,
  isEditing = false,
}: UseKeyboardShortcutsOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't capture when editing or when shortcuts are disabled
      if (!enabled || isEditing) {
        return;
      }

      // Don't capture when typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          onToggle();
          break;

        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
      }
    },
    [enabled, isEditing, onToggle, onEscape]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
