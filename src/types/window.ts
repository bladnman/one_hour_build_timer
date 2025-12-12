/**
 * Window state for persistence
 */
export interface WindowState {
  id: string;
  x: number | null;
  y: number | null;
  width: number;
  height: number;
}

/**
 * Extended window state including app-level state
 */
export interface WindowRegistryEntry {
  id: string;
  x: number | null;
  y: number | null;
  width: number;
  height: number;
  themeId: string;
  title: string;
  mode: 'countdown' | 'countup';
  lastTime: number;
}
