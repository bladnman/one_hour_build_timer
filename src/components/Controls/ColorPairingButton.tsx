import type { ColorPairing } from '../../config';

interface ColorPairingButtonProps {
  pairing: ColorPairing;
  onNext: () => void;
}

/**
 * Cycle through predefined clock color pairings
 */
export function ColorPairingButton({ pairing, onNext }: ColorPairingButtonProps) {
  return (
    <button
      className="control-button color-pairing-button"
      onClick={onNext}
      aria-label={`Switch color pairing (current: ${pairing.label})`}
      title={`Clock colors: ${pairing.label}`}
    >
      🎨 {pairing.label}
    </button>
  );
}
