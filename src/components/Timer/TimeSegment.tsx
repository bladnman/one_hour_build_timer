import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimeSegmentKey } from '../../types';
import { formatSegment } from '../../utils/time';

interface TimeSegmentProps {
  /** Current value of this segment */
  value: number;
  /** Which segment this represents */
  segment: TimeSegmentKey;
  /** Whether this segment is currently being edited */
  isEditing?: boolean;
  /** Called when user clicks to start editing */
  onStartEdit?: (segment: TimeSegmentKey) => void;
  /** Called when user changes the value */
  onChange?: (segment: TimeSegmentKey, value: number) => void;
  /** Called when user finishes editing */
  onStopEdit?: () => void;
  /** Called when user presses up/down arrows */
  onAdjust?: (segment: TimeSegmentKey, delta: number) => void;
  /** Called when user presses left/right arrows to navigate */
  onNavigate?: (direction: 'left' | 'right') => void;
}

export function TimeSegment({
  value,
  segment,
  isEditing = false,
  onStartEdit,
  onChange,
  onStopEdit,
  onAdjust,
  onNavigate,
}: TimeSegmentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value.toString().padStart(2, '0'));
  // Track if user has typed anything (vs just using arrow keys)
  const hasTypedRef = useRef(false);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      hasTypedRef.current = false; // Reset on entering edit mode
    }
  }, [isEditing]);

  // Sync local value when prop changes
  // Always pad to 2 digits
  useEffect(() => {
    setLocalValue(Math.abs(value).toString().padStart(2, '0'));
  }, [value]);

  const handleClick = useCallback(() => {
    if (!isEditing) {
      onStartEdit?.(segment);
    }
  }, [isEditing, segment, onStartEdit]);

  const commitValue = useCallback((shouldStopEdit = true) => {
    // Only call onChange if user actually typed something
    // If they only used arrow keys, the adjustments were already applied
    if (hasTypedRef.current) {
      const maxValue = segment === 'hours' ? 99 : 59;
      // Parse the value - parseInt handles negative numbers correctly
      const numValue = parseInt(localValue, 10) || 0;
      // Clamp the absolute value, but preserve the sign
      const absValue = Math.min(maxValue, Math.abs(numValue));
      const finalValue = numValue < 0 ? -absValue : absValue;
      onChange?.(segment, finalValue);
    }
    if (shouldStopEdit) {
      onStopEdit?.();
    }
  }, [localValue, segment, onChange, onStopEdit]);

  const handleBlur = useCallback(() => {
    commitValue();
  }, [commitValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Determine delta for shift modifier (10x)
      const delta = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          commitValue();
          break;

        case 'Escape':
          e.preventDefault();
          setLocalValue(Math.abs(value).toString().padStart(2, '0'));
          onStopEdit?.();
          break;

        case 'ArrowUp':
          e.preventDefault();
          // Use browser's native key repeat - fires on every repeat
          onAdjust?.(segment, delta);
          break;

        case 'ArrowDown':
          e.preventDefault();
          // Use browser's native key repeat - fires on every repeat
          onAdjust?.(segment, -delta);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          onNavigate?.('left');
          break;

        case 'ArrowRight':
          e.preventDefault();
          onNavigate?.('right');
          break;

        case 'Tab':
          // Let tab work naturally to move to next segment
          commitValue();
          break;
      }
    },
    [commitValue, value, segment, onStopEdit, onAdjust, onNavigate]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Mark that user has typed something
    hasTypedRef.current = true;
    // Allow digits and minus sign
    const newValue = e.target.value.replace(/[^\d-]/g, '');
    // Limit to 3 chars (minus + 2 digits) or 2 digits
    if (newValue.startsWith('-')) {
      setLocalValue(newValue.slice(0, 3));
    } else {
      setLocalValue(newValue.slice(0, 2));
    }
  }, []);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        className="time-segment-input"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-label={`Edit ${segment}`}
      />
    );
  }

  return (
    <span
      className="time-segment"
      data-editing="false"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${segment}: ${value}`}
    >
      {formatSegment(value)}
    </span>
  );
}
