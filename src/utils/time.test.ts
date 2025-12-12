import { describe, it, expect } from 'vitest';
import {
  secondsToSegments,
  segmentsToSeconds,
  formatSegment,
  formatTimeForDisplay,
  updateSegmentValue,
  setSegmentValue,
  formatPresetLabel,
} from './time';

describe('secondsToSegments', () => {
  it('converts 0 seconds correctly', () => {
    expect(secondsToSegments(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
  });

  it('converts positive seconds correctly', () => {
    expect(secondsToSegments(3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
  });

  it('converts negative seconds using absolute value', () => {
    expect(secondsToSegments(-3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
  });

  it('handles minutes only', () => {
    expect(secondsToSegments(150)).toEqual({ hours: 0, minutes: 2, seconds: 30 });
  });

  it('handles hours only', () => {
    expect(secondsToSegments(7200)).toEqual({ hours: 2, minutes: 0, seconds: 0 });
  });
});

describe('segmentsToSeconds', () => {
  it('converts zero segments', () => {
    expect(segmentsToSeconds({ hours: 0, minutes: 0, seconds: 0 })).toBe(0);
  });

  it('converts full segments', () => {
    expect(segmentsToSeconds({ hours: 1, minutes: 30, seconds: 45 })).toBe(5445);
  });

  it('is inverse of secondsToSegments', () => {
    const original = 12345;
    const segments = secondsToSegments(original);
    expect(segmentsToSeconds(segments)).toBe(original);
  });
});

describe('formatSegment', () => {
  it('pads single digit with zero', () => {
    expect(formatSegment(5)).toBe('05');
  });

  it('does not pad double digits', () => {
    expect(formatSegment(45)).toBe('45');
  });

  it('handles zero', () => {
    expect(formatSegment(0)).toBe('00');
  });

  it('handles negative by using absolute value', () => {
    expect(formatSegment(-5)).toBe('05');
  });
});

describe('formatTimeForDisplay', () => {
  it('formats positive time', () => {
    const result = formatTimeForDisplay(3661);
    expect(result).toEqual({
      hours: '01',
      minutes: '01',
      seconds: '01',
      isNegative: false,
    });
  });

  it('formats negative time (overtime)', () => {
    const result = formatTimeForDisplay(-125);
    expect(result).toEqual({
      hours: '00',
      minutes: '02',
      seconds: '05',
      isNegative: true,
    });
  });

  it('formats zero', () => {
    const result = formatTimeForDisplay(0);
    expect(result).toEqual({
      hours: '00',
      minutes: '00',
      seconds: '00',
      isNegative: false,
    });
  });
});

describe('updateSegmentValue', () => {
  it('increments seconds', () => {
    expect(updateSegmentValue(100, 'seconds', 1)).toBe(101);
  });

  it('decrements seconds', () => {
    expect(updateSegmentValue(100, 'seconds', -1)).toBe(99);
  });

  it('increments minutes', () => {
    expect(updateSegmentValue(100, 'minutes', 1)).toBe(160);
  });

  it('increments hours', () => {
    expect(updateSegmentValue(100, 'hours', 1)).toBe(3700);
  });

  it('allows going negative', () => {
    expect(updateSegmentValue(30, 'minutes', -1)).toBe(-30);
  });

  it('clamps to max value', () => {
    const maxSeconds = 99 * 3600 + 59 * 60 + 59;
    expect(updateSegmentValue(maxSeconds, 'hours', 1)).toBe(maxSeconds);
  });
});

describe('setSegmentValue', () => {
  it('sets seconds value', () => {
    const result = setSegmentValue(3661, 'seconds', 30);
    expect(secondsToSegments(result)).toEqual({ hours: 1, minutes: 1, seconds: 30 });
  });

  it('sets minutes value', () => {
    const result = setSegmentValue(3661, 'minutes', 45);
    expect(secondsToSegments(result)).toEqual({ hours: 1, minutes: 45, seconds: 1 });
  });

  it('sets hours value', () => {
    const result = setSegmentValue(3661, 'hours', 5);
    expect(secondsToSegments(result)).toEqual({ hours: 5, minutes: 1, seconds: 1 });
  });

  it('clamps seconds to 59', () => {
    const result = setSegmentValue(0, 'seconds', 100);
    expect(secondsToSegments(result).seconds).toBe(59);
  });

  it('clamps minutes to 59', () => {
    const result = setSegmentValue(0, 'minutes', 100);
    expect(secondsToSegments(result).minutes).toBe(59);
  });

  it('clamps hours to 99', () => {
    const result = setSegmentValue(0, 'hours', 150);
    expect(secondsToSegments(result).hours).toBe(99);
  });

  it('negative input makes entire time negative', () => {
    const result = setSegmentValue(3600, 'minutes', -30);
    expect(result).toBeLessThan(0);
  });
});

describe('formatPresetLabel', () => {
  it('formats hours only', () => {
    expect(formatPresetLabel(3600)).toBe('1h');
  });

  it('formats minutes only', () => {
    expect(formatPresetLabel(900)).toBe('15m');
  });

  it('formats seconds only', () => {
    expect(formatPresetLabel(30)).toBe('30s');
  });

  it('formats hours and minutes', () => {
    expect(formatPresetLabel(5400)).toBe('1h 30m');
  });

  it('formats zero as seconds', () => {
    expect(formatPresetLabel(0)).toBe('0s');
  });
});
