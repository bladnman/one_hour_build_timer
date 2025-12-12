import { describe, it, expect } from 'vitest';
import { STORAGE_KEYS, getWindowStorageKey } from './storage-keys';

describe('STORAGE_KEYS', () => {
  it('has all required keys defined', () => {
    expect(STORAGE_KEYS.USER_PRESETS).toBeDefined();
    expect(STORAGE_KEYS.TIMER_SECONDS).toBeDefined();
    expect(STORAGE_KEYS.TIMER_INITIAL).toBeDefined();
    expect(STORAGE_KEYS.TIMER_STATUS).toBeDefined();
    expect(STORAGE_KEYS.TITLE).toBeDefined();
    expect(STORAGE_KEYS.TIMER_MODE).toBeDefined();
    expect(STORAGE_KEYS.COLOR_THEME).toBeDefined();
    expect(STORAGE_KEYS.WINDOW_REGISTRY).toBeDefined();
  });

  it('has unique key values', () => {
    const values = Object.values(STORAGE_KEYS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it('all keys start with countdown-timer prefix', () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      expect(key).toMatch(/^countdown-timer:/);
    });
  });
});

describe('getWindowStorageKey', () => {
  it('scopes key to main window', () => {
    const result = getWindowStorageKey(STORAGE_KEYS.TITLE, 'main');
    expect(result).toBe('countdown-timer:title:main');
  });

  it('scopes key to timer window', () => {
    const result = getWindowStorageKey(STORAGE_KEYS.TIMER_SECONDS, 'timer-1');
    expect(result).toBe('countdown-timer:seconds:timer-1');
  });

  it('handles custom base keys', () => {
    const result = getWindowStorageKey('custom:key', 'window-id');
    expect(result).toBe('custom:key:window-id');
  });

  it('different windows have different keys', () => {
    const key1 = getWindowStorageKey(STORAGE_KEYS.TITLE, 'timer-1');
    const key2 = getWindowStorageKey(STORAGE_KEYS.TITLE, 'timer-2');
    expect(key1).not.toBe(key2);
  });
});
