import { useCallback, useRef } from 'react';
import { useTimer, useKeyboardShortcuts, useUserPresets, useLocalStorage, useScaling } from './hooks';
import { TimerDisplay } from './components/Timer';
import { PlayPauseButton, ResetButton, PresetButtons, ModeToggleButton } from './components/Controls';
import { EditableTitle } from './components/Title';
import { APP_CONFIG, STORAGE_KEYS } from './config';
import type { TimerMode } from './types';

function App() {
  // Container ref for scaling
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic scaling based on window size
  useScaling(containerRef);

  // Timer mode persistence
  const [mode, setMode] = useLocalStorage<TimerMode>(STORAGE_KEYS.TIMER_MODE, 'countdown');

  // Toggle between countdown and count-up modes
  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'countdown' ? 'countup' : 'countdown'));
  }, [setMode]);

  // Timer state and controls
  const timer = useTimer(60, mode); // Start with 1 minute default

  // User presets management
  const { allPresets, addPreset } = useUserPresets();

  // Title persistence
  const [title, setTitle] = useLocalStorage<string>(STORAGE_KEYS.TITLE, APP_CONFIG.name);

  // Handle preset selection
  const handlePresetSelect = useCallback(
    (seconds: number) => {
      timer.setTime(seconds);
      addPreset(seconds);
    },
    [timer, addPreset]
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggle: timer.toggle,
    onEscape: timer.stopEditing,
    isEditing: timer.state.editingSegment !== null,
  });

  return (
    <div ref={containerRef} className="app-container" data-tauri-drag-region>
      {/* Editable title */}
      <EditableTitle
        value={title}
        onChange={setTitle}
        placeholder={APP_CONFIG.name}
      />

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
        <ModeToggleButton mode={mode} onToggle={toggleMode} />
        <PlayPauseButton status={timer.state.status} onToggle={timer.toggle} />
        <ResetButton onReset={timer.reset} />
        <PresetButtons presets={allPresets} onSelect={handlePresetSelect} />
      </div>
    </div>
  );
}

export default App;
