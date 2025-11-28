/**
 * Timing configuration for the countdown timer
 */
export const TIMING = {
  /** Milliseconds between timer ticks */
  TICK_INTERVAL_MS: 1000,

  /** Maximum allowed time in seconds (99:59:59) */
  MAX_TIME_SECONDS: 359999,

  /** Minimum time value */
  MIN_TIME_SECONDS: 0,

  /** Animation duration for colon throbbing (ms) */
  COLON_ANIMATION_DURATION_MS: 1000,

  /** Debounce delay for input changes (ms) */
  INPUT_DEBOUNCE_MS: 300,
} as const;
