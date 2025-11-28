import { useEffect, useRef, useCallback } from 'react';
import { WINDOW_CONFIG } from '../config';

/**
 * Base font size at the default window width
 * All other sizes are calculated relative to this
 */
const BASE_FONT_SIZE_PX = 16;

/**
 * Hook that dynamically scales the root font-size based on window width.
 * Since aspect ratio is fixed, width alone determines the scale.
 *
 * At DEFAULT_WIDTH (400px), font-size = BASE_FONT_SIZE_PX (16px)
 * At 800px width, font-size = 32px
 * etc.
 */
export function useScaling(containerRef: React.RefObject<HTMLElement | null>): void {
  const rafRef = useRef<number | null>(null);
  const lastWidthRef = useRef<number>(0);

  const updateScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;

    // Skip if width hasn't changed (avoid unnecessary DOM updates)
    if (width === lastWidthRef.current) return;
    lastWidthRef.current = width;

    // Calculate scale factor relative to default width
    const scaleFactor = width / WINDOW_CONFIG.DEFAULT_WIDTH;

    // Calculate new font size
    const newFontSize = BASE_FONT_SIZE_PX * scaleFactor;

    // Apply to document root
    document.documentElement.style.fontSize = `${newFontSize}px`;
  }, [containerRef]);

  const handleResize = useCallback(() => {
    // Cancel any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule update on next animation frame (throttles to ~60fps)
    rafRef.current = requestAnimationFrame(() => {
      updateScale();
      rafRef.current = null;
    });
  }, [updateScale]);

  useEffect(() => {
    // Initial calculation
    updateScale();

    // Create ResizeObserver to watch for size changes
    const observer = new ResizeObserver(handleResize);

    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    // Also listen to window resize as backup
    window.addEventListener('resize', handleResize);

    return () => {
      // Cleanup
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [containerRef, updateScale, handleResize]);
}
