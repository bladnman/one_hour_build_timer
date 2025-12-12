import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getWindowId } from './useWindowId';
import { STORAGE_KEYS, getWindowStorageKey } from '../config/storage-keys';
import { DEFAULT_THEME_ID } from '../config/colors';
import { APP_CONFIG } from '../config/app';
import { getWindowState, restoreWindows } from '../utils/tauri-commands';
import type { WindowRegistryEntry } from '../types/window';

/**
 * Hook for managing the window registry
 * Handles persistence of all windows across app restarts
 */
export function useWindowRegistry() {
  const [registry, setRegistry] = useLocalStorage<WindowRegistryEntry[]>(
    STORAGE_KEYS.WINDOW_REGISTRY,
    []
  );
  const windowId = getWindowId();

  // Register this window in the registry
  const registerWindow = useCallback(async () => {
    const currentId = getWindowId();

    // Get current window state from Tauri
    let windowState = {
      x: null as number | null,
      y: null as number | null,
      width: 312,
      height: 125,
    };

    try {
      const state = await getWindowState(currentId);
      windowState = {
        x: state.x,
        y: state.y,
        width: state.width,
        height: state.height,
      };
    } catch {
      // Ignore errors, use defaults
    }

    // Get stored preferences for this window
    const themeKey = getWindowStorageKey(STORAGE_KEYS.COLOR_THEME, currentId);
    const titleKey = getWindowStorageKey(STORAGE_KEYS.TITLE, currentId);
    const modeKey = getWindowStorageKey(STORAGE_KEYS.TIMER_MODE, currentId);
    const secondsKey = getWindowStorageKey(STORAGE_KEYS.TIMER_SECONDS, currentId);

    const storedTheme = localStorage.getItem(themeKey);
    const storedTitle = localStorage.getItem(titleKey);
    const storedMode = localStorage.getItem(modeKey);
    const storedSeconds = localStorage.getItem(secondsKey);

    const entry: WindowRegistryEntry = {
      id: currentId,
      ...windowState,
      themeId: storedTheme ? JSON.parse(storedTheme) : DEFAULT_THEME_ID,
      title: storedTitle ? JSON.parse(storedTitle) : APP_CONFIG.name,
      mode: storedMode ? JSON.parse(storedMode) : 'countdown',
      lastTime: storedSeconds ? JSON.parse(storedSeconds) : 60,
    };

    setRegistry((prev) => {
      const filtered = prev.filter((w) => w.id !== currentId);
      return [...filtered, entry];
    });
  }, [setRegistry]);

  // Update window state in registry (call periodically or on changes)
  const updateWindowState = useCallback(async () => {
    const currentId = getWindowId();

    try {
      const state = await getWindowState(currentId);

      setRegistry((prev) => {
        return prev.map((w) => {
          if (w.id !== currentId) return w;
          return {
            ...w,
            x: state.x,
            y: state.y,
            width: state.width,
            height: state.height,
          };
        });
      });
    } catch {
      // Ignore errors
    }
  }, [setRegistry]);

  // Remove window from registry
  const unregisterWindow = useCallback(
    (id: string) => {
      setRegistry((prev) => prev.filter((w) => w.id !== id));

      // Clean up localStorage keys for this window
      const keys = [
        STORAGE_KEYS.COLOR_THEME,
        STORAGE_KEYS.TITLE,
        STORAGE_KEYS.TIMER_MODE,
        STORAGE_KEYS.TIMER_SECONDS,
        STORAGE_KEYS.TIMER_INITIAL,
        STORAGE_KEYS.TIMER_STATUS,
        STORAGE_KEYS.USER_PRESETS,
      ];

      for (const key of keys) {
        localStorage.removeItem(getWindowStorageKey(key, id));
      }
    },
    [setRegistry]
  );

  // Register this window on mount
  useEffect(() => {
    registerWindow();
  }, [registerWindow]);

  // Restore windows on app startup (main window only)
  useEffect(() => {
    if (windowId !== 'main') return;

    // Read registry directly from localStorage to avoid timing issues
    const savedRegistry = localStorage.getItem(STORAGE_KEYS.WINDOW_REGISTRY);
    if (!savedRegistry) return;

    try {
      const parsed = JSON.parse(savedRegistry) as WindowRegistryEntry[];
      const windowsToRestore = parsed.filter((w) => w.id !== 'main');

      if (windowsToRestore.length === 0) return;

      restoreWindows(
        windowsToRestore.map((w) => ({
          id: w.id,
          x: w.x,
          y: w.y,
          width: w.width,
          height: w.height,
        }))
      ).catch(() => {
        // Silently ignore restore errors
      });
    } catch {
      // Silently ignore parse errors
    }
  }, [windowId]);

  // Update state periodically and before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateWindowState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Update every 5 seconds
    const interval = setInterval(updateWindowState, 5000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, [updateWindowState]);

  return {
    registry,
    registerWindow,
    unregisterWindow,
    updateWindowState,
  };
}
