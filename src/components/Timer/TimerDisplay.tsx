import { useCallback } from 'react';
import type { TimerStatus, TimeSegmentKey, DisplayTime, TimeSegments } from '../../types';
import { TimeSegment } from './TimeSegment';
import { ColonSeparator } from './ColonSeparator';

interface TimerDisplayProps {
  /** Formatted display time */
  displayTime: DisplayTime;
  /** Time segments (hours, minutes, seconds) */
  segments: TimeSegments;
  /** Current timer status */
  status: TimerStatus;
  /** Which segment is currently being edited */
  editingSegment: TimeSegmentKey | null;
  /** Called when user starts editing a segment */
  onStartEdit: (segment: TimeSegmentKey) => void;
  /** Called when user changes a segment value */
  onSegmentChange: (segment: TimeSegmentKey, value: number) => void;
  /** Called when user finishes editing */
  onStopEdit: () => void;
  /** Called when user adjusts a segment with arrow keys */
  onSegmentAdjust: (segment: TimeSegmentKey, delta: number) => void;
}

const SEGMENT_ORDER: TimeSegmentKey[] = ['hours', 'minutes', 'seconds'];

export function TimerDisplay({
  displayTime,
  segments,
  status,
  editingSegment,
  onStartEdit,
  onSegmentChange,
  onStopEdit,
  onSegmentAdjust,
}: TimerDisplayProps) {
  // Handle left/right navigation between segments
  const handleNavigate = useCallback((currentSegment: TimeSegmentKey, direction: 'left' | 'right') => {
    const currentIndex = SEGMENT_ORDER.indexOf(currentSegment);
    const newIndex = direction === 'left'
      ? Math.max(0, currentIndex - 1)
      : Math.min(SEGMENT_ORDER.length - 1, currentIndex + 1);

    if (newIndex !== currentIndex) {
      onStartEdit(SEGMENT_ORDER[newIndex]);
    }
  }, [onStartEdit]);

  return (
    <div
      className="timer-display"
      data-status={status}
      role="timer"
      aria-label={`${displayTime.isNegative ? 'Negative ' : ''}${displayTime.hours}:${displayTime.minutes}:${displayTime.seconds}`}
    >
      {displayTime.isNegative && <span className="negative-sign">-</span>}

      <TimeSegment
        value={segments.hours}
        segment="hours"
        isEditing={editingSegment === 'hours'}
        onStartEdit={onStartEdit}
        onChange={onSegmentChange}
        onStopEdit={onStopEdit}
        onAdjust={onSegmentAdjust}
        onNavigate={(dir) => handleNavigate('hours', dir)}
      />

      <ColonSeparator />

      <TimeSegment
        value={segments.minutes}
        segment="minutes"
        isEditing={editingSegment === 'minutes'}
        onStartEdit={onStartEdit}
        onChange={onSegmentChange}
        onStopEdit={onStopEdit}
        onAdjust={onSegmentAdjust}
        onNavigate={(dir) => handleNavigate('minutes', dir)}
      />

      <ColonSeparator />

      <TimeSegment
        value={segments.seconds}
        segment="seconds"
        isEditing={editingSegment === 'seconds'}
        onStartEdit={onStartEdit}
        onChange={onSegmentChange}
        onStopEdit={onStopEdit}
        onAdjust={onSegmentAdjust}
        onNavigate={(dir) => handleNavigate('seconds', dir)}
      />
    </div>
  );
}
