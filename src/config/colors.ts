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
