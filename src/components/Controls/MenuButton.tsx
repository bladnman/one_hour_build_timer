interface MenuButtonProps {
  onClick: () => void;
}

/**
 * Hamburger menu button
 */
export function MenuButton({ onClick }: MenuButtonProps) {
  return (
    <button
      className="control-button menu-button"
      onClick={onClick}
      aria-label="Open menu"
      title="Menu"
    >
      ☰
    </button>
  );
}
