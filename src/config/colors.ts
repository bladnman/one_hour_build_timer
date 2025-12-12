/**
 * Timer state colors
 * All colors are externalized here for easy theming
 */
export const TIMER_COLORS = {
  /** Color when timer is actively counting down */
  running: '#22c55e',
  /** Color when timer is paused */
  paused: '#6b7280',
  /** Color when timer has gone past zero (negative time) */
  overtime: '#ef4444',
  /** Color for the colon separator */
  colon: '#9ca3af',
} as const;

/**
 * Preset color pairings for the clock face
 */
export const COLOR_PAIRINGS = [
  {
    id: 'green-red',
    label: 'Green / Red',
    running: '#22c55e',
    overtime: '#ef4444',
  },
  {
    id: 'blue-amber',
    label: 'Blue / Amber',
    running: '#38bdf8',
    overtime: '#f59e0b',
  },
  {
    id: 'violet-pink',
    label: 'Violet / Pink',
    running: '#a855f7',
    overtime: '#fb7185',
  },
  {
    id: 'mint-orange',
    label: 'Mint / Orange',
    running: '#34d399',
    overtime: '#fb923c',
  },
] as const;

export const DEFAULT_COLOR_PAIRING_ID = COLOR_PAIRINGS[0].id;

/**
 * UI background and container colors
 */
export const UI_COLORS = {
  /** Semi-transparent dark background for the app container */
  background: 'rgba(30, 30, 30, 0.85)',
  /** Hover state for buttons */
  buttonHover: 'rgba(255, 255, 255, 0.1)',
  /** Primary text color */
  textPrimary: '#ffffff',
  /** Secondary/muted text color */
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  /** Edit mode highlight */
  editHighlight: 'rgba(59, 130, 246, 0.3)',
  /** Edit mode cursor */
  editCursor: '#3b82f6',
} as const;

export type TimerColorKey = keyof typeof TIMER_COLORS;
export type ColorPairing = (typeof COLOR_PAIRINGS)[number];
