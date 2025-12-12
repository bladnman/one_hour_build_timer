import type { ColorTheme } from '../../config/colors';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  themes: readonly ColorTheme[];
  currentThemeId: string;
  onThemeSelect: (themeId: string) => void;
  onNewWindow: () => void;
  showCloseWindow: boolean;
  onCloseWindow: () => void;
}

/**
 * Full-window overlay menu for settings
 */
export function MenuOverlay({
  isOpen,
  onClose,
  themes,
  currentThemeId,
  onThemeSelect,
  onNewWindow,
  showCloseWindow,
  onCloseWindow,
}: MenuOverlayProps) {
  if (!isOpen) return null;

  const handleThemeSelect = (themeId: string) => {
    onThemeSelect(themeId);
  };

  const handleNewWindow = () => {
    onNewWindow();
    onClose();
  };

  const handleCloseWindow = () => {
    onCloseWindow();
  };

  return (
    <div className="menu-overlay" onClick={onClose}>
      <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
        <div className="menu-section">
          <div className="menu-section-title">Color Theme</div>
          <div className="theme-grid">
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`theme-grid-item ${theme.id === currentThemeId ? 'active' : ''}`}
                onClick={() => handleThemeSelect(theme.id)}
                title={theme.name}
              >
                <span
                  className="theme-swatch-large"
                  style={{
                    background: `linear-gradient(135deg, ${theme.running} 50%, ${theme.overtime} 50%)`,
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="menu-section menu-actions">
          <button className="menu-action-button" onClick={handleNewWindow}>
            New Window
          </button>
          {showCloseWindow && (
            <button className="menu-action-button menu-action-danger" onClick={handleCloseWindow}>
              Close Window
            </button>
          )}
        </div>

        <button className="menu-close-button" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
