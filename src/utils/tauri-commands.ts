import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import type { WindowState } from '../types/window';

/**
 * Create a new timer window
 * Returns the new window ID
 */
export async function createWindow(): Promise<string> {
  const currentWindow = getCurrentWindow();
  let x: number | null = null;
  let y: number | null = null;

  try {
    const position = await currentWindow.outerPosition();
    x = position.x;
    y = position.y;
  } catch {
    // Ignore position errors, window will be created at default position
  }

  return invoke<string>('create_window', { x, y });
}

/**
 * Close a window by ID
 */
export async function closeWindow(windowId: string): Promise<void> {
  return invoke('close_window', { windowId });
}

/**
 * Get window state (position and size)
 */
export async function getWindowState(windowId: string): Promise<WindowState> {
  return invoke<WindowState>('get_window_state', { windowId });
}

/**
 * Restore windows from saved state
 */
export async function restoreWindows(windows: WindowState[]): Promise<void> {
  return invoke('restore_windows', { windows });
}

/**
 * Get all current window IDs
 */
export async function getAllWindowIds(): Promise<string[]> {
  return invoke<string[]>('get_all_window_ids');
}
