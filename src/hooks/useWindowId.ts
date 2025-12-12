import { useState, useEffect } from 'react';

/**
 * Get the window ID from URL search params or generate a default
 * Window ID is used to scope localStorage keys for multi-window support
 */
export function useWindowId(): string {
  const [windowId, setWindowId] = useState<string>('main');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('windowId');
    if (id) {
      setWindowId(id);
    }
  }, []);

  return windowId;
}

/**
 * Get window ID synchronously (for initial render)
 */
export function getWindowId(): string {
  if (typeof window === 'undefined') return 'main';
  const params = new URLSearchParams(window.location.search);
  return params.get('windowId') ?? 'main';
}
