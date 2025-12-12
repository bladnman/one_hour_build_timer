interface NewWindowButtonProps {
  onClick: () => void;
}

export function NewWindowButton({ onClick }: NewWindowButtonProps) {
  return (
    <button
      className="control-button new-window-button"
      onClick={onClick}
      title="New Window (Cmd/Ctrl+N)"
      aria-label="Open new timer window"
    >
      +
    </button>
  );
}
