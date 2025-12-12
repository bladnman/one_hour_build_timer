/**
 * localStorage keys for persisting user data
 * Keys with {windowId} placeholder should be interpolated with actual window ID
 */
export const STORAGE_KEYS = {
  /** Recent user-defined time presets (per window) */
  USER_PRESETS: 'countdown-timer:user-presets',

  /** Last set time (per window) */
  LAST_TIME: 'countdown-timer:last-time',

  /** User-defined title (per window) */
  TITLE: 'countdown-timer:title',

  /** Timer mode - countdown or countup (per window) */
  TIMER_MODE: 'countdown-timer:mode',

  /** Color theme ID (per window) */
  COLOR_THEME: 'countdown-timer:color-theme',

  /** Registry of all windows and their state */
  WINDOW_REGISTRY: 'countdown-timer:window-registry',
} as const;

/**
 * Get a storage key scoped to a specific window
 */
export function getWindowStorageKey(baseKey: string, windowId: string): string {
  return `${baseKey}:${windowId}`;
}
