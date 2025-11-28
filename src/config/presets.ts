import type { PresetTime } from '../types';

/**
 * Default time presets available in the UI
 */
export const DEFAULT_PRESETS: PresetTime[] = [
  { label: '1m', seconds: 60 },
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
  { label: '1h', seconds: 3600 },
];

/**
 * Configuration for user presets
 */
export const USER_PRESET_CONFIG = {
  /** Maximum number of recent user times to store */
  MAX_USER_PRESETS: 2,
} as const;
