import { invoke } from '@tauri-apps/api/core';

function isTauriEnvironment() {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Ask the backend to open a new timer window.
 * Gracefully no-ops when not running inside Tauri (e.g. Vite preview).
 */
export async function openNewTimerWindow(label?: string) {
  if (!isTauriEnvironment()) {
    return;
  }

  try {
    await invoke('create_timer_window', { label });
  } catch (error) {
    console.error('Failed to create timer window', error);
  }
}

export { isTauriEnvironment };
