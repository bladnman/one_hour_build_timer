interface ResetButtonProps {
  /** Called when button is clicked */
  onReset: () => void;
}

/**
 * Reset button to restore timer to initial value
 */
export function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button
      className="control-button"
      onClick={onReset}
      aria-label="Reset"
      title="Reset timer"
    >
      ↺
    </button>
  );
}
