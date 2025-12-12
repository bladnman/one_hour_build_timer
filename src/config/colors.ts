/**
 * Color theme definitions
 * Each theme has a running color and overtime color
 */
export interface ColorTheme {
  id: string;
  name: string;
  running: string;
  overtime: string;
}

/**
 * Available color themes (8 pairs)
 */
export const COLOR_THEMES: ColorTheme[] = [
  { id: 'green-red', name: 'Green / Red', running: '#22c55e', overtime: '#ef4444' },
  { id: 'blue-orange', name: 'Blue / Orange', running: '#3b82f6', overtime: '#f97316' },
  { id: 'cyan-magenta', name: 'Cyan / Magenta', running: '#06b6d4', overtime: '#ec4899' },
  { id: 'purple-yellow', name: 'Purple / Yellow', running: '#8b5cf6', overtime: '#eab308' },
  { id: 'teal-coral', name: 'Teal / Coral', running: '#14b8a6', overtime: '#f87171' },
  { id: 'lime-pink', name: 'Lime / Pink', running: '#84cc16', overtime: '#f472b6' },
  { id: 'sky-amber', name: 'Sky / Amber', running: '#0ea5e9', overtime: '#f59e0b' },
  { id: 'emerald-rose', name: 'Emerald / Rose', running: '#10b981', overtime: '#fb7185' },
] as const;

export const DEFAULT_THEME_ID = 'green-red';

/**
 * Get a theme by ID, or return default if not found
 */
export function getThemeById(id: string): ColorTheme {
  return COLOR_THEMES.find((t) => t.id === id) ?? COLOR_THEMES[0];
}

/**
 * Timer state colors (static colors that don't change with theme)
 */
export const TIMER_COLORS = {
  /** Color when timer is paused */
  paused: '#6b7280',
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
export type ThemeId = (typeof COLOR_THEMES)[number]['id'];
