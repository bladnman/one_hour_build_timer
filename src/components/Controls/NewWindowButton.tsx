interface NewWindowButtonProps {
  onCreate: () => void;
}

/**
 * Launch an additional timer window
 */
export function NewWindowButton({ onCreate }: NewWindowButtonProps) {
  return (
    <button
      className="control-button new-window-button"
      onClick={onCreate}
      aria-label="Open a new timer window"
      title="Open another timer"
    >
      ➕🪟
    </button>
  );
}
