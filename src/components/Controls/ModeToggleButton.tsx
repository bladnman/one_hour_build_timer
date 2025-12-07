import type { TimerMode } from '../../types';

interface ModeToggleButtonProps {
  /** Current timer mode */
  mode: TimerMode;
  /** Called when button is clicked */
  onToggle: () => void;
}

/**
 * Toggle button to switch between countdown and count-up modes
 */
export function ModeToggleButton({ mode, onToggle }: ModeToggleButtonProps) {
  const isCountdown = mode === 'countdown';

  return (
    <button
      className="control-button mode-toggle-button"
      onClick={onToggle}
      aria-label={isCountdown ? 'Switch to count up' : 'Switch to countdown'}
      title={isCountdown ? 'Countdown mode' : 'Count up mode'}
    >
      {isCountdown ? '↓' : '↑'}
    </button>
  );
}
