/**
 * Window configuration
 * Note: Aspect ratio is also enforced in Rust (src-tauri/src/lib.rs)
 */
export const WINDOW_CONFIG = {
  /** Aspect ratio (width / height) - 2.5:1 for HH:MM:SS display */
  ASPECT_RATIO: 2.5 / 1,

  /** Default window width in pixels */
  DEFAULT_WIDTH: 312,

  /** Default window height in pixels */
  DEFAULT_HEIGHT: 125,

  /** Minimum window width in pixels */
  MIN_WIDTH: 300,

  /** Minimum window height in pixels */
  MIN_HEIGHT: 80,

  /** Border radius for the app container */
  BORDER_RADIUS: 12,
} as const;
