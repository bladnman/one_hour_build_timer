import type { TimerStatus } from '../../types';

interface PlayPauseButtonProps {
  /** Current timer status */
  status: TimerStatus;
  /** Called when button is clicked */
  onToggle: () => void;
}

/**
 * Play/pause toggle button
 */
export function PlayPauseButton({ status, onToggle }: PlayPauseButtonProps) {
  const isPlaying = status === 'running' || status === 'overtime';

  return (
    <button
      className="control-button play-pause-button"
      onClick={onToggle}
      aria-label={isPlaying ? 'Pause' : 'Play'}
      title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
    >
      {isPlaying ? '⏸' : '▶'}
    </button>
  );
}
