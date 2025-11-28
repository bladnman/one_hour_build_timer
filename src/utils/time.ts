import type { TimeSegments, DisplayTime, TimeSegmentKey } from '../types';
import { TIMING } from '../config';

/**
 * Converts total seconds to time segments (hours, minutes, seconds)
 */
export function secondsToSegments(totalSeconds: number): TimeSegments {
  const absSeconds = Math.abs(totalSeconds);
  const clampedSeconds = Math.min(absSeconds, TIMING.MAX_TIME_SECONDS);

  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const seconds = clampedSeconds % 60;

  return { hours, minutes, seconds };
}

/**
 * Converts time segments to total seconds
 */
export function segmentsToSeconds(segments: TimeSegments): number {
  return segments.hours * 3600 + segments.minutes * 60 + segments.seconds;
}

/**
 * Formats a number to a 2-digit string with leading zero
 */
export function formatSegment(value: number): string {
  return Math.abs(value).toString().padStart(2, '0');
}

/**
 * Formats total seconds for display (always HH:MM:SS)
 */
export function formatTimeForDisplay(totalSeconds: number): DisplayTime {
  const isNegative = totalSeconds < 0;
  const segments = secondsToSegments(totalSeconds);

  return {
    hours: formatSegment(segments.hours),
    minutes: formatSegment(segments.minutes),
    seconds: formatSegment(segments.seconds),
    isNegative,
  };
}

/**
 * Updates a specific segment value with wrapping and carry logic
 * Returns the new total seconds (can be negative)
 */
export function updateSegmentValue(
  currentSeconds: number,
  segment: TimeSegmentKey,
  delta: number
): number {
  // Convert delta to seconds based on segment type
  const deltaInSeconds = segment === 'hours' ? delta * 3600
    : segment === 'minutes' ? delta * 60
    : delta;

  // Simply add the delta in seconds - this naturally handles negatives
  const newSeconds = currentSeconds + deltaInSeconds;

  // Clamp to reasonable bounds (-99:59:59 to 99:59:59)
  const maxSeconds = 99 * 3600 + 59 * 60 + 59; // 99:59:59
  return Math.max(-maxSeconds, Math.min(maxSeconds, newSeconds));
}

/**
 * Sets a specific segment to an absolute value with validation
 * Returns the new total seconds (can be negative if value is negative)
 *
 * If user enters a negative value (e.g., -20 in minutes), the entire
 * time becomes negative with that segment set to the absolute value.
 */
export function setSegmentValue(
  currentSeconds: number,
  segment: TimeSegmentKey,
  value: number
): number {
  const isNegativeInput = value < 0;
  const absValue = Math.abs(value);
  const segments = secondsToSegments(currentSeconds);

  switch (segment) {
    case 'hours':
      segments.hours = Math.min(99, absValue);
      break;
    case 'minutes':
      segments.minutes = Math.min(59, absValue);
      break;
    case 'seconds':
      segments.seconds = Math.min(59, absValue);
      break;
  }

  const result = segmentsToSeconds(segments);
  // If user entered a negative value, make the entire time negative
  return isNegativeInput ? -result : result;
}

/**
 * Formats seconds into a preset label (e.g., "15m", "1h 30m")
 */
export function formatPresetLabel(seconds: number): string {
  const segments = secondsToSegments(seconds);

  if (segments.hours > 0 && segments.minutes > 0) {
    return `${segments.hours}h ${segments.minutes}m`;
  } else if (segments.hours > 0) {
    return `${segments.hours}h`;
  } else if (segments.minutes > 0) {
    return `${segments.minutes}m`;
  } else {
    return `${segments.seconds}s`;
  }
}
