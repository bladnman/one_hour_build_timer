import { useCallback, useEffect, useMemo } from 'react';
import { COLOR_PAIRINGS, DEFAULT_COLOR_PAIRING_ID, STORAGE_KEYS } from '../config';
import type { ColorPairing } from '../config';
import { useLocalStorage } from './useLocalStorage';

/**
 * Manage the active clock color pairing and sync it to CSS variables
 */
export function useColorPairing() {
  const [activeId, setActiveId] = useLocalStorage<string>(
    STORAGE_KEYS.COLOR_PAIRING,
    DEFAULT_COLOR_PAIRING_ID
  );

  const activePairing: ColorPairing = useMemo(() => {
    return COLOR_PAIRINGS.find((pair) => pair.id === activeId) ?? COLOR_PAIRINGS[0];
  }, [activeId]);

  // Apply the selected pairing to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-running', activePairing.running);
    root.style.setProperty('--color-overtime', activePairing.overtime);
  }, [activePairing]);

  const cyclePairing = useCallback(() => {
    const currentIndex = COLOR_PAIRINGS.findIndex((pair) => pair.id === activePairing.id);
    const nextIndex = (currentIndex + 1) % COLOR_PAIRINGS.length;
    setActiveId(COLOR_PAIRINGS[nextIndex].id);
  }, [activePairing.id, setActiveId]);

  const setPairing = useCallback((id: string) => {
    const exists = COLOR_PAIRINGS.some((pair) => pair.id === id);
    setActiveId(exists ? id : DEFAULT_COLOR_PAIRING_ID);
  }, [setActiveId]);

  return {
    activePairing,
    cyclePairing,
    setPairing,
    availablePairings: COLOR_PAIRINGS,
  };
}
