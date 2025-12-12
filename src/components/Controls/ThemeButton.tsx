import { useState, useRef, useEffect } from 'react';
import type { ColorTheme } from '../../config/colors';

interface ThemeButtonProps {
  themes: readonly ColorTheme[];
  currentThemeId: string;
  onSelect: (themeId: string) => void;
}

/**
 * Button with dropdown to select color theme
 */
export function ThemeButton({ themes, currentThemeId, onSelect }: ThemeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (themeId: string) => {
    onSelect(themeId);
    setIsOpen(false);
  };

  return (
    <div className="theme-button-container" ref={containerRef}>
      <button
        className="control-button theme-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change color theme"
        title="Change color theme"
        aria-expanded={isOpen}
      >
        ◐
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${theme.id === currentThemeId ? 'active' : ''}`}
              onClick={() => handleSelect(theme.id)}
            >
              <span
                className="theme-swatch"
                style={{
                  background: `linear-gradient(135deg, ${theme.running} 50%, ${theme.overtime} 50%)`,
                }}
              />
              <span className="theme-name">{theme.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
