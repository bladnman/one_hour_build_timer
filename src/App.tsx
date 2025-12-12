import { useCallback, useRef } from 'react';
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
  NewWindowButton,
} from './components/Controls';
import { EditableTitle } from './components/Title';
import { ContextMenu } from './components/ContextMenu';
import { APP_CONFIG, STORAGE_KEYS, getWindowStorageKey } from './config';
import { createWindow } from './utils/tauri-commands';
import type { TimerMode } from './types';

function App() {
  // Container ref for scaling
  const containerRef = useRef<HTMLDivElement>(null);

  // Get window ID for scoped storage
  const windowId = getWindowId();

  // Dynamic scaling based on window size
  useScaling(containerRef);

  // Color theme management
  const { themeId, setThemeId } = useColorTheme();

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

  // Timer state and controls
  const timer = useTimer(60, mode); // Start with 1 minute default

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
    } catch (error) {
      console.error('Failed to create new window:', error);
    }
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggle: timer.toggle,
    onEscape: timer.stopEditing,
    onNewWindow: handleNewWindow,
    isEditing: timer.state.editingSegment !== null,
  });

  return (
    <div ref={containerRef} className="app-container" data-tauri-drag-region>
      {/* Context menu for right-click */}
      <ContextMenu
        themeId={themeId}
        onThemeChange={setThemeId}
        onNewWindow={handleNewWindow}
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
        <NewWindowButton onClick={handleNewWindow} />
        <ModeToggleButton mode={mode} onToggle={toggleMode} />
        <PlayPauseButton status={timer.state.status} onToggle={timer.toggle} />
        <ResetButton onReset={timer.reset} />
        <PresetButtons presets={allPresets} onSelect={handlePresetSelect} />
      </div>
    </div>
  );
}

export default App;
