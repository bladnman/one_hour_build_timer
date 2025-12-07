/**
 * Timer status states
 */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'overtime';

/**
 * Timer mode - countdown or count-up
 */
export type TimerMode = 'countdown' | 'countup';

/**
 * Time segment keys for editing
 */
export type TimeSegmentKey = 'hours' | 'minutes' | 'seconds';

/**
 * Broken down time segments
 */
export interface TimeSegments {
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Core timer state
 */
export interface TimerState {
  /** Remaining time in seconds (can be negative for overtime) */
  remainingSeconds: number;
  /** Current timer status */
  status: TimerStatus;
  /** Initial time set by user in seconds */
  initialSeconds: number;
  /** Which segment is being edited (null if none) */
  editingSegment: TimeSegmentKey | null;
  /** Whether timer was running before editing started */
  wasRunningBeforeEdit: boolean;
}

/**
 * Timer reducer action types
 */
export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'TICK'; payload: TimerMode }
  | { type: 'RESET' }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'ADJUST_TIME'; payload: number }
  | { type: 'SET_SEGMENT'; payload: { segment: TimeSegmentKey; value: number } }
  | { type: 'START_EDITING'; payload: TimeSegmentKey }
  | { type: 'STOP_EDITING' };

/**
 * Preset time configuration
 */
export interface PresetTime {
  /** Display label (e.g., "15m", "1h") */
  label: string;
  /** Time in seconds */
  seconds: number;
}

/**
 * User-defined preset with timestamp
 */
export interface UserPreset extends PresetTime {
  /** Timestamp when preset was last used */
  usedAt: number;
}

/**
 * Formatted display time (always HH:MM:SS)
 */
export interface DisplayTime {
  /** Hours segment formatted */
  hours: string;
  /** Minutes segment formatted */
  minutes: string;
  /** Seconds segment formatted */
  seconds: string;
  /** Whether time is negative */
  isNegative: boolean;
}
