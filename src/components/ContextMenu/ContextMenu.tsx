import { useState, useEffect, useCallback, useRef } from 'react';
import { COLOR_THEMES } from '../../config/colors';
import type { ColorTheme } from '../../config/colors';
import './ContextMenu.css';

interface ContextMenuProps {
  themeId: string;
  onThemeChange: (themeId: string) => void;
  onNewWindow: () => void;
}

interface MenuPosition {
  x: number;
  y: number;
}

export function ContextMenu({ themeId, onThemeChange, onNewWindow }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [showThemeSubmenu, setShowThemeSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuTimeoutRef = useRef<number | null>(null);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
    setShowThemeSubmenu(false);
  }, []);

  const handleClick = useCallback(() => {
    setIsOpen(false);
    setShowThemeSubmenu(false);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setShowThemeSubmenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleContextMenu, handleClick, handleKeyDown]);

  // Adjust menu position if it goes off screen
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const newPosition = { ...position };

      if (rect.right > window.innerWidth) {
        newPosition.x = window.innerWidth - rect.width - 10;
      }
      if (rect.bottom > window.innerHeight) {
        newPosition.y = window.innerHeight - rect.height - 10;
      }

      if (newPosition.x !== position.x || newPosition.y !== position.y) {
        setPosition(newPosition);
      }
    }
  }, [isOpen, position]);

  const handleNewWindow = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onNewWindow();
      setIsOpen(false);
    },
    [onNewWindow]
  );

  const handleThemeSelect = useCallback(
    (e: React.MouseEvent, theme: ColorTheme) => {
      e.stopPropagation();
      onThemeChange(theme.id);
      setIsOpen(false);
      setShowThemeSubmenu(false);
    },
    [onThemeChange]
  );

  const handleThemeHover = useCallback(() => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
    setShowThemeSubmenu(true);
  }, []);

  const handleThemeLeave = useCallback(() => {
    submenuTimeoutRef.current = window.setTimeout(() => {
      setShowThemeSubmenu(false);
    }, 150);
  }, []);

  const handleSubmenuEnter = useCallback(() => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="context-menu-item" onClick={handleNewWindow}>
        <span className="context-menu-icon">+</span>
        New Window
        <span className="context-menu-shortcut">
          {navigator.platform.includes('Mac') ? '⌘N' : 'Ctrl+N'}
        </span>
      </button>

      <div className="context-menu-divider" />

      <div
        className="context-menu-item context-menu-submenu-trigger"
        onMouseEnter={handleThemeHover}
        onMouseLeave={handleThemeLeave}
      >
        <span className="context-menu-icon">◐</span>
        Theme
        <span className="context-menu-arrow">▶</span>

        {showThemeSubmenu && (
          <div
            className="context-menu-submenu"
            onMouseEnter={handleSubmenuEnter}
            onMouseLeave={handleThemeLeave}
          >
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.id}
                className={`context-menu-item ${theme.id === themeId ? 'active' : ''}`}
                onClick={(e) => handleThemeSelect(e, theme)}
              >
                <span className="theme-preview">
                  <span
                    className="theme-color"
                    style={{ backgroundColor: theme.running }}
                  />
                  <span
                    className="theme-color"
                    style={{ backgroundColor: theme.overtime }}
                  />
                </span>
                {theme.name}
                {theme.id === themeId && <span className="context-menu-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
