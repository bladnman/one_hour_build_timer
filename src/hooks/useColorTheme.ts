import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { COLOR_THEMES, DEFAULT_THEME_ID, getThemeById } from '../config/colors';
import { STORAGE_KEYS, getWindowStorageKey } from '../config/storage-keys';
import { getWindowId } from './useWindowId';
import type { ColorTheme } from '../config/colors';

export interface UseColorThemeReturn {
  theme: ColorTheme;
  themeId: string;
  setThemeId: (id: string) => void;
  nextTheme: () => void;
  themes: readonly ColorTheme[];
}

/**
 * Hook for managing color theme selection with persistence
 */
export function useColorTheme(): UseColorThemeReturn {
  const windowId = getWindowId();
  const storageKey = getWindowStorageKey(STORAGE_KEYS.COLOR_THEME, windowId);

  const [themeId, setThemeId] = useLocalStorage<string>(storageKey, DEFAULT_THEME_ID);

  const theme = getThemeById(themeId);

  // Apply theme CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-running', theme.running);
    root.style.setProperty('--color-overtime', theme.overtime);
  }, [theme]);

  // Cycle to next theme
  const nextTheme = useCallback(() => {
    const currentIndex = COLOR_THEMES.findIndex((t) => t.id === themeId);
    const nextIndex = (currentIndex + 1) % COLOR_THEMES.length;
    setThemeId(COLOR_THEMES[nextIndex].id);
  }, [themeId, setThemeId]);

  return {
    theme,
    themeId,
    setThemeId,
    nextTheme,
    themes: COLOR_THEMES,
  };
}
