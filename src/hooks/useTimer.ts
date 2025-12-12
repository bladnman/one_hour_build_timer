import { useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import type { TimerState, TimerAction, TimeSegmentKey, TimerStatus, TimerMode } from '../types';
import { TIMING, TIMER_COLORS, DEFAULT_THEME_ID, getThemeById, STORAGE_KEYS, getWindowStorageKey } from '../config';
import {
  formatTimeForDisplay,
  updateSegmentValue,
  setSegmentValue,
  secondsToSegments,
} from '../utils/time';

// Default theme colors (used as fallback)
const defaultTheme = getThemeById(DEFAULT_THEME_ID);

const initialState: TimerState = {
  remainingSeconds: 0,
  status: 'idle',
  initialSeconds: 0,
  editingSegment: null,
  wasRunningBeforeEdit: false,
};

/**
 * Load saved timer state from localStorage
 */
function loadSavedTimerState(windowId: string, defaultSeconds: number): Partial<TimerState> {
  try {
    const secondsKey = getWindowStorageKey(STORAGE_KEYS.TIMER_SECONDS, windowId);
    const initialKey = getWindowStorageKey(STORAGE_KEYS.TIMER_INITIAL, windowId);
    const statusKey = getWindowStorageKey(STORAGE_KEYS.TIMER_STATUS, windowId);

    const savedSeconds = localStorage.getItem(secondsKey);
    const savedInitial = localStorage.getItem(initialKey);
    const savedStatus = localStorage.getItem(statusKey);

    return {
      remainingSeconds: savedSeconds !== null ? JSON.parse(savedSeconds) : defaultSeconds,
      initialSeconds: savedInitial !== null ? JSON.parse(savedInitial) : defaultSeconds,
      // Restore as paused if was running (don't auto-start)
      status: savedStatus !== null ? (JSON.parse(savedStatus) === 'running' || JSON.parse(savedStatus) === 'overtime' ? 'paused' : JSON.parse(savedStatus)) : 'idle',
    };
  } catch {
    return {
      remainingSeconds: defaultSeconds,
      initialSeconds: defaultSeconds,
      status: 'idle',
    };
  }
}

/**
 * Save timer state to localStorage
 */
function saveTimerState(windowId: string, state: TimerState): void {
  try {
    const secondsKey = getWindowStorageKey(STORAGE_KEYS.TIMER_SECONDS, windowId);
    const initialKey = getWindowStorageKey(STORAGE_KEYS.TIMER_INITIAL, windowId);
    const statusKey = getWindowStorageKey(STORAGE_KEYS.TIMER_STATUS, windowId);

    localStorage.setItem(secondsKey, JSON.stringify(state.remainingSeconds));
    localStorage.setItem(initialKey, JSON.stringify(state.initialSeconds));
    localStorage.setItem(statusKey, JSON.stringify(state.status));
  } catch {
    // Ignore storage errors
  }
}

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        status: state.remainingSeconds < 0 ? 'overtime' : 'running',
      };

    case 'PAUSE':
      return {
        ...state,
        status: 'paused',
      };

    case 'TICK': {
      const mode = action.payload;
      const newSeconds = mode === 'countdown'
        ? state.remainingSeconds - 1
        : state.remainingSeconds + 1;
      // In countdown mode, go to overtime when negative
      // In count-up mode, just keep running
      const newStatus: TimerStatus =
        mode === 'countdown' && newSeconds < 0 ? 'overtime' : 'running';
      return {
        ...state,
        remainingSeconds: newSeconds,
        status: newStatus,
      };
    }

    case 'RESET':
      return {
        ...state,
        remainingSeconds: state.initialSeconds,
        status: 'idle',
        editingSegment: null,
      };

    case 'SET_TIME':
      return {
        ...state,
        remainingSeconds: action.payload,
        initialSeconds: action.payload,
        status: 'idle',
        editingSegment: null,
      };

    case 'ADJUST_TIME':
      // Adjust time without stopping edit mode
      return {
        ...state,
        remainingSeconds: action.payload,
        initialSeconds: action.payload,
      };

    case 'SET_SEGMENT': {
      const newSeconds = setSegmentValue(
        state.remainingSeconds,
        action.payload.segment,
        action.payload.value
      );
      return {
        ...state,
        remainingSeconds: newSeconds,
        initialSeconds: newSeconds,
      };
    }

    case 'START_EDITING':
      return {
        ...state,
        editingSegment: action.payload,
        wasRunningBeforeEdit: state.status === 'running' || state.status === 'overtime',
        status: state.status === 'running' || state.status === 'overtime' ? 'paused' : state.status,
      };

    case 'STOP_EDITING':
      return {
        ...state,
        editingSegment: null,
        status: state.wasRunningBeforeEdit ? 'running' : state.status,
        wasRunningBeforeEdit: false,
      };

    default:
      return state;
  }
}

export interface UseTimerReturn {
  /** Current timer state */
  state: TimerState;
  /** Start the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Toggle between play and pause */
  toggle: () => void;
  /** Reset timer to initial time */
  reset: () => void;
  /** Set a new time in seconds */
  setTime: (seconds: number) => void;
  /** Increment/decrement a segment */
  adjustSegment: (segment: TimeSegmentKey, delta: number) => void;
  /** Set a segment to an absolute value */
  setSegment: (segment: TimeSegmentKey, value: number) => void;
  /** Start editing a segment */
  startEditing: (segment: TimeSegmentKey) => void;
  /** Stop editing */
  stopEditing: () => void;
  /** Formatted display time */
  displayTime: ReturnType<typeof formatTimeForDisplay>;
  /** Time segments */
  segments: ReturnType<typeof secondsToSegments>;
  /** Current display color based on status */
  displayColor: string;
}

export function useTimer(initialSeconds = 0, mode: TimerMode = 'countdown', windowId = 'main'): UseTimerReturn {
  // Load saved state on first render
  const savedState = useRef(loadSavedTimerState(windowId, initialSeconds));

  const [state, dispatch] = useReducer(timerReducer, {
    ...initialState,
    remainingSeconds: savedState.current.remainingSeconds ?? initialSeconds,
    initialSeconds: savedState.current.initialSeconds ?? initialSeconds,
    status: savedState.current.status ?? 'idle',
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveTimerState(windowId, state);
  }, [windowId, state.remainingSeconds, state.initialSeconds, state.status]);

  // Timer tick effect
  useEffect(() => {
    if (state.status !== 'running' && state.status !== 'overtime') {
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: 'TICK', payload: mode });
    }, TIMING.TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [state.status, mode]);

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const setTime = useCallback((seconds: number) => dispatch({ type: 'SET_TIME', payload: seconds }), []);

  const toggle = useCallback(() => {
    if (state.status === 'running' || state.status === 'overtime') {
      dispatch({ type: 'PAUSE' });
    } else {
      dispatch({ type: 'START' });
    }
  }, [state.status]);

  const adjustSegment = useCallback((segment: TimeSegmentKey, delta: number) => {
    const newSeconds = updateSegmentValue(state.remainingSeconds, segment, delta);
    dispatch({ type: 'ADJUST_TIME', payload: newSeconds });
  }, [state.remainingSeconds]);

  const setSegment = useCallback((segment: TimeSegmentKey, value: number) => {
    dispatch({ type: 'SET_SEGMENT', payload: { segment, value } });
  }, []);

  const startEditing = useCallback((segment: TimeSegmentKey) => {
    dispatch({ type: 'START_EDITING', payload: segment });
  }, []);

  const stopEditing = useCallback(() => {
    dispatch({ type: 'STOP_EDITING' });
  }, []);

  const displayTime = useMemo(
    () => formatTimeForDisplay(state.remainingSeconds),
    [state.remainingSeconds]
  );

  const segments = useMemo(
    () => secondsToSegments(state.remainingSeconds),
    [state.remainingSeconds]
  );

  const displayColor = useMemo(() => {
    switch (state.status) {
      case 'running':
        return defaultTheme.running;
      case 'overtime':
        return defaultTheme.overtime;
      case 'paused':
      case 'idle':
      default:
        return TIMER_COLORS.paused;
    }
  }, [state.status]);

  return {
    state,
    start,
    pause,
    toggle,
    reset,
    setTime,
    adjustSegment,
    setSegment,
    startEditing,
    stopEditing,
    displayTime,
    segments,
    displayColor,
  };
}
