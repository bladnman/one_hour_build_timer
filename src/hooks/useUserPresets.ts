import { useCallback, useMemo } from 'react';
import type { PresetTime, UserPreset } from '../types';
import { DEFAULT_PRESETS, USER_PRESET_CONFIG, STORAGE_KEYS } from '../config';
import { useLocalStorage } from './useLocalStorage';
import { formatPresetLabel } from '../utils/time';

interface UseUserPresetsReturn {
  /** All available presets (default + user) */
  allPresets: PresetTime[];
  /** Just the user-defined presets */
  userPresets: UserPreset[];
  /** Add a new user preset */
  addPreset: (seconds: number) => void;
  /** Clear all user presets */
  clearUserPresets: () => void;
}

/**
 * Hook for managing time presets including user-defined ones
 */
export function useUserPresets(): UseUserPresetsReturn {
  const [userPresets, setUserPresets] = useLocalStorage<UserPreset[]>(
    STORAGE_KEYS.USER_PRESETS,
    []
  );

  const addPreset = useCallback(
    (seconds: number) => {
      // Don't add if it matches a default preset
      const isDefault = DEFAULT_PRESETS.some((p) => p.seconds === seconds);
      if (isDefault) {
        return;
      }

      // Don't add duplicates
      const isDuplicate = userPresets.some((p) => p.seconds === seconds);
      if (isDuplicate) {
        // Update the timestamp of the existing preset
        setUserPresets((prev) =>
          prev.map((p) =>
            p.seconds === seconds ? { ...p, usedAt: Date.now() } : p
          )
        );
        return;
      }

      const newPreset: UserPreset = {
        label: formatPresetLabel(seconds),
        seconds,
        usedAt: Date.now(),
      };

      setUserPresets((prev) => {
        // Add new preset and keep only the most recent ones
        const updated = [newPreset, ...prev]
          .sort((a, b) => b.usedAt - a.usedAt)
          .slice(0, USER_PRESET_CONFIG.MAX_USER_PRESETS);
        return updated;
      });
    },
    [userPresets, setUserPresets]
  );

  const clearUserPresets = useCallback(() => {
    setUserPresets([]);
  }, [setUserPresets]);

  const allPresets = useMemo(() => {
    // Combine default presets with user presets
    // User presets come after default presets
    return [...DEFAULT_PRESETS, ...userPresets];
  }, [userPresets]);

  return {
    allPresets,
    userPresets,
    addPreset,
    clearUserPresets,
  };
}
