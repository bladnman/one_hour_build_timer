/**
 * localStorage keys for persisting user data
 */
export const STORAGE_KEYS = {
  /** Recent user-defined time presets */
  USER_PRESETS: 'countdown-timer:user-presets',

  /** Last set time */
  LAST_TIME: 'countdown-timer:last-time',

  /** User-defined title */
  TITLE: 'countdown-timer:title',

  /** Timer mode (countdown or countup) */
  TIMER_MODE: 'countdown-timer:mode',

  /** Selected color pairing for the clock */
  COLOR_PAIRING: 'countdown-timer:color-pairing',
} as const;
