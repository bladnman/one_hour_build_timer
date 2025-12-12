/**
 * Central export for all configuration
 */
export { TIMER_COLORS, UI_COLORS, COLOR_THEMES, DEFAULT_THEME_ID, getThemeById } from './colors';
export type { TimerColorKey, ColorTheme, ThemeId } from './colors';
export { TIMING } from './timing';
export { DEFAULT_PRESETS, USER_PRESET_CONFIG } from './presets';
export { WINDOW_CONFIG } from './window';
export { APP_CONFIG } from './app';
export { STORAGE_KEYS, getWindowStorageKey } from './storage-keys';
