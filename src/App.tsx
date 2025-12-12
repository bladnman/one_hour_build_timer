import { useCallback, useRef, useState } from 'react';
import {
  useTimer,
  useKeyboardShortcuts,
  useUserPresets,
  useLocalStorage,
  useScaling,
  useColorTheme,
  useWindowRegistry,
  getWindowId,
} from './hooks';
import { TimerDisplay } from './components/Timer';
import {
  PlayPauseButton,
  ResetButton,
  PresetButtons,
  ModeToggleButton,
  MenuButton,
} from './components/Controls';
import { EditableTitle } from './components/Title';
import { MenuOverlay } from './components/Menu';
import { APP_CONFIG, STORAGE_KEYS, getWindowStorageKey } from './config';
import { createWindow, closeWindow } from './utils/tauri-commands';
import type { TimerMode } from './types';

function App() {
  // Container ref for scaling
  const containerRef = useRef<HTMLDivElement>(null);

  // Get window ID for scoped storage
  const windowId = getWindowId();
  const isMainWindow = windowId === 'main';

  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dynamic scaling based on window size
  useScaling(containerRef);

  // Color theme management
  const { themes, themeId, setThemeId } = useColorTheme();

  // Window registry for multi-window persistence
  useWindowRegistry();

  // Timer mode persistence (scoped to window)
  const [mode, setMode] = useLocalStorage<TimerMode>(
    getWindowStorageKey(STORAGE_KEYS.TIMER_MODE, windowId),
    'countdown'
  );

  // Toggle between countdown and count-up modes
  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'countdown' ? 'countup' : 'countdown'));
  }, [setMode]);

  // Timer state and controls (with persistence)
  const timer = useTimer(60, mode, windowId);

  // User presets management (scoped to window)
  const { allPresets, addPreset } = useUserPresets(windowId);

  // Title persistence (scoped to window)
  const [title, setTitle] = useLocalStorage<string>(
    getWindowStorageKey(STORAGE_KEYS.TITLE, windowId),
    APP_CONFIG.name
  );

  // Handle preset selection
  const handlePresetSelect = useCallback(
    (seconds: number) => {
      timer.setTime(seconds);
      addPreset(seconds);
    },
    [timer, addPreset]
  );

  // Handle new window creation
  const handleNewWindow = useCallback(async () => {
    try {
      await createWindow();
    } catch {
      // Silently ignore window creation errors
    }
  }, []);

  // Handle closing current window
  const handleCloseWindow = useCallback(async () => {
    try {
      await closeWindow(windowId);
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  }, [windowId]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggle: timer.toggle,
    onEscape: timer.stopEditing,
    onNewWindow: handleNewWindow,
    isEditing: timer.state.editingSegment !== null,
  });

  return (
    <div ref={containerRef} className="app-container" data-tauri-drag-region>
      {/* Menu overlay */}
      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        themes={themes}
        currentThemeId={themeId}
        onThemeSelect={setThemeId}
        onNewWindow={handleNewWindow}
        showCloseWindow={!isMainWindow}
        onCloseWindow={handleCloseWindow}
      />

      {/* Editable title */}
      <EditableTitle value={title} onChange={setTitle} placeholder={APP_CONFIG.name} />

      {/* Main timer display */}
      <TimerDisplay
        displayTime={timer.displayTime}
        segments={timer.segments}
        status={timer.state.status}
        editingSegment={timer.state.editingSegment}
        onStartEdit={timer.startEditing}
        onSegmentChange={timer.setSegment}
        onStopEdit={timer.stopEditing}
        onSegmentAdjust={timer.adjustSegment}
      />

      {/* Control bar */}
      <div className="control-bar">
        <MenuButton onClick={() => setIsMenuOpen(true)} />
        <div className="control-bar-separator" />
        <ModeToggleButton mode={mode} onToggle={toggleMode} />
        <PlayPauseButton status={timer.state.status} onToggle={timer.toggle} />
        <ResetButton onReset={timer.reset} />
        <PresetButtons presets={allPresets} onSelect={handlePresetSelect} />
      </div>
    </div>
  );
}

export default App;
